# Firebase Cloud Messaging Setup Guide

## Overview

This guide explains how to set up Firebase Cloud Messaging (FCM) for push notifications in the Period-Based Attendance System.

## Prerequisites

- Firebase account (free tier is sufficient)
- Node.js project with firebase-admin installed
- Access to Firebase Console

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name (e.g., "Attendance-System")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Generate Service Account Key

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Navigate to "Service accounts" tab
4. Click "Generate new private key"
5. Click "Generate key" in the confirmation dialog
6. Save the downloaded JSON file securely (e.g., `serviceAccountKey.json`)

**⚠️ IMPORTANT**: Never commit this file to version control!

## Step 3: Configure Backend Server

### Option A: Environment Variable (Recommended for Production)

1. Convert the service account JSON to a single-line string:

```bash
# Linux/Mac
export FIREBASE_SERVICE_ACCOUNT=$(cat serviceAccountKey.json | tr -d '\n')

# Windows PowerShell
$json = Get-Content serviceAccountKey.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
$env:FIREBASE_SERVICE_ACCOUNT = $json
```

2. For production deployment (e.g., Render, Heroku), add as environment variable:
   - Variable name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: The entire JSON content as a single line

### Option B: File Path (For Local Development)

1. Place `serviceAccountKey.json` in a secure location (outside project root)
2. Set environment variable:

```bash
# Linux/Mac
export FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json

# Windows PowerShell
$env:FIREBASE_SERVICE_ACCOUNT_PATH="C:\path\to\serviceAccountKey.json"
```

3. Add to `.env` file (for local development):

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

**⚠️ IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore`!

## Step 4: Configure Mobile App (React Native/Expo)

### Install Expo Notifications

```bash
npx expo install expo-notifications
```

### Configure app.json

Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

### Download google-services.json (Android)

1. In Firebase Console, go to Project Settings
2. Scroll to "Your apps" section
3. Click "Add app" → Select Android
4. Enter package name (e.g., `com.yourcompany.attendanceapp`)
5. Download `google-services.json`
6. Place in project root

### Download GoogleService-Info.plist (iOS)

1. In Firebase Console, go to Project Settings
2. Click "Add app" → Select iOS
3. Enter bundle ID
4. Download `GoogleService-Info.plist`
5. Place in project root

## Step 5: Implement Device Token Registration in Mobile App

### App.js or Main Component

```javascript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('random_ring_channel', {
      name: 'Random Verification',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig.extra.eas.projectId,
  })).data;

  return token;
}

// Send token to backend
async function updateDeviceToken(enrollmentNo, token) {
  try {
    const response = await fetch('https://your-server.com/api/student/device-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enrollmentNo,
        deviceToken: token,
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Device token registered');
    } else {
      console.error('❌ Failed to register device token:', data.error);
    }
  } catch (error) {
    console.error('❌ Error registering device token:', error);
  }
}

// Use in your app
useEffect(() => {
  if (studentEnrollmentNo) {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        updateDeviceToken(studentEnrollmentNo, token);
      }
    });
  }
}, [studentEnrollmentNo]);

// Listen for notifications
useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('📬 Notification received:', notification);
    
    // Handle random ring notification
    if (notification.request.content.data.type === 'random_ring') {
      const { ringId, period, subject, teacher } = notification.request.content.data;
      // Navigate to verification screen
      navigation.navigate('RandomRingVerification', { ringId });
    }
  });

  return () => subscription.remove();
}, []);
```

## Step 6: Test Notifications

### Test 1: Check FCM Initialization

```bash
# Start server and check logs
npm start

# Look for:
# ✅ [FCM] Initialized from environment variable
# or
# ✅ [FCM] Initialized from service account file
```

### Test 2: Register Device Token

```javascript
// In mobile app, after login
const token = await registerForPushNotificationsAsync();
console.log('Device token:', token);

// Should see in server logs:
// 📱 [DEVICE-TOKEN] Updating token for 2021001
// ✅ [DEVICE-TOKEN] Updated for 2021001
```

### Test 3: Trigger Random Ring

```bash
# Via API
curl -X POST http://localhost:3000/api/attendance/random-ring/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TEACH001",
    "semester": "3",
    "branch": "B.Tech Computer Science",
    "targetType": "select",
    "studentCount": 1
  }'

# Check server logs:
# 📤 [FCM] Sending notifications to 1 students
# ✅ [FCM] Notifications sent: 1/1 (234ms)
```

### Test 4: Verify Notification Received

- Check mobile device for push notification
- Notification should show:
  - Title: "Random Verification Required"
  - Body: "Verify your attendance for [Subject]"
  - Tap to open verification screen

## Troubleshooting

### Issue: "FCM not initialized"

**Solution**: Check environment variables are set correctly

```bash
# Verify environment variable
echo $FIREBASE_SERVICE_ACCOUNT
# or
echo $FIREBASE_SERVICE_ACCOUNT_PATH
```

### Issue: "Invalid registration token"

**Causes**:
- Device token expired
- App was uninstalled and reinstalled
- Token format is incorrect

**Solution**: Re-register device token from mobile app

### Issue: "Notifications not received"

**Checklist**:
1. ✅ Firebase credentials configured correctly
2. ✅ Device token registered in database
3. ✅ Notification permissions granted on device
4. ✅ App is in foreground or background (not force-closed)
5. ✅ Internet connection available
6. ✅ google-services.json configured in mobile app

### Issue: "Permission denied" errors

**Solution**: Check service account has correct permissions:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Verify service account has "Firebase Admin SDK" role
3. Regenerate key if needed

## Security Best Practices

1. **Never commit service account keys to version control**
   ```bash
   # Add to .gitignore
   serviceAccountKey.json
   google-services.json
   GoogleService-Info.plist
   ```

2. **Use environment variables in production**
   - Store credentials in deployment platform's secrets manager
   - Rotate keys periodically

3. **Restrict API access**
   - Use rate limiting on notification endpoints
   - Validate teacher permissions before sending notifications

4. **Monitor usage**
   - Check Firebase Console for usage statistics
   - Set up alerts for unusual activity

## Firebase Console Monitoring

### View Notification Statistics

1. Go to Firebase Console → Cloud Messaging
2. View:
   - Total notifications sent
   - Delivery success rate
   - Open rate
   - Error rate

### Debug Notifications

1. Go to Firebase Console → Cloud Messaging → Send test message
2. Enter device token
3. Send test notification
4. Verify delivery

## Cost Considerations

Firebase Cloud Messaging is **free** for:
- Unlimited notifications
- Unlimited devices
- All features

No credit card required for FCM!

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Firebase](https://rnfirebase.io/)

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify Firebase Console for service status
3. Test with Firebase Console's "Send test message" feature
4. Check mobile app logs for token registration errors

## Next Steps

After completing Firebase setup:
1. ✅ Test notification delivery
2. ✅ Implement notification handling in mobile app
3. ✅ Test random ring verification flow
4. ✅ Monitor notification delivery rates
5. ✅ Proceed to Task 4.5: Random ring verification endpoint
