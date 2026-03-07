# Student Filter Logic Update

## Changes Made

Updated the student filtering logic in `StudentList.js` to properly implement the filter categories according to the system requirements.

## Filter Definitions

### 1. **All** 
- Shows ALL students enrolled in the selected branch + semester
- No filtering applied
- Count: Total number of students in the class

### 2. **Active**
- Shows students whose timer is CURRENTLY RUNNING
- Logic: `student.isRunning === true`
- These are students actively attending class right now
- Count: Number of students with running timers

### 3. **Present**
- Shows students whose timer has CROSSED the attendance threshold
- The threshold is set by admin in the admin panel (default: 75%)
- Logic: `student.status === 'present'`
- Server determines this based on: `(time_attended / total_class_time) >= threshold`
- Count: Number of students marked as present by the server

### 4. **Absent**
- Shows students whose timer is:
  - NOT started (never clicked start), OR
  - Inactive for 30+ minutes (1800 seconds)
- Logic:
  ```javascript
  if (!student.isRunning) return true; // Timer not running
  
  // Check if inactive for 30+ minutes
  const lastUpdate = student.lastUpdated ? new Date(student.lastUpdated) : null;
  if (lastUpdate) {
    const inactiveSeconds = (Date.now() - lastUpdate.getTime()) / 1000;
    if (inactiveSeconds >= 1800) return true; // 30 minutes
  }
  ```
- Count: Number of students meeting absent criteria

## Technical Implementation

### Files Modified
- `StudentList.js` - Updated filter logic and count calculations

### Key Changes
1. Enhanced `filteredStudents` logic with detailed conditions for each filter
2. Updated `filterCounts` to accurately count students for each category
3. Added 30-minute inactivity check for absent status
4. Maintained backward compatibility with existing status-based filtering

## Attendance Threshold

The attendance threshold is:
- Stored in database: `SystemSettings` collection with key `attendance_threshold`
- Default value: 75%
- Configurable via admin panel at `/api/settings/attendance-threshold`
- Used by server to determine if a student is "present" based on time attended

## Build Information

- Fast build completed in 38 seconds using `BUILD_FAST.bat`
- APK location: `LetsBunk-Release.apk`
- Install command: `adb install -r LetsBunk-Release.apk`

## Testing Checklist

- [ ] Verify "All" shows all enrolled students
- [ ] Verify "Active" shows only students with running timers
- [ ] Verify "Present" shows students who crossed the threshold
- [ ] Verify "Absent" shows students with no timer or 30+ min inactive
- [ ] Check filter counts are accurate
- [ ] Test with different attendance thresholds from admin panel
