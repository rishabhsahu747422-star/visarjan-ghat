"""Runtime configuration. All secrets come from environment variables."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = Path(os.getenv("DATA_DIR", REPO_ROOT / "data"))

ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()
]

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "none")  # cerebras | anthropic | none
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
