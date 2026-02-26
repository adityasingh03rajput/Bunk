# Local Server Configuration - COMPLETE ✅

## Summary

Successfully verified and updated the app to use a single, unified server URL configuration. The app now points to your local server for development and testing.

## Verification Results

### ✅ Single Source of Truth Confirmed

**React Native App**:
- **File**: `config.js` (line 14)
- **URL**: `http://192.168.55.31:3000`
- **Status**: ✅ Only location where server URL is defined

**Admin Panel**:
- **File**: `admin-panel/renderer.js` (line 10)
- **URL**: `http://192.168.55.31:3000`
- **Status**: ✅ Updated to match app configuration

**Helper Script**:
- **File**: `admin-panel/set-render-url.js` (line 4)
- **URL**: `http://192.168.55.31:3000`
- **Status**: ✅ Updated for consistency

### ✅ All Components Use Config

Verified that all app components import from `config.js`:
- ✅ `App.js` - Imports `SERVER_BASE_URL`, `API_URL`, `SOCKET_URL`
- ✅ `ViewRecords.js` - Imports `SOCKET_URL` from config
- ✅ `SemesterSelector.js` - Imports `SOCKET_URL` from config
- ✅ `TimetableScreen.js` - Receives `socketUrl` prop from App.js
- ✅ `WiFiManager.js` - Receives `serverUrl` prop from App.js

### ✅ No Hardcoded URLs Found

Searched entire codebase (excluding test files):
- ❌ No hardcoded production URLs in app source
- ❌ No hardcoded localhost URLs in app source
- ❌ No hardcoded IP addresses in app source
- ✅ All URLs derived from `config.js`

## Changes Made

### 1. React Native App (`config.js`)

**Before**:
```javascript
export const SERVER_BASE_URL = 'https://letsbunk-uw7g.onrender.com';
```

**After**:
```javascript
// Production: https://letsbunk-uw7g.onrender.com
// Local: http://192.168.55.31:3000
export const SERVER_BASE_URL = 'http://192.168.55.31:3000';
```

### 2. Admin Panel (`admin-panel/renderer.js`)

**Before**:
```javascript
let SERVER_URL = localStorage.getItem('serverUrl') || 'https://letsbunk-uw7g.onrender.com';
```

**After**:
```javascript
let SERVER_URL = localStorage.getItem('serverUrl') || 'http://192.168.55.31:3000';
```

### 3. Helper Script (`admin-panel/set-render-url.js`)

**Before**:
```javascript
const RENDER_URL = 'https://letsbunk-uw7g.onrender.com';
```

**After**:
```javascript
const RENDER_URL = 'http://192.168.55.31:3000';
```

## Local Server Configuration

### Your Network Details
- **Local IP**: `192.168.55.31`
- **Server Port**: `3000`
- **Full URL**: `http://192.168.55.31:3000`

### Server Requirements

**Before building the app, ensure your local server is running**:

1. **Start MongoDB** (if not already running)
   ```bash
   # MongoDB should be running on localhost:27017
   ```

2. **Start Node.js Server**
   ```bash
   node server.js
   # OR
   npm start
   ```

3. **Verify Server is Running**
   ```bash
   # Open browser and visit:
   http://192.168.55.31:3000/api/health
   
   # Should return: {"status":"ok"}
   ```

### Network Configuration

**Important**: Your mobile device must be on the same WiFi network as your computer.

**Firewall Settings**:
- Ensure Windows Firewall allows Node.js on port 3000
- If blocked, add firewall rule:
  ```powershell
  New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
  ```

## Building the App

### Step 1: Verify Server is Running
```bash
# Test from your computer
curl http://192.168.55.31:3000/api/health

# Should return: {"status":"ok"}
```

### Step 2: Build APK
```bash
# Run the build script
BUILD_APK_PROPER_SDK.bat
```

### Step 3: Install on Device
```bash
# APK will be created at: app-release-latest.apk
# Install using:
adb install -r app-release-latest.apk
```

## Testing Checklist

After building and installing the app:

### Server Connection
- [ ] Server is running on `http://192.168.55.31:3000`
- [ ] Health check endpoint responds: `/api/health`
- [ ] Mobile device is on same WiFi network
- [ ] Firewall allows connections on port 3000

### App Functionality
- [ ] App launches successfully
- [ ] Login screen appears
- [ ] Can login with credentials
- [ ] Student data loads from local server
- [ ] Timetable displays correctly
- [ ] Attendance check-in works
- [ ] WiFi verification works
- [ ] Face verification works

### Admin Panel
- [ ] Admin panel opens in browser
- [ ] Connects to `http://192.168.55.31:3000`
- [ ] Dashboard loads data
- [ ] Can view students/teachers
- [ ] Can edit timetables
- [ ] Period reports work
- [ ] Manual marking works
- [ ] Audit trail displays

## Troubleshooting

### Issue: App can't connect to server
**Solutions**:
1. Verify server is running: `curl http://192.168.55.31:3000/api/health`
2. Check mobile device is on same WiFi network
3. Check Windows Firewall settings
4. Verify IP address hasn't changed: `ipconfig`
5. Rebuild app if IP changed

### Issue: "Network request failed"
**Solutions**:
1. Server might not be running - start with `node server.js`
2. Firewall blocking connections - add firewall rule
3. Wrong IP address - verify with `ipconfig`
4. Mobile device on different network - connect to same WiFi

### Issue: Admin panel can't connect
**Solutions**:
1. Clear browser cache and localStorage
2. Open Settings in admin panel
3. Update Server URL to `http://192.168.55.31:3000`
4. Click Save and refresh page

### Issue: IP address changed
**Solutions**:
1. Get new IP: `ipconfig` (look for IPv4 Address)
2. Update `config.js` line 14
3. Update `admin-panel/renderer.js` line 10
4. Rebuild app: `BUILD_APK_PROPER_SDK.bat`

## Switching Between Local and Production

### To Production (Render.com)
1. Update `config.js`:
   ```javascript
   export const SERVER_BASE_URL = 'https://letsbunk-uw7g.onrender.com';
   ```
2. Update `admin-panel/renderer.js`:
   ```javascript
   let SERVER_URL = localStorage.getItem('serverUrl') || 'https://letsbunk-uw7g.onrender.com';
   ```
3. Rebuild app: `BUILD_APK_PROPER_SDK.bat`

### To Local Development
1. Update `config.js`:
   ```javascript
   export const SERVER_BASE_URL = 'http://192.168.55.31:3000';
   ```
2. Update `admin-panel/renderer.js`:
   ```javascript
   let SERVER_URL = localStorage.getItem('serverUrl') || 'http://192.168.55.31:3000';
   ```
3. Rebuild app: `BUILD_APK_PROPER_SDK.bat`

## Server Startup Commands

### Start Local Server
```bash
# Navigate to project directory
cd "d:\bunk bssid"

# Start server
node server.js

# Server will start on:
# - HTTP: http://192.168.55.31:3000
# - WebSocket: ws://192.168.55.31:3000
```

### Verify Server is Running
```bash
# Check health endpoint
curl http://192.168.55.31:3000/api/health

# Check students endpoint
curl http://192.168.55.31:3000/api/students

# Check config endpoint
curl http://192.168.55.31:3000/api/config
```

## Files Modified

1. ✅ `config.js` - Updated SERVER_BASE_URL to local IP
2. ✅ `admin-panel/renderer.js` - Updated default SERVER_URL
3. ✅ `admin-panel/set-render-url.js` - Updated RENDER_URL

## Summary

✅ **Verification Complete**: App uses single unified server URL
✅ **Configuration Updated**: All URLs point to local server
✅ **Ready to Build**: Run `BUILD_APK_PROPER_SDK.bat` to create APK
✅ **Network**: Ensure server running on `http://192.168.55.31:3000`

---

**Configuration**: LOCAL DEVELOPMENT
**Server URL**: http://192.168.55.31:3000
**Your IP**: 192.168.55.31
**Status**: ✅ READY TO BUILD
**Date**: February 26, 2026
