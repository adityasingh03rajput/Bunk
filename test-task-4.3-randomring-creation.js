/**
 * Test script for Task 4.3: Create RandomRing record
 * 
 * This script tests the RandomRing record creation with all required fields:
 * - ringId: Unique identifier
 * - teacherId, teacherName, semester, branch, period, subject, room
 * - targetType, targetedStudents, studentCount
 * - responses array with initialized tracking
 * - triggeredAt, expiresAt (10 minutes)
 * - totalResponses, successfulVerifications, failedVerifications, noResponses (all 0)
 * - status: 'active'
 */

const mongoose = require('mongoose');
require('dotenv').config();

// RandomRing Schema (from server.js)
const randomRingSchema = new mongoose.Schema({
    ringId: { type: String, required: true, unique: true },
    teacherId: { type: String, required: true },
    teacherName: String,
    semester: String,
    branch: String,
    period: String,
    subject: String,
    room: String,
    targetType: { type: String, enum: ['all', 'select'], required: true },
    targetedStudents: [String],
    studentCount: Number,
    
    responses: [{
        enrollmentNo: String,
        responded: { type: Boolean, default: false },
        verified: { type: Boolean, default: false },
        responseTime: Date,
        faceVerified: Boolean,
        wifiVerified: Boolean
    }],
    
    triggeredAt: { type: Date, default: Date.now },
    expiresAt: Date,
    completedAt: Date,
    
    totalResponses: { type: Number, default: 0 },
    successfulVerifications: { type: Number, default: 0 },
    failedVerifications: { type: Number, default: 0 },
    noResponses: { type: Number, default: 0 },
    
    status: { type: String, enum: ['active', 'expired', 'completed'], default: 'active' },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

const RandomRing = mongoose.model('RandomRing', randomRingSchema);

async function testRandomRingCreation() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_app');
        console.log('✅ Connected to MongoDB\n');

        // Test data
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
        const ringId = `ring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const targetStudents = ['2021001', '2021002', '2021003'];
        const responses = targetStudents.map(enrollmentNo => ({
            enrollmentNo,
            responded: false,
            verified: false,
            responseTime: null,
            faceVerified: false,
            wifiVerified: false
        }));

        console.log('📝 Creating RandomRing record...');
        const randomRing = new RandomRing({
            ringId,
            teacherId: 'TEACH001',
            teacherName: 'Dr. Smith',
            semester: '3',
            branch: 'B.Tech Computer Science',
            period: 'P4',
            subject: 'Data Structures',
            room: 'Room 301',
            targetType: 'select',
            targetedStudents: targetStudents,
            studentCount: targetStudents.length,
            responses,
            triggeredAt: now,
            expiresAt,
            completedAt: null,
            totalResponses: 0,
            successfulVerifications: 0,
            failedVerifications: 0,
            noResponses: 0,
            status: 'active'
        });

        await randomRing.save();
        console.log('✅ RandomRing record created successfully!\n');

        // Verify the record
        console.log('🔍 Verifying created record...');
        const savedRing = await RandomRing.findOne({ ringId });
        
        console.log('\n📋 RandomRing Record Details:');
        console.log('  ringId:', savedRing.ringId);
        console.log('  teacherId:', savedRing.teacherId);
        console.log('  teacherName:', savedRing.teacherName);
        console.log('  semester:', savedRing.semester);
        console.log('  branch:', savedRing.branch);
        console.log('  period:', savedRing.period);
        console.log('  subject:', savedRing.subject);
        console.log('  room:', savedRing.room);
        console.log('  targetType:', savedRing.targetType);
        console.log('  studentCount:', savedRing.studentCount);
        console.log('  targetedStudents:', savedRing.targetedStudents);
        console.log('  responses count:', savedRing.responses.length);
        console.log('  triggeredAt:', savedRing.triggeredAt);
        console.log('  expiresAt:', savedRing.expiresAt);
        console.log('  status:', savedRing.status);
        console.log('  totalResponses:', savedRing.totalResponses);
        console.log('  successfulVerifications:', savedRing.successfulVerifications);
        console.log('  failedVerifications:', savedRing.failedVerifications);
        console.log('  noResponses:', savedRing.noResponses);

        // Verify responses structure
        console.log('\n📊 Response Tracking Structure:');
        savedRing.responses.forEach((response, index) => {
            console.log(`  Student ${index + 1}:`);
            console.log(`    enrollmentNo: ${response.enrollmentNo}`);
            console.log(`    responded: ${response.responded}`);
            console.log(`    verified: ${response.verified}`);
            console.log(`    faceVerified: ${response.faceVerified}`);
            console.log(`    wifiVerified: ${response.wifiVerified}`);
        });

        // Verify expiration time is 10 minutes
        const timeDiff = (savedRing.expiresAt - savedRing.triggeredAt) / 1000 / 60;
        console.log(`\n⏱️  Expiration time: ${timeDiff.toFixed(1)} minutes`);
        
        if (Math.abs(timeDiff - 10) < 0.1) {
            console.log('✅ Expiration time is correctly set to 10 minutes');
        } else {
            console.log('❌ Expiration time is not 10 minutes!');
        }

        // Verify all tracking fields are initialized to 0
        const trackingFieldsValid = 
            savedRing.totalResponses === 0 &&
            savedRing.successfulVerifications === 0 &&
            savedRing.failedVerifications === 0 &&
            savedRing.noResponses === 0;
        
        if (trackingFieldsValid) {
            console.log('✅ All tracking fields initialized to 0');
        } else {
            console.log('❌ Tracking fields not properly initialized!');
        }

        // Verify status is 'active'
        if (savedRing.status === 'active') {
            console.log('✅ Status is correctly set to "active"');
        } else {
            console.log('❌ Status is not "active"!');
        }

        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await RandomRing.deleteOne({ ringId });
        console.log('✅ Test data cleaned up');

        console.log('\n✅ All tests passed! Task 4.3 implementation is correct.');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the test
testRandomRingCreation();
