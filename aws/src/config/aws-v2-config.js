// module imports
const crypto = require('crypto');
const sharp = require('sharp');
const multer = require('multer');
const { S3 } = require('aws-sdk');

// variable initializations
const s3 = new S3();

exports.uploadUsingV2 = async (file) => {
  try {
    const { buffer, mimetype, originalname } = file;
    const key = `public/${crypto.randomUUID()}-${originalname}`;

    let processedBuffer = buffer;
    if (mimetype.includes('image')) {
      processedBuffer = await sharp(buffer).jpeg({ quality: 30, progressive: true, force: false }).png({ quality: 30, progressive: true, force: false });
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: processedBuffer,
      ContentType: mimetype,
    };

    const data = await s3.upload(params).promise();
    return data;
  } catch (error) {
    console.error('Error: ', error);
    return null;
  }
};

exports.multerStorageUpload = multer({ storage: multer.memoryStorage() });
