"""
Validation service for verifying creator nationality and language consistency.
Uses YouTube Data API regionCode and Gemini language detection.
"""
import logging
import json
from pathlib import Path
from datetime import datetime
from google import genai

from config import GEMINI_API_KEY
from youtube_service import get_youtube_service

logger = logging.getLogger(__name__)
client = genai.Client(api_key=GEMINI_API_KEY)

CREATORS_PATH = Path(__file__).parent / "creators.json"
ALERTS_PATH = Path(__file__).parent / "validation_alerts.json"

# Expected language for each nationality
NATIONALITY_LANGUAGES = {
    "JP": ["ja", "Japanese"],
    "TW": ["zh", "zh-TW", "Chinese", "Mandarin"],
    "KR": ["ko", "Korean"],
}

# Expected country codes for each nationality
NATIONALITY_REGIONS = {
    "JP": ["JP"],
    "TW": ["TW", "HK"],
    "KR": ["KR"],
}


def get_channel_country(channel_id: str) -> str | None:
    """
    Fetch the country setting of a YouTube channel via API.
    """
    try:
        youtube = get_youtube_service()
        response = youtube.channels().list(
            part="snippet",
            id=channel_id,
        ).execute()
        items = response.get("items", [])
        if items:
            return items[0]["snippet"].get("country", None)
    except Exception as e:
        logger.error(f"Error fetching channel country for {channel_id}: {e}")
    return None


async def detect_language(title: str) -> dict:
    """
    Use Gemini to detect the language of a video title.
    """
    prompt = f"""Detect the primary language of this YouTube video title.
Title: "{title}"

Respond ONLY with a valid JSON object, no markdown:
{{"language_code": "xx", "language_name": "LanguageName", "confidence": 0.0-1.0}}

Use standard ISO 639-1 codes: ja=Japanese, zh=Chinese, ko=Korean, en=English, etc."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except Exception as e:
        logger.error(f"Language detection error: {e}")
        return {"language_code": "unknown", "language_name": "Unknown", "confidence": 0.0}


async def validate_creator(
    channel_id: str,
    expected_nationality: str,
    recent_titles: list[str],
) -> dict:
    """
    Validate a creator's nationality by checking:
    1. Channel's set country vs expected nationality
    2. Language of recent video titles vs expected language
    """
    alerts = []

    # Check 1: Channel country setting
    channel_country = get_channel_country(channel_id)
    expected_regions = NATIONALITY_REGIONS.get(expected_nationality, [])

    if channel_country and channel_country not in expected_regions:
        alerts.append({
            "type": "region_mismatch",
            "severity": "warning",
            "message": f"Channel country '{channel_country}' does not match expected nationality '{expected_nationality}'",
            "channel_id": channel_id,
            "expected": expected_nationality,
            "actual": channel_country,
        })

    # Check 2: Language detection on recent titles
    if recent_titles:
        expected_langs = NATIONALITY_LANGUAGES.get(expected_nationality, [])
        sample_titles = recent_titles[:3]

        for title in sample_titles:
            lang_result = await detect_language(title)
            lang_code = lang_result.get("language_code", "unknown")
            lang_name = lang_result.get("language_name", "Unknown")

            if lang_code not in expected_langs and lang_name not in expected_langs:
                severity = "info" if lang_code == "en" else "warning"
                alerts.append({
                    "type": "language_mismatch",
                    "severity": severity,
                    "message": f"Title language '{lang_name}' ({lang_code}) doesn't match expected '{expected_nationality}'",
                    "title": title,
                    "detected_language": lang_code,
                    "expected_nationality": expected_nationality,
                })

    return {
        "channel_id": channel_id,
        "expected_nationality": expected_nationality,
        "channel_country": channel_country,
        "alerts": alerts,
        "is_valid": len([a for a in alerts if a["severity"] == "warning"]) == 0,
    }


def save_alerts(alerts: list[dict]):
    """Save validation alerts to a JSON file for review."""
    alert_data = {
        "generated_at": datetime.utcnow().isoformat(),
        "total_alerts": len(alerts),
        "alerts": alerts,
    }
    with open(ALERTS_PATH, "w", encoding="utf-8") as f:
        json.dump(alert_data, f, ensure_ascii=False, indent=2)
    logger.info(f"Saved {len(alerts)} validation alerts to {ALERTS_PATH}")


def load_alerts() -> list[dict]:
    """Load existing validation alerts."""
    if ALERTS_PATH.exists():
        with open(ALERTS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("alerts", [])
    return []


def flag_creator_for_review(channel_id: str, reason: str):
    """Flag a creator in creators.json for review."""
    with open(CREATORS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    for creator in data.get("creators", []):
        if creator["channel_id"] == channel_id:
            creator["needs_review"] = True
            creator["review_reason"] = reason
            break

    with open(CREATORS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    logger.info(f"Flagged creator {channel_id} for review: {reason}")


def remove_flagged_creators() -> list[dict]:
    """Remove creators flagged for review from the active list."""
    with open(CREATORS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    removed = []
    cleaned = []
    for creator in data.get("creators", []):
        if creator.get("needs_review"):
            removed.append(creator)
        else:
            cleaned.append(creator)

    data["creators"] = cleaned
    with open(CREATORS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    logger.info(f"Removed {len(removed)} flagged creators from seed data")
    return removed
