import axios from 'axios'

const apiClient = axios.create({
	baseURL: 'http://localhost:3000/api/users/',
	withCredentials: true,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
})

async function getCurrentUser() {
	return apiClient.get('/currentUser')
}

async function getUserConversations(id) {
	return apiClient.get(`/${id}/conversations`)
}

export default {
	getCurrentUser,
	getUserConversations,
}
