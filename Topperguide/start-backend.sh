#!/bin/bash

# Start TopperGuide Backend
echo "🚀 Starting TopperGuide Backend..."
cd "$(dirname "$0")/backend"
source venv/bin/activate
python main.py
