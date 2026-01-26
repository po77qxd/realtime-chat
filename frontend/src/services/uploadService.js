import axios from 'axios'

const apiClient = axios.create({
	baseURL: 'http://localhost:3000/api/',
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
