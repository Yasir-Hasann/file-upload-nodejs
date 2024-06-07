// module imports
const { randomUUID } = require('crypto');
const admin = require('firebase-admin');

// file imports
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'your-app.appspot.com',
});

const bucket = admin.storage().bucket();

exports.uploadToFirebaseStorage = async (file) => {
  const fileName = `${file.originalname}_${randomUUID()}`;
  const fileStream = bucket.file(fileName).createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    fileStream.on('error', (error) => {
      reject(error);
    });
    fileStream.on('finish', () => {
      const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
      resolve(fileUrl);
    });
    fileStream.end(file.buffer);
  });
};

// Callback Approach
// exports.uploadToFirebaseStorage = (file, callback) => {
//   const fileName = `${file.originalname}_${randomUUID()}`;
//   const fileStream = bucket.file(fileName).createWriteStream({
//     metadata: {
//       contentType: file.mimetype,
//     },
//   });

//   fileStream.on('error', (error) => {
//     callback(error, null);
//   });

//   fileStream.on('finish', () => {
//     const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
//     callback(null, fileUrl);
//   });

//   fileStream.end(file.buffer);
// };
