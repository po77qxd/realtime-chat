<script setup>
import { ref } from 'vue'
import AuthService from '@/services/authService'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref({ email: '', name: '', password: '', confirmPassword: '' })

async function handleSubmit() {
	try {
		if (user.value.password != user.value.confirmPassword) {
			alert('Les mots de passe ne correspondent pas')
			return
		}
		const response = await AuthService.registerUser(
			user.value.email,
			user.value.name,
			user.value.password,
		)
		router.push('/login')
		//console.log(response.data)
	} catch (error) {
		console.error('Login error:' + error)
	}
}
</script>
<template>
	<div class="register-form">
		<h1>Inscription</h1>
		<form @submit.prevent="handleSubmit">
			<input type="email" v-model="user.email" placeholder="Email" required />
			<input type="text" v-model="user.name" placeholder="Nom" required />
			<input type="password" v-model="user.password" placeholder="Mot de passe" required />
			<input
				type="password"
				v-model="user.confirmPassword"
				placeholder="Confirmer le mot de passe"
				required
			/>
			<router-link to="/login">Déjà inscrit ?</router-link>
			<button type="submit">S'inscrire</button>
		</form>
	</div>
</template>

<style scoped>
.register-form {
	padding: 2rem 3rem;
	border-radius: 12px;
	width: 100%;
	max-width: 400px;
	box-sizing: border-box;
}

.register-form h1 {
	text-align: center;
	margin-bottom: 1.5rem;
	font-size: 1.8rem;
	color: white;
}

.register-form form {
	display: flex;
	flex-direction: column;
}

.register-form input {
	padding: 0.75rem 1rem;
	margin-bottom: 1rem;
	border: 1px solid #ccc;
	border-radius: 8px;
	font-size: 1rem;
	transition: border 0.3s ease;
}

.register-form input:focus {
	border-color: #006eff;
	outline: none;
}

.register-form a {
	text-align: center;
	color: #006eff;
	font-size: 0.9rem;
	margin-bottom: 1.2rem;
	text-decoration: none;
}

.register-form a:hover {
	text-decoration: underline;
}

.register-form button {
	padding: 0.75rem;
	background: #006eff;
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	cursor: pointer;
	transition: background 0.3s ease;
}

.register-form button:hover {
	background: #0039f3;
}
</style>
