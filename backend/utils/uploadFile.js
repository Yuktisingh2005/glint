// 📁 backend/utils/uploadFile.js
require("dotenv").config();
const { Upload } = require("@aws-sdk/lib-storage");
const s3Client = require("../config/s3");

const uploadFileToS3 = async (file) => {
  const timestamp = Date.now();
  const safeFileName = `${timestamp}-${file.originalname}`;
  const key = `memories/${safeFileName}`; // ✅ store inside 'memories/' folder

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    },
  });

  await upload.done();

  const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    fileUrl,
    key, // Save this in MongoDB for later deletion
    contentType: file.mimetype,
  };
};

module.exports = { uploadFileToS3 };
