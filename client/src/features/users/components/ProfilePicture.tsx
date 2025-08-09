import { useContext, useRef } from 'react';
import { UserContext } from '../../../contexts/UserContext';
import { useMediaUpload } from '../../../hooks/useMediaUpload';

export default function ProfilePicture() {
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const { profilePicture, setProfilePicture } = useContext(UserContext);

  const apiEndpoint = `${import.meta.env.VITE_SERVER_BASE_URL}/users/pictures`;

  const { handleFileInputClick, handleMediaUpload } = useMediaUpload(
    fileInputRef,
    formRef,
    setProfilePicture,
    apiEndpoint,
    'Picture uploaded successfully'
  );

  return (
    <div className='profile-picture-container'>
      <img
        className='profile-picture'
        alt='Profile avatar'
        src={profilePicture ?? undefined}
      ></img>
      <form
        ref={formRef}
        id='profile-picture-upload-form'
        encType='multipart/form-data'
      >
        <input
          ref={fileInputRef}
          type='file'
          name='profile-picture'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={handleMediaUpload}
        />
      </form>
      <button
        type='button'
        className='upload-profile-picture-button'
        onClick={handleFileInputClick}
      >
        Upload
      </button>
    </div>
  );
}
