import { s3Client } from './s3-client.mjs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import NodeCache from 'node-cache';
const profilePictureUrlCache = new NodeCache({ stdTTL: 604800 });

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

export { createPresignedUrl, generatePresignedUrlsForChatList };
