@echo off
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          LetsBunk Attendance System - Local Setup         ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Starting local development environment...
echo.

REM Check if MongoDB is running
echo [1/3] Checking MongoDB...
mongosh --eval "db.version()" >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ MongoDB is not running
    echo    Starting MongoDB service...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo    ⚠️  Could not start MongoDB automatically
        echo    Please start MongoDB manually: net start MongoDB
        pause
        exit /b 1
    )
    echo    ✅ MongoDB started
) else (
    echo    ✅ MongoDB is running
)
echo.

REM Check database
echo [2/3] Checking database...
mongosh attendance_app --eval "db.studentmanagements.countDocuments()" --quiet >nul 2>&1
if %errorlevel% neq 0 (
    echo    ⚠️  Database not accessible
    pause
    exit /b 1
) else (
    echo    ✅ Database ready (attendance_app)
)
echo.

REM Start server
echo [3/3] Starting backend server...
echo    Server will run on: http://localhost:3000
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📝 Next steps:
echo    1. Server is starting below
echo    2. Open another terminal and run: cd admin-panel ^&^& npm start
echo    3. Or double-click: START_ADMIN_PANEL.bat
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Start the server
npm start
