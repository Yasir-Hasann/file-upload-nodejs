// module imports
const asyncHandler = require('express-async-handler');

// file imports
const { uploadUsingV2 } = require('../config/aws-v2-config');
const { uploadUsingV3 } = require('../config/aws-v3-config');
const { generatePresignedUrl, uploadToS3, listFilesInDirectory, checkFileExistence, deleteFileFromS3, checkDirectoryExistence, deleteDirectoryFromS3 } = require('../config/aws-multer-s3');
const { fetchFileBuffer } = require('../utils/helper-methods');

// @desc   Upload File
// @route  POST /aws-s3/upload-v2
// @access Public
exports.uploadV2 = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error('File is required!'));

  const file = await uploadUsingV2(req.file);
  if (file) throw new Error('Upload to S3 Failed!');

  res.status(200).json(file);
});

// @desc   Upload File
// @route  POST /aws-s3/upload-v3
// @access Public
exports.uploadV3 = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error('File is required!'));
  if (!req.headers.foldername) return next(new Error('Foldername is required!'));

  const file = await uploadUsingV3(req.headers.foldername, req.file);
  if (file) throw new Error('Upload to S3 Failed!');

  res.status(200).json(file);
});

// @desc   Get Presigned URL
// @route  POST /api/v1/aws-s3/get-presigned-urls
// @access Public
exports.getPresignedUrls = asyncHandler(async (req, res, next) => {
  const { folderName, fileNames, expiryTime } = req.body;
  if (!fileNames || fileNames.length === 0) return next(new ErrorResponse('Please enter the fileNames', 400));

  const fileUploadPromises = fileNames.map((filename) => generatePresignedUrl(folderName, filename, expiryTime));
  const data = await Promise.all(fileUploadPromises);

  res.status(200).json({ success: true, data });
});

// @desc   Upload File using URL
// @route  POST /api/v1/aws-s3/upload-file-url
// @access Public
exports.uploadFileUrl = asyncHandler(async (req, res, next) => {
  const { url, folder, shouldAddWatermark } = req.body;
  if (!url || !folder) throw new Error('Please enter a url and the folder');

  const file = await fetchFileBuffer(url);
  if (!file) throw new Error('Failed to fetch file');

  const uploadedUrl = await uploadToS3(folder, file, shouldAddWatermark);
  if (!uploadedUrl) throw new Error('Failed to upload file');

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully.',
    fileUrl: uploadedUrl,
  });
});

// @desc   Upload Files using URLs
// @route  POST /api/v1/aws-s3/upload-files-urls
// @access Public
exports.uploadFilesUrls = asyncHandler(async (req, res, next) => {
  const { urls, folder, shouldAddWatermark } = req.body;
  if (!urls || !folder) throw new Error('Please enter the urls and the folder');

  const fileUploadPromises = urls.map(async (url) => {
    const file = await fetchFileBuffer(url);
    return uploadToS3(folder, file, shouldAddWatermark);
  });

  const files = await Promise.all(fileUploadPromises);

  res.status(200).json({
    success: true,
    message: 'Files uploaded successfully.',
    files,
  });
});

// @desc   Upload File
// @route  POST /api/v1/aws-s3/upload-file
// @access Public
exports.uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) throw new Error('Please select the File!');

  const { key: folder, shouldAddWatermark } = req.query;
  if (!folder) throw new Error('Please provide a key for the file');

  const file = await uploadToS3(folder, req.file, shouldAddWatermark);

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully.',
    file,
  });
});

// @desc   Upload Files
// @route  POST /api/v1/aws-s3/upload-files
// @access Public
exports.uploadFiles = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) throw new Error('Please select the Files!');

  const { key: folder, shouldAddWatermark } = req.query;
  if (!folder) throw new Error('Please provide a key for the file');

  const fileUploadPromises = req.files.map(async (file) => {
    return uploadToS3(folder, file, shouldAddWatermark);
  });

  const files = await Promise.all(fileUploadPromises);

  res.status(200).json({
    success: true,
    message: 'Files uploaded successfully.',
    files,
  });
});

// @desc   Upload Images
// @route  POST /api/v1/aws-s3/upload-images
// @access Public
exports.uploadImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) throw new Error('Please select the Files!');

  //  const files = req.files.map((file) => file.location);

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully.',
    files: req.files,
  });
});

// @desc   List Files in Directory
// @route  POST /api/v1/aws-s3/list-files
// @access Public
exports.listFiles = asyncHandler(async (req, res, next) => {
  const { prefix } = req.body;
  if (!prefix) throw new Error('Please enter a directory prefix');

  const files = await listFilesInDirectory(prefix);
  res.status(200).json({
    success: true,
    files,
  });
});

// @desc   Check File Existence
// @route  POST /api/v1/aws-s3/check-file
// @access Public
exports.checkFileExistence = asyncHandler(async (req, res, next) => {
  const { fileKey } = req.body;
  if (!fileKey) throw new Error('Please enter a fileKey');

  const exists = await checkFileExistence(fileKey);
  res.status(200).json({
    success: true,
    fileExists: exists,
  });
});

// @desc   Delete File
// @route  DELETE /api/v1/aws-s3/delete-file
// @access Public
exports.deleteFile = asyncHandler(async (req, res, next) => {
  const { fileKey } = req.body;
  if (!fileKey) throw new Error('Please enter a fileKey');

  let exists = await checkFileExistence(fileKey);
  if (!exists) throw new Error('File does not exist');

  await deleteFileFromS3(fileKey);
  exists = await checkFileExistence(fileKey);
  if (exists) throw new Error('File still exists after deletion attempt');

  res.status(200).json({
    success: true,
    message: 'File deleted successfully.',
  });
});

// @desc   Check Directory Existence
// @route  POST /api/v1/aws-s3/check-directory
// @access Public
exports.checkDirectoryExistence = asyncHandler(async (req, res, next) => {
  const { prefix } = req.body;
  if (!prefix) throw new Error('Please enter a directory prefix');

  const exists = await checkDirectoryExistence(prefix);
  res.status(200).json({
    success: true,
    directoryExists: exists,
  });
});

// @desc   Delete Directory
// @route  DELETE /api/v1/aws-s3/delete-directory
// @access Public
exports.deleteDirectory = asyncHandler(async (req, res, next) => {
  const { prefix } = req.body;
  if (!prefix) throw new Error('Please enter a directory prefix');

  let exists = await checkDirectoryExistence(prefix);
  if (!exists) throw new Error('No files found in the specified directory');

  await deleteDirectoryFromS3(prefix);

  exists = await checkDirectoryExistence(prefix);
  if (exists) throw new Error('Directory still has files after deletion attempt');

  res.status(200).json({
    success: true,
    message: 'Directory deleted successfully.',
  });
});
