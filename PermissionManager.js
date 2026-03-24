/**
 * PermissionManager.js
 * Requests all required app permissions on startup in a single flow.
 */

import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

const PERMISSIONS = [
  {
    key: 'camera',
    permission: 'android.permission.CAMERA',
    title: 'Camera',
    rationale: 'Required for face verification during attendance.',
  },
  {
    key: 'fineLocation',
    permission: 'android.permission.ACCESS_FINE_LOCATION',
    title: 'Precise Location',
    rationale: 'Required to detect WiFi network (BSSID) for attendance verification.',
  },
  {
    key: 'coarseLocation',
    permission: 'android.permission.ACCESS_COARSE_LOCATION',
    title: 'Approximate Location',
    rationale: 'Required as a fallback for WiFi-based attendance.',
  },
  {
    key: 'notifications',
    permission: 'android.permission.POST_NOTIFICATIONS',
    title: 'Notifications',
    rationale: 'Required to send attendance and class alerts.',
    minSdk: 33, // Android 13+
  },
  {
    key: 'nearbyWifi',
    permission: 'android.permission.NEARBY_WIFI_DEVICES',
    title: 'Nearby Wi-Fi Devices',
    rationale: 'Required on Android 13+ to read WiFi BSSID for attendance.',
    minSdk: 33,
  },
];

/**
 * Request all required permissions at app startup.
 * Shows a pre-prompt explaining why permissions are needed,
 * then requests them all at once.
 * @returns {Promise<{allGranted: boolean, results: Object}>}
 */
export async function requestStartupPermissions() {
  if (Platform.OS !== 'android') {
    return { allGranted: true, results: {} };
  }

  // Filter permissions applicable to this Android version
  const applicable = PERMISSIONS.filter(
    (p) => !p.minSdk || Platform.Version >= p.minSdk
  );

  // Check which ones are already granted
  const checks = await Promise.all(
    applicable.map((p) => PermissionsAndroid.check(p.permission))
  );

  const needed = applicable.filter((_, i) => !checks[i]);

  if (needed.length === 0) {
    return { allGranted: true, results: {} };
  }

  // Show a single pre-prompt before the system dialogs
  await new Promise((resolve) =>
    Alert.alert(
      'Permissions Required',
      `LetsBunk needs the following permissions to work properly:\n\n${needed
        .map((p) => `• ${p.title}: ${p.rationale}`)
        .join('\n\n')}\n\nPlease grant all permissions on the next screens.`,
      [{ text: 'Continue', onPress: resolve }]
    )
  );

  // Request all needed permissions
  const permissionKeys = needed.map((p) => p.permission);
  const granted = await PermissionsAndroid.requestMultiple(permissionKeys);

  const denied = needed.filter(
    (p) => granted[p.permission] !== PermissionsAndroid.RESULTS.GRANTED
  );

  if (denied.length > 0) {
    const permanentlyDenied = denied.filter(
      (p) => granted[p.permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    );

    if (permanentlyDenied.length > 0) {
      Alert.alert(
        'Permissions Blocked',
        `Some permissions were permanently denied:\n\n${permanentlyDenied
          .map((p) => `• ${p.title}`)
          .join('\n')}\n\nPlease enable them manually in App Settings > Permissions.`,
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  }

  const allGranted = denied.length === 0;
  return { allGranted, results: granted };
}
