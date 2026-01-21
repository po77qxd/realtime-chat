import axios from 'axios'

const apiClient = axios.create({
	baseURL: 'http://localhost:3000/api/conversations/',
	withCredentials: true,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
})

async function getConversations() {
	return apiClient.get('/')
}

async function getConversationById(id) {
	return apiClient.get(`/${id}`)
}

async function getMessagesByConvId(id) {
	return apiClient.get(`/${id}/messages`)
}

async function createConv(name) {
	return apiClient.post(`/`, { name: name })
}

async function editConv(id, name) {
	return apiClient.put(`/${id}`, { name: name })
}

async function deleteConv(id) {
	return apiClient.delete(`/${id}`)
}

async function sendMessage(id, message) {
	return apiClient.post(`/${id}/messages`, { text: message })
}

async function editMessage(id, convId, text) {
	return apiClient.put(`/${convId}/messages/${id}`, { text: text })
}

async function deletedMessage(id, convId) {
	return apiClient.delete(`/${convId}/messages/${id}`)
}

async function getConvUsers(convId) {
	return apiClient.get(`/${convId}/users`)
}

export default {
	getConversations,
	getConversationById,
	getMessagesByConvId,
	createConv,
	editConv,
	deleteConv,
	sendMessage,
	editMessage,
	deletedMessage,
	getConvUsers,
}
