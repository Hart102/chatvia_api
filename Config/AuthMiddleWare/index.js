require("dotenv").config();
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // const token = req.header("Authorization")
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.json({
      isError: true,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.Access_Token);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err.message);
    res.json({ isError: true, message: "Invalid authentication token!" });
  }
};

module.exports = authMiddleware;
