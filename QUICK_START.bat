@echo off
echo ========================================
echo LetsBunk System Quick Start
echo ========================================
echo.
echo Starting Backend Server...
start "LetsBunk Server" cmd /k "cd /d %~dp0 && npm start"
timeout /t 3 /nobreak >nul

echo Starting Admin Panel...
start "Admin Panel" cmd /k "cd /d %~dp0admin-panel && npm start"

echo.
echo ========================================
echo System Started!
echo ========================================
echo.
echo Backend Server: https://letsbunk-uw7g.onrender.com
echo Admin Panel: Opening Electron app...
echo.
echo Mobile apps on your phone will connect to:
echo - LetsBunk App: https://letsbunk-uw7g.onrender.com
echo - Enrollment App: https://letsbunk-uw7g.onrender.com/api
echo.
echo Press any key to exit this window...
echo (Server and Admin Panel will keep running)
pause >nul
