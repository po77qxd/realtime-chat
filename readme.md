# 💬 Realtime Chat App

A modern real-time chat application built with **Vue 3** and **Node.js**, featuring live messaging, typing indicators, online/offline presence, file uploads, GIF support, and Markdown-rendered messages.

---

## 🚀 Features

- 🔥 Real-time messaging with Socket.IO
- 👥 Online / offline user presence
- ✍️ Typing indicators
- 📂 Image uploads
- 🎞️ GIF picker (Giphy API)
- 🧵 Conversations & multiple channels
- ⬇️ Smart auto-scroll (only when user is at bottom)
- 🧠 Redis for real-time state (users, sockets, typing)
- 📝 Messages support **Markdown**
- 📱 Responsive UI

---

## 🛠️ Tech Stack

### Frontend

- Vue 3 (Composition API)
- Vite
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express
- Socket.IO
- Redis
- Multer
- JWT Authentication

---

## ⚙️ Environment Variables

### Frontend (.env)

```
VITE_GIPHY_API_KEY=your_key
VITE_BACKEND_URL=http://localhost:3000
VITE_WEBSOCKET_URL=ws://localhost:3001
```

### Backend (.env)

```
PRIV_KEY=YOUR_PRIVATE_KEY
REDIS_URL=redis://default:admin@localhost:6379

MYSQL_HOST=localhost
MYSQL_PORT=6034
MYSQL_DATABASE=db_chat
MYSQL_USER=root
MYSQL_PASSWORD=root

FRONTEND_URL=http://localhost:5173
PORT=3000
WEBSOCKET_PORT=3001
WEBSOCKET_URL=http://localhost:3001
```

## 🔑 Giphy API Key

To enable GIF support, you need a Giphy API key.

1. Go to https://developers.giphy.com
2. Create a Giphy account (or log in)
3. Create a new app
4. Copy the generated API key
5. Paste it into your frontend `.env` file as:

VITE_GIPHY_API_KEY=your_key

---

## ▶️ Getting Started (Development)

```
git clone https://github.com/po77qxd/realtime-chat.git
cd realtime-chat
```

### Docker

```
cd backend
docker compose up -d
```

### Backend

```
cd backend
npm i
npm start
```

### Frontend

```
cd frontend
npm i
npm run dev
```

---

## 🖼️ File Uploads

- Images are uploaded via Multer
- Images are displayed directly inside messages with markdown
- Responsive rendering inside the chat

---

## 🎞️ GIF Support

- Powered by the Giphy API
- GIF picker integrated in the message input
- GIFs are sent as standard messages

---

## 🧠 Smart Auto-Scroll

- Automatically scrolls when new messages arrive
- Disabled if the user scrolls up to read older messages
- Prevents scroll jump during message history browsing

## 🧪 TODOs

- Improve UI / UX
- Private conversations and private messages
- Moderation tools:
  - User bans
  - Mutes
  - Slow mode
