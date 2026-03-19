const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://adityarajsir162_db_user:fkfWRAFNcVNoVFWW@letsbunk.cdxihb7.mongodb.net/attendance_app?retryWrites=true&w=majority&appName=letsbunk';
const ENROLLMENT_NO = '2345';

async function checkEnrollment() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('attendance_app');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // Search across likely collections
    for (const col of collections) {
      const result = await db.collection(col.name).findOne({
        $or: [
          { enrollmentNo: ENROLLMENT_NO },
          { enrollment_no: ENROLLMENT_NO },
          { enrollmentNumber: ENROLLMENT_NO },
          { enrollment: ENROLLMENT_NO }
        ]
      });
      if (result) {
        console.log(`\n✅ Found in collection "${col.name}":`);
        console.log(JSON.stringify(result, null, 2));
        return;
      }
    }

    console.log(`\n❌ Enrollment number "${ENROLLMENT_NO}" NOT found in any collection.`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.close();
  }
}

checkEnrollment();
