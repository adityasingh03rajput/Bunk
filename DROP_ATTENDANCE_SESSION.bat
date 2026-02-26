@echo off
REM Drop AttendanceSession Collection Script
REM WARNING: This is a DESTRUCTIVE operation with NO rollback
REM Ensure backup exists before running

echo ========================================
echo Drop AttendanceSession Collection
echo ========================================
echo.
echo WARNING: This will permanently delete all timer-based attendance data
echo.
echo Prerequisites:
echo 1. Database backup must exist (run BACKUP_DATABASE.bat first)
echo 2. Server should be stopped during this operation
echo.
pause

echo.
echo Running drop script...
node scripts/drop-attendance-session.js

echo.
echo ========================================
echo Operation Complete
echo ========================================
echo.
echo Next Steps:
echo 1. Verify collection was dropped successfully
echo 2. Continue with remaining migration tasks
echo 3. Remove timer-based API endpoints (Task 2.1)
echo.
pause
