/**
 * Test script for notification service
 * 
 * Tests the notification service module without requiring actual FCM credentials
 * @type {commonjs}
 */

// Force CommonJS
const notificationService = require('./services/notificationService');

console.log('🧪 Testing Notification Service\n');

// Test 1: Check if FCM initialization handles missing credentials gracefully
console.log('Test 1: FCM Initialization without credentials');
const initResult = notificationService.initializeFCM();
console.log(`Result: ${initResult ? '✅ Initialized' : '⚠️  Not initialized (expected without credentials)'}\n`);

// Test 2: Mock RandomRing document
console.log('Test 2: Mock notification sending');
const mockRandomRing = {
    _id: 'test_ring_123',
    subject: 'Data Structures',
    teacherName: 'Dr. Smith',
    period: 'P4',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    selectedStudents: [
        {
            enrollmentNo: '2021001',
            notificationSent: false,
            notificationTime: null,
            notificationError: null,
            notificationAttempts: 0
        },
        {
            enrollmentNo: '2021002',
            notificationSent: false,
            notificationTime: null,
            notificationError: null,
            notificationAttempts: 0
        }
    ]
};

const mockStudents = [
    {
        enrollmentNo: '2021001',
        name: 'John Doe',
        deviceToken: 'mock_token_1'
    },
    {
        enrollmentNo: '2021002',
        name: 'Jane Smith',
        deviceToken: null // No device token
    }
];

console.log('Mock RandomRing:', {
    id: mockRandomRing._id,
    subject: mockRandomRing.subject,
    students: mockRandomRing.selectedStudents.length
});

console.log('\nMock Students:', mockStudents.map(s => ({
    enrollmentNo: s.enrollmentNo,
    hasToken: !!s.deviceToken
})));

// Test 3: Verify notification service exports
console.log('\n\nTest 3: Verify exported functions');
const exports = [
    'initializeFCM',
    'sendNotificationToDevice',
    'sendNotificationWithRetry',
    'sendRandomRingNotifications',
    'logNotificationAttempt'
];

exports.forEach(funcName => {
    const exists = typeof notificationService[funcName] === 'function';
    console.log(`  ${exists ? '✅' : '❌'} ${funcName}`);
});

console.log('\n✅ Notification service module loaded successfully');
console.log('\n📝 Note: Actual FCM notifications require:');
console.log('  1. Firebase Admin SDK credentials');
console.log('  2. Set FIREBASE_SERVICE_ACCOUNT environment variable (JSON string)');
console.log('  3. Or set FIREBASE_SERVICE_ACCOUNT_PATH to service account file');
console.log('\n📱 Students need to:');
console.log('  1. Call POST /api/student/device-token with their FCM token');
console.log('  2. Token is obtained from expo-notifications in the mobile app');
