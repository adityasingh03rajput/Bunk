# Multiple BSSIDs Testing Guide

## Prerequisites
- Server running on http://192.168.1.7:3000
- Admin panel running on http://localhost:5500
- Student app installed on device (FEZPAYIFMV79VOWO)
- Test student: Pranav Namdeo (0246CD241000), Semester 3, B.Tech Data Science

## Test Scenarios

### Test 1: Add Classroom with Single BSSID (Legacy Mode)
**Purpose**: Verify backward compatibility

1. Open admin panel → Classrooms section
2. Click "Add Classroom"
3. Fill in:
   - Room Number: TEST-101
   - Building: Test Building
   - Capacity: 50
   - WiFi BSSID: aa:bb:cc:dd:ee:01
4. Click "Add Classroom"
5. **Expected**: Classroom appears in table with single BSSID

### Test 2: Add Classroom with Multiple BSSIDs
**Purpose**: Test new multiple BSSID feature

1. Open admin panel → Classrooms section
2. Click "Add Classroom"
3. Fill in:
   - Room Number: TEST-102
   - Building: Test Building
   - Capacity: 50
   - WiFi BSSID: aa:bb:cc:dd:ee:02
4. Click "+ More BSSID" button
5. Add second BSSID: aa:bb:cc:dd:ee:03
6. Click "+ More BSSID" again
7. Add third BSSID: aa:bb:cc:dd:ee:04
8. Click "Add Classroom"
9. **Expected**: Classroom appears with all 3 BSSIDs displayed

### Test 3: Edit Classroom - Add More BSSIDs
**Purpose**: Test adding BSSIDs to existing classroom

1. Find TEST-101 in classroom list
2. Click "Edit" button
3. Click "+ More BSSID"
4. Add second BSSID: aa:bb:cc:dd:ee:05
5. Click "Update Classroom"
6. **Expected**: 
   - Classroom now shows 2 BSSIDs
   - Real-time broadcast sent to affected students

### Test 4: Edit Classroom - Remove BSSIDs
**Purpose**: Test removing BSSIDs

1. Find TEST-102 in classroom list
2. Click "Edit" button
3. Click "🗑️" button next to second BSSID
4. Click "Update Classroom"
5. **Expected**: 
   - Classroom now shows 2 BSSIDs (removed one)
   - Real-time broadcast sent to affected students

### Test 5: Student Check-in with First BSSID
**Purpose**: Verify student can check in with primary BSSID

**Setup**:
1. Assign TEST-102 to a timetable period for Pranav's class
2. Set period time to current time

**Test**:
1. Open student app
2. Mock WiFi BSSID to: aa:bb:cc:dd:ee:02 (first BSSID)
3. Attempt check-in
4. **Expected**: Check-in succeeds

### Test 6: Student Check-in with Second BSSID
**Purpose**: Verify student can check in with any authorized BSSID

**Test**:
1. Mock WiFi BSSID to: aa:bb:cc:dd:ee:03 (second BSSID)
2. Attempt check-in
3. **Expected**: Check-in succeeds

### Test 7: Student Check-in with Wrong BSSID
**Purpose**: Verify unauthorized BSSID is rejected

**Test**:
1. Mock WiFi BSSID to: ff:ff:ff:ff:ff:ff (unauthorized)
2. Attempt check-in
3. **Expected**: Check-in fails with "Wrong WiFi" message

### Test 8: Random Ring Verification with Multiple BSSIDs
**Purpose**: Verify random ring works with any authorized BSSID

**Setup**:
1. Trigger random ring for Pranav in TEST-102

**Test**:
1. Mock WiFi BSSID to: aa:bb:cc:dd:ee:03 (second BSSID)
2. Complete face verification
3. **Expected**: Random ring verification succeeds

### Test 9: BSSID Schedule Fetch
**Purpose**: Verify offline schedule includes all BSSIDs

**Test**:
1. Open student app
2. Click "Refresh from Server" in offline timetable
3. Check console logs
4. **Expected**: 
   - Schedule fetched successfully
   - Each period shows `bssids` array with all BSSIDs
   - Backward compatible `bssid` field also present

### Test 10: Real-Time BSSID Update
**Purpose**: Verify WebSocket broadcast when BSSID changes

**Setup**:
1. Student app open and connected
2. Offline schedule cached

**Test**:
1. In admin panel, edit TEST-102
2. Change first BSSID to: aa:bb:cc:dd:ee:99
3. Click "Update Classroom"
4. **Expected**:
   - Student app receives WebSocket event
   - Offline schedule automatically updates
   - New BSSID immediately available

### Test 11: Period Time Change Broadcast
**Purpose**: Verify BSSID schedule updates when period times change

**Test**:
1. Open admin panel → Period Configuration
2. Change Period 1 time from 9:00-10:00 to 9:15-10:15
3. Click "Update All Periods"
4. **Expected**:
   - Server broadcasts BSSID schedule update
   - Student app receives update with new times
   - Offline schedule reflects new period times

### Test 12: Backward Compatibility - Old Classroom
**Purpose**: Verify old classrooms with single BSSID still work

**Setup**:
1. Create classroom with only `wifiBSSID` field (no `wifiBSSIDs` array)

**Test**:
1. Student checks in with that BSSID
2. **Expected**: Check-in succeeds
3. Fetch BSSID schedule
4. **Expected**: Schedule shows BSSID correctly

## API Testing with Postman/curl

### Test API: Get Daily BSSID Schedule
```bash
curl "http://192.168.1.7:3000/api/daily-bssid-schedule?enrollmentNo=0246CD241000"
```

**Expected Response**:
```json
{
  "success": true,
  "schedule": [
    {
      "period": 1,
      "subject": "Subject Name",
      "room": "TEST-102",
      "bssid": ["aa:bb:cc:dd:ee:02", "aa:bb:cc:dd:ee:03"],
      "bssids": ["aa:bb:cc:dd:ee:02", "aa:bb:cc:dd:ee:03"],
      "startTime": "09:00",
      "endTime": "10:00"
    }
  ]
}
```

### Test API: Validate BSSID
```bash
curl -X POST http://192.168.1.7:3000/api/attendance/validate-bssid \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "0246CD241000",
    "currentBSSID": "aa:bb:cc:dd:ee:03",
    "roomNumber": "TEST-102"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "authorized": true,
  "expectedBSSID": "aa:bb:cc:dd:ee:02",
  "expectedBSSIDs": ["aa:bb:cc:dd:ee:02", "aa:bb:cc:dd:ee:03"],
  "currentBSSID": "aa:bb:cc:dd:ee:03",
  "reason": "authorized"
}
```

## Console Log Verification

### Server Logs to Check:
1. **Classroom Update**:
   ```
   Updating classroom: <id> { wifiBSSIDs: [...] }
   📡 Broadcasting BSSID update for room TEST-102
   ```

2. **BSSID Schedule Fetch**:
   ```
   📅 Fetching BSSID schedule for 0246CD241000 on Friday
   ✅ Returning 8 periods with BSSID data for Friday
   ```

3. **WiFi Verification**:
   ```
   📶 [CHECK-IN] WiFi verification result - Match: true
   📶 BSSID Check: aa:bb:cc:dd:ee:03 vs aa:bb:cc:dd:ee:02, aa:bb:cc:dd:ee:03 = ✅
   ```

### Student App Logs to Check:
1. **Schedule Fetch**:
   ```
   ✅ BSSID schedule saved for 2026-03-06 (8 periods)
   📥 BSSID schedule retrieved (8 periods for 2026-03-06)
   ```

2. **BSSID Validation**:
   ```
   📍 Current period: Subject in TEST-102 (BSSID: ["aa:bb:cc:dd:ee:02", "aa:bb:cc:dd:ee:03"])
   ✅ Authorized for Subject in TEST-102
   ```

3. **WebSocket Update**:
   ```
   📡 Received BSSID schedule update: classroom_bssid_updated
   ✅ BSSID schedule updated from server
   ```

## Success Criteria

✅ All tests pass without errors
✅ Multiple BSSIDs stored and retrieved correctly
✅ Student can check in with any authorized BSSID
✅ Unauthorized BSSIDs are rejected
✅ Real-time updates work correctly
✅ Backward compatibility maintained
✅ No console errors in admin panel or student app
✅ Server logs show correct BSSID verification

## Troubleshooting

### Issue: BSSIDs not saving
- Check browser console for errors
- Verify server logs show `wifiBSSIDs` array
- Check MongoDB document structure

### Issue: Student can't check in
- Verify BSSID format (XX:XX:XX:XX:XX:XX)
- Check server logs for WiFi verification result
- Ensure classroom is assigned to timetable

### Issue: Real-time updates not working
- Check WebSocket connection in student app
- Verify server broadcasts after BSSID change
- Check student app is listening for 'bssid-schedule-update' event

### Issue: Backward compatibility broken
- Test with classroom that has only `wifiBSSID` field
- Verify WiFi verification service handles both formats
- Check API responses include both `bssid` and `bssids` fields

## Next Steps After Testing

1. ✅ Verify all tests pass
2. Document any issues found
3. Test with real WiFi networks (not mocked)
4. Test with multiple students simultaneously
5. Performance test with many BSSIDs
6. Consider adding BSSID format validation in admin panel
7. Consider showing all BSSIDs in student app UI
