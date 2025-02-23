const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    phone: { type: String, require: true, unique: true },
    password: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
