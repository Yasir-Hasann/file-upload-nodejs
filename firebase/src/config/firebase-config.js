// module imports
const crypto = require('crypto');
const admin = require('firebase-admin');
const multer = require('multer');

// file imports
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'your-app.appspot.com',
});

const bucket = admin.storage().bucket();

exports.uploadToFirebaseStorage = async (file) => {
  const { buffer, size, mimetype, originalname } = file;

  const fileName = `${originalname}_${crypto.randomUUID()}`;
  const fileRef = bucket.file(fileName);
  const fileStream = fileRef.createWriteStream({
    metadata: {
      contentType: mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    fileStream.on('error', (error) => {
      reject(error);
    });

    fileStream.on('finish', async () => {
      await fileRef.makePublic().catch(() => {});

      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

      const fileInfo = {
        originalname: originalname,
        filename: fileName,
        mimetype: mimetype,
        size: size,
        url: fileUrl,
        bucket: bucket.name,
        path: fileRef.name,
      };

      resolve(fileInfo);
    });

    fileStream.end(buffer);
  });
};

// Callback Approach
exports.uploadToFirebaseStorageCallback = (file, callback) => {
  const { buffer, size, mimetype, originalname } = file;

  const fileName = `${originalname}_${crypto.randomUUID()}`;
  const fileRef = bucket.file(fileName);
  const fileStream = fileRef.createWriteStream({
    metadata: {
      contentType: mimetype,
    },
  });

  fileStream.on('error', (error) => {
    callback(error, null);
  });

  fileStream.on('finish', async () => {
    await fileRef.makePublic().catch(() => {});
    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
    const fileInfo = {
      originalname: originalname,
      filename: fileName,
      mimetype: mimetype,
      size: size,
      url: fileUrl,
      bucket: bucket.name,
      path: fileRef.name,
    };
    callback(null, fileInfo);
  });

  fileStream.end(buffer);
};

exports.multerStorageUpload = multer({ storage: multer.memoryStorage() });
