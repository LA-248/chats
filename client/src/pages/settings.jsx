import { useState } from 'react';
import ProfilePicture from '../components/user/ProfilePicture';
import UsernameEdit from '../components/user/UsernameEdit';
import '../styles/Settings.css';

export default function Settings() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [uploadError, setUploadError] = useState('');

	return (
		<div className='settings-main-container'>
			<div className='settings-header'>
				<div className='settings-heading'>Settings</div>
			</div>

			<div className='account-container'>
				<div className='account-heading'>Account</div>
				<ProfilePicture
					errorMessage={uploadError}
					setErrorMessage={setUploadError}
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
