import { s3Client } from './s3-client.mjs';
import NodeCache from 'node-cache';
const profilePictureUrlCache = new NodeCache({ stdTTL: 604800 });

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

const generatePresignedUrlsForChatList = async (chatList) => {
  // For each chat in the chat list, generate a presigned S3 url using the recipient's profile picture file name
  // This url is required to display the recipient's profile picture in the chat list UI
  for (let i = 0; i < chatList.length; i++) {
    // Only run this code if the user has uploaded a profile picture
    if (chatList[i].recipient_profile_picture !== null) {
      const profilePictureFileName = chatList[i].recipient_profile_picture;
      let presignedS3Url = profilePictureUrlCache.get(profilePictureFileName);

      // If presigned url is not in cache, generate a new one
      if (!presignedS3Url) {
        presignedS3Url = await createPresignedUrl(
          process.env.BUCKET_NAME,
          profilePictureFileName
        );
        profilePictureUrlCache.set(profilePictureFileName, presignedS3Url);
      }

      chatList[i].recipient_profile_picture = presignedS3Url;
    }
  }
};

export { generatePresignedUrlsForChatList };
