const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    photo_id: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    friends: [],
  },
  { timestamps: true }
);

const Users = mongoose.model("users", userSchema);

const chatSchema = new Schema(
  {
    from_user: { type: Schema.Types.ObjectId, ref: "User" },
    to_user: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Chats = mongoose.model("chats", chatSchema);

module.exports = { Users, Chats };
