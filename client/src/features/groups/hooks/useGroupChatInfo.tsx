import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroupChatInfo } from '../../../api/group-chat-api';
import type { GroupInfoWithMembers } from '../../../types/group';

export default function useGroupChatInfo(
  room: string,
  chatType: string,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) {
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState<GroupInfoWithMembers>({
    info: {
      chatId: 0,
      name: '',
      groupPicture: null,
    },
    members: [],
  });

  useEffect(() => {
    const fetchGroupInfo = async (): Promise<void> => {
      try {
        if (chatType === 'groups') {
          const groupChatInfo = await getGroupChatInfo(room, navigate);
          setGroupInfo(groupChatInfo);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    };

    fetchGroupInfo();
  }, [room, chatType, navigate, setErrorMessage]);

  return groupInfo;
}
