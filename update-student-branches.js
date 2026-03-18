const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_app';

// Student Schema (simplified)
const studentSchema = new mongoose.Schema({
    enrollmentNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    branch: { type: String, default: 'undefined' },
    semester: { type: Number, default: 1 },
    dob: Date,
    phone: String,
    photoUrl: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// Branch Schema
const branchSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    code: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Branch = mongoose.model('Branch', branchSchema);

async function updateStudentBranches() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if "B.Tech Data Science" branch exists
        let dataScienceBranch = await Branch.findOne({ 
            $or: [
                { name: 'B.Tech Data Science' },
                { name: 'Data Science' },
                { displayName: /Data Science/i }
            ]
        });

        if (!dataScienceBranch) {
            console.log('📝 Creating "B.Tech Data Science" branch...');
            dataScienceBranch = await Branch.create({
                name: 'B.Tech Data Science',
                displayName: 'Data Science (DS)',
                code: 'DS',
                isActive: true
            });
            console.log('✅ Branch created:', dataScienceBranch.name);
        } else {
            console.log('✅ Branch exists:', dataScienceBranch.name);
        }

        // Find all students with undefined or missing branch
        const studentsToUpdate = await Student.find({
            $or: [
                { branch: 'undefined' },
                { branch: { $exists: false } },
                { branch: null },
                { branch: '' }
            ]
        });

        console.log(`\n📊 Found ${studentsToUpdate.length} students with undefined branch`);

        if (studentsToUpdate.length === 0) {
            console.log('✅ No students need updating');
            await mongoose.disconnect();
            return;
        }

        // Display students before update
        console.log('\n📋 Students to update:');
        studentsToUpdate.forEach((student, index) => {
            console.log(`${index + 1}. ${student.enrollmentNo} - ${student.name} (Branch: ${student.branch || 'null'})`);
        });

        // Update all students
        const result = await Student.updateMany(
            {
                $or: [
                    { branch: 'undefined' },
                    { branch: { $exists: false } },
                    { branch: null },
                    { branch: '' }
                ]
            },
            {
                $set: { branch: 'B.Tech Data Science' }
            }
        );

        console.log(`\n✅ Updated ${result.modifiedCount} students to branch: "B.Tech Data Science"`);

        // Verify the update
        const updatedStudents = await Student.find({ branch: 'B.Tech Data Science' });
        console.log(`\n✅ Total students with "B.Tech Data Science" branch: ${updatedStudents.length}`);

        console.log('\n📋 Updated students:');
        updatedStudents.forEach((student, index) => {
            console.log(`${index + 1}. ${student.enrollmentNo} - ${student.name} - ${student.branch}`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Database connection closed');
        console.log('✅ Update complete!');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the update
updateStudentBranches();
