// Test script for SystemSettings schema
const mongoose = require('mongoose');
require('dotenv').config();

// SystemSettings Schema
const systemSettingsSchema = new mongoose.Schema({
    settingKey: { 
        type: String, 
        required: true, 
        unique: true 
    },
    settingValue: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true 
    },
    dataType: { 
        type: String, 
        required: true,
        enum: ['number', 'string', 'boolean', 'object', 'array']
    },
    description: { 
        type: String, 
        required: true 
    },
    
    // Validation constraints
    minValue: { type: Number },
    maxValue: { type: Number },
    
    // Metadata
    lastModifiedBy: { type: String },
    lastModifiedAt: { type: Date, default: Date.now },
    
    // Legacy fields for backward compatibility
    updatedAt: { type: Date, default: Date.now },
    updatedBy: String
}, { 
    timestamps: true 
});

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

async function testSystemSettingsSchema() {
    try {
        console.log('🧪 Testing SystemSettings Schema...\n');

        // Connect to MongoDB
        const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_app';
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Test 1: Create default threshold setting
        console.log('Test 1: Creating default threshold setting...');
        const existingThreshold = await SystemSettings.findOne({ settingKey: 'daily_threshold' });
        
        if (existingThreshold) {
            console.log('ℹ️  Threshold already exists:', existingThreshold);
        } else {
            const defaultThreshold = new SystemSettings({
                settingKey: 'daily_threshold',
                settingValue: 75,
                dataType: 'number',
                description: 'Minimum percentage of periods required for daily present status',
                minValue: 1,
                maxValue: 100,
                lastModifiedBy: 'SYSTEM',
                lastModifiedAt: new Date()
            });
            
            await defaultThreshold.save();
            console.log('✅ Default threshold created:', defaultThreshold);
        }

        // Test 2: Retrieve the setting
        console.log('\nTest 2: Retrieving threshold setting...');
        const threshold = await SystemSettings.findOne({ settingKey: 'daily_threshold' });
        console.log('✅ Retrieved threshold:', {
            key: threshold.settingKey,
            value: threshold.settingValue,
            dataType: threshold.dataType,
            description: threshold.description,
            minValue: threshold.minValue,
            maxValue: threshold.maxValue
        });

        // Test 3: Validate schema fields
        console.log('\nTest 3: Validating schema fields...');
        const requiredFields = ['settingKey', 'settingValue', 'dataType', 'description'];
        const optionalFields = ['minValue', 'maxValue', 'lastModifiedBy', 'lastModifiedAt'];
        
        console.log('✅ Required fields present:', requiredFields.every(field => threshold[field] !== undefined));
        console.log('✅ Optional fields defined:', optionalFields);

        // Test 4: Validate enum for dataType
        console.log('\nTest 4: Validating dataType enum...');
        const validDataTypes = ['number', 'string', 'boolean', 'object', 'array'];
        console.log('✅ Valid dataTypes:', validDataTypes);
        console.log('✅ Current dataType:', threshold.dataType);
        console.log('✅ DataType is valid:', validDataTypes.includes(threshold.dataType));

        // Test 5: Validate unique index on settingKey
        console.log('\nTest 5: Validating unique index on settingKey...');
        try {
            const duplicate = new SystemSettings({
                settingKey: 'daily_threshold',
                settingValue: 80,
                dataType: 'number',
                description: 'Duplicate test'
            });
            await duplicate.save();
            console.log('❌ Unique constraint failed - duplicate was saved!');
        } catch (error) {
            if (error.code === 11000) {
                console.log('✅ Unique constraint working - duplicate rejected');
            } else {
                console.log('⚠️  Unexpected error:', error.message);
            }
        }

        // Test 6: Test Mixed type for settingValue
        console.log('\nTest 6: Testing Mixed type for settingValue...');
        const testSettings = [
            { key: 'test_number', value: 100, type: 'number', desc: 'Test number setting' },
            { key: 'test_string', value: 'hello', type: 'string', desc: 'Test string setting' },
            { key: 'test_boolean', value: true, type: 'boolean', desc: 'Test boolean setting' },
            { key: 'test_object', value: { foo: 'bar' }, type: 'object', desc: 'Test object setting' },
            { key: 'test_array', value: [1, 2, 3], type: 'array', desc: 'Test array setting' }
        ];

        for (const test of testSettings) {
            const existing = await SystemSettings.findOne({ settingKey: test.key });
            if (!existing) {
                const setting = new SystemSettings({
                    settingKey: test.key,
                    settingValue: test.value,
                    dataType: test.type,
                    description: test.desc,
                    lastModifiedBy: 'TEST'
                });
                await setting.save();
                console.log(`✅ Created ${test.type} setting:`, test.key);
            } else {
                console.log(`ℹ️  ${test.type} setting already exists:`, test.key);
            }
        }

        // Test 7: Verify all test settings
        console.log('\nTest 7: Verifying all test settings...');
        const allSettings = await SystemSettings.find({});
        console.log(`✅ Total settings in database: ${allSettings.length}`);
        allSettings.forEach(setting => {
            console.log(`  - ${setting.settingKey}: ${JSON.stringify(setting.settingValue)} (${setting.dataType})`);
        });

        console.log('\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run tests
testSystemSettingsSchema();
