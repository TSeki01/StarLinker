import json
import asyncio
import logging
from pathlib import Path
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from config import CORS_ORIGINS
from models import Creator, SponsoredVideoResult
from youtube_service import get_channel_stats, get_recent_videos
from gemini_service import detect_sponsored

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="StarLinker API",
    description="YouTube Sponsored Content Analytics for JP/TW/KR",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load creators from JSON
CREATORS_PATH = Path(__file__).parent / "creators.json"


def load_creators() -> list[dict]:
    with open(CREATORS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("creators", [])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "StarLinker API"}


@app.get("/api/videos")
async def get_sponsored_videos(
    nationality: Optional[str] = Query(
        None, description="Comma-separated: JP,TW,KR"
    ),
    creator_type: Optional[str] = Query(
        None, description="youtuber or vtuber"
    ),
    sort_by: str = Query(
        "views", description="subscribers, views, or engagement"
    ),
    lang: str = Query("ja", description="ja, zh-TW, or ko"),
):
    """
    Main endpoint: fetch recent videos, detect sponsors, sort & filter.
    """
    creators_data = load_creators()

    # Filter by nationality
    if nationality:
        nationalities = [n.strip().upper() for n in nationality.split(",")]
        creators_data = [
            c for c in creators_data if c["nationality"] in nationalities
        ]

    # Filter by type
    if creator_type:
        creators_data = [
            c for c in creators_data if c["type"] == creator_type.lower()
        ]

    if not creators_data:
        return {"results": [], "total": 0}

    # Get channel stats in batch
    channel_ids = [c["channel_id"] for c in creators_data]
    channel_stats = get_channel_stats(channel_ids)

    # Build Creator objects with live stats
    creators_map: dict[str, Creator] = {}
    for c in creators_data:
        cid = c["channel_id"]
        stats = channel_stats.get(cid, {})
        creators_map[cid] = Creator(
            channel_id=cid,
            name=stats.get("channel_title", c["name"]),
            nationality=c["nationality"],
            type=c["type"],
            subscriber_count=stats.get("subscriber_count", 0),
            profile_image_url=stats.get("profile_image_url", ""),
        )

    # Fetch recent videos for all creators (concurrently in batches)
    results: list[SponsoredVideoResult] = []

    async def process_creator(creator: Creator):
        local_results = []
        videos = get_recent_videos(creator.channel_id)
        for video in videos:
            # Run sponsored detection
            video = await detect_sponsored(video)
            if video.is_sponsored:
                sub_count = creator.subscriber_count
                engagement = (
                    (video.view_count / sub_count * 100) if sub_count > 0 else 0
                )
                local_results.append(
                    SponsoredVideoResult(
                        creator=creator,
                        video=video,
                        engagement_rate=round(engagement, 2),
                    )
                )
        return local_results

    # Process in batches of 5 to avoid rate limits
    batch_size = 5
    creator_list = list(creators_map.values())
    for i in range(0, len(creator_list), batch_size):
        batch = creator_list[i : i + batch_size]
        tasks = [process_creator(c) for c in batch]
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        for br in batch_results:
            if isinstance(br, list):
                results.extend(br)
            elif isinstance(br, Exception):
                logger.error(f"Error processing creator: {br}")

    # Sort results
    if sort_by == "subscribers":
        results.sort(key=lambda r: r.creator.subscriber_count, reverse=True)
    elif sort_by == "engagement":
        results.sort(key=lambda r: r.engagement_rate, reverse=True)
    else:  # views (default)
        results.sort(key=lambda r: r.video.view_count, reverse=True)

    return {
        "results": [r.model_dump() for r in results],
        "total": len(results),
        "sort_by": sort_by,
    }


@app.get("/api/creators")
async def list_creators(
    nationality: Optional[str] = Query(None),
    creator_type: Optional[str] = Query(None),
):
    """List all tracked creators with optional filtering."""
    creators_data = load_creators()

    if nationality:
        nationalities = [n.strip().upper() for n in nationality.split(",")]
        creators_data = [
            c for c in creators_data if c["nationality"] in nationalities
        ]

    if creator_type:
        creators_data = [
            c for c in creators_data if c["type"] == creator_type.lower()
        ]

    # Get live stats
    channel_ids = [c["channel_id"] for c in creators_data]
    channel_stats = get_channel_stats(channel_ids)

    result = []
    for c in creators_data:
        cid = c["channel_id"]
        stats = channel_stats.get(cid, {})
        result.append({
            **c,
            "subscriber_count": stats.get("subscriber_count", 0),
            "profile_image_url": stats.get("profile_image_url", ""),
            "channel_title": stats.get("channel_title", c["name"]),
        })

    result.sort(key=lambda x: x.get("subscriber_count", 0), reverse=True)
    return {"creators": result, "total": len(result)}


@app.post("/api/validate")
async def validate_creators():
    """
    Run nationality validation on all creators.
    Checks channel country and video title language against expected nationality.
    Flags mismatched creators for review.
    """
    from validation_service import validate_creator, save_alerts, flag_creator_for_review

    creators_data = load_creators()
    all_alerts = []

    for c in creators_data:
        cid = c["channel_id"]
        # Get recent video titles for language check
        videos = get_recent_videos(cid)
        titles = [v.title for v in videos[:3]]

        result = await validate_creator(cid, c["nationality"], titles)

        if not result["is_valid"]:
            for alert in result["alerts"]:
                if alert["severity"] == "warning":
                    flag_creator_for_review(cid, alert["message"])
            all_alerts.extend(result["alerts"])

    save_alerts(all_alerts)
    return {
        "validated": len(creators_data),
        "alerts": len(all_alerts),
        "warnings": len([a for a in all_alerts if a["severity"] == "warning"]),
        "details": all_alerts,
    }


@app.get("/api/alerts")
async def get_alerts():
    """Get saved validation alerts."""
    from validation_service import load_alerts
    alerts = load_alerts()
    return {"alerts": alerts, "total": len(alerts)}


@app.post("/api/validate/rebuild")
async def rebuild_seed_data():
    """Remove flagged creators from seed data after validation."""
    from validation_service import remove_flagged_creators
    removed = remove_flagged_creators()
    return {
        "removed": len(removed),
        "removed_creators": removed,
        "message": f"Removed {len(removed)} flagged creators from seed data",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
