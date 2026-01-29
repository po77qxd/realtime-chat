import axios from 'axios'

const apiClient = axios.create({
	baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/messages/`,
	withCredentials: true,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
})

async function editMessage(id, text) {
	return apiClient.put(`/${id}`, { text: text })
}

async function deletedMessage(id) {
	return apiClient.delete(`/${id}`)
}

export default {
	editMessage,
	deletedMessage,
}
