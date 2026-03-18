# Real-Time Timer Sync Fix

## Problem 1: Timer Not Showing on Teacher App
Student timer was running on student app (showing 00:14:29) but teacher app showed "Absent" with 00:00 timer.

## Problem 2: Timer Auto-Stops After Few Seconds
Student's timer automatically stops after running for a few seconds.

## Root Causes

### Issue 1: Data Source Mismatch
- Student app sends heartbeat every 5 minutes to `/api/attendance/update-timer`
- This endpoint was updating `AttendanceSession` collection only
- Teacher app reads from `StudentManagement` collection via `/api/view-records/students`
- Result: Student and teacher were reading from different database collections

### Issue 2: Timer State Validation Failure
- UnifiedTimerManager syncs with server every 30 seconds via `/api/attendance/get-timer-state`
- This endpoint only checked `AttendanceSession` collection
- When no session found, it returned `isRunning: false`
- This caused the timer to stop automatically
- Student app uses `StudentManagement` collection for timer state, not `AttendanceSession`

## Solutions

### Fix 1: Update Heartbeat Endpoint
Modified `/api/attendance/update-timer` endpoint to:
1. Update both `AttendanceSession` (legacy) and `StudentManagement` (teacher source)
2. Broadcast updates via socket to all teachers in real-time
3. Added detailed logging for debugging

### Fix 2: Update Timer State Endpoint
Modified `/api/attendance/get-timer-state` endpoint to:
1. Check `StudentManagement` collection FIRST (new system)
2. Return correct `isRunning` state from `StudentManagement`
3. Fallback to `AttendanceSession` for legacy support
4. Added logging to track which data source is used

## Code Changes

### `/api/attendance/update-timer` (Line 2219)
```javascript
// CRITICAL: Update StudentManagement collection (used by teacher app)
const student = await StudentManagement.findOne({ enrollmentNo: studentId });
if (student) {
    await StudentManagement.findByIdAndUpdate(student._id, {
        timerValue: timerValue,
        isRunning: true, // Heartbeat means timer is running
        status: 'attending',
        lastUpdated: new Date()
    });
    
    // Broadcast to teachers
    io.emit('student_update', {
        studentId: student._id.toString(),
        enrollmentNo: student.enrollmentNo,
        name: student.name,
        timerValue: timerValue,
        isRunning: true,
        status: 'attending'
    });
}
```

### `/api/attendance/get-timer-state` (Line 1817)
```javascript
// CRITICAL: Check StudentManagement first (new system)
let student = await StudentManagement.findOne({ enrollmentNo: studentId });

if (student && student.isRunning) {
    // Student has active timer in StudentManagement
    return res.json({
        success: true,
        timerState: {
            attendedSeconds: student.timerValue || 0,
            isRunning: student.isRunning,
            // ... other fields
        }
    });
}

// Fallback: Check AttendanceSession (legacy system)
const session = await AttendanceSession.findOne({ ... });
```

## Testing
1. Student starts timer on phone
2. After 1 minute, first heartbeat is sent
3. Server updates both `AttendanceSession` and `StudentManagement`
4. Teacher app receives socket broadcast
5. Teacher sees real-time timer update
6. Every 30 seconds, UnifiedTimerManager syncs with server
7. Server returns correct `isRunning: true` from `StudentManagement`
8. Timer continues running without auto-stopping

## Heartbeat & Sync Schedule
- **Initial heartbeat**: 1 minute after timer starts
- **Regular heartbeats**: Every 5 minutes
- **Timer state sync**: Every 30 seconds (UnifiedTimerManager)
- **Broadcast**: Immediate socket broadcast to all teachers after each heartbeat

## Files Modified
- `server.js` - Updated `/api/attendance/update-timer` endpoint (line 2219)
- `server.js` - Updated `/api/attendance/get-timer-state` endpoint (line 1817)

## Deployment
- Changes pushed to GitHub `bssid` branch
- Render will auto-deploy from GitHub
- No APK rebuild needed (server-side fix only)

## Verification
After Render deploys:
1. Student logs in and starts timer
2. Wait 1 minute for first heartbeat
3. Check teacher app - should show timer running
4. Timer should NOT auto-stop after 30 seconds
5. Check database: `node check-student-1234.js`
   - Should show `isRunning: true`
   - Should show correct `timerValue`
   - Should show recent `lastUpdated` timestamp

## Related Files
- `App.js` - Student app heartbeat logic (line 679-713)
- `UnifiedTimerManager.js` - Timer state sync logic (line 150-224)
- `server.js` - Timer update endpoint (line 2219)
- `server.js` - Timer state endpoint (line 1817)
- `server.js` - View records endpoint (line 3778)
- `StudentList.js` - Teacher app display logic
