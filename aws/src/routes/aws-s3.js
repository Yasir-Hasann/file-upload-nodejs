// module imports
const express = require('express');

// file imports
const { multerMemoryUpload, uploadImages } = require('../config/aws-multer-s3');
const awsS3Controller = require('../controllers/aws-s3');

// variable initializations
const router = express.Router();

router.post('/upload-v2', multerMemoryUpload.single('file'), awsS3Controller.uploadV2);
router.post('/upload-v3', multerMemoryUpload.single('file'), awsS3Controller.uploadV3);
router.get('/get-presigned-url', awsS3Controller.getPresignedUrl);
router.post('/upload-file-url', awsS3Controller.uploadFileUrl);
router.post('/upload-files-urls', awsS3Controller.uploadFilesUrls);
router.post('/upload-file', multerMemoryUpload.single('file'), handleMulterErrors, awsS3Controller.uploadFile);
router.post('/upload-files', multerMemoryUpload.array('files', 20), handleMulterErrors, awsS3Controller.uploadFiles);
router.post('/upload-images', uploadImages, handleMulterErrors, awsS3Controller.uploadFiles);
router.post('/list-files', awsS3Controller.listFiles);
router.post('/check-file', awsS3Controller.checkFileExistence);
router.delete('/delete-file', awsS3Controller.deleteFile);
router.post('/check-directory', awsS3Controller.checkDirectoryExistence);
router.delete('/delete-directory', awsS3Controller.deleteDirectory);

module.exports = router;
