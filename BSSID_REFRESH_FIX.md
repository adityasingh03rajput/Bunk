# BSSID Schedule Refresh Fix

## Issue
When clicking "Refresh from Server" button in TestBSSID screen, the app showed error:
```
ReferenceError: TimetableTable is not defined
```

## Root Cause
In `server.js` at the `/api/daily-bssid-schedule` endpoint (lines 4427 and 4434), there was a typo:
- Used: `TimetableTable` (incorrect)
- Should be: `Timetable` (correct model name)

## Fix Applied
Changed both occurrences in `server.js`:

```javascript
// BEFORE (WRONG):
timetable = await TimetableTable.findById(student.timetableId);
timetable = await TimetableTable.findOne({ semester, branch });

// AFTER (CORRECT):
timetable = await Timetable.findById(student.timetableId);
timetable = await Timetable.findOne({ semester, branch });
```

## Testing Instructions
1. Server is now running on Terminal ID: 5
2. Open LetsBunk app on device
3. Go to WiFi Test screen
4. Click "Refresh from Server" button
5. Should now successfully fetch and cache BSSID schedule

## Expected Behavior
- Server should find student by enrollment number
- Lookup timetable by semester (3) and branch (B.Tech Data Science)
- Return periods with BSSID data for Friday
- App should cache the schedule and display periods

## Next Steps
- Test manual refresh from device
- Verify schedule is fetched with periods
- Test real-time WebSocket updates by changing timetable in admin panel
- Confirm "Check Offline Schedule" shows cached data

## Status
✅ Server fix applied and restarted
⏳ Waiting for device testing
