const express = require("express");
const router = express.Router();
const { UserRegisteration, UserLogin } = require("../Controllers/auth");

router.post("/register", UserRegisteration);
router.post("/login", UserLogin);


module.exports = router;
