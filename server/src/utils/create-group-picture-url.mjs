import { createPresignedUrl } from '../services/s3/s3-presigned-url.mjs';

export default async function createGroupPictureUrl(groupPictureName) {
  try {
    return groupPictureName
      ? await createPresignedUrl(process.env.BUCKET_NAME, groupPictureName)
      : null;
  } catch (error) {
    throw error;
  }
}
