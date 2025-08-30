export enum ChatType {
  PRIVATE = 'chats',
  GROUP = 'groups',
}

export enum S3AvatarStoragePath {
  USER_AVATARS = 'avatars/users',
  GROUP_AVATARS = 'avatars/groups',
}

export enum S3AttachmentsStoragePath {
  CHAT_ATTACHMENTS = 'attachments/chats',
}

export interface ChatHandler {
  getMembers: (room: string) => Promise<number[]>;
  postInsert: (
    senderId: number,
    newMessageId: number,
    chatId: number,
    room: string
  ) => Promise<Date>;
}
