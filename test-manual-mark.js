// Test script for manual-mark endpoint (Task 5.1)
const axios = require('axios');

const BASE_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function testManualMark() {
    console.log('🧪 Testing Manual Mark Endpoint (Task 5.1)\n');
    console.log('='.repeat(60));

    // Test 1: Mark student present for a period
    console.log('\n📝 Test 1: Mark student present for period P3');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/manual-mark`, {
            teacherId: 'TEACH001',
            enrollmentNo: '2021001',
            period: 'P3',
            status: 'present',
            reason: 'Student arrived late with valid excuse',
            timestamp: new Date().toISOString()
        });

        console.log('✅ Success:', response.data.success);
        console.log('📋 Marked periods:', response.data.markedPeriods);
        console.log('📝 Records created:', response.data.recordsCreated);
        console.log('🔍 Audit IDs:', response.data.auditIds);
        console.log('💬 Message:', response.data.message);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 2: Mark student absent for a period
    console.log('\n📝 Test 2: Mark student absent for period P5');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/manual-mark`, {
            teacherId: 'TEACH001',
            enrollmentNo: '2021002',
            period: 'P5',
            status: 'absent',
            reason: 'Student left early without permission',
            timestamp: new Date().toISOString()
        });

        console.log('✅ Success:', response.data.success);
        console.log('📋 Marked periods:', response.data.markedPeriods);
        console.log('📝 Records created:', response.data.recordsCreated);
        console.log('💬 Message:', response.data.message);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 3: Missing required fields
    console.log('\n📝 Test 3: Missing required fields (should fail)');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/manual-mark`, {
            teacherId: 'TEACH001',
            enrollmentNo: '2021001',
            // Missing period and status
        });

        console.log('❌ Should have failed but succeeded:', response.data);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.data?.message);
        console.log('📋 Missing fields:', error.response?.data?.missingFields);
    }

    // Test 4: Invalid status
    console.log('\n📝 Test 4: Invalid status (should fail)');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/manual-mark`, {
            teacherId: 'TEACH001',
            enrollmentNo: '2021001',
            period: 'P3',
            status: 'maybe', // Invalid status
            reason: 'Test'
        });

        console.log('❌ Should have failed but succeeded:', response.data);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.data?.message);
    }

    // Test 5: Invalid period
    console.log('\n📝 Test 5: Invalid period (should fail)');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/manual-mark`, {
            teacherId: 'TEACH001',
            enrollmentNo: '2021001',
            period: 'P99', // Invalid period
            status: 'present',
            reason: 'Test'
        });

        console.log('❌ Should have failed but succeeded:', response.data);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.data?.message);
    }

    // Test 6: Non-existent teacher
    console.log('\n📝 Test 6: Non-existent teacher (should fail)');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/manual-mark`, {
            teacherId: 'INVALID_TEACHER',
            enrollmentNo: '2021001',
            period: 'P3',
            status: 'present',
            reason: 'Test'
        });

        console.log('❌ Should have failed but succeeded:', response.data);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.data?.message);
    }

    // Test 7: Non-existent student
    console.log('\n📝 Test 7: Non-existent student (should fail)');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/manual-mark`, {
            teacherId: 'TEACH001',
            enrollmentNo: 'INVALID_STUDENT',
            period: 'P3',
            status: 'present',
            reason: 'Test'
        });

        console.log('❌ Should have failed but succeeded:', response.data);
    } catch (error) {
        console.log('✅ Expected error:', error.response?.data?.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Manual Mark Endpoint Tests Complete\n');
}

// Run tests
testManualMark().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
});
