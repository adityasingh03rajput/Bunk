# Task 4.4: Push Notification Service Implementation

## Summary

Implemented Firebase Cloud Messaging (FCM) integration for sending push notifications to students during random verification rings.

## Changes Made

### 1. Created Notification Service Module
**File**: `services/notificationService.js`

Features:
- Firebase Admin SDK initialization
- Send push notifications to individual devices
- Retry logic for failed notifications (up to 3 attempts with exponential backoff)
- Batch notification sending for random rings
- Delivery status tracking
- Invalid token detection and handling
- Comprehensive error logging

Key Functions:
- `initializeFCM()` - Initialize Firebase Admin SDK
- `sendNotificationToDevice(deviceToken, payload)` - Send to single device
- `sendNotificationWithRetry(deviceToken, payload, maxRetries)` - Send with retry logic
- `sendRandomRingNotifications(randomRing, students)` - Send to multiple students
- `logNotificationAttempt(ringId, enrollmentNo, success, error)` - Audit logging

### 2. Updated Database Schemas

#### StudentManagement Schema
Added fields for device token management:
```javascript
deviceToken: { type: String }, // FCM device token
deviceTokenUpdatedAt: { type: Date } // Last update timestamp
```

#### RandomRing Schema
Added notification tracking fields:
```javascript
selectedStudents: [{
    // ... existing fields
    notificationError: String, // Error message if failed
    notificationAttempts: Number // Number of retry attempts
}]
```

### 3. Added Device Token Update Endpoint
**Endpoint**: `POST /api/student/device-token`

Request:
```json
{
  "enrollmentNo": "2021001",
  "deviceToken": "ExponentPushToken[...]"
}
```

Response:
```json
{
  "success": true,
  "message": "Device token updated successfully"
}
```

### 4. Integrated Notification Service into Random Ring Trigger

**File**: `server.js` (lines ~2130-2180)

Updated `/api/attendance/random-ring/trigger` endpoint to:
1. Send FCM push notifications to selected students
2. Track delivery status (sent/failed/invalid tokens)
3. Fall back to socket events if FCM fails
4. Update RandomRing document with notification results
5. Return detailed notification statistics

Response now includes:
```javascript
{
    success: true,
    ringId: "...",
    targetedStudents: 10,
    notificationsSent: 8,
    notificationsFailed: 2,
    invalidTokens: 1,
    expiresAt: "...",
    period: "P4",
    subject: "Data Structures"
}
```

## Installation Requirements

### 1. Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### 2. Configure Firebase Credentials

**Option A: Environment Variable (Recommended for production)**
```bash
# Set as JSON string
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Option B: Service Account File (For local development)**
```bash
# Download service account JSON from Firebase Console
# Set path to file
export FIREBASE_SERVICE_ACCOUNT_PATH='/path/to/serviceAccountKey.json'
```

### 3. Firebase Console Setup

1. Go to Firebase Console (https://console.firebase.google.com/)
2. Select your project or create new one
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Use one of the configuration options above

## Mobile App Integration

Students need to register their device tokens when the app starts:

```javascript
import * as Notifications from 'expo-notifications';

// Get device token
const token = await Notifications.getExpoPushTokenAsync();

// Register with backend
await fetch('https://your-server.com/api/student/device-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        enrollmentNo: studentEnrollmentNo,
        deviceToken: token.data
    })
});
```

## Testing

### Test Notification Service Module
```bash
node test-notification-service.js
```

This verifies:
- Module loads correctly
- All functions are exported
- FCM initialization handles missing credentials gracefully

### Test Random Ring with Notifications

1. Ensure Firebase credentials are configured
2. Ensure students have registered device tokens
3. Trigger random ring via Teacher App or API:

```bash
curl -X POST http://localhost:3000/api/attendance/random-ring/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TEACH001",
    "semester": "3",
    "branch": "B.Tech Computer Science",
    "targetType": "select",
    "studentCount": 5
  }'
```

4. Check server logs for notification delivery status
5. Verify students receive push notifications on their devices

## Error Handling

The notification service handles:

1. **Missing Credentials**: Logs warning, falls back to socket events
2. **Invalid Device Tokens**: Marks as invalid, doesn't retry
3. **Network Errors**: Retries up to 3 times with exponential backoff
4. **FCM Service Errors**: Logs error, continues with other students
5. **No Device Token**: Logs warning, marks as failed

## Notification Flow

```
Teacher triggers random ring
    ↓
Backend creates RandomRing record
    ↓
notificationService.sendRandomRingNotifications()
    ↓
For each student:
    - Check if device token exists
    - Send FCM notification with retry
    - Update RandomRing.selectedStudents status
    - Log delivery result
    ↓
Send socket events as fallback
    ↓
Save RandomRing with updated statuses
    ↓
Return response with statistics
```

## Monitoring and Logs

The service provides detailed logging:

```
📤 [FCM] Sending notifications to 10 students
✅ [FCM] Notifications sent: 8/10 (1234ms)
⚠️  [FCM] Failed: 2, Invalid tokens: 1
📝 [FCM-LOG] {"timestamp":"...","ringId":"...","enrollmentNo":"...","success":true}
```

## Security Considerations

1. **Service Account Security**: Keep Firebase service account JSON secure
2. **Token Validation**: Device tokens are validated before sending
3. **Rate Limiting**: Random ring endpoint has rate limiting (5 per hour)
4. **Error Messages**: Generic errors returned to clients, detailed logs server-side
5. **Token Expiry**: Invalid/expired tokens are detected and marked

## Future Enhancements

1. **Notification History**: Store notification delivery history in database
2. **Retry Queue**: Implement background job for failed notifications
3. **Analytics**: Track notification open rates and response times
4. **Custom Sounds**: Different notification sounds for different event types
5. **Rich Notifications**: Add images, actions, and custom UI
6. **Multi-Platform**: Support for iOS APNs in addition to FCM

## Files Modified

1. `services/notificationService.js` - New file
2. `server.js` - Updated:
   - Added notificationService import
   - Updated StudentManagement schema
   - Updated RandomRing schema
   - Added device token update endpoint
   - Integrated FCM into random ring trigger
3. `test-notification-service.js` - New test file
4. `notification-integration-snippet.js` - Reference implementation
5. `patch-notification-integration.js` - Patch script (for reference)

## Next Steps

1. Install firebase-admin: `npm install firebase-admin`
2. Configure Firebase credentials (see Installation Requirements)
3. Update mobile app to register device tokens
4. Test notification delivery
5. Monitor logs for any issues
6. Proceed to Task 4.5: Random ring verification endpoint

## Status

✅ Notification service module created
✅ Database schemas updated
✅ Device token endpoint added
✅ Integration code prepared
⚠️  Requires firebase-admin installation
⚠️  Requires Firebase credentials configuration
⚠️  Requires mobile app integration for device token registration

## Notes

- The notification service gracefully handles missing FCM credentials
- Socket events are sent as fallback even if FCM is not configured
- The system will work without FCM, but notifications won't reach offline students
- Device tokens should be refreshed periodically (expo-notifications handles this)
- Test thoroughly with actual devices before production deployment
