import axios from 'axios'

const apiClient = axios.create({
	baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
	withCredentials: true,
	headers: {
		Accept: 'application/json',
	},
})

async function uploadImage(formData) {
	return apiClient.post('/image', formData)
}

export default {
	uploadImage,
}
