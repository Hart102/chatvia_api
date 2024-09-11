require("dotenv").config();
const mongoose = require("mongoose");
const { Users } = require("../../Config/Db/modal");
const {
  storage,
  AppWriteFileUploader,
} = require("../../Config/AppWrite/index");

const FetchUser = async (req, res) => {
  try {
    const user = await Users.findById(
      new mongoose.Types.ObjectId(req.params.id)
    );
    if (user == null) {
      return res.json({ isError: true, message: "User not found" });
    }
    delete user.password;
    res.json({ isError: false, payload: user });
  } catch (error) {
    res.json({ isError: true, message: "Server error" });
  }
};

const UpdateProfile = async (req, res) => {
  try {
    const { username, phone, location, bio } = req.body;

    const checkPhoneNumberDuplicate = await Users.findOne({
      phone: phone,
      _id: { $ne: new mongoose.Types.ObjectId(req.user._id) },
    });

    if (checkPhoneNumberDuplicate !== null) {
      return res.json({
        isError: true,
        message: "Phone number already in use by another user",
      });
    }

    const user = await Users.updateOne(
      { _id: new mongoose.Types.ObjectId(req.user._id) },
      {
        username: username.trim(),
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.toLowerCase().trim(),
      }
    );

    if (user.modifiedCount > 0) {
      res.json({
        isError: false,
        message: "Profile updated",
      });
    }
  } catch (error) {
    res.json({ isError: true, message: error.message });
  }
};

const UpdateProfilePhoto = async (req, res) => {
  try {
    const UpdateDataBase = async (photoId) => {
      const user = await Users.updateOne(
        { _id: new mongoose.Types.ObjectId(req.user._id) },
        { profile_photo_id: photoId }
      );
      if (user.modifiedCount > 0) {
        return res.json({
          isError: false,
          message: "Profile photo updated",
          payload: photoId,
        });
      }
      res.json({
        isError: true,
        message: "Profile photo not updated. Please try again.",
      });
    };

    const oldProfilePhoto = req.body.profile_photo_id;

    // UPLOAD NEW FILE
    if (oldProfilePhoto?.length == 0 && req.file !== undefined) {
      const uploadedFile = await AppWriteFileUploader(req.file);
      UpdateDataBase(uploadedFile.$id);
    }

    // UPDATE OLD FILE
    if (oldProfilePhoto?.length > 0 && req.file !== undefined) {
      const response = await storage.deleteFile(
        process.env.Appwrite_BucketId,
        req.body.profile_photo_id
      );

      if (response == "") {
        const uploadedFile = await AppWriteFileUploader(req.file);
        UpdateDataBase(uploadedFile.$id);
      }
    }
  } catch (error) {
    res.json({ isError: true, message: error.message });
  }
};

const FindUser = async (req, res) => {
  try {
    const query = req.params.query?.toLowerCase().trim();

    const searchResult = await Users.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
      ],
    });

    res.json({ isError: false, payload: searchResult });
  } catch (error) {
    res.json({ isError: true, message: "Server error" });
  }
};

module.exports = { FetchUser, UpdateProfile, UpdateProfilePhoto, FindUser };
