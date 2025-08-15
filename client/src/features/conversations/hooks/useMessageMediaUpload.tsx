import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../../../hooks/useSocket';
import { MessageType } from '../../../types/message';

export function useMessageMediaUpload(
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  formRef: React.RefObject<HTMLFormElement | null>,
  username: string,
  chatId: number | null,
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

  const handleMessageMediaUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    event.preventDefault();

    // Use formData to package the file to then be sent to the server
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);

    const response = await fetch(
      `${import.meta.env.VITE_SERVER_BASE_URL}/messages/images`,
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
    const content = data.fileKey;

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
        },
        clientOffset,
        (response: string) => {
          if (response) {
            setErrorMessage(response);
          }
        }
      );
    }
  };

  return { handleFileInputClick, handleMessageMediaUpload };
}
