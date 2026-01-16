<script setup>
import { ref } from 'vue'
import AuthService from '@/services/authService'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = ref({ email: '', password: '' })

async function handleSubmit() {
	try {
		const response = await AuthService.loginUser(user.value.email, user.value.password)
		//console.log(response.data)
		router.push('/home')
	} catch (error) {
		console.error('Login error:' + error)
	}
}
</script>
<template>
	<div class="connexion-form">
		<h1>Login</h1>
		<form @submit.prevent="handleSubmit">
			<input type="email" v-model="user.email" placeholder="Email" required />
			<input type="password" v-model="user.password" placeholder="Mot de passe" required />
			<router-link to="/register">Pas encore inscrit ?</router-link>
			<button type="submit">Se connecter</button>
		</form>
	</div>
</template>

<style scoped>
.connexion-form {
	padding: 2rem 3rem;
	border-radius: 12px;
	width: 100%;
	max-width: 400px;
	box-sizing: border-box;
}

.connexion-form h1 {
	text-align: center;
	margin-bottom: 1.5rem;
	font-size: 1.8rem;
	color: white;
}

.connexion-form form {
	display: flex;
	flex-direction: column;
}

.connexion-form input {
	padding: 0.75rem 1rem;
	margin-bottom: 1rem;
	border: 1px solid #ccc;
	border-radius: 8px;
	font-size: 1rem;
	transition: border 0.3s ease;
}

.connexion-form input:focus {
	border-color: #006eff;
	outline: none;
}

.connexion-form a {
	text-align: center;
	color: #006eff;
	font-size: 0.9rem;
	margin-bottom: 1.2rem;
	text-decoration: none;
}

.connexion-form a:hover {
	text-decoration: underline;
}

.connexion-form button {
	padding: 0.75rem;
	background: #006eff;
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	cursor: pointer;
	transition: background 0.3s ease;
}

.connexion-form button:hover {
	background: #0039f3;
}
</style>
