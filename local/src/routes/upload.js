// module imports
const express = require('express');

// file imports
const { multerStorageUpload } = require('../config/multer-config');
const { uploadFile, uploadFiles, uploadNamedFiles } = require('../controllers/upload-file');

// variable initializations
const router = express.Router();

router.route('/file').post(multerStorageUpload.single('file'), uploadFile);
router.route('/files').post(multerStorageUpload.array('files', 10), uploadFiles);
router.route('/named-files').post(
  multerStorageUpload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),
  uploadNamedFiles
);

module.exports = router;
