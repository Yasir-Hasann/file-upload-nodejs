// module imports
const asyncHandler = require('express-async-handler');

// file imports
const { uploadToCloudinaryStorage } = require('../config/cloudinary-config');

// @desc   Upload File
// @route  POST /api/v1/upload/file
// @access Public
exports.uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error('File is required!'));

  const file = await uploadToCloudinaryStorage(req.file);
  if (!file) return next(new Error('Error in uploading'));

  res.status(200).json({ message: 'File uploaded successfully', file });
});

// @desc   Upload File With Multer Cloudinary Storage
// @route  POST /api/v1/upload/file-cloudinary
// @access Public
exports.uploadFileWithMulterCloudinaryStorage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error('File is required!'));

  res.status(200).json({ message: 'File uploaded successfully', file });
});
