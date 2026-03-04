import logging
from datetime import datetime, timedelta, timezone
from googleapiclient.discovery import build
from config import YOUTUBE_API_KEY, DAYS_BACK
from models import Creator, Video

logger = logging.getLogger(__name__)


def get_youtube_service():
    """Build and return a YouTube Data API service object."""
    return build("youtube", "v3", developerKey=YOUTUBE_API_KEY)


def get_channel_stats(channel_ids: list[str]) -> dict[str, dict]:
    """
    Batch fetch channel statistics (subscriber count, profile image).
    Returns a dict keyed by channel_id.
    """
    youtube = get_youtube_service()
    stats = {}
    # YouTube API allows max 50 channel IDs per request
    for i in range(0, len(channel_ids), 50):
        batch = channel_ids[i : i + 50]
        try:
            response = youtube.channels().list(
                part="statistics,snippet",
                id=",".join(batch),
            ).execute()
            for item in response.get("items", []):
                cid = item["id"]
                stats[cid] = {
                    "subscriber_count": int(
                        item["statistics"].get("subscriberCount", 0)
                    ),
                    "profile_image_url": item["snippet"]
                    .get("thumbnails", {})
                    .get("default", {})
                    .get("url", ""),
                    "channel_title": item["snippet"].get("title", ""),
                }
        except Exception as e:
            logger.error(f"Error fetching channel stats for batch starting at {i}: {e}")
    return stats


def get_recent_videos(channel_id: str, days: int = DAYS_BACK) -> list[Video]:
    """
    Fetch videos published within the last `days` days for a given channel.
    Uses search.list to find videos, then videos.list for full stats.
    """
    youtube = get_youtube_service()
    published_after = (
        datetime.now(timezone.utc) - timedelta(days=days)
    ).isoformat()

    videos = []
    try:
        # Step 1: Search for recent videos from the channel
        search_response = youtube.search().list(
            part="id",
            channelId=channel_id,
            type="video",
            publishedAfter=published_after,
            order="date",
            maxResults=50,
        ).execute()

        video_ids = [
            item["id"]["videoId"]
            for item in search_response.get("items", [])
            if item["id"].get("videoId")
        ]

        if not video_ids:
            return videos

        # Step 2: Get detailed video stats
        for i in range(0, len(video_ids), 50):
            batch_ids = video_ids[i : i + 50]
            video_response = youtube.videos().list(
                part="snippet,statistics",
                id=",".join(batch_ids),
            ).execute()

            for item in video_response.get("items", []):
                snippet = item["snippet"]
                stats = item.get("statistics", {})
                video = Video(
                    video_id=item["id"],
                    title=snippet.get("title", ""),
                    description=snippet.get("description", ""),
                    view_count=int(stats.get("viewCount", 0)),
                    like_count=int(stats.get("likeCount", 0)),
                    comment_count=int(stats.get("commentCount", 0)),
                    published_at=snippet.get("publishedAt", ""),
                    thumbnail_url=snippet.get("thumbnails", {})
                    .get("medium", {})
                    .get("url", ""),
                )
                videos.append(video)

    except Exception as e:
        logger.error(f"Error fetching videos for channel {channel_id}: {e}")

    return videos
