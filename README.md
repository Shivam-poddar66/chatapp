# Full-Stack Real-Time Private Chat System

A high-performance, secure, real-time 1-on-1 private messaging application built with **React (Vite)**, **Node.js (Express)**, **Socket.IO**, and **MySQL 8** (with connection pooling via `mysql2/promise`).

---

## 🚀 Key Features

- **Zero-Polling Real-Time Architecture:** 1-to-1 instant message dispatch via Socket.IO WebSocket rooms.
- **Sensitive PII Masking Engine:** Automatic server-side regex sanitization that masks phone numbers (e.g. `98******10`) and email addresses (e.g. `j******e@example.com`) before dispatching to recipients or persisting.
- **Live Presence Detection:** Real-time online/offline presence tracking and dynamic "last seen" timestamps.
- **Read Receipts & Typing Indicators:** Instant double checkmarks for read status and animated 3-dots typing indicators.
- **Cursor-based Message Pagination:** Efficient reverse pagination preventing server memory spikes.
- **JWT Handshake Authentication:** Strict token verification during WebSocket handshake and on REST endpoints.
- **Modern Responsive UI:** Built with Tailwind CSS, Lucide Icons, unread counters, and sound notifications.

---

## 🛠️ Project Structure

```text
chatapp/
├── server/                          # Backend: Node.js + Express + Socket.IO + MySQL
│   ├── src/
│   │   ├── config/                  # database.js, jwt.js, websocket.js
│   │   ├── controllers/             # auth.controller.js, user.controller.js, chat.controller.js
│   │   ├── middlewares/             # auth.middleware.js, socketAuth.js, validate.js, errorHandler.js
│   │   ├── models/                  # User.js, Conversation.js, Message.js
│   │   ├── routes/                  # auth.routes.js, user.routes.js, chat.routes.js, index.js
│   │   ├── services/                # auth.service.js, chat.service.js, masking.service.js, presence.service.js
│   │   ├── sockets/                 # chat.handler.js, presence.handler.js, index.js
│   │   ├── utils/                   # response.js, logger.js
│   │   ├── app.js                   # Express application setup
│   │   └── server.js                # Combined HTTP & Socket.IO server
│   ├── database/
│   │   ├── migrations/              # 001_initial_schema.sql
│   │   ├── migrate.js               # Auto-migration script
│   │   └── seed.js                  # Demo seed users & mock conversations
│   ├── .env                         # Server environment configuration
│   └── package.json
│
├── client/                          # Frontend: React (Vite) + Tailwind CSS
│   ├── src/
│   │   ├── assets/                  # Logos and audio assets
│   │   ├── components/
│   │   │   ├── auth/                # LoginForm.jsx, RegisterForm.jsx
│   │   │   ├── chat/                # ChatLayout, Sidebar, UserList, UserItem, ChatWindow, ChatHeader,
│   │   │   │                        # MessageList, MessageBubble, MessageInput, TypingIndicator
│   │   │   └── common/              # Avatar.jsx, Badge.jsx
│   │   ├── context/                 # AuthContext.jsx, SocketContext.jsx
│   │   ├── hooks/                   # useChat.js, usePresence.js
│   │   ├── services/                # api.js, auth.service.js, chat.service.js
│   │   ├── utils/                   # sound.js (Web Audio API notification chime)
│   │   ├── App.jsx                  # Main route switcher
│   │   ├── main.jsx                 # React root
│   │   └── index.css                # Tailwind CSS
│   ├── .env                         # Client environment configuration
│   └── package.json
│
├── CHAT_SYSTEM_DOCUMENTATION.md     # Architecture & Technical Design Document
└── package.json                     # Root convenience scripts
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22)
- **MySQL 8 / XAMPP MySQL** running on `localhost:3306`

### 2. Database Migration & Seeding
From the root directory:
```bash
npm run migrate
npm run seed
```
This sets up `db_chatsystem` with `users`, `conversations`, `conversation_participants`, and `messages` tables, and seeds 4 demo users with mock message history.

### 3. Start Backend Server
```bash
npm run server
# Or: cd server && npm start
```
Server starts on `http://localhost:5000`.

### 4. Start Frontend Client
In a new terminal:
```bash
npm run client
# Or: cd client && npm run dev
```
Client opens on `http://localhost:5173`.

---

## 👥 Demo Accounts (Pre-seeded)

Use any of these demo accounts (with convenient 1-click buttons on the login screen):

| Name | Email | Password |
| :--- | :--- | :--- |
| **Alice Johnson** | `alice@example.com` | `password123` |
| **Bob Smith** | `bob.smith@example.com` | `password123` |
| **Charlie Brown** | `charlie.brown@example.com` | `password123` |
| **Diana Prince** | `diana@example.com` | `password123` |

---

## 🧪 Automated System Verification Tests

Run the comprehensive integration test suite verifying PII masking, JWT authentication, and WebSocket message exchange:
```bash
cd server
npm test
```
