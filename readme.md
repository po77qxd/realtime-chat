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

### Backend (.env)

```env
PRIV_KEY=YOUR_PRIVATE_KEY
```

### Frontend (.env)

```env
VITE_GIPHY_API_KEY=your_key
```

---

## ▶️ Getting Started (Development)

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
