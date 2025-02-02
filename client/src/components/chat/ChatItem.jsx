import formatDate from '../../utils/DateTimeFormat';

export default function ChatItem({
	chat,
	isActive,
	isHovered,
	onMouseEnter,
	onMouseLeave,
	onClick,
	onDeleteClick,
}) {
	return (
		<div className='chat-item-container'>
			<div
				className={`chat-item ${isActive ? 'active' : ''}`}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				onClick={onClick}
			>
				<img
					className='chat-pic'
					alt='Profile avatar'
					src={chat.recipient_profile_picture || '/images/default-avatar.jpg'}
				></img>
				<div className='chat-info'>
					<div className='chat-name-and-time'>
						<h4 className='chat-name'>{chat.recipient_username}</h4>
						<div className='time-and-notification-container'>
							<div className='chat-time'>
								{chat.last_message_content &&
									formatDate(chat.last_message_time)}
							</div>
							{!isActive && chat.read === false ? (
								<span className='unread-message-alert'></span>
							) : (
								(chat.read = true)
							)}
						</div>
					</div>
					<div className='chat-metadata-container'>
						<p className='chat-last-message'>{chat.last_message_content}</p>
						<div className='chat-utilities'>
							{isHovered && (
								<button onClick={onDeleteClick} className='chat-delete-button'>
									Delete
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
