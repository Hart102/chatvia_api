const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../Config/AuthMiddleWare/index");
const { FileReader } = require("../Config/AppWrite/index");

// Routes
const { UserRegisteration, UserLogin } = require("../Controllers/Auth/index");
const {
  FetchUser,
  FindUser,
  UpdateProfile,
  UpdateProfilePhoto,
} = require("../Controllers/User/index");

router.post("/login", UserLogin);
router.post("/register", UserRegisteration);
router.get("/fetch-user/:id", FetchUser);
router.get("/find-user/:query", FindUser);
router.post("/update-profile", AuthMiddleware, UpdateProfile);

router.put(
  "/update-profile-photo",
  AuthMiddleware,
  FileReader,
  UpdateProfilePhoto
);


module.exports = router;
