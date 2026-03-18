# 📱 Mobile Device Testing Setup

## Your Network Information

- **Computer IP**: `192.168.1.8`
- **Server Port**: `3000`
- **Network**: WiFi (Wireless LAN)

---

## Testing Options

### Option 1: Android/iOS Emulator (Current Setup)
✅ **Already configured** - Uses localhost
```javascript
// App.js (current)
const SOCKET_URL = 'http://localhost:3000';
```

**No changes needed for emulator!**

---

### Option 2: Physical Mobile Device (Same WiFi)

To test on your actual phone/tablet:

#### Step 1: Update App.js

**Open `LetsBunk/App.js` and change:**

```javascript
// BEFORE (Line 42-43)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/config';
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

// AFTER (for physical device)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.8:3000/api/config';
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://192.168.1.8:3000';
```

#### Step 2: Ensure Mobile is on Same WiFi
- Connect your phone to the same WiFi network as your computer
- WiFi name should be the same

#### Step 3: Check Firewall
```bash
# Windows will prompt when you start the server
# Click "Allow access" for Private networks
```

#### Step 4: Start Server
```bash
cd LetsBunk
npm start
```

#### Step 5: Start Expo
```bash
cd LetsBunk
npx expo start
```

#### Step 6: Scan QR Code
- Open Expo Go app on your phone
- Scan the QR code from terminal
- App will connect to `http://192.168.1.8:3000`

---

## Alternative: Use Environment Variables

Instead of editing App.js, create `.env` file:

**Create `LetsBunk/.env`:**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.8:3000/api/config
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.8:3000
```

**Restart Expo:**
```bash
npx expo start --clear
```

---

## Troubleshooting

### Mobile Cannot Connect

**1. Check if server is accessible:**
```bash
# On your computer
curl http://192.168.1.8:3000
```

**2. Check from mobile browser:**
- Open browser on phone
- Go to: `http://192.168.1.8:3000`
- Should see: "Server is running"

**3. Check firewall:**
```bash
# Windows Firewall
# Control Panel → Windows Defender Firewall → Allow an app
# Find Node.js → Check "Private"
```

**4. Check both devices on same WiFi:**
```bash
# On computer
ipconfig

# On mobile
Settings → WiFi → Check network name
```

### Connection Timeout

**Disable Windows Firewall temporarily:**
```bash
# Test only - re-enable after testing
netsh advfirewall set allprofiles state off
```

**If it works, add firewall rule:**
```bash
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
```

### IP Address Changed

**Check current IP:**
```bash
ipconfig | findstr IPv4
```

**Update App.js with new IP**

---

## Quick Switch Between Emulator and Device

### Method 1: Comment/Uncomment

```javascript
// For Emulator (localhost)
const SOCKET_URL = 'http://localhost:3000';

// For Physical Device (your IP)
// const SOCKET_URL = 'http://192.168.1.8:3000';
```

### Method 2: Environment Variable

**Create `.env.local` for device:**
```env
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.8:3000
```

**Create `.env.emulator` for emulator:**
```env
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

**Switch by renaming:**
```bash
# For device
copy .env.local .env

# For emulator
copy .env.emulator .env
```

---

## Testing Checklist

### Before Testing on Mobile

- [ ] Server is running (`npm start`)
- [ ] Server shows your IP: `192.168.1.8`
- [ ] Mobile is on same WiFi
- [ ] Firewall allows port 3000
- [ ] App.js uses your IP (not localhost)
- [ ] Expo is running (`npx expo start`)

### Test Connection

1. **Open mobile browser**
   - Go to: `http://192.168.1.8:3000`
   - Should see: "Server is running"

2. **Open Expo Go**
   - Scan QR code
   - App should load

3. **Test login**
   - Try logging in
   - Check if API calls work

---

## Network Diagram

```
┌─────────────────────────────────────┐
│  Your Computer (192.168.1.8)       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Backend Server             │   │
│  │  Port: 3000                 │   │
│  │  Binds to: 0.0.0.0          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Admin Panel                │   │
│  │  Port: 3001                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  MongoDB                    │   │
│  │  Port: 27017                │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
              │
              │ WiFi Network
              │
┌─────────────▼─────────────────────┐
│  Mobile Device                    │
│                                   │
│  Expo Go App                      │
│  → http://192.168.1.8:3000        │
└───────────────────────────────────┘
```

---

## Recommended Setup

### For Development (Same Computer)
✅ **Keep current setup** - Uses localhost
- Faster
- No network issues
- Works offline

### For Testing (Physical Device)
✅ **Use your IP** - 192.168.1.8
- Real device testing
- Test on actual hardware
- Test WiFi features

### For Production
✅ **Use domain name** - yourdomain.com
- Deploy to cloud
- Use HTTPS
- Professional setup

---

## Current Configuration Status

### App.js
```javascript
// Current (for emulator)
const SOCKET_URL = 'http://localhost:3000';

// Change to (for physical device)
const SOCKET_URL = 'http://192.168.1.8:3000';
```

### Server
```javascript
// Already configured correctly
server.listen(3000, '0.0.0.0', () => {
    // Accessible from all interfaces
});
```

### No Changes Needed
- ✅ Server already binds to all interfaces
- ✅ Firewall will prompt automatically
- ✅ Just update App.js when testing on device

---

**Status**: ✅ Ready for mobile device testing

**Your IP**: 192.168.1.8

**Action**: Update App.js to use your IP when testing on physical device
