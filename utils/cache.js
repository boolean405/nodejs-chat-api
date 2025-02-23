const { redis } = require("./redis");

const setCacheUser = async (userId, user) => await redis.set(userId, user);

const getCacheUser = async (userId) => await redis.get(userId);

module.exports = {
  setCacheUser,
  getCacheUser,
};
