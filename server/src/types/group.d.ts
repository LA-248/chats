import { NewGroupMember } from '../schemas/group.schema.ts';

export interface GroupInfo {
  group_id: number;
  name: string;
  group_picture: string | null;
}

export interface GroupParticipant {
  user_id: number;
  username: string;
  profile_picture: string | null;
  role: string;
}

export interface GroupMemberToBeAdded {
  username: string;
  userId: number;
  role: string;
}

export interface AddedUserInfo {
  user_id: number;
  username: string;
  profile_picture: string | null;
}

export interface GroupInfoWithMembers {
  info: {
    chatId: number;
    name: string;
    groupPicture: string | null;
  };
  members: GroupParticipant[];
}

export interface GroupMemberInsertionResult {
  status: 'fulfilled' | 'rejected';
  value?: NewGroupMember;
  reason?: Error | string;
}
