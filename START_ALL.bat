@echo off
echo ========================================
echo    LetsBunk - Quick Start Script
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB status...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo MongoDB is not running. Starting MongoDB...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo ERROR: Failed to start MongoDB!
        echo Please install MongoDB first or start it manually.
        echo See SETUP_LOCAL_MONGODB.md for installation guide.
        pause
        exit /b 1
    )
    echo MongoDB started successfully!
) else (
    echo MongoDB is already running!
)
echo.

REM Check if node_modules exists
echo [2/4] Checking dependencies...
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

REM Check if .env exists
echo [3/4] Checking configuration...
if not exist ".env" (
    echo .env file not found. Creating from .env.example...
    copy .env.example .env
    echo Configuration file created!
) else (
    echo Configuration file exists!
)
echo.

echo [4/4] Starting LetsBunk Server...
echo.
echo ========================================
echo Server will start on http://localhost:3000
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the server
node server.js

pause
