const express = require("express");
require("dotenv");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const DbConnection = require("./Config/Db/index");
const { initSocket } = require("./Socket/index");

const app = express();
const server = http.createServer(app);
const PORT = process.env.Port || 5000;

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const authRoutes = require("./Routes/auth");
const ChatRoutes = require("./Routes/Chats");

// Connect to_user Database
DbConnection();

initSocket(server);

app.use("/api", authRoutes);
app.use("/api/chat", ChatRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
