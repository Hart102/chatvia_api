const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { Chats, Users } = require("../Config/Db/modal");
const { GetLastChatWithFriend } = require("../Utils/index");
const uuid = require("uuid")

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
      socket.userId = userId;
      socket.join(userId);

      const friends = await Users.find({
        "friends._id": userId,
      }).select("_id photo_id username");

      const activeFriends = friends.filter((friend) => {
        return [...io.sockets.sockets.values()].some(
          (socket) => socket.userId === friend._id.toString()
        );
      });

      io.to(userId).emit("user_connected", { activeFriends });
    });

    socket.on("fetchFriends", async (data) => {
      try {
        const userId = data?.from_user;
        if (userId) {
          currentUser = await Users.findOne({
            _id: new mongoose.Types.ObjectId(userId),
          }).select("_id photo_id username");

          const Friends = await GetLastChatWithFriend(userId);
          io.to(userId).emit("fetchFriends", {
            isError: false,
            payload: Friends,
          });
        }
      } catch (error) {
        if (userId) {
          io.to(userId).emit({ isError: true, message: "Server error" });
        }
      }
    });

    socket.on("fetchPreviousMessages", async (data) => {
      try {
        const host = data?.from_user;
        const recipient = data?.to_user;
        const userId = new mongoose.Types.ObjectId(host);
        const friendId = new mongoose.Types.ObjectId(recipient);

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
        io.to(host).emit({ isError: true, message: "Server error" });
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
          io.to(message?.to_user).emit("message", message);
        }
      } catch (error) {
        io.to(message?.from_user).emit("message", {
          isError: true,
          message: "Server error",
        });
      }
    });

    // socket.on("Initialize-call", (data) => {
    //   try {
    //     socket.broadcast.emit("Initialize-call", data);
    //   } catch (error) {
    //     socket.broadcast.emit("Initialize-call", {
    //       isError: true,
    //       message: "Server error",
    //     });
    //   }
    // });

    // socket.on("Call-response", (response) => {
    //   socket.broadcast.emit("Call-response", response);
    // });

    // socket.on("Share-stream", (stream) => {
    //   socket.broadcast.emit("Share-stream", stream);
    // });



    // ===================
    // socket.on("generate-roomURL", (data) => {
    //   const roomURL =  `room?username=${encodeURIComponent(data?.username)}&photoId=${encodeURIComponent(data?.photoId)}&_id=${encodeURIComponent(data?.from_user)}&reciepiantId=${data?.to_user}`
    //   socket.emit("generate-roomURL", roomURL)
    // })

     const GetQueryData = (urlData, text) => {
      if(urlData && text){
        const queryString = urlData.split('?')[1];
        const params = new URLSearchParams(queryString);
        const result = params.get(text)
        return result
      }
      return null
    }

    socket.on("start-call", (roomURL) => socket.broadcast.emit("start-call", roomURL))

    socket.on("join-call", (data) => socket.broadcast.emit("join-call", data))
  });

  
};

module.exports = { initSocket };
