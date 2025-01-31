async function createGroupChat(loggedInUserId, groupName, addedMembers) {
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
          addedMembers: addedMembers,
        }),
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      if (response.status === 207) {
        return data.message;
      } else {
        return data.success;
      }
    }
  } catch (error) {
    throw error;
  }
}

async function getGroupChatInfo(room) {
  try {
    const response = await fetch(`http://localhost:8080/groups/${room}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export { createGroupChat, getGroupChatInfo };
