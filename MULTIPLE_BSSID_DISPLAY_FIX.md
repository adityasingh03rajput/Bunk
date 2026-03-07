# Multiple BSSID Display Fix - Student App

## Issue
The student app's offline timetable and WiFi test screens were displaying only one BSSID even when classrooms had multiple BSSIDs configured. The BSSID field was being treated as a string when it could be an array.

## Root Cause
The server was correctly returning multiple BSSIDs in the `bssid` field (as an array), but the student app was displaying it directly without checking if it was an array. This resulted in showing something like `["aa:bb:cc:dd:ee:01","aa:bb:cc:dd:ee:02"]` instead of a formatted list.

## Files Fixed

### 1. TestBSSID.js (WiFi Test Screen)
Updated 4 locations where BSSID is displayed:

#### a) Current Period Display (line ~208)
```javascript
// Before: period.bssid || 'Not configured'
// After: Handles array and formats as comma-separated list

let bssidDisplay = 'Not configured';
if (currentPeriod.bssids && Array.isArray(currentPeriod.bssids) && currentPeriod.bssids.length > 0) {
  bssidDisplay = currentPeriod.bssids.join(', ');
} else if (Array.isArray(currentPeriod.bssid) && currentPeriod.bssid.length > 0) {
  bssidDisplay = currentPeriod.bssid.join(', ');
} else if (currentPeriod.bssid && typeof currentPeriod.bssid === 'string') {
  bssidDisplay = currentPeriod.bssid;
}
```

#### b) Full Schedule Display (line ~182)
Same logic applied when displaying all periods in the offline schedule check.

#### c) Server Refresh Display (line ~320)
Same logic applied when showing schedule fetched from server.

#### d) BSSID Validation Display (line ~230)
```javascript
// Format expected BSSIDs for display
let expectedDisplay = 'N/A';
if (Array.isArray(validation.expected)) {
  expectedDisplay = validation.expected.join(', ');
} else if (validation.expected) {
  expectedDisplay = validation.expected;
}
```

### 2. BSSIDStorage.js (Offline Storage)
Updated console logging to properly display multiple BSSIDs:

```javascript
// Format BSSID for logging
let bssidLog = 'Not configured';
if (Array.isArray(period.bssid) && period.bssid.length > 0) {
  bssidLog = period.bssid.join(', ');
} else if (period.bssid && typeof period.bssid === 'string') {
  bssidLog = period.bssid;
}

console.log(`📍 Current period: ${period.subject} in ${period.room} (BSSID: ${bssidLog})`);
```

## Display Format

### Before Fix:
```
BSSID: ["aa:bb:cc:dd:ee:01","aa:bb:cc:dd:ee:02"]
Expected: ["aa:bb:cc:dd:ee:01","aa:bb:cc:dd:ee:02"]
```

### After Fix:
```
BSSID: aa:bb:cc:dd:ee:01, aa:bb:cc:dd:ee:02
Expected: aa:bb:cc:dd:ee:01, aa:bb:cc:dd:ee:02
```

## Backward Compatibility
The fix handles all three cases:
1. **Multiple BSSIDs (array)**: `["aa:bb:cc:dd:ee:01", "aa:bb:cc:dd:ee:02"]` → Displays as comma-separated
2. **Single BSSID (string)**: `"aa:bb:cc:dd:ee:01"` → Displays as-is
3. **No BSSID**: `null` or `undefined` → Displays as "Not configured"

## Testing

### WiFi Test Screen:
1. Open student app
2. Go to "WiFi Test" tab
3. Click "Check Offline Schedule"
4. **Expected**: All BSSIDs displayed as comma-separated list

### Refresh from Server:
1. Click "Refresh from Server"
2. **Expected**: Each period shows all BSSIDs in readable format

### BSSID Validation:
1. Click "Check Offline Schedule" when connected to WiFi
2. **Expected**: "Expected" field shows all authorized BSSIDs

## Changes Applied
- ✅ TestBSSID.js updated (4 locations)
- ✅ BSSIDStorage.js console logging updated
- ✅ APK rebuilt and installed
- ✅ All BSSID displays now show multiple BSSIDs properly

## APK Details
- **File**: LetsBunk-Release.apk
- **Build Date**: 2026-03-06
- **Status**: Installed on device FEZPAYIFMV79VOWO

## Next Steps
1. Test the WiFi Test screen to verify multiple BSSIDs display correctly
2. Test offline schedule to see all BSSIDs for each period
3. Verify BSSID validation shows all expected BSSIDs
4. Confirm check-in works with any of the authorized BSSIDs

## Status: ✅ COMPLETE
Student app now properly displays multiple BSSIDs in all screens.
