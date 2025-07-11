// module imports
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const uploadDir = 'public/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const { fieldname, originalname } = file;
    const uniqueSuffix = crypto.randomUUID();
    cb(null, fieldname + '-' + uniqueSuffix + path.extname(originalname));
  },
});

exports.multerStorageUpload = multer({ storage });
