async function getLoggedInUserData() {
	try {
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
	} catch (error) {
		throw error;
	}
}

// Retrieve the ID of a message recipient from the database using their username
async function getRecipientUserIdByUsername(username) {
	try {
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
	} catch (error) {
		throw error;
	}
}

// Retrieve the block list of the logged in user
async function getBlockList() {
	try {
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
	} catch (error) {
		throw error;
	}
}

async function updateUsername(username) {
	try {
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
	} catch (error) {
		throw error;
	}
}

// Update a user's block list with the ID of who they want blocked
async function updateBlockList(userIds) {
	try {
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
	} catch (error) {
		throw error;
	}
}

export {
	getLoggedInUserData,
	getRecipientUserIdByUsername,
	getBlockList,
	updateUsername,
	updateBlockList,
};
