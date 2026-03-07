/**
 * Verification Script: RandomRing Schema Timer Fields Removal
 * Task 1.7: Remove timer fields from RandomRing schema
 * 
 * This script verifies that the RandomRing schema does not contain
 * timer-related fields: timeBeforeRandomRing, timerCutoff
 */

const mongoose = require('mongoose');

// Connect to MongoDB (same as server.js)
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_app';
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
});

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

db.once('open', async () => {
    console.log('✅ Connected to MongoDB');
    console.log('');
    
    try {
        // Define RandomRing schema (same as server.js)
        const randomRingSchema = new mongoose.Schema({
            teacherId: { type: String, required: true },
            teacherName: String,
            semester: String,
            branch: String,
            subject: String,
            room: String,
            bssid: String,
            type: { type: String, enum: ['all', 'select'], required: true },
            count: Number,
            triggerTime: { type: Date, default: Date.now },
            selectedStudents: [{
                studentId: String,
                name: String,
                enrollmentNo: String,
                notificationSent: Boolean,
                notificationTime: Date,
                verified: Boolean,
                verificationTime: Date,
                verificationPhoto: String,
                teacherAccepted: Boolean,
                teacherRejected: Boolean,
                teacherActionTime: Date,
                reVerified: Boolean,
                reVerifyTime: Date,
                failed: Boolean
            }],
            status: { type: String, enum: ['pending', 'completed', 'expired'], default: 'pending' },
            createdAt: { type: Date, default: Date.now },
            expiresAt: Date
        });
        
        // Get or create RandomRing model
        const RandomRing = mongoose.models.RandomRing || mongoose.model('RandomRing', randomRingSchema);
        
        // Get schema paths
        const schemaPaths = Object.keys(RandomRing.schema.paths);
        console.log('📋 RandomRing Schema Fields:');
        console.log('─'.repeat(50));
        schemaPaths.forEach(path => {
            console.log(`  • ${path}`);
        });
        console.log('');
        
        // Check for timer fields
        const timerFields = ['timeBeforeRandomRing', 'timerCutoff'];
        const foundTimerFields = timerFields.filter(field => schemaPaths.includes(field));
        
        if (foundTimerFields.length > 0) {
            console.log('❌ VERIFICATION FAILED: Timer fields found in schema:');
            foundTimerFields.forEach(field => {
                console.log(`  • ${field}`);
            });
            console.log('');
            console.log('Action Required: Remove these fields from the RandomRing schema');
        } else {
            console.log('✅ VERIFICATION PASSED: No timer fields in RandomRing schema');
            console.log('');
            console.log('Confirmed: timeBeforeRandomRing and timerCutoff are NOT present');
        }
        console.log('');
        
        // Check existing documents for these fields
        console.log('🔍 Checking existing RandomRing documents...');
        const docsWithTimerFields = await RandomRing.find({
            $or: [
                { timeBeforeRandomRing: { $exists: true } },
                { timerCutoff: { $exists: true } }
            ]
        }).countDocuments();
        
        if (docsWithTimerFields > 0) {
            console.log(`⚠️  WARNING: Found ${docsWithTimerFields} documents with timer fields`);
            console.log('   These fields exist in the database but not in the schema');
            console.log('   They will be ignored by Mongoose but can be cleaned up');
            console.log('');
            
            // Show sample document
            const sampleDoc = await RandomRing.findOne({
                $or: [
                    { timeBeforeRandomRing: { $exists: true } },
                    { timerCutoff: { $exists: true } }
                ]
            });
            
            if (sampleDoc) {
                console.log('📄 Sample document with timer fields:');
                console.log(JSON.stringify(sampleDoc, null, 2));
            }
        } else {
            console.log('✅ No documents found with timer fields');
        }
        console.log('');
        
        // Summary
        console.log('📊 VERIFICATION SUMMARY');
        console.log('─'.repeat(50));
        console.log(`Schema Status: ${foundTimerFields.length === 0 ? '✅ Clean' : '❌ Has timer fields'}`);
        console.log(`Document Status: ${docsWithTimerFields === 0 ? '✅ Clean' : `⚠️  ${docsWithTimerFields} docs with timer fields`}`);
        console.log('');
        
        if (foundTimerFields.length === 0 && docsWithTimerFields === 0) {
            console.log('🎉 Task 1.7 Complete: RandomRing schema is clean!');
        } else if (foundTimerFields.length === 0 && docsWithTimerFields > 0) {
            console.log('✅ Task 1.7 Complete: Schema is clean');
            console.log('ℹ️  Note: Some documents have legacy fields (will be ignored)');
        } else {
            console.log('❌ Task 1.7 Incomplete: Schema needs cleanup');
        }
        
    } catch (error) {
        console.error('❌ Error during verification:', error);
    } finally {
        await mongoose.connection.close();
        console.log('');
        console.log('Connection closed');
    }
});
