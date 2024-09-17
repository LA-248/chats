import { useState } from 'react';
import ProfilePicture from '../components/ProfilePicture';
import UsernameEdit from '../components/UsernameEdit';
import '../styles/Settings.css';

export default function Settings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <div className="settings-main-container">
      <div className="settings-header">
        <div className="settings-heading">Settings</div>
      </div>

      <div className="account-container">
        <div className="account-heading">Account</div>
        <ProfilePicture
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />

        <UsernameEdit
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      </div>
    </div>
  );
}
