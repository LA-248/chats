import { createContext, ReactNode, useState } from 'react';

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

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [loggedInUserId, setLoggedInUserId] = useState<number>(0);
  const [loggedInUsername, setLoggedInUsername] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  return (
    <UserContext.Provider
      value={{
        loggedInUserId,
        setLoggedInUserId,
        loggedInUsername,
        setLoggedInUsername,
        profilePicture,
        setProfilePicture,
        isBlocked,
        setIsBlocked,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
