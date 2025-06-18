import { useEffect, useState } from 'react';
import { getRecipientInfo } from '../../../api/private-chat-api';
import { useNavigate } from 'react-router-dom';

export default function usePrivateChatInfo(room, chatType, setErrorMessage) {
  const navigate = useNavigate();
  const [privateChatInfo, setPrivateChatInfo] = useState({
    userId: '',
    username: '',
    profilePicture: '',
  });

  useEffect(() => {
    const fetchPrivateChatInfo = async () => {
      try {
        if (chatType === 'chats') {
          const chatInfo = await getRecipientInfo(room, navigate);
          setPrivateChatInfo(chatInfo);
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchPrivateChatInfo();
  }, [chatType, navigate, room, setErrorMessage]);

  return privateChatInfo;
}
