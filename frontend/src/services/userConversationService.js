import axios from 'axios'

const apiClient = axios.create({
	baseURL: 'http://localhost:3000/api/user_conversation/',
	withCredentials: true,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
})

async function addUserToConv(conv_id) {
	return apiClient.post(`/`, { conv_id: conv_id })
}

export default {
	addUserToConv,
}
