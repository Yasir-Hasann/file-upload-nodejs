// module imports
const asyncHandler = require('express-async-handler');

// @desc   Upload file
// @route  POST /upload
// @access Public
exports.uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error('file missing'));
  res.status(200).json({ message: 'File uploaded successfully', filename: req.file.filename });
});
