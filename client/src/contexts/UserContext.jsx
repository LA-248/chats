import { createContext, useState } from 'react';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [blockList, setBlockList] = useState([]);

  return (
    <UserContext.Provider
      value={{
        loggedInUserId,
        setLoggedInUserId,
        loggedInUsername,
        setLoggedInUsername,
        profilePicture,
        setProfilePicture,
        blockList,
        setBlockList,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
