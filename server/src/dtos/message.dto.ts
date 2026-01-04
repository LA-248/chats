export type EditMessageParamsDto = {
  type: string;
  chatId: string;
  messageId: string;
};
export type EditMessageInputDto = {
  newMessage: string;
};
export type EditMessageResponseDto = EditMessageInputDto;

export type DeleteMessageParamsDto = {
  type: string;
  chatId: string;
  messageId: string;
};
export type DeleteMessageResponseDto = {
  ok: boolean;
  success: string;
};
