const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const dbName = uri.split('/').pop();

async function run() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    // Delete only documents where winner, boughtBy, or participants reference the old Member collection (24-char ObjectId but not a User)
    const result = await db.collection('lotteries').deleteMany({
      $or: [
        { winner: { $type: 'objectId', $size: 12 } },
        { boughtBy: { $type: 'objectId', $size: 12 } },
        { participants: { $elemMatch: { $type: 'objectId', $size: 12 } } }
      ]
    });
    console.log(`Deleted ${result.deletedCount} lottery documents.`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
