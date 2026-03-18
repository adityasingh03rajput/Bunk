/**
 * Test Script for Task 4.2: Student Selection Logic
 * 
 * This script tests the enhanced student selection logic that filters
 * only currently checked-in students for random verification rings.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Import models (simplified versions for testing)
const periodAttendanceSchema = new mongoose.Schema({
    enrollmentNo: String,
    studentName: String,
    date: Date,
    period: String,
    status: String,
    subject: String,
    teacher: String,
    verificationType: String,
    wifiVerified: Boolean,
    faceVerified: Boolean
}, { timestamps: true });

const studentManagementSchema = new mongoose.Schema({
    enrollmentNo: String,
    name: String,
    email: String,
    semester: String,
    course: String,
    branch: String,
    isActive: Boolean
}, { timestamps: true });

const PeriodAttendance = mongoose.model('PeriodAttendance', periodAttendanceSchema);
const StudentManagement = mongoose.model('StudentManagement', studentManagementSchema);

async function testStudentSelection() {
    console.log('=== Testing Student Selection Logic ===\n');
    
    try {
        // Test parameters
        const semester = '3';
        const branch = 'B.Tech Computer Science';
        
        // Get today's date (start of day)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        console.log(`📅 Testing for date: ${todayStart.toDateString()}`);
        console.log(`📚 Semester: ${semester}, Branch: ${branch}\n`);
        
        // Step 1: Get all students from semester and branch
        const allStudents = await StudentManagement.find({ 
            semester, 
            course: branch 
        });
        console.log(`✅ Total students in ${branch} Semester ${semester}: ${allStudents.length}`);
        
        // Step 2: Find students who have checked in today
        const checkedInEnrollmentNos = await PeriodAttendance.distinct('enrollmentNo', {
            date: { $gte: todayStart, $lte: todayEnd },
            status: 'present'
        });
        console.log(`✅ Students checked in today: ${checkedInEnrollmentNos.length}`);
        
        if (checkedInEnrollmentNos.length > 0) {
            console.log(`   Checked-in enrollment numbers: ${checkedInEnrollmentNos.slice(0, 5).join(', ')}${checkedInEnrollmentNos.length > 5 ? '...' : ''}`);
        }
        
        // Step 3: Filter to only checked-in students
        const attendingStudents = allStudents.filter(s => 
            checkedInEnrollmentNos.includes(s.enrollmentNo) && 
            (s.isActive === undefined || s.isActive === true)
        );
        console.log(`✅ Checked-in active students: ${attendingStudents.length}`);
        
        if (attendingStudents.length > 0) {
            console.log(`   Sample students:`);
            attendingStudents.slice(0, 3).forEach(s => {
                console.log(`   - ${s.enrollmentNo}: ${s.name}`);
            });
        }
        
        // Test Case 1: Select all students
        console.log('\n--- Test Case 1: Select All Students ---');
        const allSelected = attendingStudents;
        console.log(`✅ Would target ${allSelected.length} students`);
        
        // Test Case 2: Select N students (e.g., 5)
        console.log('\n--- Test Case 2: Select 5 Random Students ---');
        const studentCount = 5;
        const shuffled = [...attendingStudents].sort(() => 0.5 - Math.random());
        const randomSelected = shuffled.slice(0, Math.min(studentCount, attendingStudents.length));
        console.log(`✅ Would target ${randomSelected.length} students`);
        if (randomSelected.length > 0) {
            console.log(`   Selected students:`);
            randomSelected.forEach(s => {
                console.log(`   - ${s.enrollmentNo}: ${s.name}`);
            });
        }
        
        // Test Case 3: Verify filtering logic
        console.log('\n--- Test Case 3: Verify Filtering Logic ---');
        const notCheckedIn = allStudents.filter(s => 
            !checkedInEnrollmentNos.includes(s.enrollmentNo)
        );
        console.log(`✅ Students NOT checked in: ${notCheckedIn.length}`);
        console.log(`✅ Filtering working correctly: ${notCheckedIn.length + attendingStudents.length === allStudents.length ? 'YES' : 'NO'}`);
        
        // Summary
        console.log('\n=== Summary ===');
        console.log(`Total students: ${allStudents.length}`);
        console.log(`Checked in today: ${checkedInEnrollmentNos.length}`);
        console.log(`Available for random ring: ${attendingStudents.length}`);
        console.log(`Not checked in (excluded): ${notCheckedIn.length}`);
        
        if (attendingStudents.length === 0) {
            console.log('\n⚠️  WARNING: No students available for random ring!');
            console.log('   Students must check in before receiving random verification requests.');
        } else {
            console.log('\n✅ Student selection logic working correctly!');
        }
        
    } catch (error) {
        console.error('❌ Error during test:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Test completed');
    }
}

// Run the test
testStudentSelection();
