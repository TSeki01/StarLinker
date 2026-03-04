from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Creator(BaseModel):
    channel_id: str
    name: str
    nationality: str  # JP, TW, KR
    type: str  # youtuber, vtuber
    subscriber_count: int = 0
    profile_image_url: str = ""


class Video(BaseModel):
    video_id: str
    title: str
    description: str
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    published_at: str = ""
    thumbnail_url: str = ""
    is_sponsored: bool = False
    sponsor_confidence: float = 0.0


class SponsoredVideoResult(BaseModel):
    creator: Creator
    video: Video
    engagement_rate: float = 0.0  # (view_count / subscriber_count) * 100


class FilterParams(BaseModel):
    nationality: Optional[list[str]] = None  # ["JP", "TW", "KR"]
    creator_type: Optional[str] = None  # "youtuber" or "vtuber"
    sort_by: str = "views"  # "subscribers", "views", "engagement"
    lang: str = "ja"  # "ja", "zh-TW", "ko"
