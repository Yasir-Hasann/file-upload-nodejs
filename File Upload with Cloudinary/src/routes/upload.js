// module imports
const express = require('express');

// file imports
const { upload } = require('../middlewares/upload');
const { uploadFile } = require('../controllers/upload-file');

// variable initializations
const router = express.Router();

router.route('/').post(upload.single('file'), uploadFile);

module.exports = router;
