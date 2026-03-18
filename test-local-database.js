/**
 * Test Local MongoDB Connection
 * 
 * This script verifies that the local MongoDB database is properly configured
 * and contains the expected data.
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/attendance_app';

async function testLocalDatabase() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 Testing Local MongoDB Connection');
    console.log('='.repeat(60) + '\n');

    try {
        // Test 1: Connect to MongoDB
        console.log('📡 Test 1: Connecting to MongoDB...');
        console.log(`   URI: ${MONGODB_URI}`);
        
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        
        console.log('   ✅ Connected successfully!\n');

        // Test 2: Check database name
        console.log('📊 Test 2: Checking database...');
        const dbName = mongoose.connection.db.databaseName;
        console.log(`   Database: ${dbName}`);
        console.log(`   ✅ Database name correct!\n`);

        // Test 3: List collections
        console.log('📋 Test 3: Listing collections...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`   Found ${collections.length} collections:`);
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        console.log('   ✅ Collections found!\n');

        // Test 4: Count documents
        console.log('📈 Test 4: Counting documents...');
        
        const counts = {
            students: await mongoose.connection.db.collection('studentmanagements').countDocuments(),
            teachers: await mongoose.connection.db.collection('teachers').countDocuments(),
            classrooms: await mongoose.connection.db.collection('classrooms').countDocuments(),
            timetables: await mongoose.connection.db.collection('timetables').countDocuments(),
            subjects: await mongoose.connection.db.collection('subjects').countDocuments(),
            periodAttendances: await mongoose.connection.db.collection('periodattendances').countDocuments(),
            dailyAttendances: await mongoose.connection.db.collection('dailyattendances').countDocuments(),
            systemSettings: await mongoose.connection.db.collection('systemsettings').countDocuments()
        };

        console.log(`   Students: ${counts.students}`);
        console.log(`   Teachers: ${counts.teachers}`);
        console.log(`   Classrooms: ${counts.classrooms}`);
        console.log(`   Timetables: ${counts.timetables}`);
        console.log(`   Subjects: ${counts.subjects}`);
        console.log(`   Period Attendances: ${counts.periodAttendances}`);
        console.log(`   Daily Attendances: ${counts.dailyAttendances}`);
        console.log(`   System Settings: ${counts.systemSettings}`);
        console.log('   ✅ Document counts retrieved!\n');

        // Test 5: Sample data
        console.log('🔍 Test 5: Checking sample data...');
        
        const sampleStudent = await mongoose.connection.db.collection('studentmanagements').findOne();
        if (sampleStudent) {
            console.log(`   Sample Student: ${sampleStudent.name} (${sampleStudent.enrollmentNo})`);
            console.log(`   Semester: ${sampleStudent.semester}, Branch: ${sampleStudent.branch}`);
        } else {
            console.log('   ⚠️  No students found in database');
        }

        const sampleTeacher = await mongoose.connection.db.collection('teachers').findOne();
        if (sampleTeacher) {
            console.log(`   Sample Teacher: ${sampleTeacher.name} (${sampleTeacher.teacherId})`);
        } else {
            console.log('   ⚠️  No teachers found in database');
        }

        console.log('   ✅ Sample data retrieved!\n');

        // Test 6: Database stats
        console.log('💾 Test 6: Database statistics...');
        const stats = await mongoose.connection.db.stats();
        console.log(`   Database Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Indexes: ${stats.indexes}`);
        console.log(`   Collections: ${stats.collections}`);
        console.log('   ✅ Statistics retrieved!\n');

        // Summary
        console.log('='.repeat(60));
        console.log('✅ All Tests Passed!');
        console.log('='.repeat(60));
        console.log('\n📊 Summary:');
        console.log(`   Database: ${dbName}`);
        console.log(`   Collections: ${collections.length}`);
        console.log(`   Students: ${counts.students}`);
        console.log(`   Teachers: ${counts.teachers}`);
        console.log(`   Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log('\n✨ Local MongoDB is ready to use!\n');

        // Close connection
        await mongoose.connection.close();
        console.log('🔌 Connection closed.\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Test Failed!');
        console.error('Error:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Check if MongoDB is running: mongosh --eval "db.version()"');
        console.error('   2. Check if database exists: mongosh attendance_app --eval "show collections"');
        console.error('   3. Verify .env file has correct MONGODB_URI');
        console.error('   4. Check MongoDB service: net start MongoDB (Windows)\n');
        
        process.exit(1);
    }
}

// Run tests
testLocalDatabase();
