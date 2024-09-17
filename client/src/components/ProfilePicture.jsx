import { useEffect, useRef, useState } from 'react';
import { getUserProfilePicture } from '../api/user-api';

export default function ProfilePicture({ errorMessage, setErrorMessage }) {
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Use the reference to the file input to open it when clicking on the upload button
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSubmit = async (event) => {
    event.preventDefault();
    // Use formData to package the file to then be sent to the server
    const formData = new FormData(formRef.current);

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
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Retrieve profile picture for display
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const profilePicture = await getUserProfilePicture();
        setProfilePicture(profilePicture.fileUrl);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchProfilePicture();
  }, [setErrorMessage]);

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
          onChange={handleFileSubmit}
        />
      </form>
      <button
        type="file"
        className="upload-profile-picture-button"
        onClick={handleFileInputClick}
      >
        Upload
      </button>

      {errorMessage ? (
        <div className="error-message">{errorMessage}</div>
      ) : null}
    </div>
  );
}
