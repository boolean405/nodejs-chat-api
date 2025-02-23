const { redis } = require("../utils/redis");
const MessageDB = require("../models/message");
const UnreadMessageDB = require("../models/unread_message");
const UserDB = require("../models/user");
const { setCacheUser } = require("../utils/cache");

let initialize = async (io, socket) => {
  socket["current_user_id"] = socket.userData._id;

  await liveUser(socket.id, socket.userData);

  socket.on("message", (data) => incommingMessage(io, socket, data));
  socket.on("unread_message", (data) => loadUnreadMessage(socket));
  socket.on("all_messages", (data) => loadAllMessages(socket, data));
};

let liveUser = async (socketId, user) => {
  user["socketId"] = socketId;
  setCacheUser(socketId, user._id);
  setCacheUser(user._id, user);
};

let incommingMessage = async (io, socket, data) => {
  let save_msg = await new MessageDB(data).save();
  let db_msg = await MessageDB.findById(save_msg._id).populate(
    "from to",
    "name _id"
  );

  let db_from_user = await UserDB.findById(db_msg.from);
  let db_to_user = await UserDB.findById(db_msg.to);

  if (db_from_user) {
    if (db_to_user) {
      let to_user = await redis.get(db_msg.to._id);
      if (to_user) {
        let to_user_socket = io.of("/chat").to(to_user.socketId);
        if (to_user_socket) {
          to_user_socket.emit("message", db_msg);
        } else {
          socket.emit("message", { con: false, msg: "To Socket not found" });
        }
      } else {
        await new UnreadMessageDB({
          from: db_msg.from._id,
          to: db_msg.to._id,
        }).save();
      }

      socket.emit("message", db_msg);
    } else {
      socket.emit("message", { con: false, msg: "To User not found" });
    }
  } else {
    socket.emit("message", { con: false, msg: "From User not found" });
  }
};

let loadUnreadMessage = async (socket) => {
  let unread_msg = await UnreadMessageDB.find({ to: socket.current_user_id });

  if (unread_msg.length > 0) {
    unread_msg.forEach(async (unread) => {
      await UnreadMessageDB.findByIdAndDelete(unread._id);
    });
  }
  socket.emit("unread_message", { unread_message: unread_msg.length });
};

let loadAllMessages = async (socket, data) => {
  let limit = Number(process.env.MSG_LIMIT);
  let pageNum = Number(data.page);

  if (pageNum > 0) {
    let reqPage = pageNum == 1 ? 0 : pageNum - 1;
    let skipCount = limit * reqPage;

    let messages = await MessageDB.find({
      $or: [{ from: socket.current_user_id }, { to: socket.current_user_id }],
    })
      .sort({ created_at: -1 })
      .skip(skipCount)
      .limit(limit)
      .populate("from to", "name _id");

    socket.emit("all_messages", messages);
  } else {
    console.log(`Page Number must be greater than 0`);
  }
};

module.exports = {
  initialize,
};
