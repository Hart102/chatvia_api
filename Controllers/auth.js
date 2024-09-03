const Users = require("../Config/Db/modal");

const UserRegisteration = async (req, res) => {
  try {
    // res.json("response:", req.body);
    const { username, email, password } = req.body;

    const emailAlreadyExist = await Users.findOne({
      email: email.toLowerCase(),
    });

    res.json(emailAlreadyExist);

    if (emailAlreadyExist) {
      return res.json({ isError: true, message: "Email already exists" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// UserLogin;

module.exports = { UserRegisteration };
