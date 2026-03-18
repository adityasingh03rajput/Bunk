const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_app';

// Student Schema (simplified)
const studentSchema = new mongoose.Schema({
    enrollmentNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    branch: String,
    semester: Number
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

async function checkStudents() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all students
        const students = await Student.find({}).select('enrollmentNo name branch semester');
        
        console.log(`📊 Total students in database: ${students.length}\n`);

        if (students.length === 0) {
            console.log('⚠️  No students found in database');
        } else {
            console.log('📋 Student List:');
            console.log('─'.repeat(80));
            students.forEach((student, index) => {
                console.log(`${index + 1}. ${student.enrollmentNo.padEnd(15)} | ${student.name.padEnd(25)} | Branch: ${student.branch || 'null'} | Sem: ${student.semester || 'null'}`);
            });
            console.log('─'.repeat(80));

            // Group by branch
            const branchGroups = {};
            students.forEach(student => {
                const branch = student.branch || 'undefined/null';
                if (!branchGroups[branch]) {
                    branchGroups[branch] = [];
                }
                branchGroups[branch].push(student);
            });

            console.log('\n📊 Students grouped by branch:');
            Object.keys(branchGroups).forEach(branch => {
                console.log(`\n${branch}: ${branchGroups[branch].length} students`);
                branchGroups[branch].forEach(s => {
                    console.log(`  - ${s.enrollmentNo} - ${s.name}`);
                });
            });
        }

        await mongoose.disconnect();
        console.log('\n✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the check
checkStudents();
