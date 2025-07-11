// module imports
const express = require('express');

// file imports
const { multerStorageUpload } = require('../config/cloudinary-config');
const { multerCloudinaryStorageUpload } = require('../config/multer-storage-cloudinary-config');
const { uploadFile, uploadFileWithMulterCloudinaryStorage } = require('../controllers/upload-file');

// variable initializations
const router = express.Router();

router.route('/file').post(multerStorageUpload.single('file'), uploadFile);
router.route('/file-cloudinary').post(multerCloudinaryStorageUpload.single('file'), uploadFileWithMulterCloudinaryStorage);

module.exports = router;
