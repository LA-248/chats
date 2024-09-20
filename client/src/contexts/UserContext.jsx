import { createContext, useState } from 'react';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        loggedInUsername,
        setLoggedInUsername,
        profilePicture,
        setProfilePicture,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };
