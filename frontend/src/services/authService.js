import axios from 'axios'

const apiClient = axios.create({
	baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/`,
	withCredentials: true,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
})

async function loginUser(email, password) {
	return apiClient.post('/login', { email, password })
}

async function registerUser(email, name, password) {
	return apiClient.post('/register', { email, name, password })
}

export default {
	loginUser,
	registerUser,
}
