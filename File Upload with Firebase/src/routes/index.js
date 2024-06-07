// module imports
const express = require('express');

// file imports
const uploadRouter = require('./upload');

// variable initializations
const apiRouter = express.Router();

apiRouter.use('/upload', uploadRouter);

module.exports = apiRouter;
