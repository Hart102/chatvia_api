require("dotenv").config();
const appwrite = require("node-appwrite");
const multer = require("multer");

// AppWrite Configuration
const client = new appwrite.Client();
const storage = new appwrite.Storage(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.Appwrite_ProjectId)
  .setKey(process.env.AppWrite_ApiKey);

const upload = multer.memoryStorage({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // Limit file size to 5 MB
  },
});
const fileuploader = multer({ storage: upload }).single("profile_picture");

// AppWrite Image Uploader Function
const AppWriteFilesUploader = async (profile_picture) => {
  const uniqueImageId = Math.random().toString(36).substring(2, 8);
  const uniqueFilename =
    Math.random().toString(36).substring(2, 8) +
    "-" +
    profile_picture.originalname;

  const image_id = await storage.createFile(
    process.env.Appwrite_BucketId,
    uniqueImageId,
    appwrite.InputFile.fromBuffer(profile_picture.buffer, uniqueFilename)
  );
  return image_id;
};

module.exports = { storage, fileuploader, AppWriteFilesUploader };
