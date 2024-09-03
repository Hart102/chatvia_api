const Users = require("../Config/Db/modal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const UserRegisteration = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const emailAlreadyExist = await Users.findOne({
      email: email.toLowerCase(),
    });
    if (emailAlreadyExist) {
      return res.json({
        isError: true,
        message: "Email already exist. Please use another email.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new Users({
      username,
      email: email.toLowerCase(),
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
    res.json({ isError: true, message: "Server error" });
  }
};

const UserLogin = async (req, res) => {
  try {
    const result = await Users.findOne({
      email: req.body.email.toLowerCase(),
    });

    if (result == null) {
      return res.json({ isError: true, message: "User not found" });
    }
    // Check password match
    const match = bcrypt.compareSync(req.body.password, result.password);
    if (!match) {
      return res.json({ isError: true, message: "Invalid email or password" });
    }
    // Generate JWT Token
    const token = jwt.sign(
      { userId: result._id, email: result.email },
      process.env.Access_Token,
      { expiresIn: "1w" }
    );
    res.json({
      isError: false,
      message: "Login successful",
      payoad: {
        token,
        userId: result._id,
        email: result.email,
        username: result.username,
      },
    });
  } catch (error) {
    res.json({ isError: true, message: "Server error" });
  }
};

module.exports = { UserRegisteration, UserLogin };
