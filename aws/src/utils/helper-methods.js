// module imports
const path = require('path');
const axios = require('axios');

exports.fetchFileBuffer = async (fileUrl) => {
  try {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });

    if (response.status !== 200) throw new Error('Failed to fetch file');

    const buffer = Buffer.from(response.data, 'binary');
    const mimetype = response.headers['content-type'];
    const originalname = path.basename(fileUrl.split('?')[0]).replace(/[^\w.-]/g, '_');

    return { buffer, mimetype, originalname };
  } catch (error) {
    console.error('Error: ', error);
    throw new Error('Error in fetching file: ' + error.message);
  }
};
