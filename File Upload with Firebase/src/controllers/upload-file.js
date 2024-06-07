// module imports
const asyncHandler = require('express-async-handler');

// file imports
const { uploadToFirebaseStorage } = require('../middleware/upload');

// @desc   Upload file
// @route  POST /upload
// @access Public
exports.uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error('file missing'));
  const data = await uploadToFirebaseStorage(req.file);
  if (!data) return next(new Error('Error in uploading'));
  res.status(200).json({ message: 'File uploaded successfully', URL: data });
});
