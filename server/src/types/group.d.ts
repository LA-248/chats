import { NewGroupMember } from '../schemas/group.schema.ts';

interface GroupInfo {
  group_id: number;
  name: string;
  group_picture: string | null;
}

interface GroupParticipant {
  user_id: number;
  username: string;
  profile_picture: string | null;
  role: string;
}

interface GroupMemberToBeAdded {
  username: string;
  userId: number;
  role: string;
}

interface AddedUserInfo {
  user_id: number;
  username: string;
  profile_picture: string | null;
}

interface GroupInfoWithMembers {
  info: {
    chatId: number;
    name: string;
    groupPicture: string | null;
  };
  members: GroupParticipant[];
}

interface GroupMemberInsertionResult {
  status: 'fulfilled' | 'rejected';
  value?: NewGroupMember;
  reason?: Error | string;
}

export {
  GroupInfo,
  GroupParticipant,
  GroupMemberToBeAdded,
  AddedUserInfo,
  GroupInfoWithMembers,
  GroupMemberInsertionResult,
};
