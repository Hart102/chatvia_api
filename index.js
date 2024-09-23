const express = require("express");
const PORT = 5000;
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoos = require("mongoose");
const app = express();

// Socket.IO Server setup
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
  transports: ["websocket", "polling"],
});

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const DbConnection = require("./Config/Db/index");
const { Users, Chats } = require("./Config/Db/modal");
const { GetLastChatWithFriend } = require("./Utils/index");

const authRoutes = require("./Routes/auth");
const ChatRoutes = require("./Routes/Chats");

// Connect to_user Database
DbConnection();
let user;
const activeUsers = new Map();

io.on("connection", async (socket) => {
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
        user = await Users.findOne({
          _id: new mongoos.Types.ObjectId(userId),
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
      const userId = new mongoos.Types.ObjectId(data?.from_user);
      const friendId = new mongoos.Types.ObjectId(data?.to_user);

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
          user,
        });
      }
    } catch (error) {
      socket.emit({ isError: true, message: "Server error" });
    }
  });

  socket.on("sendMessage", async (message) => {
    try {
      await Users.updateOne(
        {
          _id: message?.from_user,
          "friends._id": { $ne: message?.from_user },
        },
        {
          $addToSet: {
            friends: { _id: message?.to_user },
          },
        }
      );
      //Update Reciever Friends List
      await Users.updateOne(
        {
          _id: message?.to_user,
          "friends._id": { $ne: message?.to_user },
        },
        {
          $addToSet: {
            friends: { _id: message?.from_user },
          },
        }
      );

      // Save chat in Database
      const savedMessage = new Chats({
        from_user: message?.from_user,
        to_user: message?.to_user,
        message: message?.text,
      });
      await savedMessage.save();

      if (savedMessage?._id) {
        io.emit("message", message);
      }
    } catch (error) {
      socket.emit({ isError: true, message: "Server error" });
    }
  });
});

app.get("/", (req, res) => {
  res.json("Welcome to_user Chatvia Api!");
});

app.use("/api", authRoutes);
app.use("/api/chat", ChatRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

 // // Add User to_user Friends List When User Connects  (On Connect)
  // socket.on("addFriend", async (data) => {
  //   await Users.updateOne(
  //     { _id: data?.hostId },
  //     {
  //       $addto_userSet: {
  //         friends: { _id: data?.friendId },
  //       },
  //     }
  //   );
  // });

  // // Remove User from_user Friends List When User Disconnects  (On Disconnect)
  // socket.on("disconnect", async (data) => {
  //   await Users.updateOne(
  //     { _id: data?.hostId },
  //     {
  //       $pull: {
  //         friends: { _id: data?.friendId },
  //       },
  //     }
  //   );
  // });

  // // Send Message When User Connects  (On Connect)
  // socket.on("joinRoom", (room) => {
  //   socket.join(room);
  // });

  // // Listen For Messages When User Connects  (On Connect)
  // socket.on("typing", (data) => {
  //   socket.broadcast.to_user(data?.room).emit("typing", data?.senderId);
  // });

  // // Listen For Messages When User Connects  (On Connect)
  // socket.on("sto_userpTyping", (data) => {
  //   socket.broadcast.to_user(data?.room).emit("sto_userpTyping", data?.senderId);
  // });

  // // Listen For Messages When User Connects  (

  // socket.on("disconnect", () => {
  //   console.log("User disconnected");
  // });