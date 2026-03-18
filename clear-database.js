/**
 * Clear MongoDB Database Script
 * 
 * This script connects to MongoDB and clears all collections
 * Use with caution - this will delete ALL data!
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/letsbunk';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function clearDatabase() {
    try {
        log('\n🔌 Connecting to MongoDB...', 'cyan');
        await mongoose.connect(MONGODB_URI);
        log('✅ Connected to MongoDB', 'green');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        log(`\n📊 Found ${collections.length} collections`, 'cyan');

        for (const collection of collections) {
            const collectionName = collection.name;
            log(`🗑️  Clearing collection: ${collectionName}...`, 'yellow');
            
            const result = await db.collection(collectionName).deleteMany({});
            log(`   ✅ Deleted ${result.deletedCount} documents`, 'green');
        }

        log('\n✅ Database cleared successfully!', 'green');
        log('All collections have been emptied.\n', 'green');

    } catch (error) {
        log(`\n❌ Error: ${error.message}`, 'red');
        console.error(error);
    } finally {
        await mongoose.connection.close();
        log('🔌 MongoDB connection closed', 'cyan');
    }
}

// Confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

log('\n⚠️  WARNING: This will DELETE ALL DATA from MongoDB!', 'red');
log(`Database: ${MONGODB_URI}\n`, 'yellow');

rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
    rl.close();
    
    if (answer.toLowerCase() === 'yes') {
        clearDatabase();
    } else {
        log('\n❌ Operation cancelled', 'yellow');
    }
});
