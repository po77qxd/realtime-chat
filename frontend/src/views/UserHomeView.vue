<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import conversationService from '@/services/conversationService'
import userService from '@/services/userService'
import messageService from '@/services/messageService'
import userConversationService from '@/services/userConversationService'
import { useUserStore } from '@/stores/user'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

import { socket } from '@/main'

const userStore = useUserStore()

const conversations = ref(null)
const messages = ref(null)
const shownConvId = ref(null)
const shownConvAdminId = ref(null)
const showCreateConv = ref(false)
const convName = ref('')
const messageToSend = ref('')
const messageMenuShown = ref(null) //id of the message where the menu is shown
const editInputShown = ref(null) //id of the message being modified
const messagetoEdit = ref(null)
const joinConvShown = ref(false)
const convToJoinList = ref(null)
const searchConvValue = ref(null)
const editConvId = ref(null)
const convToEdit = ref(null)

const userList = ref(null)
const userListShown = ref(false)

const messagesContainer = ref(null)
const isUserAtBottom = ref(true)
const SCROLL_THRESHOLD = 50 //px

const sendMessageTextarea = ref(null)
const editMessageTextarea = ref(null)

//sockets:
socket.on('new_message', async (message) => {
	if (message.conversation_id != shownConvId.value) return

	messages.value.push(message)

	if (!isUserAtBottom.value) return

	await nextTick() // attendre que le DOM soit mis a jour
	scrollToBottom()
})

socket.on('edit_message', (message) => {
	if (message.conversation_id != shownConvId.value) return

	const messageToEditIndex = messages.value.findIndex((m) => m.message_id == message.message_id)
	messages.value[messageToEditIndex].text = message.text
})

socket.on('delete_message', (message) => {
	if (message.conversation_id != shownConvId.value) return

	messages.value = messages.value.filter((m) => m.message_id != message.message_id)
})

socket.on('join_conv', (conv) => {
	conversations.value.push(conv)
})

socket.on('edit_conv', (conv) => {
	const convToEditIndex = conversations.value.findIndex(
		(c) => c.conversation_id == conv.conversation_id,
	)
	conversations.value[convToEditIndex].name = conv.name
})

socket.on('delete_conv', (conv_id) => {
	conversations.value = conversations.value.filter((c) => c.conversation_id != conv_id)

	if (shownConvId.value == conv_id) change_conv(conversations.value[0].conversation_id)
})

socket.on('user_join_conv', (user) => {
	userList.value.push(user)
})

onMounted(() => {
	userStore
		.getCurrentUser()
		.then((response) => {
			socket.emit('user_join', userStore.user.user_id)

			userService
				.getUserConversations(userStore.user.user_id)
				.then((response) => {
					conversations.value = response.data.data
					change_conv(conversations.value[0].conversation_id)
					shownConvAdminId.value = conversations.value[0].admin_user_id

					conversations.value.forEach((conv) => {
						socket.emit('join_users_conv', conv.conversation_id)
					})

					conversationService
						.getMessagesByConvId(conversations.value[0].conversation_id) //par défaut on affiche les messages de la premiere conv
						.then((response) => {
							messages.value = response.data.data
						})
						.catch((error) => {
							console.log(error)
						})

					conversationService
						.getConvUsers(conversations.value[0].conversation_id)
						.then((response) => {
							userList.value = response.data.data
						})
						.catch((error) => {
							console.log(error)
						})
				})
				.catch((error) => {
					console.log(error)
				})
		})
		.catch((error) => {
			console.log(error)
		})
})

function change_conv(id) {
	if (shownConvId.value) {
		socket.emit('leave_conversation', shownConvId.value)
	}
	socket.emit('join_conversation', id)

	shownConvId.value = id
	conversationService
		.getConversationById(id)
		.then((response) => {
			shownConvAdminId.value = response.data.data.admin_user_id

			conversationService
				.getConvUsers(response.data.data.conversation_id)
				.then((response) => {
					userList.value = response.data.data
				})
				.catch((error) => {
					console.log(error)
				})
		})
		.catch((error) => {
			console.log(error)
		})

	conversationService
		.getMessagesByConvId(id)
		.then(async (response) => {
			messages.value = response.data.data

			await nextTick()
			scrollToBottom()
		})
		.catch((error) => {
			console.log(error)
		})
}

function showCreateConvForm() {
	showCreateConv.value = true
}

function closeCreateConvForm() {
	showCreateConv.value = false
	convName.value = ''
}

async function createConv() {
	if (!convName.value.trim()) return

	conversationService
		.createConv(convName.value)
		.then((response) => {
			closeCreateConvForm()

			userConversationService
				.addUserToConv(response.data.data.conversation_id)
				.then((response) => {
					change_conv(response.data.data.conversation_id)
					socket.emit('join_users_conv', response.data.data.conversation_id)
				})
				.catch((error) => {
					console.log(error)
				})
		})
		.catch((error) => {
			console.log(error)
		})
}

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

function showMessageMenu(id) {
	messageMenuShown.value = id
}

function closeMessageMenu() {
	messageMenuShown.value = null
	//close the edit menu too
	editInputShown.value = null
	messagetoEdit.value = ''
}

async function showEditMessage(message) {
	editInputShown.value = message.message_id
	messagetoEdit.value = message.text
}

function closeEditMessage() {
	editInputShown.value = null
	messagetoEdit.value = ''
}

async function editMessage(message_id) {
	if (!messagetoEdit.value.trim()) return

	conversationService
		.editMessage(message_id, shownConvId.value, messagetoEdit.value)
		.then((response) => {
			closeEditMessage()
			//console.log(response.data.data)
		})
		.catch((error) => {
			console.log(error)
		})
}

async function deleteMessage(messageId) {
	conversationService
		.deletedMessage(messageId, shownConvId.value)
		.then((response) => {
			// console.log(response.data)
		})
		.catch((error) => {
			console.log(error)
		})
}

function showJoinConv() {
	if (joinConvShown.value) {
		//montrer la page mes conversations
		searchConv()
		joinConvShown.value = false
		return
	}

	joinConvShown.value = true

	userService
		.getUserConversations(userStore.user.user_id)
		.then((response) => {
			conversations.value = response.data.data
			conversationService
				.getConversations()
				.then((response) => {
					//filtrer les conv pour ne montrer que celle que l'utilisateur n'a pas.
					convToJoinList.value = response.data.data.filter(
						(conv) =>
							!conversations.value.find(
								(c) => c.conversation_id == conv.conversation_id,
							),
					)
				})
				.catch((error) => {
					console.log(error)
				})
		})
		.catch((error) => {
			console.log(error)
		})
}

async function joinConv(convId) {
	userConversationService
		.addUserToConv(convId)
		.then((response) => {
			joinConvShown.value = false
			socket.emit('join_users_conv', convId)
		})
		.catch((error) => {
			console.log(error)
		})
}

async function searchConv() {
	userService
		.getUserConversations(userStore.user.user_id, searchConvValue.value)
		.then((response) => {
			// console.log(response.data.data)
			conversations.value = response.data.data
		})
		.catch((error) => {
			console.log(error)
		})
}

function showEditConv(conv) {
	editConvId.value = conv.conversation_id
	convToEdit.value = conv.name
}

async function editConv(convId) {
	if (!convToEdit.value.trim()) return

	conversationService
		.editConv(convId, convToEdit.value)
		.then((response) => {
			// console.log(response.data.data)
			closeEditConv()
		})
		.catch((error) => {
			console.log(error)
		})
}

function closeEditConv() {
	editConvId.value = null
	convToEdit.value = null
}

async function deleteConv(convId) {
	conversationService
		.deleteConv(convId)
		.then((response) => {
			// console.log(response.data.data)
			socket.emit('leave_users_conv', convId)
		})
		.catch((error) => {
			console.log(error)
		})
}

function onScroll() {
	const mc = messagesContainer.value
	const distanceFromBottom = mc.scrollHeight - mc.scrollTop - mc.clientHeight

	isUserAtBottom.value = distanceFromBottom < SCROLL_THRESHOLD
}

function scrollToBottom() {
	const mc = messagesContainer.value

	mc.scrollTop = mc.scrollHeight
}

function shouldShowUsername(index) {
	if (index == 0) return true
	//si le message precedant a été envoyé par un user différent, on affiche le username, sinon non
	return messages.value[index].user_id != messages.value[index - 1].user_id
}

//hide or show userlist
function handleUserListState() {
	userListShown.value = !userListShown.value
}

function parseMarkdown(text) {
	return DOMPurify.sanitize(marked.parse(text))
}

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

watch(messagetoEdit, async () => {
	await nextTick()

	const textarea = editMessageTextarea.value[0]
	if (!textarea) return

	//reset la hauteur
	textarea.style.height = 'auto'

	const style = window.getComputedStyle(textarea)
	const lineHeight = parseFloat(style.lineHeight)
	const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)

	const maxLines = 5
	const maxHeight = lineHeight * maxLines + padding

	textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
	textarea.style.height = textarea.scrollHeight + 'px'
	textarea.style.width = '50%'
})
</script>
<template>
	<div class="home">
		<div class="conversations">
			<div>{{ joinConvShown ? 'Rejoindre une conversation' : 'Mes conversations' }}</div>
			<div class="filters" v-if="!joinConvShown">
				<input
					type="text"
					placeholder="Rechercher"
					@input="searchConv"
					v-model="searchConvValue"
				/>
			</div>
			<div class="conversations-list">
				<div v-if="!conversations?.length && !joinConvShown">
					Pas de conversation correspondant à la recherche
				</div>
				<div
					v-for="conv in conversations"
					@click="change_conv(conv.conversation_id)"
					:class="{ selectedConv: shownConvId == conv.conversation_id }"
					class="conversation"
					v-if="!joinConvShown"
				>
					<form
						class="editConvForm"
						v-if="conv.conversation_id && editConvId == conv.conversation_id"
						@submit.prevent="editConv(conv.conversation_id)"
					>
						<input
							type="text"
							name="editConv"
							placeholder="Modifier le nom"
							v-model="convToEdit"
						/>
						<button @click="closeEditConv" type="button">
							<img src="../assets/close.png" />
						</button>
						<button type="submit"><img src="../assets/check.png" /></button>
					</form>
					<div v-else>{{ conv.name }}</div>
					<div class="convButtons" v-if="conv.admin_user_id == userStore.user.user_id">
						<button @click="showEditConv(conv)">
							<img src="../assets/edit.png" />
						</button>
						<button @click="deleteConv(conv.conversation_id)">
							<img src="../assets/delete.png" />
						</button>
					</div>
				</div>
				<div v-for="conv in convToJoinList" v-else class="convToJoinList">
					<div>{{ conv.name }}</div>
					<button @click="joinConv(conv.conversation_id)">Rejoindre</button>
				</div>
				<div v-if="!convToJoinList?.length && joinConvShown">
					Pas de conversation à rejoindre
				</div>
			</div>

			<form class="createConv" v-if="showCreateConv" @submit.prevent="createConv">
				<h3>Créer un conversation</h3>
				<input type="text" placeholder="Nom de la conversation" v-model="convName" />
				<div class="createConvButtons">
					<button @click="closeCreateConvForm" type="button">Annuler</button>
					<button type="submit">Créer</button>
				</div>
			</form>

			<div class="buttons">
				<button @click="showCreateConvForm">Créer une conversation</button>
				<button @click="showJoinConv">
					{{ !joinConvShown ? 'Rejoindre une conversation' : 'Mes conversations' }}
				</button>
			</div>
		</div>
		<div class="current-conv">
			<div class="messages" @scroll="onScroll" ref="messagesContainer">
				<div
					v-for="(message, index) in messages"
					class="message"
					:class="{ 'self-message': message.user_id == userStore.user.user_id }"
				>
					<div class="message-sender" v-if="shouldShowUsername(index)">
						{{ message.User.name }}
					</div>
					<div
						class="message-text"
						v-if="!editInputShown || editInputShown != message.message_id"
						@click="showMessageMenu(message.message_id)"
						v-html="parseMarkdown(message.text)"
					></div>
					<form
						class="edit-message"
						v-else
						@submit.prevent="editMessage(message.message_id)"
					>
						<textarea
							placeholder="Modifier le message"
							v-model="messagetoEdit"
							ref="editMessageTextarea"
						></textarea>
						<button @click="closeEditMessage" type="button">
							<img src="../assets/close.png" />
						</button>
						<button type="submit"><img src="../assets/check.png" /></button>
					</form>
					<div
						class="message-menu"
						v-if="
							messageMenuShown &&
							messageMenuShown == message.message_id &&
							(message.user_id == userStore.user.user_id || //afficher le menu seulement sur nos message ou sur tout les message si on est l'admin de la conversation actuelle
								userStore.user.user_id == shownConvAdminId)
						"
					>
						<button @click="showEditMessage(message)">
							<img src="../assets/edit.png" />
						</button>
						<button @click="deleteMessage(message.message_id)">
							<img src="../assets/delete.png" />
						</button>
						<button @click.stop="closeMessageMenu">
							<img src="../assets/close.png" />
						</button>
					</div>
				</div>
			</div>
			<button v-if="!isUserAtBottom" class="newMessageButton" @click="scrollToBottom">
				Nouveaux messages
			</button>
			<div class="message-bar">
				<form @submit.prevent="sendMessage" class="sendMessageForm">
					<textarea
						placeholder="Envoyer un message"
						v-model="messageToSend"
						@keypress.enter.exact="sendMessage"
						rows="1"
						ref="sendMessageTextarea"
					></textarea>
					<button type="submit" class="sendButton">
						<img src="../assets/send.png" />
					</button>
				</form>
			</div>
		</div>
		<div
			class="userList"
			:class="{ userListShownClass: userListShown, userListHiddenClass: !userListShown }"
		>
			<button @click="handleUserListState">
				<!-- {{ userListShown ? 'close userlist' : 'userlist' }} -->
				<img src="../assets/close.png" v-if="userListShown" />
				<img src="../assets/user_list.png" v-else />
			</button>
			<div class="userListTitle" v-if="userListShown">Utilisateurs</div>
			<div v-for="user in userList" v-if="userListShown">
				{{ user.name }}
			</div>
		</div>
	</div>
</template>

<style scoped>
.home {
	display: flex;
	width: 100%;
	height: 90vh;
}

.conversations {
	width: 25%;
	height: 100%;
	border-right: 1px solid grey;
	display: flex;
	flex-direction: column;
	margin-left: auto;
}

.conversation {
	display: flex;
	justify-content: space-between;
	height: 40px;
}

.convButtons button {
	width: 30px;
	margin-left: 5px;
}

.convButtons button img {
	width: 100%;
}

.editConvForm {
	display: flex;
	align-items: center;
}

.editConvForm button {
	width: 35px;
	margin-left: 5px;
}

.editConvForm input {
	padding: 5px;
}

.editConvForm button img {
	width: 100%;
}

.filters {
	display: flex;
	gap: 8px;
}

.filters input {
	flex: 1;
	padding: 10px;
	border-radius: 5px;
	margin-right: 10px;
}

.filters button {
	margin-left: 5px;
	margin-right: 5px;
}

.conversations-list {
	flex: 1;
	overflow-y: auto;
}

.conversations-list div {
	/* padding: 6px 0; */
	align-items: center;
	cursor: pointer;
	margin-right: 10px;
}

.convToJoinList {
	display: flex;
	justify-content: space-between;
}

.convToJoinList button {
	margin-right: 25px;
	padding: 7px;
}

.selectedConv {
	background-color: blue;
}

.buttons {
	display: flex;
	width: 100%;
	justify-content: space-around;
}

.buttons button {
	padding: 15px;
}

.current-conv {
	width: 75%;
	height: 100%;
	display: flex;
	flex-direction: column;
	margin-left: 15px;
	/* max-height: 100%; */
}

.messages {
	flex: 1;
	overflow-y: auto;
}

.message {
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin-top: 4px;
}

.message-sender {
	font-size: 14px;
	font-weight: bold;
	margin-top: 5px;
}

.message-text {
	background: blue;
	padding: 0px 10px;
	width: fit-content;
	max-width: 50%;

	word-wrap: break-word;
	overflow-wrap: break-word;
	overflow-wrap: anywhere;
	text-align: left;
	white-space: normal;
}

.message-text :link {
	color: #00ffff;
}

.message-menu button {
	width: 40px;
	margin: 5px;
}

.message-menu button img {
	width: 100%;
}

.edit-message textarea {
	padding: 10px;
	margin: 5px;
	line-height: 20px;
	resize: none;
}

.edit-message button {
	width: 40px;
	margin: 5px;
}

.edit-message button img {
	width: 100%;
}

.self-message {
	align-self: flex-end;
	text-align: right;
	margin-right: 15px;
}

.self-message .message-text {
	background: darkblue;
	margin-left: auto;
}

.sendMessageForm {
	display: flex;
}

.message-bar {
	width: 100%;
	margin-top: 15px;
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

.message-bar button {
	cursor: pointer;
	width: 40px;
	margin: 5px;
	border: none;
	margin-left: -40px;
	background-color: white;
}

.sendButton img {
	width: 100%;
}

.createConv {
	width: 100%;
	text-align: center;
}

.createConv input {
	padding: 15px;
	margin: 5px;
	width: 89%;
}

.createConvButtons {
	display: flex;
}

.createConvButtons button {
	width: 50%;
	padding: 15px;
	margin: 10px;
}

.newMessageButton {
	padding: 5px;
	width: 10%;
	margin-left: 90%;
}

.userList div {
	margin-bottom: 5px;
}

.userList button img {
	width: 25px;
}

.userListTitle {
	font-weight: bold;
}

.userListHiddenClass {
	margin-left: -35px;
	height: fit-content;
}
.userListShownClass {
	width: 6%;
	margin-left: 15px;
	border-left: 1px solid gray;
	padding-left: 5px;
}

.userListShownClass button {
	margin-bottom: 10px;
}
</style>
