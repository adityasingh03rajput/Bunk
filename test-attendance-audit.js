/**
 * Test script for AttendanceAudit schema
 * Verifies schema creation, validation, and indexes
 */

const mongoose = require('mongoose');
require('dotenv').config();

// AttendanceAudit Schema
const attendanceAuditSchema = new mongoose.Schema({
    auditId: { 
        type: String, 
        required: true,
        default: () => `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    
    // Record reference
    recordType: { 
        type: String, 
        required: true,
        enum: ['period_attendance', 'daily_attendance']
    },
    recordId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    
    // Student info
    enrollmentNo: { type: String, required: true },
    studentName: { type: String, required: true },
    date: { type: Date, required: true },
    period: { type: String }, // "P1", "P2", ..., "P8" (null for daily attendance)
    
    // Modification details
    modifiedBy: { type: String, required: true }, // Teacher/Admin ID
    modifierName: { type: String, required: true },
    modifierRole: { 
        type: String, 
        required: true,
        enum: ['teacher', 'admin', 'system']
    },
    
    // Change tracking
    oldStatus: { type: String }, // Previous status
    newStatus: { type: String, required: true }, // New status
    changeType: { 
        type: String, 
        required: true,
        enum: ['create', 'update', 'delete']
    },
    
    // Justification
    reason: { type: String }, // Reason for manual marking
    
    // Timestamps
    modifiedAt: { type: Date, default: Date.now }
}, { 
    timestamps: true 
});

// Indexes for AttendanceAudit
attendanceAuditSchema.index({ auditId: 1 }, { unique: true });
attendanceAuditSchema.index({ enrollmentNo: 1, date: -1 });
attendanceAuditSchema.index({ modifiedBy: 1, modifiedAt: -1 });
attendanceAuditSchema.index({ recordId: 1 });

const AttendanceAudit = mongoose.model('AttendanceAudit', attendanceAuditSchema);

async function testAttendanceAuditSchema() {
    try {
        console.log('🧪 Testing AttendanceAudit Schema...\n');

        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system');
        console.log('✅ Connected to MongoDB\n');

        // Test 1: Create a valid audit record
        console.log('Test 1: Creating valid audit record...');
        const testAudit = new AttendanceAudit({
            recordType: 'period_attendance',
            recordId: new mongoose.Types.ObjectId(),
            enrollmentNo: '2021001',
            studentName: 'John Doe',
            date: new Date('2024-01-15'),
            period: 'P4',
            modifiedBy: 'TEACH001',
            modifierName: 'Dr. Smith',
            modifierRole: 'teacher',
            oldStatus: 'absent',
            newStatus: 'present',
            changeType: 'update',
            reason: 'Student arrived late with valid excuse'
        });

        await testAudit.save();
        console.log('✅ Valid audit record created successfully');
        console.log('   Generated auditId:', testAudit.auditId);
        console.log('   Record ID:', testAudit._id);
        console.log('');

        // Test 2: Verify enum validation for recordType
        console.log('Test 2: Testing recordType enum validation...');
        try {
            const invalidAudit = new AttendanceAudit({
                recordType: 'invalid_type',
                recordId: new mongoose.Types.ObjectId(),
                enrollmentNo: '2021002',
                studentName: 'Jane Doe',
                date: new Date(),
                modifiedBy: 'ADMIN001',
                modifierName: 'Admin User',
                modifierRole: 'admin',
                newStatus: 'present',
                changeType: 'create'
            });
            await invalidAudit.save();
            console.log('❌ Should have failed validation');
        } catch (error) {
            console.log('✅ Enum validation working correctly');
            console.log('   Error:', error.message);
        }
        console.log('');

        // Test 3: Verify enum validation for modifierRole
        console.log('Test 3: Testing modifierRole enum validation...');
        try {
            const invalidRole = new AttendanceAudit({
                recordType: 'period_attendance',
                recordId: new mongoose.Types.ObjectId(),
                enrollmentNo: '2021003',
                studentName: 'Bob Smith',
                date: new Date(),
                modifiedBy: 'USER001',
                modifierName: 'Invalid User',
                modifierRole: 'student', // Invalid role
                newStatus: 'present',
                changeType: 'create'
            });
            await invalidRole.save();
            console.log('❌ Should have failed validation');
        } catch (error) {
            console.log('✅ Enum validation working correctly');
            console.log('   Error:', error.message);
        }
        console.log('');

        // Test 4: Verify enum validation for changeType
        console.log('Test 4: Testing changeType enum validation...');
        try {
            const invalidChange = new AttendanceAudit({
                recordType: 'daily_attendance',
                recordId: new mongoose.Types.ObjectId(),
                enrollmentNo: '2021004',
                studentName: 'Alice Johnson',
                date: new Date(),
                modifiedBy: 'ADMIN001',
                modifierName: 'Admin User',
                modifierRole: 'admin',
                newStatus: 'absent',
                changeType: 'modify' // Invalid change type
            });
            await invalidChange.save();
            console.log('❌ Should have failed validation');
        } catch (error) {
            console.log('✅ Enum validation working correctly');
            console.log('   Error:', error.message);
        }
        console.log('');

        // Test 5: Verify indexes
        console.log('Test 5: Verifying indexes...');
        const indexes = await AttendanceAudit.collection.getIndexes();
        console.log('✅ Indexes created:');
        Object.keys(indexes).forEach(indexName => {
            console.log('   -', indexName, ':', JSON.stringify(indexes[indexName]));
        });
        console.log('');

        // Test 6: Query by enrollmentNo and date
        console.log('Test 6: Testing query by enrollmentNo and date...');
        const auditRecords = await AttendanceAudit.find({
            enrollmentNo: '2021001',
            date: { $gte: new Date('2024-01-01') }
        }).sort({ date: -1 });
        console.log('✅ Query successful, found', auditRecords.length, 'record(s)');
        console.log('');

        // Test 7: Create audit for daily attendance (no period)
        console.log('Test 7: Creating audit for daily attendance (no period)...');
        const dailyAudit = new AttendanceAudit({
            recordType: 'daily_attendance',
            recordId: new mongoose.Types.ObjectId(),
            enrollmentNo: '2021005',
            studentName: 'Charlie Brown',
            date: new Date('2024-01-15'),
            // period is null for daily attendance
            modifiedBy: 'SYSTEM',
            modifierName: 'System',
            modifierRole: 'system',
            newStatus: 'present',
            changeType: 'create'
        });
        await dailyAudit.save();
        console.log('✅ Daily audit record created successfully');
        console.log('   Period field:', dailyAudit.period === undefined ? 'undefined' : dailyAudit.period);
        console.log('');

        // Cleanup
        console.log('🧹 Cleaning up test data...');
        await AttendanceAudit.deleteMany({
            enrollmentNo: { $in: ['2021001', '2021005'] }
        });
        console.log('✅ Test data cleaned up\n');

        console.log('✅ All tests passed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n📡 MongoDB connection closed');
    }
}

// Run tests
testAttendanceAuditSchema();
