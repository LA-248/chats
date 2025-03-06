async function createGroupChat(loggedInUserId, groupName, addedMembers) {
	try {
		if (groupName) {
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

			if (response.status === 207) {
				return data.message;
			} else {
				return data.updatedChatList;
			}
		}
	} catch (error) {
		throw error;
	}
}

async function getGroupChatInfo(room, navigate) {
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

async function markUserAsRead(room) {
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

async function deleteGroupChat(room) {
	try {
		const response = await fetch(`http://localhost:8080/groups/${room}`, {
			method: 'DELETE',
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

async function leaveGroupChat(groupId, userId) {
	try {
		const response = await fetch(
			`http://localhost:8080/groups/${groupId}/${userId}`,
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
			const errorResponse = await response.json();
			throw new Error(errorResponse.error);
		}

		return data.message;
	} catch (error) {
		throw error;
	}
}

export {
	createGroupChat,
	getGroupChatInfo,
	markUserAsRead,
	deleteGroupChat,
	leaveGroupChat,
};
