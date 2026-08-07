export type GroupMemberToBeAdded = {
  username: string;
  userId: number;
  role: GroupMemberRole;
}

export type GroupMember = {
  user_id: number;
  username: string;
  role: GroupMemberRole;
}

export type GroupInfoWithMembers = {
  info: {
    chatId: number;
    name: string;
    groupPicture: string | null;
  };
  members: GroupMember[];
}

export type RemovedGroupChat = {
  room: string;
  redirectPath: string;
}

export type GroupMemberToRemove = {
  username: string;
  userId: number;
  role: GroupMemberRole;
}

export enum GroupMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}
