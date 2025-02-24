const { Redis } = require("../utils/redis");
const UserDB = require("../models/user-model");
const MessageDB = require("../models/message-model");
const UnreadDB = require("../models/unread-model");

let initialize = async (io, socket) => {
  socket["currentUserId"] = socket.userData._id;

  await liveUser(socket.id, socket.userData);

  socket.on("message", (data) => incommingMessage(io, socket, data));
  socket.on("unreads", () => loadUnreads(socket));
  socket.on("messages", (data) => loadMessages(socket, data));
};

let liveUser = async (socketId, user) => {
  user["socketId"] = socketId;
  await Redis.set(socketId, user._id);
  await Redis.set(user._id, user);
};

let incommingMessage = async (io, socket, data) => {
  let { receiver, type, message } = data;
  let sender = socket.currentUserId;
  if (!receiver) {
    socket.emit("message", { con: false, msg: "Receiver must be include" });
    return;
  }
  if (type !== "text" && type !== "image") {
    socket.emit("message", { con: false, msg: "Type must be valid" });
    return;
  }
  if (!message) {
    socket.emit("message", { con: false, msg: "Message must be include" });
    return;
  }
  let dbSender = await UserDB.findById(sender);
  let dbReceiver = await UserDB.findById(receiver);
  if (!dbSender) {
    socket.emit("message", { con: false, msg: "No sender user found!" });
    return;
  }
  if (!dbReceiver) {
    socket.emit("message", { con: false, msg: "No receiver user found!" });
    return;
  }
  let saveMsg = await new MessageDB({ sender, receiver, type, message }).save();
  let dbMsg = await MessageDB.findById(saveMsg._id).populate(
    "sender receiver",
    "name _id"
  );

  let redisReceiver = await Redis.get(dbMsg.receiver._id);
  if (redisReceiver) {
    let receiverSocket = io.of("api/chat").to(redisReceiver.socketId);
    if (receiverSocket) {
      receiverSocket.emit("message", dbMsg);
    } else {
      socket.emit("message", {
        con: false,
        msg: "Receiver socket not found",
      });
    }
  } else {
    await new UnreadDB({
      sender: dbMsg.sender._id,
      receiver: dbMsg.receiver._id,
    }).save();
  }
  socket.emit("message", dbMsg);
};

let loadUnreads = async (socket) => {
  let unreads = await UnreadDB.find({ receiver: socket.currentUserId });
  if (unreads.length > 0) {
    unreads.forEach(async (unread) => {
      await UnreadDB.findByIdAndDelete(unread._id);
    });
  }
  socket.emit("unreads", {
    con: true,
    msg: "Unread message count",
    unreads: unreads.length,
  });
};

let loadMessages = async (socket, data) => {
  let pageNum = Number(data.page);
  if (!pageNum) {
    socket.emit("messages", {
      con: false,
      msg: "Page no. must be include and valid",
    });
    return;
  }
  if (pageNum <= 0) {
    socket.emit("messages", {
      con: false,
      msg: "Page no. must be greater than 0",
    });
    return;
  }
  let limit = Number(process.env.PAGINATE_LIMIT);
  let reqPage = pageNum == 1 ? 0 : pageNum - 1;
  let skipCount = limit * reqPage;

  let totalMsg = await MessageDB.countDocuments({
    $or: [{ sender: socket.currentUserId }, { receiver: socket.currentUserId }],
  });
  let messages = await MessageDB.find({
    $or: [{ sender: socket.currentUserId }, { receiver: socket.currentUserId }],
  })
    .sort({ createdAt: -1 })
    .skip(skipCount)
    .limit(limit)
    .populate("sender receiver", "name _id");
  socket.emit("messages", {
    con: true,
    msg: `${messages.length} relative messages paginated of total ${totalMsg} messages for '${socket.userData.name}', max ${limit} messages per page`,
    messages,
  });
};

module.exports = {
  initialize,
};
