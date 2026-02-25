require('dotenv').config();
const mongoose = require('mongoose');

// Student schema
const studentSchema = new mongoose.Schema({
    name: String,
    enrollmentNo: String,
    semester: String,
    branch: String,
    password: String,
    timerValue: { type: Number, default: 0 },
    isRunning: { type: Boolean, default: false },
    status: { type: String, default: 'absent' },
    lastUpdated: Date,
    faceEmbedding: [Number],
    createdAt: { type: Date, default: Date.now }
});

const StudentManagement = mongoose.model('StudentManagement', studentSchema);

async function checkStudent() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find student by enrollment number
        const student = await StudentManagement.findOne({ enrollmentNo: '1234' });

        if (student) {
            console.log('✅ STUDENT FOUND:');
            console.log('==================');
            console.log('Name:', student.name);
            console.log('Enrollment No:', student.enrollmentNo);
            console.log('Branch:', student.branch);
            console.log('Semester:', student.semester);
            console.log('\n📊 TIMER STATUS:');
            console.log('==================');
            console.log('Timer Value:', student.timerValue, 'seconds');
            console.log('Is Running:', student.isRunning);
            console.log('Status:', student.status);
            console.log('Last Updated:', student.lastUpdated);
            console.log('\n🆔 DATABASE ID:', student._id.toString());
            
            // Convert timer to readable format
            const minutes = Math.floor(student.timerValue / 60);
            const seconds = student.timerValue % 60;
            console.log(`\n⏱️  Timer Display: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            
            // Check if timer should be considered active
            const now = new Date();
            const lastUpdate = student.lastUpdated ? new Date(student.lastUpdated) : null;
            if (lastUpdate) {
                const timeSinceUpdate = (now - lastUpdate) / 1000; // seconds
                console.log(`\n⏰ Time since last update: ${Math.floor(timeSinceUpdate)} seconds`);
                if (timeSinceUpdate > 1800) {
                    console.log('⚠️  WARNING: Timer inactive for more than 30 minutes!');
                }
            }
        } else {
            console.log('❌ Student with enrollment number "1234" NOT FOUND in database');
            
            // Search for similar enrollment numbers
            console.log('\n🔍 Searching for similar enrollment numbers...');
            const similar = await StudentManagement.find({
                enrollmentNo: { $regex: '1234', $options: 'i' }
            }).select('name enrollmentNo branch semester');
            
            if (similar.length > 0) {
                console.log('Found similar students:');
                similar.forEach(s => {
                    console.log(`  - ${s.name} (${s.enrollmentNo}) - ${s.branch} Sem ${s.semester}`);
                });
            }
        }

        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkStudent();
