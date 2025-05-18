export enum ChatType {
  PRIVATE = 'chats',
  GROUP = 'groups',
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
