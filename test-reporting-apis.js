// Test script for reporting APIs (Task 7)
const axios = require('axios');

const BASE_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function testReportingAPIs() {
    console.log('🧪 Testing Reporting APIs (Task 7)\n');
    console.log('='.repeat(60));

    // Test 1: Period Report
    console.log('\n📊 Test 1: Period Report');
    try {
        const response = await axios.get(`${BASE_URL}/api/attendance/period-report`, {
            params: {
                enrollmentNo: '2021001',
                page: 1,
                limit: 10
            }
        });

        console.log('✅ Success:', response.data.success);
        console.log('📋 Records found:', response.data.records.length);
        console.log('📄 Pagination:', response.data.pagination);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 2: Daily Report
    console.log('\n📊 Test 2: Daily Report');
    try {
        const response = await axios.get(`${BASE_URL}/api/attendance/daily-report`, {
            params: {
                enrollmentNo: '2021001',
                page: 1,
                limit: 10
            }
        });

        console.log('✅ Success:', response.data.success);
        console.log('📋 Records found:', response.data.records.length);
        console.log('📊 Summary:', response.data.summary);
        console.log('📄 Pagination:', response.data.pagination);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 3: Monthly Report
    console.log('\n📊 Test 3: Monthly Report');
    try {
        const now = new Date();
        const response = await axios.get(`${BASE_URL}/api/attendance/monthly-report`, {
            params: {
                enrollmentNo: '2021001',
                month: now.getMonth() + 1,
                year: now.getFullYear()
            }
        });

        console.log('✅ Success:', response.data.success);
        console.log('📅 Month/Year:', `${response.data.month}/${response.data.year}`);
        console.log('📊 Summary:', response.data.summary);
        console.log('📋 Days with data:', Object.keys(response.data.calendarData).length);
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 4: Export CSV
    console.log('\n📊 Test 4: Export CSV');
    try {
        const response = await axios.get(`${BASE_URL}/api/attendance/export`, {
            params: {
                enrollmentNo: '2021001',
                limit: 100
            }
        });

        console.log('✅ Success: CSV generated');
        console.log('📄 Content type:', response.headers['content-type']);
        console.log('📊 CSV size:', response.data.length, 'bytes');
        console.log('📋 First 200 chars:', response.data.substring(0, 200));
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 5: Audit Trail
    console.log('\n📊 Test 5: Audit Trail');
    try {
        const response = await axios.get(`${BASE_URL}/api/attendance/audit-trail`, {
            params: {
                enrollmentNo: '2021001',
                page: 1,
                limit: 10
            }
        });

        console.log('✅ Success:', response.data.success);
        console.log('📋 Audit records found:', response.data.records.length);
        console.log('📄 Pagination:', response.data.pagination);
        
        if (response.data.records.length > 0) {
            console.log('📝 Sample audit record:', {
                auditId: response.data.records[0].auditId,
                changeType: response.data.records[0].changeType,
                modifierName: response.data.records[0].modifierName
            });
        }
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Reporting APIs Tests Complete\n');
}

// Run tests
testReportingAPIs().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
});
