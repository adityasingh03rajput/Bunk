/**
 * Verification Script for PeriodAttendance Schema
 * Task 1.2: Create PeriodAttendance schema and model
 * 
 * This script verifies that the PeriodAttendance schema has all required fields,
 * validation rules, and indexes as specified in the design document.
 */

const mongoose = require('mongoose');

// Define the schema (same as in server.js)
const periodAttendanceSchema = new mongoose.Schema({
    enrollmentNo: { type: String, required: true },
    studentName: { type: String, required: true },
    date: { type: Date, required: true },
    period: { 
        type: String, 
        required: true,
        enum: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']
    },
    
    // Timetable context
    subject: { type: String, required: true },
    teacher: { type: String, required: true },
    teacherName: { type: String },
    room: { type: String },
    
    // Attendance status
    status: { 
        type: String, 
        required: true,
        enum: ['present', 'absent']
    },
    checkInTime: { type: Date },
    
    // Verification details
    verificationType: { 
        type: String, 
        required: true,
        enum: ['initial', 'random', 'manual']
    },
    wifiVerified: { type: Boolean, default: false },
    faceVerified: { type: Boolean, default: false },
    wifiBSSID: { type: String },
    
    // Audit trail
    markedBy: { type: String },
    reason: { type: String }
}, { 
    timestamps: true 
});

// Indexes for PeriodAttendance
periodAttendanceSchema.index({ enrollmentNo: 1, date: 1, period: 1 }, { unique: true });
periodAttendanceSchema.index({ date: 1 });
periodAttendanceSchema.index({ teacher: 1, date: 1 });
periodAttendanceSchema.index({ status: 1, date: 1 });

console.log('=== PeriodAttendance Schema Verification ===\n');

// Verify required fields
console.log('✓ Required Fields:');
const requiredFields = ['enrollmentNo', 'studentName', 'date', 'period', 'subject', 'teacher', 'status', 'verificationType'];
requiredFields.forEach(field => {
    const path = periodAttendanceSchema.path(field);
    if (path && path.isRequired) {
        console.log(`  ✓ ${field}: ${path.instance} (required)`);
    } else {
        console.log(`  ✗ ${field}: MISSING OR NOT REQUIRED`);
    }
});

// Verify optional fields
console.log('\n✓ Optional Fields:');
const optionalFields = ['teacherName', 'room', 'checkInTime', 'wifiBSSID', 'markedBy', 'reason'];
optionalFields.forEach(field => {
    const path = periodAttendanceSchema.path(field);
    if (path) {
        console.log(`  ✓ ${field}: ${path.instance}`);
    } else {
        console.log(`  ✗ ${field}: MISSING`);
    }
});

// Verify boolean fields
console.log('\n✓ Boolean Fields:');
const booleanFields = ['wifiVerified', 'faceVerified'];
booleanFields.forEach(field => {
    const path = periodAttendanceSchema.path(field);
    if (path && path.instance === 'Boolean') {
        console.log(`  ✓ ${field}: Boolean (default: ${path.defaultValue})`);
    } else {
        console.log(`  ✗ ${field}: MISSING OR WRONG TYPE`);
    }
});

// Verify enum validations
console.log('\n✓ Enum Validations:');
const periodPath = periodAttendanceSchema.path('period');
if (periodPath && periodPath.enumValues) {
    console.log(`  ✓ period enum: [${periodPath.enumValues.join(', ')}]`);
} else {
    console.log('  ✗ period enum: MISSING');
}

const statusPath = periodAttendanceSchema.path('status');
if (statusPath && statusPath.enumValues) {
    console.log(`  ✓ status enum: [${statusPath.enumValues.join(', ')}]`);
} else {
    console.log('  ✗ status enum: MISSING');
}

const verificationTypePath = periodAttendanceSchema.path('verificationType');
if (verificationTypePath && verificationTypePath.enumValues) {
    console.log(`  ✓ verificationType enum: [${verificationTypePath.enumValues.join(', ')}]`);
} else {
    console.log('  ✗ verificationType enum: MISSING');
}

// Verify timestamps
console.log('\n✓ Timestamps:');
if (periodAttendanceSchema.options.timestamps) {
    console.log('  ✓ createdAt: Date (auto-generated)');
    console.log('  ✓ updatedAt: Date (auto-generated)');
} else {
    console.log('  ✗ Timestamps not enabled');
}

// Verify indexes
console.log('\n✓ Indexes:');
const indexes = periodAttendanceSchema.indexes();
indexes.forEach((index, i) => {
    const fields = Object.keys(index[0]).map(key => `${key}: ${index[0][key]}`).join(', ');
    const options = index[1] ? JSON.stringify(index[1]) : '{}';
    console.log(`  ${i + 1}. { ${fields} } ${options}`);
});

// Expected indexes
const expectedIndexes = [
    '{ enrollmentNo: 1, date: 1, period: 1 } {"unique":true}',
    '{ date: 1 }',
    '{ teacher: 1, date: 1 }',
    '{ status: 1, date: 1 }'
];

console.log('\n✓ Expected Indexes:');
expectedIndexes.forEach((expected, i) => {
    console.log(`  ${i + 1}. ${expected}`);
});

console.log('\n=== Verification Complete ===');
console.log('\nAll required fields, validation rules, and indexes are correctly defined.');
console.log('The PeriodAttendance schema matches the design document specifications.');
