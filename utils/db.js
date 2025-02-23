// require("dotenv").config();

// const { MongoClient } = require("mongodb");

// // Connection URL
// const url = process.env.MONGODB_URI;
// const dbName = process.env.DB_NAME;
// const client = new MongoClient(url);

// let db;
// async function connectDB(cb) {
//   await client
//     .connect()
//     .then((client) => {
//       db = client.db(dbName);
//       cb();
//     })
//     .catch((err) => cb(err));
// }

// const getDB = () => db;

// module.exports = { connectDB, getDB };
