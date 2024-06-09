// module imports
const cloudinary = require('cloudinary');
const { randomUUID } = require('crypto');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// exports.uploadToCloudinaryStorage = async (file) => {
//   const fileName = `${file.originalname}_${randomUUID()}`;

//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.v2.uploader.upload_stream(
//       {
//         public_id: fileName,
//         resource_type: 'auto',
//       },
//       (error, result) => {
//         if (error) {
//           console.error('Uploading Error: ', error);
//           return reject(error);
//         }
//         return resolve(result.secure_url);
//       }
//     );

//     stream.end(file.buffer);
//   });
// };

// Alternative way
exports.uploadToCloudinaryStorage = async (file) => {
  const fileName = `${file.originalname}_${randomUUID()}`;

  try {
    const response = await cloudinary.v2.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
      public_id: fileName,
      resource_type: 'auto',
    });
    return response.secure_url;
  } catch (error) {
    console.error('Uploading Error: ', error);
    throw error;
  }
};
