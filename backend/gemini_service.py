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
    "#PR", "#pr", "#AD", "#ad", "【PR】", "【AD】", "[PR]", "[AD]", "【広告】", "【案件】", "【タイアップ】", "【提供】",
    "#広告", "#案件", "#タイアップ", "#Sponsored", "#sponsored", "提供", "タイアップ", "案件", "協賛", "プロモーション",
    "提供:", "提供：", "sponsored by", "Sponsored by",
    # Traditional Chinese (Taiwan)
    "#贊助", "#業配", "#合作", "【贊助】", "【業配】", "【合作】", "[贊助]", "[業配]", "[合作]",
    "贊助", "業配", "合作", "廣告", "工商", "付費推廣", "工商服務", "工商時間",
    # Korean
    "#협찬", "#광고", "#유료광고", "#유료_광고", "[협찬]", "[광고]", "[유료광고]", "【협찬】", "【광고】", "【유료광고】",
    "협찬", "광고", "유료광고", "유료 광고", "브랜디드", "스폰서", "제작지원",
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


async def batch_gemini_judge_sponsored(videos: list[Video]) -> list[Video]:
    """
    Use Gemini Flash to determine if a batch of videos are sponsored content.
    Returns the updated list of videos.
    """
    if not videos:
        return videos

    sys_prompt = """You are an expert at identifying sponsored/promotional content on YouTube.
Analyze the following list of videos (ID, Title, Description snippet) to determine if each is a sponsored video (企業案件, 業配, 협찬, paid promotion).
Look for indicators such as explicit sponsor mentions, brand partnerships, product placements, or paid promotional content.
Respond ONLY with a valid JSON object matching exactly this schema:
{
  "results": {
    "video_id_1": {"is_sponsored": true, "confidence": 0.95},
    "video_id_2": {"is_sponsored": false, "confidence": 0.1}
  }
}
Do not include any other text, markdown formatting, or explanations."""

    prompt = sys_prompt + "\n\nVIDEOS:\n"
    for v in videos:
        # truncate safely and remove newlines for compact prompt
        truncated_desc = v.description[:MAX_DESCRIPTION_LENGTH].replace("\n", " ")
        prompt += f"ID: {v.video_id} | Title: {v.title} | Desc: {truncated_desc}\n"

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1]
            text = text.rsplit("```", 1)[0]
            text = text.strip()
            
        result = json.loads(text)
        res_dict = result.get("results", {})
        
        for v in videos:
            judgement = res_dict.get(v.video_id, {})
            v.is_sponsored = bool(judgement.get("is_sponsored", False))
            v.sponsor_confidence = float(judgement.get("confidence", 0.0))
            
    except Exception as e:
        logger.error(f"Gemini API batch error: {e}")
        # On error (like rate limit), fallback to false
        for v in videos:
            v.is_sponsored = False
            v.sponsor_confidence = 0.0
            
    return videos
