# Real-Time Timer Sync Fix

## Problem
Student timer was running on student app (showing 00:14:29) but teacher app showed "Absent" with 00:00 timer.

## Root Cause
**Data Source Mismatch:**
- Student app sends heartbeat every 5 minutes to `/api/attendance/update-timer`
- This endpoint was updating `AttendanceSession` collection only
- Teacher app reads from `StudentManagement` collection via `/api/view-records/students`
- Result: Student and teacher were reading from different database collections

## Investigation Steps
1. Checked database directly for enrollment "1234":
   - Timer Value: 0 seconds
   - Is Running: false
   - Status: absent
   - Last Updated: Yesterday (Feb 24)

2. Tested socket connection with test script:
   - Socket connection works perfectly
   - Server receives and broadcasts timer updates
   - Database updates successfully when using socket `timer_update` event

3. Found that student app uses heartbeat system:
   - Sends updates every 5 minutes via HTTP POST to `/api/attendance/update-timer`
   - Does NOT use socket `timer_update` for regular updates
   - Socket is only used for special events (Random Ring, etc.)

4. Discovered the mismatch:
   - Heartbeat endpoint updated `AttendanceSession` collection
   - Teacher endpoint read from `StudentManagement` collection
   - Two different data sources = no real-time sync

## Solution
Modified `/api/attendance/update-timer` endpoint in `server.js` to:

1. Continue updating `AttendanceSession` (for legacy compatibility)
2. **Also update `StudentManagement` collection** (used by teacher app)
3. Broadcast updates via socket to all connected teachers
4. Add detailed logging for debugging

### Changes Made
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

## Testing
1. Student starts timer on phone
2. After 1 minute, first heartbeat is sent
3. Server updates both `AttendanceSession` and `StudentManagement`
4. Teacher app receives socket broadcast
5. Teacher sees real-time timer update

## Heartbeat Schedule
- **Initial heartbeat**: 1 minute after timer starts
- **Regular heartbeats**: Every 5 minutes
- **Broadcast**: Immediate socket broadcast to all teachers after each heartbeat

## Files Modified
- `server.js` - Updated `/api/attendance/update-timer` endpoint (line 2219)

## Deployment
- Changes pushed to GitHub `bssid` branch
- Render will auto-deploy from GitHub
- No APK rebuild needed (server-side fix only)

## Verification
After Render deploys:
1. Student logs in and starts timer
2. Wait 1 minute for first heartbeat
3. Check teacher app - should show timer running
4. Check database: `node check-student-1234.js`
   - Should show `isRunning: true`
   - Should show correct `timerValue`
   - Should show recent `lastUpdated` timestamp

## Related Files
- `App.js` - Student app heartbeat logic (line 679-713)
- `server.js` - Timer update endpoint (line 2219)
- `server.js` - View records endpoint (line 3778)
- `StudentList.js` - Teacher app display logic
