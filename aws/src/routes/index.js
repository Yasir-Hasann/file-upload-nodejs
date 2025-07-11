// module imports
const express = require('express');

// file imports
const awsS3Router = require('./aws-s3');

// variable initializations
const apiRouter = express.Router();

apiRouter.use('/aws-s3', awsS3Router);

module.exports = apiRouter;
