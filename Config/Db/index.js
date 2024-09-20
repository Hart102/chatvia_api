require("dotenv").config();

const mongoose = require("mongoose");
const mongoURI = `mongodb+srv://${process.env.Database_username}:${process.env.Database_password}@cluster0.yxj6w.mongodb.net/chatVia_app?retryWrites=true&w=majority`;

const DbConnection = async () => {
  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 30000 });
    console.log("Connected to Mongodb database");
  } catch (error) {
    console.log("Failed to connect to Mongodb:", error.message);
  }
};
module.exports = DbConnection;

// , { serverSelectionTimeoutMS: 30000 }


// How to catch this Error

// Error fetching friends and last messages: MongooseError: Operation `users.aggregate()` buffering timed out after 10000ms
//     at Timeout.<anonymous> (/home/hart/Documents/HartWorks/chatVia_api/node_modules/mongoose/lib/drivers/node-mongodb-native/collection.js:185:23)
//     at listOnTimeout (node:internal/timers:573:17)
//     at process.processTimers (node:internal/timers:514:7)
// node:internal/process/promises:391
//     triggerUncaughtException(err, true /* fromPromise */);
//     ^

// MongooseError: Operation `users.aggregate()` buffering timed out after 10000ms
//     at Timeout.<anonymous> (/home/hart/Documents/HartWorks/chatVia_api/node_modules/mongoose/lib/drivers/node-mongodb-native/collection.js:185:23)
//     at listOnTimeout (node:internal/timers:573:17)
//     at process.processTimers (node:internal/timers:514:7)

// Node.js v20.15.1
// [nodemon] app crashed - waiting for file changes before starting...