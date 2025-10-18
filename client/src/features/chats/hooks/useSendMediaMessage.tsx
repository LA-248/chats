import type { ChangeEvent } from 'react';
import { uploadChatMedia } from '../../../api/message-api';
import { useSocket } from '../../../hooks/useSocket';

export function useSendMediaMessage(
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  formRef: React.RefObject<HTMLFormElement>,
  username: string,
  chatId: number,
  room: string,
  chatType: string,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) {
  const socket = useSocket();

  // Use the reference to the file picker input to open it when clicking on the upload button
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (socket) {
      uploadChatMedia(
        event,
        formRef,
        socket,
        username,
        chatId,
        room,
        chatType,
        setErrorMessage
      );
    }
  };

  return { handleFileInputClick, handleUpload };
}
