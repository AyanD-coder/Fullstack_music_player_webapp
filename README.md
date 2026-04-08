# 🎵 Music Player Web App

🚀 A full-stack music streaming web app where users can listen to music and artists can upload & manage tracks.

---

## ✨ Features

- 🔐 Authentication using **JWT + bcrypt**
- 🧑‍🤝‍🧑 Role-Based Access (User & Artist)
- 🎤 Artist Dashboard (Upload Songs & Albums)
- 🎧 Music Streaming Player
- 🔗 REST API Integration
- 🧠 MVC Backend Architecture

---

## 🔐 Authentication & Authorization

- Passwords hashed using **bcrypt**
- JWT used for secure authentication
- Token stored on client (cookies/localStorage)
- Protected routes via middleware

### 🧑‍🤝‍🧑 Roles
- **Artist** → Upload & manage songs & albums 
- **User** → Browse & play music & albums

---

## ⚙️ Tech Stack

**Frontend:** HTML, CSS, JavaScript  
**Backend:** Node.js, Express.js  
**Database:** MongoDB (Mongoose)  
**Auth:** JWT, bcrypt  

---

## Installation
```bash
git clone https://github.com/AyanD-coder/Fullstack_music_player_webapp.git
cd Fullstack_music_player_webapp/app/backend
npm install
npm start
