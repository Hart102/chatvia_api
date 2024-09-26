// const socketIo = require("socket.io");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { Chats, Users } = require("../Config/Db/modal");
const { GetLastChatWithFriend } = require("../Utils/index");

const activeUsers = new Map();
let currentUser;

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    socket.on("user_connected", async (userId) => {
      activeUsers.set(userId, socket.id);

      const friends = await Users.find({
        "friends._id": userId,
      }).select("_id photo_id username");

      const activeFriends = friends.filter((friend) =>
        activeUsers.has(friend._id.toString())
      );

      const socketId = activeUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit("user_connected", { activeFriends });
      }
    });

    socket.on("fetchFriends", async (data) => {
      try {
        const userId = data?.from_user;
        if (userId) {
          currentUser = await Users.findOne({
            _id: new mongoose.Types.ObjectId(userId),
          }).select("_id photo_id username");

          const Friends = await GetLastChatWithFriend(userId);
          socket.emit("fetchFriends", { isError: false, payload: Friends });
        }
      } catch (error) {
        socket.emit({ isError: true, message: "Server error" });
      }
    });

    socket.on("fetchPreviousMessages", async (data) => {
      try {
        const userId = new mongoose.Types.ObjectId(data?.from_user);
        const friendId = new mongoose.Types.ObjectId(data?.to_user);

        if (userId && friendId) {
          const previousMessages = await Chats.find({
            $or: [
              { from_user: userId, to_user: friendId },
              { from_user: friendId, to_user: userId },
            ],
          });

          socket.emit("fetchPreviousMessages", {
            isError: false,
            payload: previousMessages,
            user: currentUser,
          });
        }
      } catch (error) {
        socket.emit({ isError: true, message: "Server error" });
      }
    });

    socket.on("SendMessage", async (message) => {
      try {
        await Users.updateOne(
          {
            _id: message?.from_user,
            "friends._id": { $ne: message?.from_user },
          },
          { $addToSet: { friends: { _id: message?.to_user } } }
        );

        await Users.updateOne(
          { _id: message?.to_user, "friends._id": { $ne: message?.to_user } },
          { $addToSet: { friends: { _id: message?.from_user } } }
        );

        const savedMessage = new Chats({
          from_user: message?.from_user,
          to_user: message?.to_user,
          message: message?.text,
        });
        await savedMessage.save();

        if (savedMessage?._id) {
          socket.emit("message", message);
        }
      } catch (error) {
        socket.emit({ isError: true, message: "Server error" });
      }
    });
  });
};

module.exports = { initSocket };
