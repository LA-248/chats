import { toast } from 'sonner';
import { ChatType } from '../../../types/chat';

export function usePictureUpload(
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  formRef: React.RefObject<HTMLFormElement | null>,
  setPicture: React.Dispatch<React.SetStateAction<string>>,
  chatType: string,
  room: string
) {
  // Use the reference to the file picker input to open it when clicking on the upload button
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    event.preventDefault();
    // Use formData to package the file to then be sent to the server
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);

    const uploadPromise = async () => {
      const response = await fetch(
        chatType === ChatType.GROUP
          ? `${import.meta.env.VITE_SERVER_BASE_URL}/groups/${room}/pictures`
          : `${import.meta.env.VITE_SERVER_BASE_URL}/users/pictures`,
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
      setPicture(data.fileUrl);
    };

    toast.promise(uploadPromise(), {
      loading: 'Uploading...',
      success: () => {
        return 'Picture uploaded successfully';
      },
      error: (error) => error.message,
    });
  };

  return { handleFileInputClick, handlePictureUpload };
}
