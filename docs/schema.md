
## 3. Database Schema Documentation - docs/schema.md

```markdown
# Database Schema Documentation

## Overview

AgileFlow uses SQLite3 as its database. Below is the complete schema documentation.

## Table Structures

### 1. users
Stores user account information and profile data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| name | TEXT | NOT NULL | User's full name |
| email | TEXT | UNIQUE NOT NULL | User's email address |
| password | TEXT | NOT NULL | Hashed password (bcrypt) |
| role | TEXT | DEFAULT 'member' | User role (member, admin, product_owner) |
| bio | TEXT | | Short biography |
| avatar | TEXT | | Profile picture URL |
| department | TEXT | | Department name |
| phone | TEXT | | Contact number |
| location | TEXT | | Geographic location |
| github | TEXT | | GitHub profile URL |
| linkedin | TEXT | | LinkedIn profile URL |
| is_verified | INTEGER | DEFAULT 0 | Email verification status (0/1) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_users_email` on `email`

### 2. otp_codes
Stores one-time passwords for email verification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique OTP identifier |
| email | TEXT | NOT NULL, FOREIGN KEY | User's email address |
| otp_code | TEXT | NOT NULL | 6-digit OTP code |
| expires_at | DATETIME | NOT NULL | Expiration timestamp (10 minutes) |
| is_used | INTEGER | DEFAULT 0 | Whether OTP has been used |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Foreign Keys:**
- `email` references `users(email)` ON DELETE CASCADE

**Indexes:**
- `idx_otp_email` on `email`
- `idx_otp_expires` on `expires_at`

### 3. projects
Stores project information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique project identifier |
| title | TEXT | NOT NULL | Project title |
| description | TEXT | | Project description |
| status | TEXT | DEFAULT 'Planning' | Project status (Planning, Active, Completed, Archived) |
| created_by | INTEGER | NOT NULL, FOREIGN KEY | User ID of project owner |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Foreign Keys:**
- `created_by` references `users(id)` ON DELETE CASCADE

**Indexes:**
- `idx_projects_created_by` on `created_by`
- `idx_projects_status` on `status`

### 4. stories
Stores user stories linked to projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique story identifier |
| project_id | INTEGER | NOT NULL, FOREIGN KEY | Parent project ID |
| title | TEXT | NOT NULL | Story title |
| description | TEXT | | Story description |
| status | TEXT | DEFAULT 'To Do' | Story status (To Do, In Progress, Done) |
| created_by | INTEGER | FOREIGN KEY | User who created the story |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Foreign Keys:**
- `project_id` references `projects(id)` ON DELETE CASCADE
- `created_by` references `users(id)` ON DELETE SET NULL

**Indexes:**
- `idx_stories_project_id` on `project_id`
- `idx_stories_status` on `status`

### 5. tasks
Stores tasks linked to user stories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique task identifier |
| story_id | INTEGER | NOT NULL, FOREIGN KEY | Parent story ID |
| title | TEXT | NOT NULL | Task title |
| assignee | TEXT | NOT NULL | Email of assigned user |
| deadline | DATE | | Task deadline date |
| status | TEXT | DEFAULT 'To Do' | Task status (To Do, In Progress, Done) |
| created_by | INTEGER | FOREIGN KEY | User who created the task |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Foreign Keys:**
- `story_id` references `stories(id)` ON DELETE CASCADE
- `created_by` references `users(id)` ON DELETE SET NULL

**Indexes:**
- `idx_tasks_story_id` on `story_id`
- `idx_tasks_assignee` on `assignee`
- `idx_tasks_status` on `status`
- `idx_tasks_deadline` on `deadline`

### 6. team_members
Stores project-team member relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique membership identifier |
| project_id | INTEGER | NOT NULL, FOREIGN KEY | Project ID |
| user_email | TEXT | NOT NULL | Member's email address |
| role | TEXT | DEFAULT 'member' | Member's role in project |
| joined_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | When member joined |

**Foreign Keys:**
- `project_id` references `projects(id)` ON DELETE CASCADE

**Constraints:**
- `UNIQUE(project_id, user_email)` prevents duplicate membership

**Indexes:**
- `idx_team_members_project_id` on `project_id`
- `idx_team_members_user_email` on `user_email`

### 7. chat_messages
Stores project chat messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique message identifier |
| project_id | INTEGER | NOT NULL, FOREIGN KEY | Project ID |
| user_id | INTEGER | NOT NULL, FOREIGN KEY | Sender's user ID |
| user_name | TEXT | NOT NULL | Sender's name (denormalized) |
| user_email | TEXT | NOT NULL | Sender's email (denormalized) |
| user_avatar | TEXT | | Sender's avatar URL |
| message | TEXT | NOT NULL | Message content |
| file_url | TEXT | | Attached file URL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

**Foreign Keys:**
- `project_id` references `projects(id)` ON DELETE CASCADE
- `user_id` references `users(id)` ON DELETE CASCADE

**Indexes:**
- `idx_chat_messages_project_id` on `project_id`
- `idx_chat_messages_created_at` on `created_at`

### 8. user_skills
Stores user skills and proficiency levels.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique skill identifier |
| user_id | INTEGER | NOT NULL, FOREIGN KEY | User ID |
| skill_name | TEXT | NOT NULL | Name of skill (e.g., React, Python) |
| skill_level | TEXT | DEFAULT 'Beginner' | Proficiency level (Beginner, Intermediate, Advanced, Expert) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | When skill was added |

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE

**Indexes:**
- `idx_user_skills_user_id` on `user_id`
- `idx_user_skills_name` on `skill_name`

## Entity Relationships

### Primary Keys (PK) and Foreign Keys (FK)
users (PK: id)
│
├───< projects (FK: created_by)
│
├───< stories (FK: created_by)
│
├───< tasks (FK: created_by)
│
├───< team_members (FK: user_email)
│
├───< chat_messages (FK: user_id)
│
├───< user_skills (FK: user_id)
│
└───< otp_codes (FK: email)

projects (PK: id)
│
├───< stories (FK: project_id)
│
├───< team_members (FK: project_id)
│
└───< chat_messages (FK: project_id)

stories (PK: id)
│
└───< tasks (FK: story_id)

## Sample Queries

### 1. Get all projects for a user (owner + member)

```sql
SELECT DISTINCT p.*
FROM projects p
LEFT JOIN team_members tm ON p.id = tm.project_id
WHERE p.created_by = ? OR tm.user_email = ?
ORDER BY p.created_at DESC;

2. Get user's task statistics
SELECT 
  COUNT(*) as total_tasks,
  SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as completed_tasks,
  SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
  SUM(CASE WHEN status = 'To Do' THEN 1 ELSE 0 END) as pending_tasks,
  ROUND(CAST(SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as completion_rate
FROM tasks
WHERE assignee = ?;

3. Get project progress
SELECT 
  p.title,
  COUNT(DISTINCT s.id) as total_stories,
  COUNT(DISTINCT t.id) as total_tasks,
  SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) as completed_tasks,
  ROUND(CAST(SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS FLOAT) / 
        NULLIF(COUNT(DISTINCT t.id), 0) * 100, 2) as completion_rate
FROM projects p
LEFT JOIN stories s ON p.id = s.project_id
LEFT JOIN tasks t ON s.id = t.story_id
WHERE p.id = ?
GROUP BY p.id;

4. Get team member performance
SELECT 
  tm.user_email,
  u.name,
  COUNT(t.id) as assigned_tasks,
  SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) as completed_tasks,
  ROUND(CAST(SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS FLOAT) / 
        NULLIF(COUNT(t.id), 0) * 100, 2) as completion_rate
FROM team_members tm
LEFT JOIN users u ON tm.user_email = u.email
LEFT JOIN stories s ON s.project_id = tm.project_id
LEFT JOIN tasks t ON t.story_id = s.id AND t.assignee = tm.user_email
WHERE tm.project_id = ?
GROUP BY tm.user_email;

5. Get overdue tasks
SELECT t.*, s.title as story_title, p.title as project_title
FROM tasks t
JOIN stories s ON t.story_id = s.id
JOIN projects p ON s.project_id = p.id
WHERE t.assignee = ?
  AND t.status != 'Done'
  AND t.deadline IS NOT NULL
  AND date(t.deadline) < date('now');

  Data Types
SQLite Type	Description	Used For
INTEGER	Whole numbers	IDs, counts, flags
TEXT	String data	Names, emails, descriptions
DATETIME	Date and time	created_at, updated_at, deadline
REAL	Floating point numbers	Percentages, averages
Constraints
NOT NULL
Ensures a column cannot have NULL values.

UNIQUE
Ensures all values in a column are different.

DEFAULT
Provides a default value when none is specified.

FOREIGN KEY
Ensures referential integrity between tables.

CHECK (Application-level)
Status values validated in application code.

Migration Strategy
Adding a New Column
ALTER TABLE table_name ADD COLUMN column_name datatype DEFAULT default_value;
Adding an Index
CREATE INDEX idx_name ON table_name(column_name);
Dropping a Table
DROP TABLE IF EXISTS table_name;
Resetting Database
rm -f database/agile.db
node server/models/initDB.js


Backup and Recovery
Backup Database
# Copy database file
cp database/agile.db database/agile_backup_$(date +%Y%m%d).db

Restore Database
# Restore from backup
cp database/agile_backup_20240101.db database/agile.db

Performance Recommendations
Index frequently queried columns

**Avoid SELECT *** (only select needed columns)

Use LIMIT for large result sets

Consider pagination for large tables

Regular VACUUM to reclaim space
-- Optimize database
VACUUM;
ANALYZE;
Database File Location
Development: /database/agile.db
Production: /var/lib/agileflow/agile.db
Environment-Specific Configuration
// Development
const dbPath = path.join(__dirname, "../../database/agile.db");

// Production
const dbPath = process.env.DB_PATH || "/var/lib/agileflow/agile.db";


Documentation Version: 1.0
Last Updated: 2024
Database Version: SQLite 3