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

export enum MulterUploadField {
  USER_AVATAR = 'profile-picture',
  GROUP_PICTURE = 'group-picture',
  MEDIA_UPLOAD = 'media-upload',
}

export type ChatHandler = {
  getMembers: (room: string) => Promise<number[]>;
  postInsert: (
    senderId: number,
    newMessageId: number,
    chatId: number,
    room: string,
  ) => Promise<Date>;
}

export type ChatRoom = {
  room: string | null;
}
