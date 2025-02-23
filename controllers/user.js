const DB = require("../models/user");
const { setCacheUser } = require("../utils/cache");
const { resMsg, Encoder, Token } = require("../utils/core");

const all = async (req, res, next) => {
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
  let user = await DB.find().skip(skipCount).limit(limit).select("-password");
  resMsg(
    res,
    `All users paginated page no. ${pageNum}, for ${limit} users`,
    user
  );
};

const register = async (req, res, next) => {
  let { name, email, phone, password } = await req.body;
  let existUserEmail = await DB.findOne({ email });
  if (existUserEmail) {
    next(new Error("Email is already in use"));
    return;
  }

  let existUserPhone = await DB.findOne({ phone });
  if (existUserPhone) {
    next(new Error("Phone is already in use"));
    return;
  }

  // Password Encryption
  let encodedPassword = Encoder.encode(password);
  await new DB({
    name,
    email,
    phone,
    password: encodedPassword,
  }).save();
  let user = await DB.findOne({ email }).select("-password");
  resMsg(res, "User Saved", user);
};

const login = async (req, res, next) => {
  let existUser = {};
  let existPhoneUser = {};
  let existEmailUser = {};

  const { phone, email, password } = await req.body;

  if (!phone && !email) {
    next(new Error("Email or Phone must be contain to Login"));
    return;
  }

  if (phone) {
    existPhoneUser = await DB.findOne({ phone });
    if (existPhoneUser) {
      existUser = existPhoneUser;
    } else {
      next(new Error(`No User found with this '${phone}' Phone Number`));
      return;
    }
  }

  if (email) {
    existEmailUser = await DB.findOne({ email });
    if (existEmailUser) {
      existUser = existEmailUser;
    } else {
      next(new Error(`No User found with this '${email}' Email Address`));
      return;
    }
  }

  if (!existUser.email && !existUser.phone) {
    next(new Error("Email or Phone must be valid"));
    return;
  }

  if (!Encoder.compare(password, existUser.password)) {
    next(new Error("Incorrect Password"));
    return;
  }

  let user = existUser.toObject();
  delete user.password;
  await setCacheUser(user._id.toString(), user);
  let token = Token.makeToken({ id: user._id.toString() });
  user.token = token;
  resMsg(res, "Login Success", user);
};

const profile = async (req, res, next) => {
  let user = await req.user;

  if (!user) {
    next(new Error("No login user"));
    return;
  }
  resMsg(res, "User Profile", user);
};

const removeUser = async (req, res, next) => {
  let user = await DB.findById(req.params.id);

  if (!user) {
    next(new Error("No User with that id"));
    return;
  }
  await DB.findByIdAndDelete(user._id);
  resMsg(res, `${user.name} User Deleted`);
};

module.exports = {
  all,
  register,
  login,
  profile,
  removeUser,
};
