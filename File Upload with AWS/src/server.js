// module imports
const cors = require('cors');
require('dotenv').config();
const express = require('express');

// file imports
const apiRouter = require('./routes');

// variable initializations
const app = express();
const port = process.env.PORT || 5001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// mount routes
app.use('/api/v1', apiRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
