// Create a group chat
export default async function addGroupChat(groupName, members, chatList) {
  try {
    // If there is already an active chat with the user, throw an error
    const exists = chatList.some((chat) => chat.name === groupName);
    if (exists) {
      throw new Error('You already have a group with this name');
    }

    /*
    // Get the ID for each user added to the group
    let recipientIds = [];
    for (let i = 0; i < addedMembers.length; i++) {
      const addedMember = addedMembers[i];
      const recipientId = await getRecipientUserIdByUsername(addedMember);
      recipientIds.push(recipientId);
    }
    */

    // const recipientId = await getRecipientUserIdByUsername(inputUsername);

    if (groupName) {
      const response = await fetch('http://localhost:8080/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the username entered to the backend to ensure that it exists in the database
        body: JSON.stringify({
          groupName: groupName,
          recipientId: 10,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
      }

      const data = await response.json();
      return data.newChatItem;
    }
  } catch (error) {
    throw error;
  }
}