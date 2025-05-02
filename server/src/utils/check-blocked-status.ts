import { User } from '../models/user.model.ts';

export default async function isSenderBlocked(
  recipientId: number,
  senderId: number
): Promise<void> {
  const recipientBlockList = await User.getBlockListById(recipientId);
  if (recipientBlockList !== null) {
    if (recipientBlockList.includes(senderId)) {
      throw new Error('Sender is blocked by the recipient');
    }
  }
}
