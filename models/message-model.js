const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, require: true, ref: "user" },
    receiver: { type: Schema.Types.ObjectId, require: true, ref: "user" },
    type: {
      type: String,
      require: true,
      enum: ["text", "image"],
      default: "text",
    },
    message: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("message", MessageSchema);

module.exports = MessageModel;
