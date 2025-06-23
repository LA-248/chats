import { GroupPicture } from '../schemas/group.schema.ts';
import { createPresignedUrl } from '../services/s3.service.ts';

export default async function createGroupPictureUrl(
  groupPictureName: string
): Promise<GroupPicture> {
  return groupPictureName
    ? await createPresignedUrl(process.env.BUCKET_NAME!, groupPictureName)
    : null;
}
