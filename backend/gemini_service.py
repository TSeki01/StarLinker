"""
Gemini-based sponsored content detection service.
Uses keyword pre-filter + Gemini Flash AI for ambiguous cases.
"""
import logging
import re
import json
from google import genai
from config import GEMINI_API_KEY, MAX_DESCRIPTION_LENGTH
from models import Video

logger = logging.getLogger(__name__)

# Configure Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

# ----- Keyword-based pre-filter -----
SPONSOR_KEYWORDS = [
    # Japanese
    "#PR", "#pr", "#AD", "#ad", "#広告", "#案件", "#タイアップ",
    "#Sponsored", "#sponsored", "提供", "タイアップ", "案件",
    "協賛", "プロモーション",
    # Traditional Chinese (Taiwan)
    "#贊助", "#業配", "#合作", "贊助", "業配", "合作",
    "廣告", "工商", "付費推廣",
    # Korean
    "#협찬", "#광고", "#유료광고", "#유료_광고",
    "협찬", "광고", "유료광고", "유료 광고",
    "브랜디드", "스폰서",
    # English (commonly used by all regions)
    "Sponsored", "sponsored", "paid promotion", "Paid Promotion",
    "#collab", "brand deal",
]

# Compiled regex for fast matching
_keyword_pattern = re.compile(
    "|".join(re.escape(kw) for kw in SPONSOR_KEYWORDS),
    re.IGNORECASE,
)


def keyword_pre_filter(title: str, description: str) -> bool:
    """
    Quick check if title or description contains known sponsor keywords.
    Returns True if likely sponsored.
    """
    text = f"{title} {description[:MAX_DESCRIPTION_LENGTH]}"
    return bool(_keyword_pattern.search(text))


async def gemini_judge_sponsored(
    title: str, description: str, lang: str = "ja"
) -> dict:
    """
    Use Gemini Flash to determine if a video is sponsored content.
    Returns {"is_sponsored": bool, "confidence": float}
    """
    truncated_desc = description[:MAX_DESCRIPTION_LENGTH]

    prompt = f"""You are an expert at identifying sponsored/promotional content on YouTube.

Analyze the following video title and description to determine if this is a sponsored video 
(企業案件, 業配, 협찬). Look for indicators such as:
- Explicit sponsor mentions (#PR, #ad, 提供, 贊助, 협찬, etc.)
- Brand partnerships or product placements
- Government/corporate tie-up content
- Paid promotional content

Video Title: {title}
Video Description (first 200 chars): {truncated_desc}

Respond ONLY with a valid JSON object, no markdown formatting:
{{"is_sponsored": true/false, "confidence": 0.0-1.0}}"""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        text = response.text.strip()
        # Clean up markdown wrapping if present
        if text.startswith("```"):
            text = text.split("\n", 1)[-1]
            text = text.rsplit("```", 1)[0]
            text = text.strip()
        result = json.loads(text)
        return {
            "is_sponsored": bool(result.get("is_sponsored", False)),
            "confidence": float(result.get("confidence", 0.0)),
        }
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return {"is_sponsored": False, "confidence": 0.0}


async def detect_sponsored(video: Video) -> Video:
    """
    Full sponsored detection pipeline:
    1. Keyword pre-filter (instant, free)
    2. If ambiguous, use Gemini for deeper analysis
    """
    # Step 1: Keyword check
    if keyword_pre_filter(video.title, video.description):
        video.is_sponsored = True
        video.sponsor_confidence = 0.95
        return video

    # Step 2: Gemini analysis for non-obvious cases
    result = await gemini_judge_sponsored(video.title, video.description)
    video.is_sponsored = result["is_sponsored"]
    video.sponsor_confidence = result["confidence"]

    return video
