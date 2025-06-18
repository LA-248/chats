import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroupChatInfo } from '../../../api/group-chat-api';

export default function useGroupChatInfo(room, chatType, setErrorMessage) {
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState({ info: [], members: [] });

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        if (chatType === 'groups') {
          const groupChatInfo = await getGroupChatInfo(room, navigate);
          setGroupInfo(groupChatInfo);
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchGroupInfo();
  }, [room, chatType, navigate, setErrorMessage]);

  return groupInfo;
}
