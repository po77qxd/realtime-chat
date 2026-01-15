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

async function getMessagesByConvId(id) {
	return apiClient.get(`/${id}/messages`)
}

async function createConv(name) {
	return apiClient.post(`/`, { name: name })
}

async function sendMessage(id, message) {
	return apiClient.post(`/${id}/messages`, { text: message })
}

export default {
	getConversations,
	getMessagesByConvId,
	createConv,
	sendMessage,
}
