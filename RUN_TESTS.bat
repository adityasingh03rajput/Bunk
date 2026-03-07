@echo off
echo ╔════════════════════════════════════════╗
echo ║   LETSBUNK SYSTEM TEST RUNNER          ║
echo ╚════════════════════════════════════════╝
echo.

:menu
echo.
echo Select test to run:
echo.
echo 1. Fresh Start Setup (WIPE DB + Seed Minimum Data)
echo 2. Complete Userflow Test (Remote - Render)
echo 3. Complete Userflow Test (Local - localhost:3000)
echo 4. Quick Feature Test (Remote - Render)
echo 5. Quick Feature Test (Local - localhost:3000)
echo 6. Clear Database
echo 7. Exit
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto fresh_start
if "%choice%"=="2" goto complete_remote
if "%choice%"=="3" goto complete_local
if "%choice%"=="4" goto quick_remote
if "%choice%"=="5" goto quick_local
if "%choice%"=="6" goto clear
if "%choice%"=="7" goto end

echo Invalid choice! Please try again.
goto menu

:fresh_start
echo.
echo ═══════════════════════════════════════════
echo FRESH START: Wiping DB + Seeding Data
echo ═══════════════════════════════════════════
echo.
echo WARNING: This will DELETE all data and start fresh!
echo.
set /p confirm="Type 'YES' to proceed: "
if /i "%confirm%"=="YES" (
    node fresh-start-setup.js
) else (
    echo Cancelled.
)
pause
goto menu

:complete_remote
echo.
echo ═══════════════════════════════════════════
echo Running Complete Userflow Test (Remote)...
echo ═══════════════════════════════════════════
echo.
node test-complete-flow.js
pause
goto menu

:complete_local
echo.
echo ═══════════════════════════════════════════
echo Running Complete Userflow Test (Local)...
echo ═══════════════════════════════════════════
echo.
node test-complete-flow.js --local
pause
goto menu

:quick_remote
echo.
echo ═══════════════════════════════════════════
echo Running Quick Feature Tests (Remote)...
echo ═══════════════════════════════════════════
echo.
node quick-test.js
pause
goto menu

:quick_local
echo.
echo ═══════════════════════════════════════════
echo Running Quick Feature Tests (Local)...
echo ═══════════════════════════════════════════
echo.
node quick-test.js --local
pause
goto menu

:clear
echo.
echo ═══════════════════════════════════════════
echo WARNING: This will DELETE ALL DATA!
echo ═══════════════════════════════════════════
echo.
node clear-database.js
pause
goto menu

:end
echo.
echo Goodbye!
echo.
exit
