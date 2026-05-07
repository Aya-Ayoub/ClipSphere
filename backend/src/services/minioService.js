const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3 } = require("../config/minio");
const fs = require("fs");

const BUCKET = process.env.MINIO_BUCKET;

// Upload a file to MinIO and return the object key
exports.uploadFile = async (filePath, objectKey, mimeType) => {
  const fileStream = fs.createReadStream(filePath);

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
    Body: fileStream,
    ContentType: mimeType,
  });

  await s3.send(command);
  return objectKey;
};

// Generate a temporary presigned URL for secure video access
exports.getPresignedUrl = async (objectKey, expiresInSeconds = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
  return url;
};

// Delete a file from MinIO
exports.deleteFile = async (objectKey) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
  });

  await s3.send(command);
};