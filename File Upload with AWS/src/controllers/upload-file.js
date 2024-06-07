// module imports
const asyncHandler = require('express-async-handler');
const { randomUUID } = require('crypto');
const sharp = require('sharp');
const { S3 } = require('aws-sdk'); // v2
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // v3

exports.uploadV2 = asyncHandler(async (req, res, next) => {
  const s3 = new S3();
  try {
    if (!req.file) return next(new Error('file missing'));

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: req.file.buffer,
      Key: `uploads/${Date.now()}-image`,
      ContentType: req.file.mimetype,
    };

    const data = await s3.upload(params).promise();
    res.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

exports.uploadV3 = asyncHandler(async (req, res, next) => {
  const s3client = new S3Client();
  try {
    if (!req.file) return next(new Error('file missing'));

    const key = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/uploads/${Date.now()}-image`;
    const params = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Region: process.env.AWS_REGION,
      Body: req.file.buffer,
      Key: `uploads/${Date.now()}-image`,
      ContentType: req.file.mimetype,
    });

    const data = await s3client.send(params);
    const response = { key: key, ...data };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

exports.upload = asyncHandler(async (req, res, next) => {
  const { foldername } = req.headers;

  if (!req.file) return next(new Error('file missing'));
  if (!foldername) return next(new Error('foldername missing in headers'));

  const { buffer, mimetype } = req.file;
  let resized = buffer;
  if (mimetype.includes('image')) {
    resized = await sharp(buffer).jpeg({ quality: 30, progressive: true, force: false }).png({ quality: 30, progressive: true, force: false });
  }
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Body: resized,
    Key: `${foldername}/${Date.now()}_${randomUUID()}`,
    ContentType: mimetype,
  };

  req.S3.upload(params, function (err, data) {
    if (err) {
      return next(new Error('Something went wrong'));
    }
    if (data) {
      return res.status(200).send(data);
    }
  });
});
