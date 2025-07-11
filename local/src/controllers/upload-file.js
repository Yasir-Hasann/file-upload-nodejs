// module imports
const asyncHandler = require('express-async-handler');

// @desc   Upload File
// @route  POST /upload/file
// @access Public
exports.uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error('File is required!'));

  res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});

// @desc   Upload Files
// @route  POST /upload/files
// @access Public
exports.uploadFiles = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next(new Error('Files are required!'));

  res.status(200).json({ message: 'Files uploaded successfully', files: req.files });
});

// @desc   Upload Named Files
// @route  POST /upload/named-files
// @access Public
exports.uploadNamedFiles = asyncHandler(async (req, res, next) => {
  if (!req.files || (!req.files.cv && !req.files.resume)) return next(new Error('CV and Resume files are required!'));

  res.status(200).json({ message: 'Files uploaded successfully', files: req.files });
});
