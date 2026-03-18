@echo off
echo ========================================
echo   DATABASE RESET UTILITY
echo ========================================
echo.
echo WARNING: This will DELETE ALL DATA!
echo.
echo What will be deleted:
echo   - All Students
echo   - All Teachers  
echo   - All Attendance Records
echo   - All Timetables
echo   - All Classrooms
echo   - All other data
echo.
echo What will be KEPT:
echo   - Database schemas/collections
echo   - Database structure
echo.
echo ========================================
echo.
set /p confirm="Type 'RESET' to confirm: "

if /i "%confirm%"=="RESET" (
    echo.
    echo Starting database reset...
    node reset-database.js
) else (
    echo.
    echo ❌ Reset cancelled.
    echo You must type 'RESET' exactly to confirm.
)

echo.
pause
