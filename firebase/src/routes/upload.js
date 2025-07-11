// module imports
const express = require('express');

// file imports
const { multerStorageUpload } = require('../config/firebase-config');
const { uploadFile } = require('../controllers/upload-file');

// variable initializations
const router = express.Router();

router.route('/file').post(multerStorageUpload.single('file'), uploadFile);

module.exports = router;
