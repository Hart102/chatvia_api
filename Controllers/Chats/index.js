const mongoose = require("mongoose");
const { chatSchema } = require("../../Config/Db/modal");

const FetchChats = async (req, res) => {
  try {
    const friendsId = req.params?.id;

    const chats = await chatSchema.find({
      sender_id: new mongoose.Types.ObjectId(req.user._id),
      receiver_id: new mongoose.Types.ObjectId(friendsId),
    });

    res.json({ isError: false, payload: chats });
  } catch (error) {
    console.log(error);
    res.json({ isError: true, message: "Server error" });
  }
};

module.exports = { FetchChats };
