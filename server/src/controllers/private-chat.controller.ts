import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ApiErrorResponse } from '../dtos/error.dto.ts';
import {
  CreatePrivateChatInputDto,
  DeleteChatResponseDto,
  UpdateLastMessageIdInputDto,
  UpdateReadStatusInputDto,
  UpdateReadStatusResponseDto,
} from '../dtos/private-chat.dto.ts';
import { userSockets } from '../handlers/socket-handlers.ts';
import { Chat } from '../schemas/private-chat.schema.ts';
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
  ParamsDictionary,
  Chat | ApiErrorResponse,
  CreatePrivateChatInputDto
> = async (req, res): Promise<void> => {
  try {
    const senderId = Number(req.user?.user_id);

    const { user_id: recipientId } = await retrieveUserIdByUsername(
      req.body.recipientName,
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
  ParamsDictionary,
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
    await updateLastMessage(req.body.messageId, req.params.room);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error updating last message id:', error);
    res.status(500).json({
      error:
        'There was an error updating your chat list. Please refresh the page.',
    });
  }
};

export const updateChatReadStatus: RequestHandler<
  { room: string },
  UpdateReadStatusResponseDto | ApiErrorResponse,
  UpdateReadStatusInputDto
> = async (req, res): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);

    await updateReadStatus(userId, req.body.read, req.params.room);
    res
      .status(200)
      .json({ ok: true, success: 'Read status updated successfully.' });
  } catch (error) {
    console.error('Error updating read status:', error);
    res.status(500).json({
      error:
        'There was an error updating the read status of your chat. Please refresh the page.',
    });
  }
};

// Delete a chat from a user's chat list
export const deleteChat: RequestHandler<
  { room: string },
  DeleteChatResponseDto | ApiErrorResponse,
  void
> = async (req, res): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);
    await updateDeletionStatus(userId, req.params.room);
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Error deleting chat. Please try again.' });
  }
};
