# Quick Start

```bash
cd backend
npm install
npm start

# UniLife Campus Walk

A web-based interactive campus life simulation game integrated with a MySQL database system.
This project was developed as a database application project demonstrating full-stack development, database integration, and interactive user interface design.

---

# Project Overview

UniLife Campus Walk is an interactive web application that simulates campus activities, student events, mini-games, and social interactions within a university environment.

The system combines:

* Frontend web interface
* Backend server using Node.js and Express
* MySQL relational database
* RESTful API communication
* Persistent game and user data storage

The project demonstrates practical database application development with real database connectivity and dynamic data interaction.

---


# Features

## Interactive Web Interface

* Browser-based user interface
* Dynamic game interactions
* Campus navigation system
* Event and activity simulation

## Database Integration

* MySQL relational database
* Persistent user/game data storage
* SQL procedures and structured schema
* Multiple database tables with constraints

## Backend System

* Node.js + Express server
* RESTful API endpoints
* Database query handling
* Server-side logic processing

## Additional Functionalities

* User registration system
* Event scheduling
* Game state management
* Health/API status checking

---

# Technology Stack

## Frontend

* HTML5
* CSS3
* JavaScript

## Backend

* Node.js
* Express.js

## Database

* MySQL 8.0

## Database Driver

* mysql2

---

# Project Structure

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
│   └── .env.example
│
├── database/
│   ├── unilife_campus_walk_uic_map.sql
│   ├── enhanced_event_schedule.sql
│   └── latest_game_content_patch.sql
│
└── README.md
```

---

# Database Setup

## Step 1: Install MySQL

Install MySQL 8.0 or a compatible version.

Official website:

https://www.mysql.com/

---

## Step 2: Create the Database

Import the main SQL file:

```sql
database/unilife_campus_walk_uic_map.sql
```

Then apply additional patches:

```sql
database/enhanced_event_schedule.sql
database/latest_game_content_patch.sql
```

You may use:

* MySQL Workbench
* phpMyAdmin
* Command Line MySQL Client

Example command:

```bash
mysql -u root -p < database/unilife_campus_walk_uic_map.sql
```

---

# Environment Configuration

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

# Installation

## Step 1: Install Dependencies

Navigate to the backend folder:

```bash
cd backend
```

Install required packages:

```bash
npm install
```

---

# Running the Application

Start the backend server:

```bash
npm start
```

or

```bash
node server.js
```

---

# Access the Application

Open your browser and visit:

```text
http://127.0.0.1:3002/
```

---

# API Examples

## Health Check

```text
GET /api/health
```

## Create New Game

```text
POST /api/new-game
```

## User Registration

```text
POST /api/register
```

---

# Database Design

The project uses a relational database design including:

* User tables
* Event tables
* Game progress tables
* Campus map data
* Schedule management
* Stored procedures
* Foreign key constraints

The database supports persistent storage and dynamic retrieval of gameplay information.

---

# Learning Objectives Demonstrated

This project demonstrates:

* Database schema design
* SQL implementation
* Backend and database connectivity
* Full-stack web application development
* REST API development
* Interactive UI implementation
* Data persistence and management

---

# Future Improvements

Possible future extensions include:

* Multiplayer support
* Authentication system
* Cloud database deployment
* Mobile responsive design
* More campus activities and mini-games

---

# Authors

Developed as a university database application project.

---

# License

This project is for educational purposes only.
