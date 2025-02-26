const ChatDB = require("../models/chat-model");
const UserDB = require("../models/user-model");
const { resMsg } = require("../utils/core");

const createOrAccessChat = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    let dbReceiver = await UserDB.findById(receiverId);

    if (!dbReceiver) {
      const error = new Error("No receiver found!");
      error.status = 404;
      return next(error);
    }

    let isChat = await ChatDB.find({
      isGroupChat: false,
      $and: [
        {
          users: { $elemMatch: { $eq: req.user._id } },
        },
        {
          users: { $elemMatch: { $eq: receiverId } },
        },
      ],
    }).populate("users latestMessage", "-password");

    isChat = await UserDB.populate(isChat, {
      path: "latestMessage.sender",
      select: "name picture email",
    });

    if (isChat.length > 0) {
      resMsg(res, "Accessed PM chat", isChat);
    } else {
      let chatData = {
        chatName: "PM Chat",
        isGroupChat: false,
        users: [req.user._id, receiverId],
      };

      const createdChat = await ChatDB.create(chatData);
      const dbChat = await ChatDB.findById(createdChat._id).populate(
        "users latestMessage",
        "-password"
      );
      resMsg(res, "Created PM chat", dbChat);
    }
  } catch (err) {
    const error = new Error(err.message);
    error.status = 404;
    return next(error);
  }
};

const fetchChat = async (req, res, next) => {
  try {
    await ChatDB.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users groupAdmin latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await UserDB.populate(results, {
          path: "latestMessage.sender",
          select: "name picture email",
        });
        resMsg(res, `Fetch '${req.user.name}' chat`, results);
      });
  } catch (err) {
    const error = new Error(err.message);
    error.status = 404;
    return next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    let { users, groupName } = req.body;
    let usersObj = JSON.parse(users);

    if (usersObj.length <= 1) {
      const error = new Error(
        "Minimum 2 other users need to create group chat!"
      );
      error.status = 400;
      return next(error);
    }
    usersObj.push(req.user);

    const groupChat = await ChatDB.create({
      chatName: groupName,
      users: usersObj,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const dbGroupChat = await ChatDB.findById(groupChat._id).populate(
      "users groupAdmin",
      "-password"
    );
    resMsg(res, "Created group Chat", dbGroupChat);
  } catch (err) {
    const error = new Error(err.message);
    error.status = 404;
    return next(error);
  }
};

const renameGroup = async (req, res, next) => {
  try {
    const { chatId, groupName } = req.body;
    let dbChat = await ChatDB.findById(chatId);

    if (!dbChat) {
      const error = new Error("No found group data with that id!");
      error.status = 404;
      return next(error);
    }

    if (dbChat.chatName === groupName) {
      const error = new Error(
        "Can't change group name because the current group name is the same with change name!"
      );
      error.status = 400;
      return next(error);
    }

    const updatedChat = await ChatDB.findByIdAndUpdate(
      chatId,
      { chatName: groupName },
      { new: true }
    ).populate("users groupAdmin", "-password");

    resMsg(res, "Renamed group chat", updatedChat);
  } catch (err) {
    const error = new Error(err.message);
    error.status = 404;
    return next(error);
  }
};

const addUserToGroup = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;
    let dbUser = await UserDB.findById(userId);
    let dbChat = await ChatDB.findById(chatId);
    let existUser = await ChatDB.find({
      users: { $elemMatch: { $eq: userId } },
    });

    if (!dbChat) {
      const error = new Error("No found group with that id!");
      error.status = 404;
      return next(error);
    }

    if (!dbUser) {
      const error = new Error("No found user with that id!");
      error.status = 404;
      return next(error);
    }

    if (existUser.length > 0) {
      const error = new Error("User is already in the group!");
      error.status = 400;
      return next(error);
    }

    const updatedChat = await ChatDB.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    ).populate("users groupAdmin", "-password");

    resMsg(res, `'${dbUser.name} is added to the group chat`, updatedChat);
  } catch (err) {
    const error = new Error(err.message);
    error.status = 404;
    return next(error);
  }
};

const removeUserFromGroup = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;
    let dbUser = await UserDB.findById(userId);
    let dbChat = await ChatDB.findById(chatId);
    let existUser = await ChatDB.find({
      users: { $elemMatch: { $eq: userId } },
    });

    if (!dbChat) {
      const error = new Error("No found group with that id!");
      error.status = 404;
      return next(error);
    }

    if (!dbUser) {
      const error = new Error("No found user with that id!");
      error.status = 404;
      return next(error);
    }

    if (existUser.length === 0) {
      const error = new Error("User is not in the group!");
      error.status = 404;
      return next(error);
    }

    const updatedChat = await ChatDB.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    ).populate("users groupAdmin", "-password");

    resMsg(res, `'${dbUser.name} is removed from the group chat`, updatedChat);
  } catch (err) {
    const error = new Error(err.message);
    error.status = 404;
    return next(error);
  }
};

module.exports = {
  createOrAccessChat,
  fetchChat,
  createGroup,
  renameGroup,
  addUserToGroup,
  removeUserFromGroup,
};
