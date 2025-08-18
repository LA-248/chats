import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../../../hooks/useSocket';
import { MessageType } from '../../../types/message';
import { toast } from 'sonner';

export function useSendMediaMessage(
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

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    event.preventDefault();

    // Use formData to package the file to then be sent to the server
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);

    try {
      const loadingToast = toast.loading('Uploading image...', {
        duration: Infinity,
      });

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
            // If the image was successfully sent, show a success toast and dismiss the loading toast
            if (response === 'Image uploaded') {
              toast.success(response);
              toast.dismiss(loadingToast);
            } else {
              setErrorMessage(response);
            }
          }
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return { handleFileInputClick, handleUpload };
}
