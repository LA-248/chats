import { Request, Response } from 'express';
import { Message } from '../../models/message.model.ts';
import { edit, handleMessageDeletion } from '../../services/message.service.ts';

export const editMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const newMessage = req.body.newMessage;
    const messageId = req.body.messageId;
    await edit(newMessage, messageId);
    return res.status(200).json({ editedMessage: newMessage });
  } catch (error) {
    console.error('Error editing message:', error);
    return res
      .status(500)
      .json({ error: 'Error editing message. Please try again.' });
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const messageId = req.body.messageId;
    await handleMessageDeletion(messageId);
    return res.status(200).json({ success: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res
      .status(500)
      .json({ error: 'Error deleting message. Please try again.' });
  }
};
