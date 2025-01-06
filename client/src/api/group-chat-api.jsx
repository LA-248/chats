async function createGroupChat(loggedInUserId, groupName, addedMembersUserIds) {
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
          addedMembersUserIds: addedMembersUserIds,
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

export { createGroupChat };
