const express = require("express");
const router = express.Router();
const { UserRegisteration } = require("../Controllers/auth");

router.post("/register", UserRegisteration);

module.exports = router;
