// module imports
const express = require('express');
const multer = require('multer');

// file imports
const { uploadFile } = require('../controllers/upload-file');

// variable initializations
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route('/').post(upload.single('file'), uploadFile);

module.exports = router;
