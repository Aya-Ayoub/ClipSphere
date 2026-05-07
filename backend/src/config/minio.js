const { S3Client, CreateBucketCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.MINIO_BUCKET;

async function initBuckets() {
  try {
    await s3.send(
      new CreateBucketCommand({
        Bucket: BUCKET,
      })
    );
    console.log("MinIO bucket ready");
  } catch (err) {
    if (err.name !== "BucketAlreadyOwnedByYou") {
      console.log("Bucket init error:", err.message);
    }
  }
}

module.exports = { s3, initBuckets };