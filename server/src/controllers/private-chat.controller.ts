import { Request, RequestHandler, Response } from 'express';
import { ApiErrorResponse } from '../dtos/error.dto.ts';
import {
  CreatePrivateChatInputDto,
  UpdateLastMessageIdInputDto,
} from '../dtos/private-chat.dto.ts';
import { userSockets } from '../handlers/socket-handlers.ts';
import {
  Chat,
  CreatePrivateChatSchema,
  DeleteChatParamsSchema,
  UpdateLastMessageIdBodySchema,
  UpdateLastMessageIdParamsSchema,
  UpdateReadStatusBodySchema,
  UpdateReadStatusParamsSchema,
} from '../schemas/private-chat.schema.ts';
import {
  getChatListByUser,
  handleChatAddition,
  updateDeletionStatus,
  updateLastMessage,
  updateReadStatus,
} from '../services/private-chat.service.ts';
import { retrieveUserIdByUsername } from '../services/user.service.ts';

// Handle adding a chat (new or previously added but deleted) to a user's chat list
export const addChat: RequestHandler<
  void,
  Chat | ApiErrorResponse,
  CreatePrivateChatInputDto
> = async (req, res): Promise<void> => {
  try {
    const senderId = Number(req.user?.user_id);
    const parsedBody = CreatePrivateChatSchema.safeParse(req.body);

    if (!parsedBody.success) {
      console.error(
        'Error adding chat, invalid request body:',
        parsedBody.error
      );
      res.status(400).json({ error: 'Invalid request data. Please try again' });
      return;
    }

    const { user_id: recipientId } = await retrieveUserIdByUsername(
      parsedBody.data.recipientName
    );

    const io = req.app.get('io');
    // Retrieve specific socket instance by socket ID
    const socket = io.sockets.sockets.get(userSockets.get(senderId));

    const addedChat = await handleChatAddition(socket, senderId, recipientId);
    res.status(200).json(addedChat);
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

// Fetch the chat list of a specific user
// TODO: Move this function to a different file - this handles all chats, not just private ones
export const getChatList: RequestHandler<
  void,
  Chat[] | ApiErrorResponse,
  void
> = async (req, res): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);
    const chatList = await getChatListByUser(userId);

    res.status(200).json(chatList);
  } catch (error) {
    console.error('Error retrieving chat list:', error);
    res.status(500).json({ error: 'Unable to retrieve chat list' });
  }
};

export const updateLastMessageId: RequestHandler<
  { room: string },
  void | ApiErrorResponse,
  UpdateLastMessageIdInputDto
> = async (req, res): Promise<void> => {
  try {
    const parsedBody = UpdateLastMessageIdBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      console.error(
        'Error updating last message id, invalid request body:',
        parsedBody.error
      );
      res.status(400).json({ error: 'Invalid request body data' });
      return;
    }
    const parsedParams = UpdateLastMessageIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      console.error(
        'Error updating last message id, invalid request parameters:',
        parsedParams.error
      );
      res.status(400).json({ error: 'Invalid request parameter data' });
      return;
    }

    await updateLastMessage(parsedBody.data.messageId, parsedParams.data.room);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error updating last message id:', error);
    res.status(500).json({
      error:
        'There was an error updating your chat list. Please refresh the page.',
    });
  }
};

export const updateChatReadStatus: RequestHandler<{ room: string }> = async (
  req,
  res
): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);

    const parsedBody = UpdateReadStatusBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      console.error(
        'Error updating read status, invalid request body:',
        parsedBody.error
      );
      res.status(400).json({ error: 'Invalid request body data' });
      return;
    }
    const parsedParams = UpdateReadStatusParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      console.error(
        'Error updating read status, invalid request parameters:',
        parsedParams.error
      );
      res.status(400).json({ error: 'Invalid request parameter data' });
      return;
    }

    await updateReadStatus(
      userId,
      parsedBody.data.read,
      parsedParams.data.room
    );
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

    const parsedParams = DeleteChatParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      console.error(
        'Error deleting chat, invalid request parameters:',
        parsedParams.error
      );
      res.status(400).json({ error: 'Invalid request parameter data' });
      return;
    }

    await updateDeletionStatus(userId, parsedParams.data.room);
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Error deleting chat. Please try again.' });
  }
};
