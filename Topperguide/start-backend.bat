@echo off
REM Start TopperGuide Backend
echo Starting TopperGuide Backend...
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
python main.py
