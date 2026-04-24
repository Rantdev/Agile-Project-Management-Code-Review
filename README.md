# 🚀 AgileFlow - Complete Project Management Solution

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)
[![SQLite Version](https://img.shields.io/badge/sqlite-5.1.6-blue)](https://www.sqlite.org/)

A full-stack Agile Project Management application for small teams to manage projects, user stories, tasks, and team collaboration efficiently.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Usage Guide](#-usage-guide)
- [Security Features](#-security-features)
- [AI Usage](#-ai-usage)
- [Future Improvements](#-future-improvements)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## ✨ Features

### 🔐 Authentication & Security
- Email/Password login with JWT authentication
- Google OAuth 2.0 integration
- OTP (One-Time Password) verification for new users
- Password hashing with bcrypt (10 rounds)
- Protected routes and API endpoints
- Session management with 7-day token expiry

### 📊 Project Management
- Create, read, update, delete projects
- Project status tracking (Planning, Active, Completed, Archived)
- Project owner assignment
- Project statistics (tasks, members, stories count)
- Search and filter projects

### 📝 User Story Management
- Create stories within projects
- Story status tracking (To Do, In Progress, Done)
- Hierarchical structure: Project → Story → Task
- Story prioritization
- Story points estimation

### ✅ Task Management
- Create tasks within stories
- Assign tasks to team members
- Set deadlines and priorities
- Task status updates
- Kanban-style task board (To Do, In Progress, Done)
- Task completion tracking
- Overdue task highlighting

### 👥 Team Collaboration
- Add/remove team members to projects
- Role-based access control:
  - **Product Owner**: Full CRUD operations
  - **Team Member**: View and update task status only
- Team member roles and permissions
- Activity tracking

### 💬 Real-time Chat
- Project-based team chat rooms
- Live message updates (polling every 5 seconds)
- Delete own messages
- User avatars and identification
- Message timestamps
- Chat history (last 100 messages)

### 📈 Performance Analytics
- **Individual Performance Dashboard**
  - Task completion rate
  - Task breakdown (completed, in-progress, pending)
  - Overdue tasks count
  - Average completion time
  - Projects and stories contribution

- **Team Performance Dashboard**
  - Team overview metrics
  - Individual member performance
  - Completion rates by member
  - Project progress tracking

- **Company Analytics**
  - Total users, projects, tasks statistics
  - Overall completion rate
  - Top performers leaderboard
  - Weekly activity trends

### 👤 User Profile Management
- View and edit profile information
- Add/remove skills with proficiency levels (Beginner, Intermediate, Advanced, Expert)
- Change password functionality
- Role selection during registration
- Department and contact information
- Social links (GitHub, LinkedIn)

### 📧 Email Notifications
- Email notification on task assignment
- Daily cron job for overdue task reminders (9:00 AM)
- Rich HTML email templates
- OTP emails for verification

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| React Router DOM | 6.20.1 | Routing |
| Axios | 1.6.2 | API calls |
| Tailwind CSS | 3.4.0 | Styling |
| React Hot Toast | 2.4.1 | Notifications |
| React Icons | 5.0.1 | Icons |
| Vite | 5.0.8 | Build tool |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 14+ | Runtime |
| Express | 4.18.2 | Web framework |
| SQLite3 | 5.1.6 | Database |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password hashing |
| Nodemailer | 6.9.7 | Email service |
| node-cron | 3.0.3 | Scheduled jobs |

## 📁 Project Structure

## 🗄️ Database Schema

### Tables Structure

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  bio TEXT,
  avatar TEXT,
  department TEXT,
  phone TEXT,
  location TEXT,
  github TEXT,
  linkedin TEXT,
  is_verified INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Planning',
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Stories table
CREATE TABLE stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'To Do',
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tasks table
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  assignee TEXT NOT NULL,
  deadline DATE,
  status TEXT DEFAULT 'To Do',
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES stories(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Team members table
CREATE TABLE team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_email),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Chat messages table
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_avatar TEXT,
  message TEXT NOT NULL,
  file_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- OTP codes table
CREATE TABLE otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  is_used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email) REFERENCES users(email)
);

-- User skills table
CREATE TABLE user_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  skill_name TEXT NOT NULL,
  skill_level TEXT DEFAULT 'Beginner',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);