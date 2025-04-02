// middlewares/fileUpload.js
const localUpload = require('./localUpload');
const s3Upload = require('./s3Upload');

// Use S3 in production, local storage in development
const useS3 = (process.env.NODE_ENV === 'production' || process.env.FORCE_S3 === 'true');
console.log("useS3 Value:" ,useS3);

const upload = useS3 ? s3Upload : localUpload;
// const upload = s3Upload // HACK

console.log(`Using ${useS3 ? 'S3' : 'local'} storage for file uploads`);

module.exports = upload;