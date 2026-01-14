<script setup>
import { ref, onMounted } from 'vue'
import userService from './services/userService'

const user = ref(null)

onMounted(() => {
  userService.getCurrentUser()
    .then((response) => {
      user.value = response.data
    })
    .catch((error) => {
      console.log(error)
    })
})

</script>

<template>
  <div id="layout">
    <header>
      <nav class="nav">
        <div class="nav-buttons">

          <RouterLink v-if="user?.user_id == null" to="/login">
            <button>Connexion</button>
          </RouterLink>

          <RouterLink v-if="user?.user_id == null" to="/register">
            <button>Inscription</button>
          </RouterLink>

          <button v-if="user && user?.user_id !== null" @click="handleLogout">
            Déconnexion
          </button>
        </div>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <footer>
      <p><strong>Site créé par</strong></p>
      <ul>
        <li>Bastien Segalen (bastien.segalen@eduvaud.ch)</li>
      </ul>
    </footer>
  </div>
</template>


<style scoped>
#layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-family: Helvetica, Arial, sans-serif;
}

header {
  padding: 16px 24px;
  border-bottom: 1px solid #333333;
}

.nav {
  display: flex;
  justify-content: flex-end;
}

.content {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

footer {
  padding: 20px 0;
  text-align: center;
  font-size: 14px;
  color: #bbb;
  border-top: 1px solid #222;
}

footer p {
  margin: 0;
  color: #fff;
}

footer ul {
  list-style: none;
  padding: 0;
  margin-top: 8px;
}

footer li {
  margin: 4px 0;
}
</style>

