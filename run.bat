@echo off
echo ===================================================
echo   CampusFix AI - AI-Powered Campus Issue Reporter
echo ===================================================
echo.
echo Installing dependencies...
python -m pip install -r requirements.txt
echo.
echo Starting CampusFix AI Server...
python app.py
pause

