# 📦 APK Build Guide

## Current Build Status

### ✅ Build in Progress
- **Command**: `gradlew.bat assembleRelease --no-daemon`
- **Location**: `LetsBunk/android`
- **Process ID**: 5
- **Status**: Running

### Build Configuration
- **Java Version**: OpenJDK 17.0.17
- **Android SDK**: C:\Users\Prathmesh\AppData\Local\Android\Sdk
- **Gradle**: Wrapper (included in project)
- **Build Type**: Release (signed APK)

---

## Build Process

### Step 1: Prerequisites ✅
- [x] Java JDK 17 installed
- [x] Android SDK installed
- [x] ANDROID_HOME set
- [x] Gradle wrapper present
- [x] Server running

### Step 2: Code Preparation ✅
- [x] Face-API removed
- [x] URLs changed to localhost
- [x] Dependencies installed
- [x] No compilation errors

### Step 3: Build APK (In Progress)
```bash
cd LetsBunk/android
.\gradlew.bat assembleRelease --no-daemon
```

**Expected Time**: 5-10 minutes (first build)

### Step 4: Locate APK
After build completes, APK will be at:
```
LetsBunk/android/app/build/outputs/apk/release/app-release.apk
```

### Step 5: Copy to Root
```bash
copy android\app\build\outputs\apk\release\app-release.apk app-release-latest.apk
```

### Step 6: Install on Device
```bash
adb install -r app-release-latest.apk
```

---

## Build Output Structure

```
LetsBunk/
├── android/
│   ├── app/
│   │   └── build/
│   │       └── outputs/
│   │           └── apk/
│   │               └── release/
│   │                   └── app-release.apk  ← Built APK
│   └── gradlew.bat
└── app-release-latest.apk  ← Copied here for easy access
```

---

## Build Commands

### Full Build (Current)
```bash
cd LetsBunk/android
.\gradlew.bat assembleRelease --no-daemon
```

### Clean Build
```bash
cd LetsBunk/android
.\gradlew.bat clean
.\gradlew.bat assembleRelease --no-daemon
```

### Debug Build (Faster)
```bash
cd LetsBunk/android
.\gradlew.bat assembleDebug --no-daemon
```

### Build with Stacktrace (For Errors)
```bash
cd LetsBunk/android
.\gradlew.bat assembleRelease --no-daemon --stacktrace
```

---

## Build Configuration Files

### build.gradle (Project Level)
Location: `LetsBunk/android/build.gradle`
- Defines Android Gradle Plugin version
- Repository configurations
- Build script dependencies

### build.gradle (App Level)
Location: `LetsBunk/android/app/build.gradle`
- App ID: com.countdowntimer.app
- Min SDK: 23 (Android 6.0)
- Target SDK: 34 (Android 14)
- Version code and name
- Dependencies

### gradle.properties
Location: `LetsBunk/android/gradle.properties`
- Gradle JVM settings
- Android build options
- Memory allocation

---

## APK Signing

### Debug Signing (Automatic)
- Uses debug keystore
- Located at: `LetsBunk/android/app/debug.keystore`
- Automatically applied for debug builds

### Release Signing
- Uses same debug keystore for testing
- For production: Create release keystore
- Configure in `android/app/build.gradle`

---

## Build Optimization

### Speed Up Builds

**1. Use Gradle Daemon (Default)**
```bash
# Daemon keeps Gradle running between builds
# Enabled by default
```

**2. Increase Memory**
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

**3. Enable Parallel Execution**
```properties
org.gradle.parallel=true
org.gradle.configureondemand=true
```

**4. Use Build Cache**
```properties
org.gradle.caching=true
```

---

## Troubleshooting

### Build Fails with "Out of Memory"
**Solution**: Increase Gradle memory
```properties
# In android/gradle.properties
org.gradle.jvmargs=-Xmx4096m
```

### Build Fails with "SDK Not Found"
**Solution**: Set ANDROID_HOME
```bash
set ANDROID_HOME=C:\Users\Prathmesh\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=%ANDROID_HOME%
```

### Build Fails with "Java Version"
**Solution**: Use Java 17
```bash
# Check version
java -version

# Should show: openjdk version "17.x.x"
```

### Gradle Daemon Issues
**Solution**: Stop all daemons
```bash
cd android
.\gradlew.bat --stop
```

### Build Stuck at "CONFIGURING"
**Solution**: Wait or use --no-daemon
```bash
.\gradlew.bat assembleRelease --no-daemon
```

---

## Build Variants

### Release (Production)
```bash
.\gradlew.bat assembleRelease
```
- Optimized
- Minified
- Signed
- Smaller size

### Debug (Development)
```bash
.\gradlew.bat assembleDebug
```
- Not optimized
- Larger size
- Faster build
- Debug symbols

---

## Post-Build Steps

### 1. Verify APK
```bash
# Check if APK exists
dir android\app\build\outputs\apk\release\app-release.apk

# Check APK size
```

### 2. Copy APK
```bash
copy android\app\build\outputs\apk\release\app-release.apk app-release-latest.apk
```

### 3. Check Connected Devices
```bash
adb devices
```

### 4. Install APK
```bash
adb install -r app-release-latest.apk
```

### 5. Launch App
```bash
adb shell am start -n com.countdowntimer.app/.MainActivity
```

---

## Build Logs

### View Build Output
Build output is displayed in terminal during build.

### Save Build Log
```bash
.\gradlew.bat assembleRelease --no-daemon > build.log 2>&1
```

### Check for Errors
```bash
.\gradlew.bat assembleRelease --no-daemon --stacktrace
```

---

## APK Information

### Expected APK Size
- **Release**: 80-100 MB
- **Debug**: 100-120 MB

### APK Contents
- React Native runtime
- JavaScript bundle
- Native libraries
- Resources (images, fonts)
- Android framework

### Supported Architectures
- armeabi-v7a (32-bit ARM)
- arm64-v8a (64-bit ARM)
- x86 (32-bit Intel)
- x86_64 (64-bit Intel)

---

## Build Time Estimates

### First Build
- **Clean build**: 5-10 minutes
- **Incremental**: 2-5 minutes

### Subsequent Builds
- **With changes**: 2-3 minutes
- **No changes**: 30-60 seconds

### Factors Affecting Speed
- CPU speed
- RAM available
- SSD vs HDD
- Internet speed (for dependencies)
- Gradle daemon status

---

## Quick Reference

| Command | Purpose | Time |
|---------|---------|------|
| `assembleRelease` | Build release APK | 5-10 min |
| `assembleDebug` | Build debug APK | 3-5 min |
| `clean` | Clean build files | 1-2 min |
| `--no-daemon` | Don't use daemon | Slower |
| `--stacktrace` | Show error details | Same |

---

## Next Steps After Build

1. ✅ Wait for build to complete
2. ✅ Verify APK exists
3. ✅ Copy APK to root
4. ✅ Connect Android device
5. ✅ Install APK
6. ✅ Test application

---

**Status**: Build in progress (Process ID: 5)

**Estimated Completion**: 5-10 minutes

**Output Location**: `android/app/build/outputs/apk/release/app-release.apk`
