const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    password: { type: String, required: true, minlength: 6 },
    profile_picture: { type: String, default: "" },
    friends: [],
  },
  { timestamps: true }
);

const Users = mongoose.model("users", userSchema);

module.exports = Users;
