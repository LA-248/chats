import { useContext, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { UserContext } from '../../../contexts/UserContext';
import { usePictureUpload } from '../hooks/usePictureUpload';

export default function ProfilePicture() {
  const { room } = useParams();
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const chatType = pathSegments[1];
  const { profilePicture, setProfilePicture } = useContext(UserContext);

  const { handleFileInputClick, handlePictureUpload } = usePictureUpload(
    fileInputRef,
    formRef,
    setProfilePicture,
    chatType,
    room!
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
          onChange={handlePictureUpload}
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
