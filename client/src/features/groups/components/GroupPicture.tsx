import { useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ChatContext } from '../../../contexts/ChatContext';
import { useMediaUpload } from '../../../hooks/useMediaUpload';

export default function GroupPicture() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { room } = useParams();

  const chatContext = useContext(ChatContext);
  if (!chatContext) {
    throw new Error();
  }
  const { groupPicture, setGroupPicture } = chatContext;

  const apiEndpoint = `${
    import.meta.env.VITE_SERVER_BASE_URL
  }/groups/${room}/pictures`;

  const { handleFileInputClick, handleMediaUpload } = useMediaUpload(
    fileInputRef,
    formRef,
    apiEndpoint,
    setGroupPicture,
    'Picture uploaded successfully'
  );

  return (
    <div className='group-picture-container'>
      <img
        className='group-picture'
        alt='Group avatar'
        src={groupPicture || '/images/default-avatar.jpg'}
      ></img>
      <form
        ref={formRef}
        id='group-picture-upload-form'
        encType='multipart/form-data'
      >
        <input
          ref={fileInputRef}
          type='file'
          name='group-picture'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={handleMediaUpload}
        />
      </form>
      <button
        type='button'
        className='upload-group-picture-button'
        onClick={handleFileInputClick}
      >
        Change picture
      </button>
    </div>
  );
}
