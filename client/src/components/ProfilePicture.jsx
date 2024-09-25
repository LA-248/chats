import { useContext, useRef, useState } from 'react';
import { UserContext } from '../contexts/UserContext';

export default function ProfilePicture({ errorMessage, setErrorMessage }) {
  const { profilePicture, setProfilePicture } = useContext(UserContext);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Use the reference to the file picker input to open it when clicking on the upload button
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleProfilePictureUpload = async (event) => {
    event.preventDefault();
    // Use formData to package the file to then be sent to the server
    const formData = new FormData(formRef.current);
    setUploadStatus('Upload in progress...');

    try {
      const response = await fetch('http://localhost:8080/users/profile_pictures', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
      }

      const data = await response.json();
      setProfilePicture(data.fileUrl);
      setUploadStatus('Upload successful');
      setTimeout(() => {
        setUploadStatus('');
      }, 3000);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="profile-picture-container">
      <div className="profile-picture-heading">Profile picture</div>
      <img className="profile-picture" alt="Profile" src={profilePicture}></img>
      <form
        ref={formRef}
        id="profile-picture-upload-form"
        encType="multipart/form-data"
      >
        <input
          ref={fileInputRef}
          type="file"
          name="profile-picture"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleProfilePictureUpload}
        />
      </form>
      <button
        type="file"
        className="upload-profile-picture-button"
        onClick={handleFileInputClick}
      >
        Upload
      </button>
      {uploadStatus ? (
        <div className="status-text">{uploadStatus}</div> 
      ) : null}

      {errorMessage ? (
        <div className="error-message">{errorMessage}</div>
      ) : null}
    </div>
  );
}
