// module imports
const asyncHandler = require('express-async-handler');

// file imports
const { uploadToFirebaseStorage } = require('../config/firebase-config');

// @desc   Upload File
// @route  POST /upload/file
// @access Public
exports.uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error('File is required!'));

  const file = await uploadToFirebaseStorage(req.file);
  if (!file) return next(new Error('Error in uploading'));

  res.status(200).json({ message: 'File uploaded successfully', file });
});
