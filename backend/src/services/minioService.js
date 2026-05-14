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

// Generate a temporary presigned URL for secure video access.
// When running inside Docker, the S3 client signs URLs with the internal
// service hostname (e.g. "minio"). We replace it with "localhost" so the
// browser can actually reach the file.
exports.getPresignedUrl = async (objectKey, expiresInSeconds = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
  });

  let url = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });

  // Replace internal Docker hostname with localhost for browser access
  const internalEndpoint = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
  url = url.replace(internalEndpoint, "http://localhost:9000");

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