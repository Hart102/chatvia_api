const express = require("express");
const PORT = 5000;
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const DbConnection = require("./Config/Db/index");
const authRoutes = require("./Routes/auth");

// Connect to MongoDB Database
DbConnection();

app.get("/", (req, res) => {
  res.json("Welcome to Chatvia Api!");
});

app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
