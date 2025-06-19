import { useContext, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ChatContext } from '../../../contexts/ChatContext';
import { usePictureUpload } from '../../users/hooks/usePictureUpload';

export default function GroupPicture() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { room } = useParams();
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const chatType = pathSegments[1];

  const chatContext = useContext(ChatContext);
  if (!chatContext) {
    throw new Error();
  }
  const { groupPicture, setGroupPicture } = chatContext;

  const { handleFileInputClick, handlePictureUpload } = usePictureUpload(
    fileInputRef,
    formRef,
    setGroupPicture,
    chatType,
    room!
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
          onChange={handlePictureUpload}
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
