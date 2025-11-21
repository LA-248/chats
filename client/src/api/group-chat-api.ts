import type {
  GroupInfoWithMembers,
  GroupMemberToBeAdded,
} from '../types/group';

export async function createGroupChat(
  loggedInUserId: number,
  groupName: string,
  membersToBeAdded: GroupMemberToBeAdded[]
): Promise<string> {
  if (!groupName) {
    throw new Error('Group name is required');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/group`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ownerUserId: loggedInUserId,
        name: groupName,
        membersToBeAdded,
      }),
      credentials: 'include',
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.message;
}

export async function addMembers(
  room: string,
  addedMembers: GroupMemberToBeAdded[]
): Promise<{ message: string }> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/group/${room}/members`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        addedMembers: addedMembers,
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

export async function getGroupChatInfo(
  room: string,
  navigate: (path: string) => void
): Promise<GroupInfoWithMembers> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/group/${room}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    }
  );
  const data = await response.json();

  // Redirect user to homepage if they try to access a group chat via the URL that does not exist
  // or they try to access a room that they are not a part of
  if (
    response.status === 403 ||
    response.status === 404 ||
    response.status === 500
  ) {
    navigate(data.redirectPath);
  }
  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}

export async function retrieveGroupMembersInfo(
  groupId: number
): Promise<string[]> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/group/${groupId}/members`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }
  return data.memberUsernames;
}

// Needed for when the most recent message in a group chat is deleted
// Ensures the correct latest message is shown in the chat list
export async function updateLastGroupMessageId(
  messageId: number | null,
  room: string
): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/group/${room}/last_message`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageId: messageId }),
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }
}

export async function markUserAsRead(room: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/group/${room}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }
}

export async function deleteGroupChat(
  groupId: number,
  room: string
): Promise<void> {
  const response = await fetch(
    `${
      import.meta.env.VITE_SERVER_BASE_URL
    }/chats/group/${groupId}/rooms/${room}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }
}

export async function leaveGroup(groupId: number): Promise<string> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/group/${groupId}/members/me`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.message;
}

export async function removeGroupMember(
  groupId: number,
  userId: number
): Promise<string> {
  const response = await fetch(
    `${
      import.meta.env.VITE_SERVER_BASE_URL
    }/chats/group/${groupId}/members/${userId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.message;
}

export async function updateGroupMemberRole(
  groupId: number,
  userId: number,
  newRole: string
): Promise<string> {
  const response = await fetch(
    `${
      import.meta.env.VITE_SERVER_BASE_URL
    }/chats/group/${groupId}/members/${userId}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: newRole }),
      credentials: 'include',
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.message;
}

export async function permanentlyDeleteGroup(groupId: number): Promise<string> {
  const response = await fetch(
    // TODO: Rename route to avoid conflict with existing one
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/group/${groupId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.message;
}
