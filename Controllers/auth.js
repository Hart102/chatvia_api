require("dotenv").config();
const Users = require("../Config/Db/modal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const UserRegisteration = async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    const emailAlreadyExist = await Users.findOne({
      phone: phone.trim(),
    });
    if (emailAlreadyExist) {
      return res.json({
        isError: true,
        message: "Phone number already exist. Please use another phone number.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new Users({
      username: username.trim(),
      phone: phone.trim(),
      password: hashedPassword,
    });
    await user.save();

    if (user?.createdAt) {
      return res.json({
        isError: false,
        message: "User registered successfully",
      });
    }
    res.json({ isError: true, message: "Failed to register user" });
  } catch (error) {
    res.json({ isError: true, message: error.message });
  }
};

const UserLogin = async (req, res) => {
  try {
    const result = await Users.findOne({
      phone: req.body.phone.trim(),
    });

    if (result == null) {
      return res.json({ isError: true, message: "User not found" });
    }

    const match = bcrypt.compareSync(req.body.password, result.password);
    if (!match) {
      return res.json({
        isError: true,
        message: "Invalid phone number or password",
      });
    }

    const token = jwt.sign(
      { _id: result._id, phone: result.phone },
      process.env.Access_Token,
      { expiresIn: "1w" }
    );

    res.json({
      isError: false,
      message: "Login successful",
      payoad: {
        token,
        _id: result._id,
        phone: result.phone,
        username: result.username,
      },
    });
  } catch (error) {
    res.json({ isError: true, message: "Server error" });
  }
};

module.exports = { UserRegisteration, UserLogin };
