import { useEffect, useState } from 'react';
import { getRecipientInfo } from '../../../api/private-chat-api';
import { useNavigate } from 'react-router-dom';
import type { UserInfo } from '../../../types/user';
import { ChatType } from '../../../types/chat';

export default function usePrivateChatInfo(
  room: string,
  chatType: string,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) {
  const navigate = useNavigate();
  const [privateChatInfo, setPrivateChatInfo] = useState<UserInfo>({
    userId: '',
    username: '',
    profilePicture: '',
  });

  useEffect(() => {
    const fetchPrivateChatInfo = async (): Promise<void> => {
      try {
        if (chatType === ChatType.PRIVATE) {
          const chatInfo = await getRecipientInfo(room, navigate);
          setPrivateChatInfo(chatInfo);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    };

    fetchPrivateChatInfo();
  }, [chatType, navigate, room, setErrorMessage]);

  return privateChatInfo;
}
