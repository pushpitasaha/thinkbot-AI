#!/bin/bash
# start.sh - Deployment start script

# Set working directory to where this script is located
cd "$(dirname "$0")"

# Start the application
uvicorn index:app --host 0.0.0.0 --port ${PORT:-8000}
