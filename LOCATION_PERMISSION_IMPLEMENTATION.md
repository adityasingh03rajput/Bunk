# Location Permission Implementation for LetsBunk

## Complete Working Code for BSSID Access on Xiaomi Devices

### 1. Permission Declarations (AndroidManifest.xml)

Already added to your manifest:
```xml
<!-- Location Permissions (Required for BSSID) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>

<!-- WiFi Permissions -->
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

<!-- Xiaomi/MIUI Specific -->
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>

<!-- Android 13+ -->
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" android:usesPermissionFlags="neverForLocation"/>

<!-- Feature Declarations -->
<uses-feature android:name="android.hardware.wifi" android:required="true"/>
<uses-feature android:name="android.hardware.location" android:required="true"/>
<uses-feature android:name="android.hardware.fingerprint" android:required="false"/>
<uses-feature android:name="android.hardware.camera" android:required="false"/>
```

### 2. React Native Permission Request (JavaScript)

Add this to your React Native code where you need to access BSSID:

```javascript
import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Request location permissions for WiFi BSSID access
 * This is required on Android 6.0+ to get WiFi BSSID
 */
async function requestLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    // For Android 13+ (API 33+), request NEARBY_WIFI_DEVICES if available
    if (Platform.Version >= 33) {
      const nearbyWifiGranted = await PermissionsAndroid.request(
        'android.permission.NEARBY_WIFI_DEVICES',
        {
          title: 'WiFi Permission',
          message: 'This app needs access to WiFi information for attendance verification',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      if (nearbyWifiGranted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ NEARBY_WIFI_DEVICES permission granted');
        return true;
      }
    }

    // Request location permissions (required for BSSID on all Android versions)
    const fineLocationGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs location access to verify your attendance via WiFi',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    if (fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('✅ Location permission granted');
      
      // Also request coarse location for better compatibility
      const coarseLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      );
      
      return true;
    } else {
      console.log('❌ Location permission denied');
      return false;
    }
  } catch (err) {
    console.warn('Permission request error:', err);
    return false;
  }
}

/**
 * Check if location permissions are granted
 */
async function hasLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const fineLocation = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    
    const coarseLocation = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    );

    return fineLocation && coarseLocation;
  } catch (err) {
    console.warn('Permission check error:', err);
    return false;
  }
}

/**
 * Request all required permissions for BSSID access
 */
async function requestAllPermissions() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ];

    // Add Android 13+ permission if available
    if (Platform.Version >= 33) {
      permissions.push('android.permission.NEARBY_WIFI_DEVICES');
    }

    const granted = await PermissionsAndroid.requestMultiple(permissions);

    const allGranted = Object.values(granted).every(
      result => result === PermissionsAndroid.RESULTS.GRANTED
    );

    if (allGranted) {
      console.log('✅ All permissions granted');
      return true;
    } else {
      console.log('❌ Some permissions denied:', granted);
      return false;
    }
  } catch (err) {
    console.warn('Permission request error:', err);
    return false;
  }
}

export { requestLocationPermission, hasLocationPermission, requestAllPermissions };
```

### 3. Usage in Your Component

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { requestAllPermissions, hasLocationPermission } from './permissions';

function AttendanceScreen() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await hasLocationPermission();
    setHasPermission(granted);
    
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Location permission is needed to verify your attendance via WiFi',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: requestPermissions }
        ]
      );
    }
  };

  const requestPermissions = async () => {
    const granted = await requestAllPermissions();
    setHasPermission(granted);
    
    if (!granted) {
      Alert.alert(
        'Permission Denied',
        'Please enable location permission in Settings to use attendance features'
      );
    }
  };

  const markAttendance = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant location permission first');
      await requestPermissions();
      return;
    }

    // Your attendance marking code here
    // The native module can now access BSSID
  };

  return (
    <View>
      <Text>Permission Status: {hasPermission ? '✅ Granted' : '❌ Not Granted'}</Text>
      {!hasPermission && (
        <Button title="Grant Permission" onPress={requestPermissions} />
      )}
      <Button 
        title="Mark Attendance" 
        onPress={markAttendance}
        disabled={!hasPermission}
      />
    </View>
  );
}

export default AttendanceScreen;
```

### 4. Native Module for BSSID Access (Java/Kotlin)

If you're using a native module to get BSSID, here's the implementation:

```kotlin
package com.countdowntimer.app

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.wifi.WifiManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*

class WifiModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "WifiModule"
    }

    @ReactMethod
    fun getCurrentBSSID(promise: Promise) {
        try {
            // Check location permission
            val fineLocationGranted = ContextCompat.checkSelfPermission(
                reactApplicationContext,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED

            val coarseLocationGranted = ContextCompat.checkSelfPermission(
                reactApplicationContext,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED

            if (!fineLocationGranted || !coarseLocationGranted) {
                promise.reject("PERMISSION_DENIED", "Location permission not granted")
                return
            }

            // Check if location is enabled (Android 10+)
            val locationManager = reactApplicationContext.getSystemService(Context.LOCATION_SERVICE) 
                as android.location.LocationManager
            val isLocationEnabled = locationManager.isProviderEnabled(android.location.LocationManager.GPS_PROVIDER) ||
                    locationManager.isProviderEnabled(android.location.LocationManager.NETWORK_PROVIDER)

            if (!isLocationEnabled && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                promise.reject("LOCATION_DISABLED", "Location services are disabled")
                return
            }

            // Get WiFi Manager
            val wifiManager = reactApplicationContext.applicationContext
                .getSystemService(Context.WIFI_SERVICE) as WifiManager

            // Get connection info
            val wifiInfo = wifiManager.connectionInfo
            val bssid = wifiInfo?.bssid

            // Check for fake BSSID (Android 10+ returns this when location is off)
            if (bssid == null || bssid == "02:00:00:00:00:00" || bssid.isEmpty()) {
                promise.reject("BSSID_UNAVAILABLE", "BSSID not available. Check location settings.")
                return
            }

            // Return BSSID
            val result = Arguments.createMap()
            result.putString("bssid", bssid)
            result.putString("ssid", wifiInfo.ssid?.replace("\"", ""))
            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get BSSID: ${e.message}")
        }
    }

    @ReactMethod
    fun hasLocationPermission(promise: Promise) {
        val fineLocationGranted = ContextCompat.checkSelfPermission(
            reactApplicationContext,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        val coarseLocationGranted = ContextCompat.checkSelfPermission(
            reactApplicationContext,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        promise.resolve(fineLocationGranted && coarseLocationGranted)
    }
}
```

### 5. Xiaomi-Specific Checks

For Xiaomi devices, add these additional checks:

```javascript
import { NativeModules, Platform } from 'react-native';

async function checkXiaomiPermissions() {
  if (Platform.OS !== 'android') {
    return true;
  }

  // Check if running on Xiaomi device
  const manufacturer = await NativeModules.PlatformConstants.Manufacturer;
  const isXiaomi = manufacturer?.toLowerCase().includes('xiaomi');

  if (isXiaomi) {
    Alert.alert(
      'Xiaomi Device Detected',
      'Please ensure the following settings are enabled:\n\n' +
      '1. Location Services: ON\n' +
      '2. WiFi Scanning: ON (in Location settings)\n' +
      '3. App Permissions: Location → Allow all the time\n' +
      '4. Autostart: Enabled for this app\n' +
      '5. Battery Saver: No restrictions',
      [{ text: 'OK' }]
    );
  }

  return true;
}
```

### 6. Testing Checklist

Test on Xiaomi devices:

- [ ] Location permission requested
- [ ] Location permission granted
- [ ] Location services enabled
- [ ] WiFi scanning enabled
- [ ] BSSID successfully retrieved
- [ ] BSSID not "02:00:00:00:00:00"
- [ ] Works after app restart
- [ ] Works after device restart

### 7. Common Issues and Solutions

**Issue**: BSSID returns "02:00:00:00:00:00"
**Solution**: 
- Enable Location Services
- Enable WiFi Scanning in Location settings
- Grant location permission

**Issue**: Permission granted but BSSID still null
**Solution**:
- Check if location services are enabled
- Restart the app
- Check MIUI security settings

**Issue**: Works on other devices but not Xiaomi
**Solution**:
- Ensure USE_BIOMETRIC permission is in manifest
- Add hardware.fingerprint feature declaration
- Check MIUI autostart settings

## Summary

The key requirements for BSSID access on Xiaomi devices:

1. ✅ Location permissions (FINE and COARSE)
2. ✅ Location services enabled
3. ✅ WiFi scanning enabled
4. ✅ USE_BIOMETRIC permission (Xiaomi specific)
5. ✅ Hardware feature declarations
6. ✅ Proper runtime permission handling
7. ✅ Check for fake BSSID (02:00:00:00:00:00)

All these are now implemented in your AndroidManifest.xml!
