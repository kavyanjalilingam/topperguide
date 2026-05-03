#!/bin/bash

# Start TopperGuide Frontend
echo "🚀 Starting TopperGuide Frontend..."
cd "$(dirname "$0")/frontend"
npm run dev
