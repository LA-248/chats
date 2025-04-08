import { Link } from 'react-router-dom';
import Logout from './UserLogout';

export default function UserProfile({
  profilePicture,
  loggedInUsername,
  setActiveChatRoom,
}) {
  return (
    <div className='profile-settings-container'>
      <div className='user-profile-info'>
        <img
          src={profilePicture}
          alt='Profile'
          className='user-profile-picture'
        ></img>
        <div className='account-username'>{loggedInUsername}</div>
      </div>
      <div className='user-navigation-buttons'>
        <Logout />
        <Link
          to='/settings'
          style={{ textDecoration: 'none', marginLeft: '10px' }}
        >
          <button
            className='settings-button'
            onClick={() => setActiveChatRoom(null)}
          >
            Settings
          </button>
        </Link>
      </div>
    </div>
  );
}
