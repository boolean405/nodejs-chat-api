const { Redis } = require("../utils/redis");
const UserDB = require("../models/user-model");
const MessageDB = require("../models/message-model");
const UnreadDB = require("../models/unread-model");

let initialize = async (io, socket) => {
  socket["currentUserId"] = socket.userData._id;

  await liveUser(socket.id, socket.userData);

  socket.on("message", (data) => incommingMessage(io, socket, data));
  socket.on("unreads", (data) => loadUnreads(socket));
  // socket.on("messages", (data) => loadMessages(socket, data));
};

let liveUser = async (socketId, user) => {
  user["socketId"] = socketId;
  await Redis.set(socketId, user._id);
  await Redis.set(user._id, user);
};

let incommingMessage = async (io, socket, data) => {
  let saveMsg = await new MessageDB(data).save();
  let dbMsg = await MessageDB.findById(saveMsg._id).populate(
    "sender receiver",
    "name _id"
  );

  let dbSender = await UserDB.findById(dbMsg.sender);
  let dbReceiver = await UserDB.findById(dbMsg.receiver);

  if (dbSender) {
    if (dbReceiver) {
      let redisReceiver = await Redis.get(dbMsg.receiver._id);
      if (redisReceiver) {
        let receiverSocket = io.of("/chat").to(redisReceiver.socketId);
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
    } else {
      socket.emit("message", { con: false, msg: "To User not found" });
    }
  } else {
    socket.emit("message", { con: false, msg: "From User not found" });
  }
};

let loadUnreads = async (socket) => {
  let unreads = await UnreadDB.find({ receiver: socket.currentUserId });

  if (unreads.length > 0) {
    unreads.forEach(async (unread) => {
      await UnreadDB.findByIdAndDelete(unread._id);
    });
  }
  socket.emit("unreads", { msg: unreads.length });
};

let loadMessages = async (socket, data) => {
  let limit = Number(process.env.MSG_LIMIT);
  let pageNum = Number(data.page);

  if (pageNum > 0) {
    let reqPage = pageNum == 1 ? 0 : pageNum - 1;
    let skipCount = limit * reqPage;

    let messages = await MessageDB.find({
      $or: [
        { sender: socket.currentUserId },
        { receiver: socket.currentUserId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(limit)
      .populate("sender receiver", "name _id");

    socket.emit("messages", messages);
  } else {
    console.log(`Page Number must be greater than 0`);
  }
};

module.exports = {
  initialize,
};
