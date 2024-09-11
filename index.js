const express = require("express");
const PORT = 5000;
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// Socket.IO Server setup
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const DbConnection = require("./Config/Db/index");
const { Users, Chats } = require("./Config/Db/modal");

const authRoutes = require("./Routes/auth");
const ChatRoutes = require("./Routes/Chats");

// Connect to Database
DbConnection();

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);

  socket.on("userConnected", async (data) => {
    console.log(`${data.userId} just connected`);

    // Fetch Friends
    const friends = await Users.find({
      friends: {
        $elemMatch: {
          _id: data.userId,
        },
      },
    });

    console.log(friends);

    // Send Friends to User
    socket.emit("friends", friends);
  });

  socket.on("sendMessage", async (message) => {
    // Add User To Friends List
    await Users.updateOne(
      { _id: message?.senderId, "friends._id": { $ne: message?.receiverId } },
      {
        $addToSet: {
          friends: { _id: message?.receiverId },
        },
      }
    );

    // Save chat in Database
    const savedMessage = new Chats({
      sender_id: message?.senderId,
      receiver_id: message?.receiverId,
      message: message?.text,
    });
    await savedMessage.save();

    if (savedMessage?._id) {
      io.emit("message", message);
    }

    console.log(savedMessage);
  });

  // socket.on("disconnect", () => {
  //   console.log("User disconnected");
  // });
});

app.get("/", (req, res) => {
  res.json("Welcome to Chatvia Api!");
});

app.use("/api", authRoutes);
app.use("/api/chat", ChatRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
