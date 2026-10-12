import os
import sys
from pathlib import Path

# Set Netlify environment flag
os.environ["NETLIFY"] = "true"

# Ensure backend directory is in sys.path
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent.parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from mangum import Mangum

# pyrefly: ignore [missing-import]
from main import app

# pyrefly: ignore [missing-import]
from database import engine, Base

# Ensure SQLite tables exist
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database initialization notice: {e}")

handler = Mangum(app, lifespan="off")
