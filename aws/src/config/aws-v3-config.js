// module imports
const crypto = require('crypto');
const sharp = require('sharp');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// variable initializations
const s3client = new S3Client();

exports.uploadUsingV3 = async (foldername, file) => {
  try {
    const { buffer, mimetype, originalname } = file;
    const key = `${foldername}/${crypto.randomUUID()}_${originalname}`;

    let processedBuffer = buffer;
    if (mimetype.includes('image')) {
      processedBuffer = await sharp(buffer).jpeg({ quality: 30, progressive: true, force: false }).png({ quality: 30, progressive: true, force: false });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: processedBuffer,
      ContentType: mimetype,
      ACL: 'public-read',
    };

    const command = new PutObjectCommand(params);
    await S3.send(command);
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error: ', error);
    return null;
  }
};

exports.multerStorageUpload = multer({ storage: multer.memoryStorage() });
