import { useContext, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ChatContext } from '../../../contexts/ChatContext';
import { usePictureUpload } from '../../users/hooks/usePictureUpload';

export default function GroupPicture() {
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const { room } = useParams();
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const chatType = pathSegments[1];
  const { groupPicture, setGroupPicture } = useContext(ChatContext);

  const { handleFileInputClick, handlePictureUpload } = usePictureUpload(
    fileInputRef,
    formRef,
    setGroupPicture,
    chatType,
    room
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
        type='file'
        className='upload-group-picture-button'
        onClick={handleFileInputClick}
      >
        Change picture
      </button>
    </div>
  );
}
