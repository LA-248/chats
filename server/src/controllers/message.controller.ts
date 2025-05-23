import { Request, Response } from 'express';
import { edit, handleMessageDeletion } from '../services/message.service.ts';

export const editMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newMessage = req.body.newMessage;
    const senderId = Number(req.user?.user_id);
    const messageId = req.body.messageId;
    await edit(newMessage, senderId, messageId);
    res.status(200).json({ editedMessage: newMessage });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Error editing message. Please try again.' });
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const senderId = Number(req.user?.user_id);
    const messageId = req.body.messageId;
    await handleMessageDeletion(senderId, messageId);
    res.status(200).json({ success: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res
      .status(500)
      .json({ error: 'Error deleting message. Please try again.' });
  }
};
