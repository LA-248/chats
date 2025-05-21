import { toast } from 'sonner';

export function usePictureUpload(
  fileInputRef,
  formRef,
  setPicture,
  chatType,
  room
) {
  // Use the reference to the file picker input to open it when clicking on the upload button
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handlePictureUpload = async (event) => {
    event.preventDefault();
    // Use formData to package the file to then be sent to the server
    const formData = new FormData(formRef.current);

    const uploadPromise = async () => {
      const response = await fetch(
        chatType === 'groups'
          ? `http://localhost:8080/groups/${room}/pictures`
          : `http://localhost:8080/users/pictures`,
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
      return data;
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
