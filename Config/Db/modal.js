const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    profile_photo_id: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    friends: [],
  },
  { timestamps: true }
);

const Users = mongoose.model("users", userSchema);

module.exports = Users;
