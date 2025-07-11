// module imports
const sharp = require('sharp');
const path = require('path');
const { parentPort, workerData } = require('worker_threads');

const watermarkPath = path.join(process.cwd(), 'images', 'watermark.png');
(async () => {
  try {
    const image = sharp(workerData.buffer);
    const metadata = await image.metadata();

    const watermark = await sharp(watermarkPath)
      .resize({ width: Math.round(metadata.width * 0.3) })
      .png()
      .toBuffer();

    const outputBuffer = await image.composite([{ input: watermark, gravity: 'center' }]).toBuffer();

    parentPort.postMessage({ success: true, buffer: outputBuffer });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
})();
