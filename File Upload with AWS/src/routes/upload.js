// module imports
const express = require('express');

// file imports
const { upload } = require('../middlewares/upload');
const { uploadV2, uploadV3 } = require('../controllers/upload-file');

// variable initializations
const router = express.Router();

router.post('/1', upload.single('file'), uploadV2);
router.post('/2', upload.single('file'), uploadV3);

module.exports = router;
