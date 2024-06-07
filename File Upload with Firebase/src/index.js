const express = require('express');
const cors = require('cors');

// file imports
const apiRouter = require('./routes');

// variable initializations
const app = express();
const port = 5001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// mount routes
app.use('/api/v1', apiRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
