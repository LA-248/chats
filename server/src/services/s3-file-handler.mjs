import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client } from './s3-client.mjs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

// Stream file directly to S3 using multer-s3
const s3Upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.BUCKET_NAME,
    cacheControl: 'max-age=31536000', // Cache the uploaded image - reducing the need to re-fetch it from the server
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

// Create a presigned S3 URL for temporary access to the object
const createPresignedUrl = (bucket, key) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

export { s3Upload, createPresignedUrl };
