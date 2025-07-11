// module imports
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const multerS3 = require('multer-s3');
const mime = require('mime-types');
const sharp = require('sharp');
const { createPresignedPost } = require('@aws-sdk/s3-presigned-post');
const { S3Client, PutObjectCommand, ListObjectsV2Command, HeadObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

// file imports
const { applyWatermarkWithWorker } = require('../utils/apply-watermark');

// variable initializations
const S3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_KEY,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const multerMemoryStorage = multer.memoryStorage();

const multerDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public');
    if (fs.existsSync(uploadPath)) {
      fs.rmSync(uploadPath, { recursive: true, force: true });
    }
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + path.extname(file.originalname));
  },
});

const multerS3Storage = (path) => {
  return multerS3({
    bucket: process.env.AWS_S3_BUCKET_NAME,
    s3: S3,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // contentType: (req, file, cb) => {
    //   cb(null, file.mimetype);
    // },
    key: (req, file, cb) => {
      const fileExtension = mime.extension(file.mimetype);
      if (!fileExtension) return cb(new Error('Unsupported file type'), false);

      const fullPath = `$${crypto.randomUUID()}_${file.originalname.split('.')[0]}.${fileExtension}`;
      cb(null, fullPath);
    },
  });
};

const fileFilter = (sizeOfFile) => {
  return (req, file, cb) => {
    const fileSize = parseInt(req.headers['content-length']);
    if (fileSize > sizeOfFile) return cb(new Error('File size too large'));

    cb(null, true);
  };
};

const uploadArray = (path, sizeOfFile, name = 'images', maxFiles = 1) => {
  return multer({
    storage: multerS3Storage(path),
    limits: { fileSize: sizeOfFile },
    fileFilter: fileFilter(sizeOfFile),
  }).array(name, maxFiles);
};

const uploadSingle = (path, sizeOfFile, name) => {
  return multer({
    storage: multerS3Storage(path),
    limits: { fileSize: sizeOfFile },
    fileFilter: fileFilter(sizeOfFile),
  }).single(name);
};

const uploadMultipleFields = (path, sizeOfFile, firstField, secondField) => {
  return multer({
    storage: multerS3Storage(path),
    limits: { fileSize: sizeOfFile },
    fileFilter: fileFilter(sizeOfFile),
  }).fields([
    { name: firstField, maxCount: 1 },
    { name: secondField, maxCount: 1 },
  ]);
};

exports.multerDiskUpload = multer({ storage: multerDiskStorage });
exports.multerMemoryUpload = multer({ storage: multerMemoryStorage });
exports.uploadUserProfile = uploadSingle('user-profiles', 10 * 1024 * 1024, 'profileImage');
exports.uploadImages = uploadArray('user-images', 20 * 10 * 1024 * 1024, 'userImages', 20);
exports.handleMulterErrors = (err, req, res, next) => {
  if (err) {
    console.error(err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.message === 'File size too large') {
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
  next();
};

exports.generatePresignedUrl = async (folder, fileKey, expiresIn = 300) => {
  const key = `${folder}/${crypto.randomUUID()}_${fileKey}`;
  const contentType = mime.lookup(fileKey) || 'application/octet-stream';
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Conditions: [
      ['content-length-range', 0, 10485760],
      ['eq', '$Content-Type', contentType],
    ],
    Expires: expiresIn,
    Fields: {
      acl: 'public-read',
      key,
      'Content-Type': contentType,
    },
  };

  try {
    const { url, fields } = await createPresignedPost(S3, params);
    return { url, fields };
  } catch (err) {
    console.error('Error generating presigned POST URL:', err);
    return null;
  }
};

exports.uploadToS3 = async (folder, file, shouldAddWatermark = 'false') => {
  const { buffer, mimetype, originalname } = file;
  const isImage = mimetype.startsWith('image/');

  let processedBuffer = buffer;
  let key, contentType;

  if (isImage) {
    const baseName = originalname.replace(/\.[^/.]+$/, '');
    key = `${folder}/${crypto.randomUUID()}_${baseName}.webp`;
    contentType = 'image/webp';

    try {
      if (shouldAddWatermark === 'true' || shouldAddWatermark === '1') {
        processedBuffer = await applyWatermarkWithWorker(buffer);
      }

      processedBuffer = await sharp(processedBuffer).webp({ quality: 80 }).toBuffer(); // lossless: true
    } catch (error) {
      console.error('Watermarking failed:', error);
      return null;
    }
  } else {
    key = `${folder}/${crypto.randomUUID()}_${originalname}`;
    contentType = mimetype;
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: processedBuffer,
    ContentType: contentType,
    ACL: 'public-read',
  };

  try {
    const command = new PutObjectCommand(params);
    await S3.send(command);
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error in uploading to S3:', error);
    return null;
  }
};

exports.listFilesInDirectory = async (prefix) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: prefix,
    };

    const command = new ListObjectsV2Command(params);
    const data = await S3.send(command);

    if (data.Contents && data.Contents.length > 0) {
      return data.Contents.map((file) => `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`);
    } else {
      console.log('No files found in this directory.');
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

exports.checkFileExistence = async (fileKey) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
  };

  try {
    await S3.send(new HeadObjectCommand(params));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    console.error('Error: ', error);
    throw error;
  }
};

exports.deleteFileFromS3 = async (fileKey) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await S3.send(command);
  } catch (error) {
    console.error('Error: ', error);
    throw error;
  }
};

exports.checkDirectoryExistence = async (prefix) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Prefix: prefix,
  };

  try {
    const listCommand = new ListObjectsV2Command(params);
    const data = await S3.send(listCommand);
    if (data && data.Contents && Array.isArray(data.Contents)) {
      return data.Contents.length > 0;
    }

    return false;
  } catch (error) {
    console.error('Error: ', error);
    throw error;
  }
};

exports.deleteDirectoryFromS3 = async (prefix) => {
  const listParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Prefix: prefix,
  };

  try {
    const listCommand = new ListObjectsV2Command(listParams);
    const data = await S3.send(listCommand);

    if (data.Contents.length === 0) {
      console.log('No files found in the specified directory.');
      return;
    }

    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Delete: {
        Objects: data.Contents.map((object) => ({ Key: object.Key })),
      },
    };

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await S3.send(deleteCommand);
    console.log(`Successfully deleted ${data.Contents.length} files from ${prefix}`);
  } catch (error) {
    console.error('Error: ', error);
    throw error;
  }
};
