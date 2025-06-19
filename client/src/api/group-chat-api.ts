import { GroupInfoWithMembers, GroupMemberToBeAdded } from '../types/group';

export async function createGroupChat(
  loggedInUserId: number,
  groupName: string,
  addedMembers: GroupMemberToBeAdded[]
): Promise<string> {
  try {
    if (!groupName) {
      throw new Error('Group name is required');
    }

    const response = await fetch('http://localhost:8080/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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

    return data.message;
  } catch (error) {
    throw error;
  }
}

export async function addMembers(
  room: string,
  addedMembers: GroupMemberToBeAdded[]
): Promise<{ message: string }> {
  try {
    const response = await fetch(
      `http://localhost:8080/groups/${room}/members`,
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
  } catch (error) {
    throw error;
  }
}

export async function getGroupChatInfo(
  room: string,
  navigate: (path: string) => void
): Promise<GroupInfoWithMembers> {
  try {
    const response = await fetch(`http://localhost:8080/groups/${room}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    });
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
  } catch (error) {
    throw error;
  }
}

export async function retrieveGroupMembersInfo(
  groupId: number
): Promise<string[]> {
  try {
    const response = await fetch(
      `http://localhost:8080/groups/${groupId}/members`,
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
  } catch (error) {
    throw error;
  }
}

// Needed for when the most recent message in a group chat is deleted
// Ensures the correct latest message is shown in the chat list
export async function updateLastGroupMessageId(
  messageId: number | null,
  room: string
): Promise<void> {
  try {
    const response = await fetch(
      `http://localhost:8080/groups/${room}/last_message`,
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
  } catch (error) {
    throw error;
  }
}

export async function markUserAsRead(room: string): Promise<void> {
  try {
    const response = await fetch(`http://localhost:8080/groups/${room}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error);
    }
  } catch (error) {
    throw error;
  }
}

export async function deleteGroupChat(
  groupId: number,
  room: string
): Promise<void> {
  try {
    const response = await fetch(
      `http://localhost:8080/groups/${groupId}/rooms/${room}`,
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
  } catch (error) {
    throw error;
  }
}

export async function leaveGroup(groupId: number): Promise<string> {
  try {
    const response = await fetch(
      `http://localhost:8080/groups/${groupId}/members/me`,
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
  } catch (error) {
    throw error;
  }
}

export async function removeGroupMember(
  groupId: number,
  userId: number
): Promise<string> {
  try {
    const response = await fetch(
      `http://localhost:8080/groups/${groupId}/members/${userId}`,
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
  } catch (error) {
    throw error;
  }
}

export async function permanentlyDeleteGroup(groupId: number): Promise<string> {
  try {
    const response = await fetch(
      // TODO: Rename route to avoid conflict with existing one
      `http://localhost:8080/groups/${groupId}`,
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
  } catch (error) {
    throw error;
  }
}
