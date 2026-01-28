<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import gifService from '@/services/gifService'
import uploadService from '@/services/uploadService'
import conversationService from '@/services/conversationService'
import { socket } from '@/main'

const props = defineProps(['userList', 'shownConvId'])

const typingText = computed(() => {
	const typingUsers = userList.value?.filter((user) => user.isTyping).map((user) => user.name)
	if (!typingUsers) return

	const count = typingUsers.length
	if (count == 0) return ''
	if (count == 1) return `${typingUsers[0]} est en train d'écrire`
	if (count <= 3) return `${typingUsers.join(', ')} sont en train d'écrire`
	return "Plusieurs utilisateurs sont en train d'écrire"
})

const messageToSend = ref('')
const sendMessageTextarea = ref(null)
const userList = computed(() => props.userList)
const shownConvId = computed(() => props.shownConvId)

const showGifPicker = ref(false)
const gifQuery = ref('')
const gifs = ref([])
const leftColumn = ref([])
const rightColumn = ref([])

async function sendMessage() {
	if (!messageToSend.value.trim()) return

	conversationService
		.sendMessage(shownConvId.value, messageToSend.value)
		.then((response) => {
			messageToSend.value = ''
			//console.log(response.data.data)
		})
		.catch((error) => {
			console.log(error)
		})
}

async function uploadImage(e) {
	const file = e.target.files[0]
	if (!file) return

	const formData = new FormData()
	formData.append('image', file)

	const res = await uploadService.uploadImage(formData)

	messageToSend.value += `\n![image](${res.data.url})`
}

async function handleImageDrop(e) {
	const file = e.dataTransfer.files[0]
	if (!file || !file.type.startsWith('image/')) return

	const formData = new FormData()
	formData.append('image', file)

	const res = await uploadService.uploadImage(formData)

	messageToSend.value += `\n![image](${res.data.url})`
}

function typing() {
	socket.emit('typing', shownConvId.value)
}

function toggleGifPicker() {
	showGifPicker.value = !showGifPicker.value
	if (showGifPicker.value) searchGif()
}

async function searchGif() {
	//si la recherche est vide, on affiche les gifs trending
	if (gifQuery.value == '') {
		getTrendingGifs()
		return
	}
	const res = await gifService.searchGif(gifQuery.value)
	gifs.value = res.data.data
}

async function getTrendingGifs() {
	const res = await gifService.getTrendingGifs()
	gifs.value = res.data.data
}
function sendGif(gifTitle, gifUrl) {
	messageToSend.value += `![${gifTitle}](${gifUrl})`
}

watch(
	() => gifs.value,
	(newGifs) => {
		leftColumn.value = []
		rightColumn.value = []

		let leftHeight = 0
		let rightHeight = 0

		newGifs.forEach((gif) => {
			const h = gif.images.fixed_height.height

			if (leftHeight <= rightHeight) {
				leftColumn.value.push(gif)
				leftHeight += Number(h)
			} else {
				rightColumn.value.push(gif)
				rightHeight += Number(h)
			}
		})
	},
	{ immediate: true },
)

watch(messageToSend, async () => {
	await nextTick()

	const textarea = sendMessageTextarea.value
	if (!textarea) return

	// reset la hauteur
	textarea.style.height = 'auto'

	const style = window.getComputedStyle(textarea)
	const lineHeight = parseFloat(style.lineHeight)
	const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)

	const maxLines = 5
	const maxHeight = lineHeight * maxLines + padding

	textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
})
</script>

<template>
	<div class="message-bar">
		<div class="typingUsers" v-if="typingText">{{ typingText }}</div>
		<div v-if="showGifPicker" class="gifPicker">
			<input
				type="text"
				@input="searchGif"
				placeholder="Rechercher un gif"
				v-model="gifQuery"
			/>
			<div class="gifGrid">
				<div class="gifCol">
					<img
						v-for="gif in leftColumn"
						:key="gif.id"
						:src="gif.images.fixed_height.url"
						@click="sendGif(gif.title, gif.images.original.url)"
						class="gifGridImg"
					/>
				</div>

				<div class="gifCol">
					<img
						v-for="gif in rightColumn"
						:key="gif.id"
						:src="gif.images.fixed_height.url"
						@click="sendGif(gif.title, gif.images.original.url)"
						class="gifGridImg"
					/>
				</div>
			</div>
		</div>
		<form @submit.prevent="sendMessage" class="sendMessageForm">
			<textarea
				placeholder="Envoyer un message"
				v-model="messageToSend"
				@keypress.enter.exact="sendMessage"
				rows="1"
				ref="sendMessageTextarea"
				@dragover.prevent=""
				@drop.prevent="handleImageDrop"
				maxlength="4096"
				@input="typing"
			></textarea>
			<input type="file" ref="fileInput" accept="image/*" hidden @change="uploadImage" />

			<button type="submit" class="sendButton">
				<img src="../assets/send.png" />
			</button>
			<button @click="$refs.fileInput.click()" class="uploadImageButton">
				<img src="../assets/image.png" />
			</button>
			<button @click="toggleGifPicker" type="button">GIF</button>
		</form>
	</div>
</template>

<style scoped>
.typingUsers {
	display: flex;
}

.sendMessageForm {
	display: flex;
}

.message-bar {
	width: 100%;
	margin-top: 15px;
	display: flex;
	flex-direction: column;
}

.message-bar textarea {
	height: 50px;
	flex: 1;
	padding: 15px;
	padding-right: 35px;
	width: 90%;
	word-wrap: break-word;
	overflow-wrap: break-word;
	text-align: left;
	line-height: 20px;
	resize: none;
	box-sizing: border-box;
}

.message-bar .sendButton {
	cursor: pointer;
	width: 40px;
	margin: 5px;
	border: none;
	margin-left: -40px;
	background-color: white;
}

.message-bar .uploadImageButton {
	width: 40px;
	margin-right: 5px;
}

.message-bar .uploadImageButton img {
	width: 100%;
}

.sendButton img {
	width: 100%;
}

.gifPicker {
	align-items: end;
	display: flex;
	flex-direction: column;
	margin: 5px;
	width: 25%;
	align-self: end;
	background-color: gray;
	z-index: 999;
	margin-top: -475px;
}

.gifPicker input {
	padding: 10px;
	margin-bottom: 5px;
	margin-top: 5px;
	width: 85%;
	align-self: center;
}

.gifPicker img:hover {
	cursor: pointer;
	/* opacity: 75%; */
	transform: scale(1.05);
	transition: transform 0.15s ease;
}

.gifGrid {
	height: 400px;
	width: 300px;
	display: flex;
	gap: 10px;
	overflow-y: auto;
	padding: 10px;
}

.gifCol {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.gifGridImg {
	width: 100%;
	border-radius: 10px;
	cursor: pointer;
}
</style>
