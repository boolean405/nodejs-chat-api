const { Redis } = require("./redis");

const setCacheUser = async (userId, user) => await Redis.set(userId, user);

const getCacheUser = async (userId) => await Redis.get(userId);

module.exports = {
  setCacheUser,
  getCacheUser,
};
