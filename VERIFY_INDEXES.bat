@echo off
echo ========================================
echo Database Index Verification
echo ========================================
echo.
echo This script will verify that all required
echo indexes are created for the new collections:
echo - PeriodAttendance
echo - DailyAttendance
echo - AttendanceAudit
echo - SystemSettings
echo.
echo Press any key to start verification...
pause > nul

node scripts/verify-indexes.js

echo.
echo ========================================
echo Verification Complete
echo ========================================
pause
