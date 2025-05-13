export type ChatType = keyof typeof CHAT_HANDLERS;

export interface ChatHandler {
  getMembers: (room: string) => Promise<number[]>;
  postInsert: (
    senderId: number,
    newMessageId: number,
    chatId: number,
    room: string
  ) => Promise<void>;
}
