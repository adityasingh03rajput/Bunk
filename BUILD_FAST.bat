@echo off
setlocal enabledelayedexpansion
echo ========================================
echo  LetsBunk Build ^& Install Script
echo  Usage: BUILD_FAST.bat [--release]
echo ========================================
echo.

REM Parse args: default = debug (fast), pass --release for release build
set BUILD_TYPE=assembleDebug
set APK_SUBPATH=debug\app-debug.apk
set BUILD_LABEL=DEBUG

for %%A in (%*) do (
    if /I "%%A"=="--release" (
        set BUILD_TYPE=assembleRelease
        set APK_SUBPATH=release\app-release.apk
        set BUILD_LABEL=RELEASE
    )
)

echo Build mode: %BUILD_LABEL%
echo.

REM Step 1: Cleanup old APKs (no uninstall - preserves permissions)
echo [1/3] Removing old APKs...
del /S /F /Q *.apk >nul 2>&1
echo     Done.
echo.

REM Step 2: Build
echo [2/3] Building (%BUILD_LABEL% mode)...
echo     This may take a few minutes...
cd android
call gradlew %BUILD_TYPE% --no-daemon --build-cache --parallel
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build FAILED! Check errors above.
    cd ..
    pause
    exit /b 1
)
cd ..
echo.
echo ✅ Build complete!
echo.

REM Step 3: Locate APK
set APK_PATH=android\app\build\outputs\apk\%APK_SUBPATH%
if not exist "%APK_PATH%" (
    echo ❌ APK not found at: %APK_PATH%
    pause
    exit /b 1
)
echo     APK: %APK_PATH%
echo.

REM Step 4: Detect connected device (prefer wireless TCP/IP)
echo [3/3] Detecting device...
set TARGET_DEVICE=

REM Look for a TCP/IP (wireless) device first — format: 192.168.x.x:PORT or serial:5555
for /f "tokens=1" %%i in ('adb devices 2^>nul') do (
    set "LINE=%%i"
    if not "!LINE!"=="!LINE::5555=!" set "TARGET_DEVICE=!LINE!"
    if not "!LINE!"=="!LINE::5554=!" set "TARGET_DEVICE=!LINE!"
    if not "!LINE!"=="!LINE::5556=!" set "TARGET_DEVICE=!LINE!"
)

REM Fallback: any device (USB)
if "!TARGET_DEVICE!"=="" (
    for /f "skip=1 tokens=1" %%i in ('adb devices 2^>nul') do (
        set "LINE=%%i"
        if not "!LINE!"=="" if not "!LINE!"=="List" (
            if "!TARGET_DEVICE!"=="" set "TARGET_DEVICE=!LINE!"
        )
    )
)

if "!TARGET_DEVICE!"=="" (
    echo ⚠️  No device connected.
    echo     APK is ready at: %APK_PATH%
    echo     Run manually:  adb install -r "%APK_PATH%"
    echo.
    pause
    exit /b 0
)

echo     Device: !TARGET_DEVICE!
adb -s !TARGET_DEVICE! install -r "%APK_PATH%"
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  ✅ SUCCESS! Installed on !TARGET_DEVICE!
    echo ========================================
) else (
    echo.
    echo ⚠️  Install failed. Check for permission prompts on device.
    echo     Enable "Install via USB" / "Wireless Debugging" in Developer Options.
)

echo.
pause
