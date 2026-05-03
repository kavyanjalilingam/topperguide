#!/bin/bash

# ============================================
# TopperGuide Setup Script for macOS/Linux
# ============================================

echo "🎓 TopperGuide Setup Script"
echo "==========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Python is installed
echo -e "${BLUE}Checking Python...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ $PYTHON_VERSION found${NC}"
else
    echo -e "${RED}✗ Python 3 not found. Please install Python 3.9 or higher${NC}"
    echo "  Download from: https://www.python.org/downloads/"
    exit 1
fi

# Check if Node.js is installed
echo -e "${BLUE}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18 or higher${NC}"
    echo "  Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
echo -e "${BLUE}Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm $NPM_VERSION found${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check if Ollama is installed
echo -e "${BLUE}Checking Ollama...${NC}"
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✓ Ollama found${NC}"
else
    echo -e "${YELLOW}⚠ Ollama not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            echo "  Download from: https://ollama.ai"
        fi
    else
        # Linux
        curl -fsSL https://ollama.ai/install.sh | sh
    fi
fi

echo ""
echo -e "${BLUE}Setting up Backend...${NC}"
echo "---------------------"

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# Create uploads directory
mkdir -p uploads

echo -e "${GREEN}✓ Backend setup complete${NC}"

cd ..

echo ""
echo -e "${BLUE}Setting up Frontend...${NC}"
echo "----------------------"

cd frontend

# Install npm dependencies
echo "Installing Node.js dependencies..."
npm install

echo -e "${GREEN}✓ Frontend setup complete${NC}"

cd ..

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}To run the application:${NC}"
echo ""
echo "1. Start Ollama (Terminal 1):"
echo "   ollama serve"
echo ""
echo "2. Pull AI model (one time only):"
echo "   ollama pull llama3.2"
echo ""
echo "3. Start Backend (Terminal 2):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "4. Start Frontend (Terminal 3):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
