import { createContext, useState } from 'react';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
	const [chatList, setChatList] = useState([]);
	const [chatId, setChatId] = useState(null);
	const [chatName, setChatName] = useState('');
	const [activeChatInfo, setActiveChatInfo] = useState(null);
	const [activeChatRoom, setActiveChatRoom] = useState(null);
	const [chatSearchInputText, setChatSearchInputText] = useState('');
	const [groupPicture, setGroupPicture] = useState(null);

	return (
		<ChatContext.Provider
			value={{
				chatList,
				setChatList,
				activeChatInfo,
				setActiveChatInfo,
				activeChatRoom,
				setActiveChatRoom,
				chatSearchInputText,
				setChatSearchInputText,
				chatId,
				setChatId,
				chatName,
				setChatName,
				groupPicture,
				setGroupPicture,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};

export { ChatContext, ChatProvider };
