import axios from 'axios'

const apiClient = axios.create({
	baseURL: 'http://localhost:3000/api/messages/',
	withCredentials: true,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
})

async function deletedMessage(id) {
	return apiClient.delete(`/${id}`)
}

export default {
	deletedMessage,
}
