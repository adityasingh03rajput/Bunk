const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_app';

console.log('🔌 Connecting to:', MONGODB_URI);

// Student Schema - matching server.js
const studentManagementSchema = new mongoose.Schema({
    enrollmentNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    branch: { type: String, default: 'undefined' },
    semester: { type: Number, default: 1 },
    dob: Date,
    phone: String,
    photoUrl: String,
    isActive: { type: Boolean, default: true },
    attendancePercentage: { type: Number, default: 0 },
    totalClassTime: { type: Number, default: 0 },
    totalAttended: { type: Number, default: 0 }
}, { timestamps: true });

const StudentManagement = mongoose.model('StudentManagement', studentManagementSchema, 'studentmanagements');

// Branch Config Schema
const branchConfigSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    code: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const BranchConfig = mongoose.model('BranchConfig', branchConfigSchema, 'branchconfigs');

async function fixStudentBranches() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('📍 Database:', mongoose.connection.name);
        console.log('📍 Collections:', Object.keys(mongoose.connection.collections));

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📚 Available collections:');
        collections.forEach(col => console.log(`  - ${col.name}`));

        // Check for Data Science branch
        let dataScienceBranch = await BranchConfig.findOne({
            $or: [
                { name: /Data Science/i },
                { displayName: /Data Science/i }
            ]
        });

        if (!dataScienceBranch) {
            console.log('\n📝 Creating "B.Tech Data Science" branch...');
            dataScienceBranch = await BranchConfig.create({
                name: 'B.Tech Data Science',
                displayName: 'Data Science (DS)',
                code: 'DS',
                isActive: true
            });
            console.log('✅ Branch created');
        } else {
            console.log(`\n✅ Data Science branch exists: ${dataScienceBranch.name}`);
        }

        // Get all students
        const allStudents = await StudentManagement.find({});
        console.log(`\n📊 Total students: ${allStudents.length}`);

        if (allStudents.length === 0) {
            console.log('⚠️  No students found');
            await mongoose.disconnect();
            return;
        }

        // Show all students
        console.log('\n📋 All students:');
        allStudents.forEach((s, i) => {
            console.log(`${i + 1}. ${s.enrollmentNo} - ${s.name} - Branch: "${s.branch}" - Sem: ${s.semester}`);
        });

        // Find students with undefined/null/empty branch
        const studentsToFix = await StudentManagement.find({
            $or: [
                { branch: 'undefined' },
                { branch: { $exists: false } },
                { branch: null },
                { branch: '' }
            ]
        });

        console.log(`\n🔧 Students needing branch update: ${studentsToFix.length}`);

        if (studentsToFix.length > 0) {
            console.log('\n📝 Updating students to "B.Tech Data Science"...');
            
            const result = await StudentManagement.updateMany(
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

            console.log(`✅ Updated ${result.modifiedCount} students`);

            // Verify
            const verified = await StudentManagement.find({ branch: 'B.Tech Data Science' });
            console.log(`\n✅ Students with "B.Tech Data Science": ${verified.length}`);
            verified.forEach((s, i) => {
                console.log(`${i + 1}. ${s.enrollmentNo} - ${s.name}`);
            });
        } else {
            console.log('✅ All students already have valid branches');
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');

    } catch (error) {
        console.error('❌ Error:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
}

fixStudentBranches();
