import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    # OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-40-mini")
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./topperguide.db")
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff"}

config = Config()
