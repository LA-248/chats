export type RetrieveLoggedInUserDataResponseDto = {
  userId: number;
  username: string;
  profilePicture: string | null;
};

export type RetrieveRecipientProfileResponseDto =
  RetrieveLoggedInUserDataResponseDto;

export type RetrieveRecipientProfileNotFoundResponseDto = {
  redirectPath: string;
};
