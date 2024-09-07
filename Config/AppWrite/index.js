require("dotenv").config();
const appwrite = require("node-appwrite");
const multer = require("multer");

// APPWRITE CONFIG
const client = new appwrite.Client();
const storage = new appwrite.Storage(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.Appwrite_ProjectId)
  .setKey(process.env.AppWrite_ApiKey);

const upload = multer.memoryStorage({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // Limit file size to 1 MB
  },
});
const FileReader = multer({ storage: upload }).single("file");

// FILE UPLOADER
const AppWriteFileUploader = async (File) => {
  if (File) {
    const uniqueFilename =
      Math.random().toString(36).substring(2, 8) + "-" + File.originalname;

    const uploadedFile = await storage.createFile(
      process.env.Appwrite_BucketId,
      appwrite.ID.unique(),
      appwrite.InputFile.fromBuffer(File.buffer, uniqueFilename)
    );
    return uploadedFile;
  }
};

module.exports = { storage, FileReader, AppWriteFileUploader };
