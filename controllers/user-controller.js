const UserDB = require("../models/user-model");
const { Redis } = require("../utils/redis");
const { resMsg, Encoder, Token } = require("../utils/core");

const paginateUser = async (req, res, next) => {
  let pageNum = Number(req.params.page);
  if (!pageNum) {
    next(new Error(`Page no. must be number`));
    return;
  }
  if (pageNum <= 0) {
    next(new Error(`Page Number must be greater than 0`));
    return;
  }
  let limit = Number(process.env.PAGE_LIMIT);
  let reqPage = pageNum == 1 ? 0 : pageNum - 1;

  let skipCount = limit * reqPage;
  let totalUser = await UserDB.countDocuments();
  let user = await UserDB.find()
    .skip(skipCount)
    .limit(limit)
    .select("-password");
  resMsg(
    res,
    `${user.length} users paginated of total ${totalUser} users, max ${limit} users per page`,
    user
  );
};

const register = async (req, res, next) => {
  let { name, email, phone, password } = await req.body;
  let existUserEmail = await UserDB.findOne({ email });
  if (existUserEmail) {
    next(new Error("Email is already in use"));
    return;
  }
  let existUserPhone = await UserDB.findOne({ phone });
  if (existUserPhone) {
    next(new Error("Phone is already in use"));
    return;
  }
  // Password Encryption
  let encodedPassword = Encoder.encode(password);
  await new UserDB({
    name,
    email,
    phone,
    password: encodedPassword,
  }).save();
  let user = await UserDB.findOne({ email }).select("-password");
  resMsg(res, "Register Success", user);
};

const login = async (req, res, next) => {
  let existUser = {};
  let existPhoneUser = {};
  let existEmailUser = {};

  const { phone, email, password } = await req.body;

  if (phone && email) {
    next(new Error("Only Email or Phone need to use to Login"));
    return;
  }
  if (!phone && !email) {
    next(new Error("Email or Phone must be contain to Login"));
    return;
  }
  if (phone) {
    existPhoneUser = await UserDB.findOne({ phone });
    if (existPhoneUser) {
      existUser = existPhoneUser;
    } else {
      next(new Error(`No exist user with '${phone}'`));
      return;
    }
  }
  if (email) {
    existEmailUser = await UserDB.findOne({ email });
    if (existEmailUser) {
      existUser = existEmailUser;
    } else {
      next(new Error(`No exist user with '${email}'`));
      return;
    }
  }
  if (!existUser.email && !existUser.phone) {
    next(new Error("Email or Phone must be valid"));
    return;
  }
  if (!Encoder.compare(password, existUser.password)) {
    next(new Error("Incorrect password"));
    return;
  }
  let user = existUser.toObject();
  delete user.password;
  await Redis.set(user._id.toString(), user);
  let token = Token.makeToken({ id: user._id.toString() });
  user.token = token;
  resMsg(res, "Login success", user);
};

const profile = async (req, res, next) => {
  let user = await req.user;
  if (!user) {
    next(new Error("No login user"));
    return;
  }
  resMsg(res, "User profile", user);
};

const removeUser = async (req, res, next) => {
  let id = req.params.id;
  let user = await UserDB.findById(id);
  if (!user) {
    next(new Error("No User with that id"));
    return;
  }
  if (await Redis.get(id)) {
    await Redis.delete(id);
  }
  await UserDB.findByIdAndDelete(id);
  resMsg(res, `${user.name} User deleted`);
};

module.exports = {
  paginateUser,
  register,
  login,
  profile,
  removeUser,
};
