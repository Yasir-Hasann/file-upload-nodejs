// module imports
const crypto = require('crypto');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadToCloudinaryStorage = async (file) => {
  const { buffer, mimetype, originalname } = file;

  const fileName = `${originalname}_${crypto.randomUUID()}`;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: fileName,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Uploading Error: ', error);
          return reject(error);
        }
        return resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Callback Approach
exports.uploadToCloudinaryStorageCallback = (file, callback) => {
  const { buffer, mimetype, originalname } = file;

  const fileName = `${originalname}_${crypto.randomUUID()}`;
  const stream = cloudinary.uploader.upload_stream(
    {
      public_id: fileName,
      resource_type: 'auto',
    },
    (error, result) => {
      if (error) {
        console.error('Uploading Error: ', error);
        return callback(error, null);
      }
      return callback(null, result);
    }
  );
  stream.end(buffer);
};

exports.multerStorageUpload = multer({ storage: multer.memoryStorage() });
