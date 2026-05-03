@echo off
REM ============================================
REM TopperGuide Setup Script for Windows
REM ============================================

echo.
echo ========================================
echo    TopperGuide Setup Script (Windows)
echo ========================================
echo.

REM Check if Python is installed
echo [*] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Python not found!
    echo     Please install Python 3.9 or higher from:
    echo     https://www.python.org/downloads/
    echo.
    echo     IMPORTANT: Check "Add Python to PATH" during installation!
    pause
    exit /b 1
)
python --version
echo [OK] Python found

REM Check if Node.js is installed
echo.
echo [*] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js not found!
    echo     Please install Node.js 18 or higher from:
    echo     https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo [OK] Node.js found

REM Check if npm is installed
echo.
echo [*] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] npm not found!
    pause
    exit /b 1
)
npm --version
echo [OK] npm found

REM Check if Ollama is installed
echo.
echo [*] Checking Ollama...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Ollama not found!
    echo     Please download and install from:
    echo     https://ollama.ai/download/windows
    echo.
    echo     After installing, run: ollama pull llama3.2
    echo.
) else (
    echo [OK] Ollama found
)

echo.
echo ----------------------------------------
echo Setting up Backend...
echo ----------------------------------------

cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

REM Create uploads directory
if not exist "uploads" mkdir uploads

echo [OK] Backend setup complete

cd ..

echo.
echo ----------------------------------------
echo Setting up Frontend...
echo ----------------------------------------

cd frontend

REM Install npm dependencies
echo Installing Node.js dependencies...
call npm install

echo [OK] Frontend setup complete

cd ..

echo.
echo ========================================
echo    SETUP COMPLETE!
echo ========================================
echo.
echo To run the application:
echo.
echo 1. Start Ollama (Terminal 1):
echo    ollama serve
echo.
echo 2. Pull AI model (one time only):
echo    ollama pull llama3.2
echo.
echo 3. Start Backend (Terminal 2):
echo    cd backend
echo    venv\Scripts\activate
echo    python main.py
echo.
echo 4. Start Frontend (Terminal 3):
echo    cd frontend
echo    npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
