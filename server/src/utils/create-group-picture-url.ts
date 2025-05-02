import { GroupPicture } from '../schemas/group.schema.ts';
import { createPresignedUrl } from '../services/s3.service.ts';

export default async function createGroupPictureUrl(
  groupPictureName: string
): Promise<GroupPicture> {
  try {
    return groupPictureName
      ? await createPresignedUrl(process.env.BUCKET_NAME!, groupPictureName)
      : null;
  } catch (error) {
    throw error;
  }
}
