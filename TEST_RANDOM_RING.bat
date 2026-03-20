@echo off
echo ========================================
echo  Random Ring Test Script
echo ========================================
echo.

REM ---- CONFIG ----
set SERVER=https://letsbunk-uw7g.onrender.com
set SEMESTER=1
set BRANCH=cse comp

set /p TEACHER_ID="Enter Teacher Login ID (e.g. T001): "
set /p TEACHER_NAME="Enter Teacher Name (e.g. Aditya): "
REM -----------------

echo.
echo [1] Triggering Random Ring for ALL active students...
echo     Server  : %SERVER%
echo     Teacher : %TEACHER_ID% (%TEACHER_NAME%)
echo     Class   : Sem %SEMESTER% - %BRANCH%
echo.

powershell -NoProfile -Command ^
  "$body = '{\"type\":\"all\",\"teacherId\":\"%TEACHER_ID%\",\"teacherName\":\"%TEACHER_NAME%\",\"semester\":\"%SEMESTER%\",\"branch\":\"%BRANCH%\"}'; " ^
  "try { $r = Invoke-WebRequest -Uri '%SERVER%/api/random-ring' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing; Write-Host '✅ Server Response:' $r.Content } " ^
  "catch { Write-Host '❌ HTTP Error:' $_.Exception.Message }"

echo.
echo [2] Waiting 5 seconds for student device to receive notification...
timeout /t 5 /nobreak >nul

echo.
echo ---- LOGCAT: Device 1 (091945934X001314 - Student) ----
powershell -NoProfile -Command "adb -s 091945934X001314 logcat -d | Select-String -Pattern 'countdowntimer|ReactNativeJS|FATAL' | Select-Object -Last 80"

echo.
echo ---- LOGCAT: Device 2 (13729425410008D - Teacher) ----
powershell -NoProfile -Command "adb -s 13729425410008D logcat -d | Select-String -Pattern 'countdowntimer|ReactNativeJS|FATAL' | Select-Object -Last 40"

echo.
echo ========================================
echo  Done
echo ========================================
pause
