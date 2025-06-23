export interface UserInfo {
  userId: number | string;
  username: string;
  profilePicture: string | null;
}

export interface UserContextType {
  loggedInUserId: number;
  setLoggedInUserId: React.Dispatch<React.SetStateAction<number>>;
  loggedInUsername: string;
  setLoggedInUsername: React.Dispatch<React.SetStateAction<string>>;
  profilePicture: string;
  setProfilePicture: React.Dispatch<React.SetStateAction<string>>;
  isBlocked: boolean;
  setIsBlocked: React.Dispatch<React.SetStateAction<boolean>>;
}
