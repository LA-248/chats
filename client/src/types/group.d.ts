export interface GroupMemberToBeAdded {
  username: string;
  userId: number;
  role: string;
}

export interface GroupMember {
  user_id: number;
  username: string;
  profile_picture: string | null;
  role: string;
}

export interface GroupInfoWithMembers {
  info: {
    chatId: number;
    name: string;
    groupPicture: string;
  };
  members: GroupParticipant[];
}

export interface RemovedGroupChat {
  room: string;
  redirectPath: string;
}

export interface GroupMemberToRemove {
  username: string;
  userId: number;
  role: string;
}
