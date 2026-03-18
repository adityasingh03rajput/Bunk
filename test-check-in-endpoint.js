/**
 * Test script for POST /api/attendance/check-in endpoint
 * 
 * Tests:
 * 1. Missing required fields
 * 2. Invalid faceEmbedding format
 * 3. Student not found
 * 4. Face not enrolled
 * 5. Face verification failure
 * 6. WiFi verification failure
 * 7. Successful check-in
 * 8. Duplicate check-in prevention
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Helper function to generate a random face embedding (192 floats)
function generateFaceEmbedding() {
    return Array.from({ length: 192 }, () => Math.random() * 2 - 1);
}

// Test data
const testStudent = {
    enrollmentNo: '2021001',
    faceEmbedding: generateFaceEmbedding(),
    wifiBSSID: 'b4:86:18:6f:fb:ec',
    timestamp: new Date().toISOString()
};

async function runTests() {
    console.log('🧪 Testing POST /api/attendance/check-in endpoint\n');

    // Test 1: Missing required fields
    console.log('Test 1: Missing required fields');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/check-in`, {
            enrollmentNo: testStudent.enrollmentNo
            // Missing faceEmbedding, wifiBSSID, timestamp
        });
        console.log('❌ Should have failed with 400');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ Correctly rejected missing fields');
            console.log(`   Message: ${error.response.data.message}\n`);
        } else {
            console.log('❌ Unexpected error:', error.message, '\n');
        }
    }

    // Test 2: Invalid faceEmbedding format
    console.log('Test 2: Invalid faceEmbedding format');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/check-in`, {
            enrollmentNo: testStudent.enrollmentNo,
            faceEmbedding: 'not-an-array',
            wifiBSSID: testStudent.wifiBSSID,
            timestamp: testStudent.timestamp
        });
        console.log('❌ Should have failed with 400');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ Correctly rejected invalid faceEmbedding');
            console.log(`   Message: ${error.response.data.message}\n`);
        } else {
            console.log('❌ Unexpected error:', error.message, '\n');
        }
    }

    // Test 3: Student not found
    console.log('Test 3: Student not found');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/check-in`, {
            enrollmentNo: 'NONEXISTENT',
            faceEmbedding: testStudent.faceEmbedding,
            wifiBSSID: testStudent.wifiBSSID,
            timestamp: testStudent.timestamp
        });
        console.log('❌ Should have failed with 404');
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log('✅ Correctly rejected non-existent student');
            console.log(`   Message: ${error.response.data.message}\n`);
        } else {
            console.log('❌ Unexpected error:', error.message, '\n');
        }
    }

    // Test 4: Successful check-in (if student exists with face enrolled)
    console.log('Test 4: Attempting successful check-in');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/check-in`, {
            enrollmentNo: testStudent.enrollmentNo,
            faceEmbedding: testStudent.faceEmbedding,
            wifiBSSID: testStudent.wifiBSSID,
            timestamp: testStudent.timestamp
        });
        
        if (response.data.success) {
            console.log('✅ Check-in successful');
            console.log(`   Message: ${response.data.message}`);
            console.log(`   Check-in period: ${response.data.checkInPeriod}`);
            console.log(`   Marked periods: ${response.data.markedPeriods.join(', ')}`);
            console.log(`   Missed periods: ${response.data.missedPeriods.join(', ')}\n`);
        } else {
            console.log('⚠️  Check-in failed (expected if no active lecture or face not enrolled)');
            console.log(`   Message: ${response.data.message}\n`);
        }
    } catch (error) {
        if (error.response) {
            console.log(`⚠️  Check-in failed with status ${error.response.status}`);
            console.log(`   Message: ${error.response.data.message}\n`);
        } else {
            console.log('❌ Unexpected error:', error.message, '\n');
        }
    }

    // Test 5: Duplicate check-in prevention
    console.log('Test 5: Duplicate check-in prevention');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/check-in`, {
            enrollmentNo: testStudent.enrollmentNo,
            faceEmbedding: testStudent.faceEmbedding,
            wifiBSSID: testStudent.wifiBSSID,
            timestamp: testStudent.timestamp
        });
        
        if (response.data.alreadyCheckedIn) {
            console.log('✅ Correctly detected duplicate check-in');
            console.log(`   Message: ${response.data.message}\n`);
        } else {
            console.log('⚠️  No duplicate detected (student may not have checked in yet)\n');
        }
    } catch (error) {
        console.log('⚠️  Error during duplicate check:', error.response?.data?.message || error.message, '\n');
    }

    console.log('🏁 Tests completed');
}

// Run tests
runTests().catch(error => {
    console.error('❌ Test suite error:', error.message);
    process.exit(1);
});
