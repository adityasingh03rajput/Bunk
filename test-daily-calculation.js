// Test script for daily attendance calculation (Task 6)
const axios = require('axios');

const BASE_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function testDailyCalculation() {
    console.log('🧪 Testing Daily Attendance Calculation (Task 6)\n');
    console.log('='.repeat(60));

    // Test: Trigger manual daily calculation
    console.log('\n📊 Test: Trigger manual daily calculation');
    try {
        const response = await axios.post(`${BASE_URL}/api/attendance/calculate-daily`);

        console.log('✅ Success:', response.data.success);
        console.log('📊 Processed students:', response.data.processedCount);
        console.log('❌ Errors:', response.data.errorCount);
        console.log('⏱️ Duration:', response.data.duration, 'ms');
        
        if (response.data.results && response.data.results.length > 0) {
            console.log('\n📋 Sample Results (first 5):');
            response.data.results.slice(0, 5).forEach(result => {
                console.log(`  - ${result.enrollmentNo} (${result.name}): ${result.presentPeriods}/${result.totalPeriods} = ${result.percentage.toFixed(1)}% → ${result.status}`);
            });
        }
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Daily Calculation Test Complete\n');
}

// Run test
testDailyCalculation().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
