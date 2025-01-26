import { PrivateChat } from '../models/private-chat-model.mjs';

export const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).json({
      error: 'Unauthorised',
      message: 'You must be logged in to access this resource',
    });
  }
};

// Room-specific authorisation middleware
// Check if a room exists and/or if the user is a member of it
export const roomAuth = async (req, res, next) => {
  const senderId = req.user.user_id;
  const room = req.params.room;
  try {
    const privateChatMembers =
      await PrivateChat.retrievePrivateChatMembersByRoom(room);

    if (!privateChatMembers) {
      return res.status(404).json({
        error: 'Not found',
        message: 'This room does not exist',
        redirectPath: '/',
      });
    }

    if (Object.values(privateChatMembers).includes(senderId)) {
      return next();
    } else {
      return res.status(401).json({
        error: 'Unauthorised',
        message: 'You are not a member of this room',
        redirectPath: '/',
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      redirectPath: '/',
    });
  }
};
