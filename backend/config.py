import os
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# How many days back to search for videos
DAYS_BACK = 10

# Max description chars to send to Gemini (token-saving)
MAX_DESCRIPTION_LENGTH = 200

# CORS origins
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://*.onrender.com",
]
