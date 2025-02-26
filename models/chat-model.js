const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChatSchema = new Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: Schema.Types.ObjectId, ref: "user" }],
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "message",
    },
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const ChatModel = mongoose.model("chat", ChatSchema);

module.exports = ChatModel;
