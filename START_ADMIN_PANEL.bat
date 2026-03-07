@echo off
echo ========================================
echo    LetsBunk - Admin Panel Launcher
echo ========================================
echo.

REM Navigate to admin-panel directory
cd admin-panel

REM Check if node_modules exists
echo [1/2] Checking admin panel dependencies...
if not exist "node_modules\" (
    echo Dependencies not found. Installing...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed!
)
echo.

echo [2/2] Starting Admin Panel...
echo.
echo ========================================
echo Admin Panel will launch in a new window
echo ========================================
echo.

REM Start Electron app
call npm start

pause
