import { S3Client } from '@aws-sdk/client-s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Chat } from '../schemas/private-chat.schema.ts';
import multer from 'multer';
import multerS3 from 'multer-s3';
import NodeCache from 'node-cache';
const profilePictureUrlCache = new NodeCache({ stdTTL: 604800 });

if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_REGION ||
  !process.env.BUCKET_NAME
) {
  throw new Error('Missing AWS configuration environment variables');
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Stream file directly to S3 using multer-s3
export const s3Upload = multer({
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
export const deleteS3Object = async (
  bucket: string,
  key: string
): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await s3Client.send(command);
    return console.log('Object deleted successfully:', response);
  } catch (error) {
    // Only log the error, no need to throw it, as the user experience is not affected if the S3 deletion fails
    return console.error('Error deleting object from S3:', error);
  }
};

// Create a presigned S3 URL for temporary access to the object
export const createPresignedUrl = (
  bucket: string,
  key: string
): Promise<string> => {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(s3Client, command, { expiresIn: 604800 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error creating presigned S3 URL: ${error.message}`);
    }
    throw new Error('Unknown error creating presigned S3 URL');
  }
};

// For each chat in the chat list, generate a presigned S3 url using the recipient's profile picture file name
// This url is required to display the recipient's profile picture in the chat list
export const generatePresignedUrlsForChatList = async (
  chatList: Chat[]
): Promise<void> => {
  try {
    for (const chat of chatList) {
      const fileName = chat.chat_picture;
      // If the chat has no associated picture, set it to null and skip to the next chat
      if (!fileName) {
        chat.chat_picture = null;
        continue;
      }

      // If there is a cache of the picture for the given chat, use it and skip to the next chat
      const cachedUrl = profilePictureUrlCache.get<string>(fileName);
      if (cachedUrl) {
        chat.chat_picture = cachedUrl;
        continue;
      }

      // If there is no cached url, create a new presigned S3 url
      const presignedUrl = await createPresignedUrl(
        process.env.BUCKET_NAME!,
        fileName
      );
      profilePictureUrlCache.set(fileName, presignedUrl); // Cache the newly generated picture url
      chat.chat_picture = presignedUrl;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
  }
};
