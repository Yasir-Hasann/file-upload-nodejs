// module imports
const AWS = require('aws-sdk');
const { S3Client } = require('@aws-sdk/client-s3');
const cors = require('cors');
require('dotenv').config();
const express = require('express');

// file imports
const apiRouter = require('./routes');

// variable initializations
const app = express();
const port = process.env.PORT || 5001;

// AWS init
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const S3 = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// mount routes
app.use('/api/v1', apiRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
