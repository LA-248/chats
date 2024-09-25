import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client } from './s3-client.mjs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

// Stream file directly to S3 using multer-s3
const s3Upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.BUCKET_NAME,
    cacheControl: 'max-age=31536000', // Cache the uploaded image - reducing the need to re-fetch it from the database
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Create a presigned S3 URL for temporary access to the object
const createPresignedUrl = (bucket, key) => {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(s3Client, command, { expiresIn: 604800 });
  } catch (error) {
    console.error('Error creating presigned S3 URL:', error);
    throw new Error('Error retrieving profile pictures');
  }
};

// Delete object from S3 bucket
const deleteS3Object = async (bucket, key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await s3Client.send(command);
    console.log('Object deleted successfully:', response);
  } catch (error) {
    // Only log the error, no need to throw it, as the user experience is not affected if the S3 deletion fails
    console.error('Error deleting object from S3:', error);
  }
};

export { s3Upload, createPresignedUrl, deleteS3Object };
