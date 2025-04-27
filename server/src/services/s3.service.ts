import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import NodeCache from 'node-cache';
const profilePictureUrlCache = new NodeCache({ stdTTL: 604800 });

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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

// Create a presigned S3 URL for temporary access to the object
const createPresignedUrl = (bucket, key) => {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(s3Client, command, { expiresIn: 604800 });
  } catch (error) {
    throw new Error('Error creating presigned S3 URL', { cause: error });
  }
};

const generatePresignedUrlsForChatList = async (chatList) => {
  try {
    // For each chat in the chat list, generate a presigned S3 url using the recipient's profile picture file name
    // This url is required to display the recipient's profile picture in the chat list UI
    for (let i = 0; i < chatList.length; i++) {
      // Only run this code if the user has uploaded a profile picture
      if (chatList[i].chat_picture !== null) {
        const profilePictureFileName = chatList[i].chat_picture;
        let presignedS3Url = profilePictureUrlCache.get(profilePictureFileName);

        // If presigned url is not in cache, generate a new one
        if (!presignedS3Url) {
          presignedS3Url = await createPresignedUrl(
            process.env.BUCKET_NAME,
            profilePictureFileName
          );
          profilePictureUrlCache.set(profilePictureFileName, presignedS3Url);
        }

        chatList[i].chat_picture = presignedS3Url;
      }
    }
  } catch (error) {
    throw error;
  }
};

export {
  s3Client,
  s3Upload,
  deleteS3Object,
  createPresignedUrl,
  generatePresignedUrlsForChatList,
};
