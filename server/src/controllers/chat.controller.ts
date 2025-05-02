import { Request, Response } from 'express';
import {
  handleChatAddition,
  getChatListByUser,
} from '../services/private-chat.service.ts';
import { retrieveUserIdByUsername } from '../services/user.service.ts';
import {
  updateDeletionStatus,
  updateLastMessage,
  updateReadStatus,
} from '../services/private-chat.service.ts';

// Handle adding a chat (new or previously added but deleted) to a user's chat list
export const addChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { senderId, recipientId } = await getChatRoomData(req);
    const updatedChatList = await handleChatAddition(senderId, recipientId);
    res.status(200).json({ updatedChatList: updatedChatList });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (
        error.message ===
        'User does not exist. Make sure that the username is correct.'
      ) {
        res.status(404).json({ error: error.message });
        return;
      }
    }
    console.error('Error adding chat:', error);
    res.status(500).json({ error: 'Error adding chat. Please try again.' });
  }
};

const getChatRoomData = async (
  req: Request
): Promise<{ senderId: number; recipientId: number }> => {
  try {
    const username = req.body.recipientName;
    const user = await retrieveUserIdByUsername(username);
    // If there are no rows, the user does not exist
    if (!user) {
      throw new Error(
        'User does not exist. Make sure that the username is correct.'
      );
    }
    const senderId = Number(req.user?.user_id);
    const recipientId = req.body.recipientId;

    return { senderId, recipientId };
  } catch (error) {
    throw error;
  }
};

// Fetch the chat list of a specific user
// TODO: Move this function to a different file - this handles all chats, not just private ones
export const getChatList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);
    const chatList = await getChatListByUser(userId);

    // Send user's chat list data to the frontend so it can be displayed in the UI
    res.status(200).json({ chatList: chatList });
  } catch (error) {
    console.error('Error retrieving chat list:', error);
    res.status(500).json({ error: 'Unable to retrieve chat list' });
  }
};

// Update the last message id for a chat, used when last message is deleted
export const updateLastMessageId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newLastMessageId = req.body.messageId;
    const room = req.params.room;

    await updateLastMessage(newLastMessageId, room);
    res.status(200).json({ success: 'Last message successfully updated' });
  } catch (error) {
    console.error('Error updating last message id:', error);
    res.status(500).json({
      error:
        'There was an error updating your chat list. Please refresh the page.',
    });
  }
};

export const updateChatReadStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);
    const read = req.body.read;
    const room = req.params.room;

    await updateReadStatus(userId, read, room);
    res.status(200).json({ success: 'Read status updated successfully.' });
  } catch (error) {
    console.error('Error updating read status:', error);
    res.status(500).json({
      error:
        'There was an error updating the read status of your chat. Please refresh the page.',
    });
  }
};

// Delete a chat from a user's chat list
export const deleteChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);
    const room = req.params.room;

    await updateDeletionStatus(userId, room);
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Error deleting chat. Please try again.' });
  }
};
