# index.py - Entry point for deployment
# This file imports the FastAPI app from main.py for deployment compatibility

from main import app

# Re-export the app for uvicorn to find
__all__ = ["app"]
