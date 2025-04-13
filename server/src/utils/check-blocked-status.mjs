import { User } from '../models/user-model.mjs';

export default async function isSenderBlocked(recipientId, senderId) {
  const recipientBlockList = await User.getBlockListById(recipientId);
  if (recipientBlockList !== null) {
    if (recipientBlockList.includes(senderId)) {
      throw new Error('Sender is blocked by the recipient');
    }
  }
}
