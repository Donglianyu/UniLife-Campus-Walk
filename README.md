# 🎓 UniLife Campus Walk

> A full-stack campus life simulation web application powered by **Node.js**, **Express**, and **MySQL**.

---

## 🚀 Quick Start

```bash
cd backend
npm install
npm start
```

Then open:

```text
http://127.0.0.1:3002/
```

---

# 📖 Project Overview

UniLife Campus Walk is an interactive web-based campus simulation game designed as a database application project.

The project demonstrates:

* Full-stack web development
* MySQL database integration
* RESTful API communication
* Persistent data management
* Interactive browser-based gameplay

Players can explore a virtual campus environment, participate in activities, trigger events, and interact with dynamic game systems.

---

# ✨ Features

## 🖥 Interactive Web Interface

* Browser-based gameplay
* Dynamic campus navigation
* Interactive event system
* Responsive UI interactions

## 🗄 Database Integration

* MySQL relational database
* Persistent user/game data
* Structured SQL schema
* Stored procedures and constraints

## ⚙ Backend System

* Node.js + Express server
* RESTful API architecture
* Database query management
* Server-side game logic

## 🎮 Additional Functionalities

* User registration
* Event scheduling
* Save/load game states
* Health check APIs

---

# 🛠 Technology Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Frontend | HTML5, CSS3, JavaScript |
| Backend  | Node.js, Express.js     |
| Database | MySQL 8.0               |
| Driver   | mysql2                  |

---

# 📂 Project Structure

```text
Unilife/
│
├── backend/
│   ├── public/
│   │   ├── index.html
│   │   ├── app.js
│   │   └── styles.css
│   │
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── database/
│   ├── unilife_campus_walk_uic_map.sql
│   ├── enhanced_event_schedule.sql
│   └── latest_game_content_patch.sql
│
├── README.md
└── .gitignore
```

---

# 🗄 Database Setup

## 1️⃣ Install MySQL

Install MySQL 8.0 or any compatible version.

Official website:

https://www.mysql.com/

---

## 2️⃣ Create the Database

Import the main SQL file:

```bash
mysql -u root -p < database/unilife_campus_walk_uic_map.sql
```

Then apply additional SQL patches:

```text
database/enhanced_event_schedule.sql
database/latest_game_content_patch.sql
```

You may use:

* MySQL Workbench
* phpMyAdmin
* MySQL Command Line Client

---

# ⚙ Environment Configuration

Create a `.env` file inside the `backend/` directory.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=unilife_campus_walk
PORT=3002
```

---

# 📦 Installation

Navigate to the backend folder:

```bash
cd backend
```

Install required dependencies:

```bash
npm install
```

---

# ▶ Running the Application

Start the backend server:

```bash
npm start
```

or:

```bash
node server.js
```

---

# 🌐 Access the Application

Open your browser:

```text
http://127.0.0.1:3002/
```

---

# 🔌 API Examples

## Health Check

```http
GET /api/health
```

## Create New Game

```http
POST /api/new-game
```

## User Registration

```http
POST /api/register
```

---

# 🧩 Database Design

The relational database system includes:

* User tables
* Event tables
* Game progress tables
* Campus map data
* Schedule management
* Stored procedures
* Foreign key constraints

The database supports persistent storage and dynamic retrieval of gameplay information.

---

# 🎯 Learning Objectives Demonstrated

This project demonstrates:

* Database schema design
* SQL implementation
* Backend-database connectivity
* REST API development
* Full-stack web application architecture
* Interactive UI implementation
* Persistent data management

---

# 🚧 Future Improvements

Potential future extensions include:

* Multiplayer support
* Authentication system
* Cloud database deployment
* Mobile responsive design
* More campus activities and mini-games

---

# 👨‍💻 Authors

Developed as a university database application project.

---

# 📄 License

This project is for educational purposes only.
