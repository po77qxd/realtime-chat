import axios from 'axios'

const api_key = import.meta.env.VITE_GIPHY_API_KEY

const apiClient = axios.create({
	baseURL: 'https://api.giphy.com/v1/gifs/',
	withCredentials: false,
})

async function getTrendingGifs() {
	return apiClient.get(`/trending?api_key=${api_key}&limit=20&bundle=messaging_non_clips`)
}

async function searchGif(gifQuery) {
	return apiClient.get(
		`/search?api_key=${api_key}&q=${gifQuery}&limit=20&bundle=messaging_non_clips`,
	)
}

export default {
	getTrendingGifs,
	searchGif,
}
