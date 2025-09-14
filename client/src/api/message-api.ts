import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { ChatType } from '../types/chat';
import type { Socket } from 'socket.io-client';
import { MessageType } from '../types/message';

export async function editMessageById(
  chatType: string,
  chatId: number,
  newMessage: string,
  messageId: number | null
): Promise<void> {
  const type = determineChatType(chatType);

  const response = await fetch(
    `${
      import.meta.env.VITE_SERVER_BASE_URL
    }/chats/${type}/${chatId}/messages/${messageId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newMessage: newMessage }),
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }
}

export async function deleteMessage(
  chatType: string,
  chatId: number,
  messageId: number
): Promise<void> {
  const type = determineChatType(chatType);

  const response = await fetch(
    `${
      import.meta.env.VITE_SERVER_BASE_URL
    }/chats/${type}/${chatId}/messages/${messageId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }
}

export const uploadChatMedia = async (
  event: React.ChangeEvent<HTMLInputElement>,
  formRef: React.RefObject<HTMLFormElement>,
  socket: Socket,
  username: string,
  chatId: number,
  room: string,
  chatType: string
): Promise<void> => {
  event.preventDefault();

  const type = determineChatType(chatType);

  // Use formData to package the file to then be sent to the server
  if (!formRef.current) return;
  const formData = new FormData(formRef.current);

  const loadingToast = toast.loading('Uploading media...', {
    duration: Infinity,
  });

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_BASE_URL}/chats/${type}/${chatId}/media`,
      {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error);
    }
    const data = await response.json();
    const content = data.fileName;
    const fileKey = data.fileKey;

    if (socket) {
      const messageType = MessageType.IMAGE;
      const clientOffset = uuidv4();

      socket.emit(
        'chat-message',
        {
          username,
          chatId,
          content,
          room,
          chatType,
          messageType,
          fileKey,
        },
        clientOffset,
        (response: string) => {
          // If the media was successfully uploaded, show a success toast and dismiss the loading toast
          if (response === 'Media uploaded') {
            toast.success(response);
            toast.dismiss(loadingToast);
          } else {
            toast.error(response);
            toast.dismiss(loadingToast);
          }
        }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      toast.dismiss(loadingToast);
      toast.error(error.message);
    }
  }
};

function determineChatType(chatType: string) {
  return chatType === ChatType.PRIVATE ? 'private' : 'group';
}
