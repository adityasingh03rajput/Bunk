# Server URL Unified - Configuration Summary

## ✅ Status: ALREADY UNIFIED

The application already has a centralized server URL configuration system in place.

## Configuration File

**Location**: `config.js` (root directory)

```javascript
export const SERVER_BASE_URL = 'https://letsbunk-uw7g.onrender.com';
export const API_URL = `${SERVER_BASE_URL}/api/config`;
export const SOCKET_URL = SERVER_BASE_URL;
```

## How It Works

### 1. Central Configuration (`config.js`)
- Single source of truth for server URL
- All derived URLs automatically generated from `SERVER_BASE_URL`
- Easy to update - change one line, rebuild app

### 2. App.js Integration
```javascript
import { SERVER_BASE_URL, API_URL as CONFIG_API_URL, SOCKET_URL as CONFIG_SOCKET_URL } from './config';

const API_URL = process.env.EXPO_PUBLIC_API_URL || CONFIG_API_URL;
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || CONFIG_SOCKET_URL;
```

### 3. Component Usage
All components import from config:
- `ViewRecords.js` - imports `SOCKET_URL` from config
- `SemesterSelector.js` - imports `SOCKET_URL` from config
- `TimetableScreen.js` - uses `socketUrl` prop passed from App.js
- `WiFiManager.js` - uses `serverUrl` prop passed from App.js

## Current Server URL

```
Production: https://letsbunk-uw7g.onrender.com
```

## How to Change Server URL

### Option 1: Update config.js (Recommended)
1. Open `config.js`
2. Change line 12:
   ```javascript
   export const SERVER_BASE_URL = 'https://your-new-server.com';
   ```
3. Rebuild the app:
   ```bash
   npm run android
   # OR
   BUILD_APK_PROPER_SDK.bat
   ```

### Option 2: Use Environment Variables
Set environment variables before building:
```bash
export EXPO_PUBLIC_API_URL=https://your-server.com/api/config
export EXPO_PUBLIC_SOCKET_URL=https://your-server.com
npm run android
```

## Components Using Config

### ✅ Properly Configured Components
1. **App.js** - Main app, imports from config
2. **ViewRecords.js** - Imports `SOCKET_URL` from config
3. **SemesterSelector.js** - Imports `SOCKET_URL` from config
4. **TimetableScreen.js** - Receives `socketUrl` prop from App.js
5. **WiFiManager.js** - Receives `serverUrl` prop from App.js

### Admin Panel (Separate Configuration)
The admin panel has its own configuration:
- **File**: `admin-panel/renderer.js` (line 10)
- **Default**: `https://letsbunk-uw7g.onrender.com`
- **Storage**: Saved in localStorage, can be changed in Settings

## Verification

### Check Current Configuration
```bash
# View config file
cat config.js | grep SERVER_BASE_URL

# Search for hardcoded URLs (should only find config.js)
grep -r "letsbunk-uw7g.onrender.com" --exclude-dir=node_modules --exclude-dir=android --exclude-dir=.git
```

### Test After Changing URL
1. Update `config.js`
2. Rebuild APK
3. Install on device
4. Check app connects to new server
5. Verify all features work (login, attendance, timetable)

## Benefits of Unified Configuration

✅ **Single Source of Truth**
- One place to update server URL
- No scattered hardcoded URLs

✅ **Easy Maintenance**
- Change once, affects entire app
- Reduces errors from inconsistent URLs

✅ **Environment Support**
- Can override with environment variables
- Supports dev/staging/production environments

✅ **Type Safety**
- Exported constants prevent typos
- IDE autocomplete support

## Related Files

### Configuration Files
- `config.js` - Main configuration (React Native app)
- `admin-panel/renderer.js` - Admin panel configuration
- `.env` - Environment variables (server-side)

### Components Using Config
- `App.js` - Main app entry point
- `ViewRecords.js` - View attendance records
- `SemesterSelector.js` - Semester/branch selector
- `TimetableScreen.js` - Timetable management
- `WiFiManager.js` - WiFi verification

## Admin Panel Configuration

The admin panel has a separate configuration system:

**Location**: `admin-panel/renderer.js` (lines 6-10)

```javascript
const savedUrl = localStorage.getItem('serverUrl');
if (savedUrl && savedUrl.includes('localhost')) {
    localStorage.setItem('serverUrl', 'https://letsbunk-uw7g.onrender.com');
}
let SERVER_URL = localStorage.getItem('serverUrl') || 'https://letsbunk-uw7g.onrender.com';
```

**To Change Admin Panel URL**:
1. Open admin panel
2. Go to Settings section
3. Update "Server URL" field
4. Click "Save"
5. Refresh the page

OR manually edit `admin-panel/renderer.js` line 10.

## Testing Checklist

After changing server URL:

- [ ] App builds successfully
- [ ] App connects to server on launch
- [ ] Login works
- [ ] Student data loads
- [ ] Timetable displays correctly
- [ ] Attendance check-in works
- [ ] Random ring notifications work
- [ ] WiFi verification works
- [ ] Face verification works
- [ ] Admin panel connects to server
- [ ] Admin panel can view/edit data

## Troubleshooting

### Issue: App can't connect to server
**Solution**: 
1. Check `config.js` has correct URL
2. Verify server is running
3. Check network connectivity
4. Rebuild app after changing config

### Issue: Some features use old URL
**Solution**:
1. Search for hardcoded URLs: `grep -r "old-url" .`
2. Replace with config import
3. Rebuild app

### Issue: Admin panel uses different URL
**Solution**:
1. Admin panel has separate config
2. Update in Settings or edit `admin-panel/renderer.js`
3. Refresh admin panel

## Summary

✅ **Server URL is already unified** in the React Native app through `config.js`

✅ **All components properly import** from the centralized config

✅ **Easy to update** - change one line in `config.js` and rebuild

✅ **Admin panel** has separate configuration in `admin-panel/renderer.js`

✅ **No action needed** - system is already properly configured

---

**Current Configuration**: ✅ UNIFIED
**Server URL**: https://letsbunk-uw7g.onrender.com
**Last Verified**: February 26, 2026
