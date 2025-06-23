import type { UserInfo } from '../types/user';

async function getLoggedInUserData(): Promise<UserInfo> {
  const response = await fetch('http://localhost:8080/users', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }

  const data = await response.json();
  return data;
}

// Retrieve the ID of a message recipient from the database using their username
async function getRecipientUserIdByUsername(username: string): Promise<number> {
  const response = await fetch(`http://localhost:8080/users/${username}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }

  const data = await response.json();
  return data.userId;
}

// Retrieve the block list of the logged in user
async function getBlockList(): Promise<number[]> {
  const response = await fetch('http://localhost:8080/users/blocked', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }

  const data = await response.json();
  return data.blockList;
}

async function updateUsername(username: string): Promise<string> {
  const response = await fetch('http://localhost:8080/users', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ username: username }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }

  const data = await response.json();
  return data.success;
}

// Update a user's block list with the ID of who they want blocked
async function updateBlockList(userIds: number[]): Promise<void> {
  const response = await fetch('http://localhost:8080/users/blocked', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ blockedUserIds: userIds }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }
}

export {
  getLoggedInUserData,
  getRecipientUserIdByUsername,
  getBlockList,
  updateUsername,
  updateBlockList,
};
