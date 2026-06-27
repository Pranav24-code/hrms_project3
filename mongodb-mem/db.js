const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbPath = path.join(__dirname, 'data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

async function run() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbPath: dbPath,
      storageEngine: 'ephemeralForTest' // faster and needs no disk cleanup
    }
  });

  console.log('MongoDB Memory Server is running on port 27017');
  console.log('URI:', mongod.getUri());
}

run().catch(err => {
  console.error('Failed to start MongoDB Memory Server:', err);
  process.exit(1);
});
