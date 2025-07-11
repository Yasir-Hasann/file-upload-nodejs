// module imports
const cors = require('cors');
const express = require('express');
const path = require('path');

// file imports
const apiRouter = require('./routes');

// variable initializations
const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public/', express.static(path.join('public/')));

// mount routes
app.use('/api/v1', apiRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
