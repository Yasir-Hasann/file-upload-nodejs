// module imports
const { Worker } = require('worker_threads');

exports.applyWatermarkWithWorker = (buffer) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, './add-watermark-worker.js'), {
      workerData: { buffer },
      transferList: [buffer.buffer],
    });

    worker.on('message', (data) => {
      if (data.success) resolve(data.buffer);
      else reject(new Error(data.error));
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
    });
  });
};

// const watermarkPath = path.join(process.cwd(), 'images', 'watermark.png');
// const addWatermark = async (imageBuffer) => {
//   try {
//     const image = sharp(imageBuffer);
//     const metadata = await image.metadata();

//     const watermark = await sharp(watermarkPath)
//       .resize({ width: Math.round(metadata.width * 0.3) })
//       .png()
//       .toBuffer();

//     return await image
//       .composite([
//         {
//           input: watermark,
//           gravity: 'center',
//         },
//       ])
//       .toBuffer();
//   } catch (err) {
//     console.error('Error applying watermark:', err);
//     throw new Error('Failed to process image');
//   }
// };
