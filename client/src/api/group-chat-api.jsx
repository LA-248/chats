async function createGroupChat(loggedInUserId, groupName) {
  try {
    if (groupName) {
      const response = await fetch('http://localhost:8080/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loggedInUserId: loggedInUserId,
          groupName: groupName,
        }),
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    }
  } catch (error) {
    throw error;
  }
}

async function addGroupMember(groupName, userId, role) {
  try {
    if (groupName) {
      const response = await fetch(
        `http://localhost:8080/groups/${userId}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: role,
          }),
          credentials: 'include',
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    }
  } catch (error) {
    throw error;
  }
}

export { createGroupChat, addGroupMember };
