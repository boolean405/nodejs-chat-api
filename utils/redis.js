// localhost Redis
const redisClient = require("async-redis").createClient();

const Redis = {
  set: async (key, value) => {
    await redisClient.set(key.toString(), JSON.stringify(value));
  },
  get: async (key) => {
    return JSON.parse(await redisClient.get(key.toString()));
  },
  delete: async (key) => {
    await redisClient.del(key.toString());
  },
};

// // server Redis
// const redis = require("ioredis");

// const Redis = new redis({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT || 13013,
//   password: process.env.REDIS_PASSWORD,
// })
//   .on("connect", () => {
//     console.log("Success, Redis Server Connected");
//   })
//   .on("error", (error) => {
//     console.error("Failed, to connect to Redis Server: ", error.message);
//   })
//   .on("close", () => {
//     console.log("Redis connection closed.");
//   });

// module.exports = {
//   set: async (id, value) =>
//     await Redis.set(id.toString(), JSON.stringify(value)),
//   get: async (id) => JSON.parse(await Redis.get(id.toString())),
//   drop: async (id) => await Redis.del(id.toString()),
// };

module.exports = { Redis };
