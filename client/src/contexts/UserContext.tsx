import { createContext, useState } from 'react';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [isBlocked, setIsBlocked] = useState(null);

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
