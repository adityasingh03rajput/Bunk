/**
 * Migration Script: Convert wifiBSSID to wifiBSSIDs array
 * 
 * This script migrates all classrooms from the legacy single wifiBSSID field
 * to the new wifiBSSIDs array field.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_app';

// Classroom Schema (temporary for migration)
const classroomSchema = new mongoose.Schema({
    roomNumber: String,
    building: String,
    capacity: Number,
    wifiBSSID: String,
    wifiBSSIDs: [String],
    isActive: Boolean,
    createdAt: Date
});

const Classroom = mongoose.model('Classroom', classroomSchema);

async function migrateClassrooms() {
    try {
        console.log('🔄 Starting BSSID migration...\n');
        console.log(`📡 Connecting to: ${MONGODB_URI}`);
        
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all classrooms with legacy wifiBSSID field
        const classrooms = await Classroom.find({});
        console.log(`📊 Found ${classrooms.length} classrooms\n`);

        let migrated = 0;
        let skipped = 0;
        let errors = 0;

        for (const classroom of classrooms) {
            try {
                // Check if already has wifiBSSIDs array
                if (classroom.wifiBSSIDs && classroom.wifiBSSIDs.length > 0) {
                    console.log(`⏭️  ${classroom.roomNumber}: Already has wifiBSSIDs array, skipping`);
                    skipped++;
                    continue;
                }

                // Check if has legacy wifiBSSID
                if (classroom.wifiBSSID && classroom.wifiBSSID.trim() !== '') {
                    // Migrate: Move wifiBSSID to wifiBSSIDs array
                    classroom.wifiBSSIDs = [classroom.wifiBSSID];
                    classroom.wifiBSSID = undefined; // Remove legacy field
                    
                    await classroom.save();
                    console.log(`✅ ${classroom.roomNumber}: Migrated "${classroom.wifiBSSIDs[0]}" to array`);
                    migrated++;
                } else {
                    console.log(`⚠️  ${classroom.roomNumber}: No BSSID configured`);
                    skipped++;
                }
            } catch (error) {
                console.error(`❌ ${classroom.roomNumber}: Migration failed - ${error.message}`);
                errors++;
            }
        }

        console.log('\n========================================');
        console.log('Migration Complete!');
        console.log('========================================');
        console.log(`✅ Migrated: ${migrated}`);
        console.log(`⏭️  Skipped: ${skipped}`);
        console.log(`❌ Errors: ${errors}`);
        console.log(`📊 Total: ${classrooms.length}`);
        console.log('========================================\n');

        // Remove the wifiBSSID field from all documents
        console.log('🧹 Cleaning up legacy wifiBSSID field...');
        const result = await Classroom.updateMany(
            { wifiBSSID: { $exists: true } },
            { $unset: { wifiBSSID: "" } }
        );
        console.log(`✅ Removed wifiBSSID field from ${result.modifiedCount} documents\n`);

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        console.log('\n🎉 Migration successful! You can now remove wifiBSSID from the schema.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateClassrooms();
