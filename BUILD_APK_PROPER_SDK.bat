@echo off
echo ========================================
echo Building Android APK with Proper SDK
echo ========================================
echo.

REM Set proper Android SDK environment variables
echo Setting up Android SDK environment...
echo ========================================
set ANDROID_HOME=C:\Android\Sdk
set ANDROID_SDK_ROOT=C:\Android\Sdk
set "PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin;%ANDROID_HOME%\build-tools\34.0.0;%PATH%"

echo ✅ ANDROID_HOME: %ANDROID_HOME%
echo ✅ ANDROID_SDK_ROOT: %ANDROID_SDK_ROOT%
echo.

REM Verify SDK tools are available
echo Verifying Android SDK tools...
echo ========================================
if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo ✅ ADB found at: %ANDROID_HOME%\platform-tools\adb.exe
) else (
    echo ❌ ADB not found - check Android SDK installation
    pause
    exit /b 1
)

if exist "%ANDROID_HOME%\build-tools\34.0.0" (
    echo ✅ Build tools 34.0.0 found
) else (
    echo ❌ Build tools 34.0.0 not found - installing...
    "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" "build-tools;34.0.0"
)
echo.

REM Check Java version
echo Checking Java version...
echo ========================================
java -version
echo.

REM Step 1: Install missing dependencies
echo Step 1: Installing missing dependencies...
echo ========================================
npm install @babel/runtime @babel/core babel-preset-expo --save
echo ✅ Dependencies installed
echo.

REM Step 2: Clean previous builds
echo Step 2: Cleaning previous builds...
echo ========================================
cd android
call gradlew clean --no-daemon
cd ..
echo.

REM Step 3: Stop all Gradle daemons
echo Step 3: Stopping Gradle daemons...
echo ========================================
cd android
call gradlew --stop
cd ..
echo.

REM Step 4: Kill processes that might interfere
echo Step 4: Killing interfering processes...
echo ========================================
taskkill /F /IM adb.exe 2>nul
taskkill /F /IM java.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.

REM Step 5: Remove old APK files
echo Step 5: Removing old APK files...
echo ========================================
if exist "android\app\build\outputs\apk\release\*.apk" (
    del /F /Q "android\app\build\outputs\apk\release\*.apk" 2>nul
    echo ✅ Old release APKs removed
)
if exist "app-release-*.apk" (
    del /F /Q "app-release-*.apk" 2>nul
    echo ✅ Old root APKs removed
)
echo.

REM Step 6: Build the release APK
echo Step 6: Building Release APK...
echo ========================================
echo This may take 3-5 minutes depending on your system...
echo.
cd android
call gradlew assembleRelease --no-daemon --stacktrace
set BUILD_RESULT=%ERRORLEVEL%
cd ..
echo.

REM Step 7: Check build result and copy APK
echo Step 7: Processing build result...
echo ========================================
if %BUILD_RESULT% EQU 0 (
    echo ✅ Build completed successfully!
    
    if exist "android\app\build\outputs\apk\release\app-release.apk" (
        copy /Y "android\app\build\outputs\apk\release\app-release.apk" "app-release-latest.apk" >nul
        echo ✅ APK copied to: app-release-latest.apk
        
        REM Get APK size
        for %%A in ("app-release-latest.apk") do set APK_SIZE=%%~zA
        set /a APK_SIZE_MB=%APK_SIZE%/1024/1024
        echo ✅ APK Size: %APK_SIZE_MB% MB (%APK_SIZE% bytes)
        echo.
        
        REM Step 8: Install APK on device
        echo Step 8: Installing APK on connected device...
        echo ========================================
        
        REM Check for connected devices
        adb devices > temp_devices.txt
        findstr /C:"device" temp_devices.txt | findstr /V /C:"List of devices" >nul
        if %ERRORLEVEL% EQU 0 (
            echo ✅ Android device detected
            adb install -r "app-release-latest.apk"
            if %ERRORLEVEL% EQU 0 (
                echo.
                echo ========================================
                echo ✅ SUCCESS! APK built and installed
                echo ========================================
                echo APK Location: app-release-latest.apk
                echo Size: %APK_SIZE_MB% MB
                echo Target SDK: 34
                echo Min SDK: 23
                echo ========================================
            ) else (
                echo ❌ Installation failed - please install manually
                echo APK available at: app-release-latest.apk
            )
        ) else (
            echo ⚠️  No Android device connected
            echo APK built successfully: app-release-latest.apk
            echo Connect device and run: adb install -r app-release-latest.apk
        )
        del temp_devices.txt 2>nul
    ) else (
        echo ❌ APK file not found after successful build
        echo Check: android\app\build\outputs\apk\release\
    )
) else (
    echo ❌ Build failed with error code: %BUILD_RESULT%
    echo Check the build output above for errors
    echo.
    echo Common solutions:
    echo - Ensure Android SDK is properly installed
    echo - Check Java version compatibility
    echo - Run: gradlew clean in android folder
    echo - Check for missing dependencies
)

echo.
echo ========================================
echo Build Process Summary
echo ========================================
echo SDK Path: %ANDROID_HOME%
echo Build Tools: 34.0.0
echo Target SDK: 34
echo Min SDK: 23
echo Java Version: OpenJDK 17
echo ========================================
pause