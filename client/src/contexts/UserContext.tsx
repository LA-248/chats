import { createContext, ReactNode, useState } from 'react';

export interface UserContextType {
  loggedInUserId: number | null;
  setLoggedInUserId: React.Dispatch<React.SetStateAction<number | null>>;
  loggedInUsername: string;
  setLoggedInUsername: React.Dispatch<React.SetStateAction<string>>;
  profilePicture: string | null;
  setProfilePicture: React.Dispatch<React.SetStateAction<string | null>>;
  isBlocked: boolean | null;
  setIsBlocked: React.Dispatch<React.SetStateAction<boolean | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const [loggedInUsername, setLoggedInUsername] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);

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
