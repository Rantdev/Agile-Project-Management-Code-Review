# API Documentation

## Base URL
Development: http://localhost:5000/api
Production: https://yourdomain.com/api


## Authentication

All protected endpoints require a Bearer token in the Authorization header:
Authorization: Bearer <your_jwt_token>

---

## Authentication Endpoints

### Register User
Creates a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
Response:
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
Login User
Authenticates a user and returns JWT token.

Endpoint: POST /auth/login
Request Body:
{
  "email": "john@example.com",
  "password": "123456"
}
Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member"
  }
}
Google Login
Authenticates user via Google OAuth.

Endpoint: POST /auth/google
Request Body:
{
  "token": "google_oauth_token"
}
Response:
{
  "success": true,
  "message": "Google login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
Get Current User
Returns authenticated user information.

Endpoint: GET /auth/me

Headers: Authorization: Bearer <token>
Response:
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "is_verified": true
  }
}
Project Endpoints
Get All Projects
Returns all projects for the authenticated user.

Endpoint: GET /projects

Headers: Authorization: Bearer <token>
Response:
{
  "success": true,
  "projects": [
    {
      "id": 1,
      "title": "E-commerce Website",
      "description": "Build a modern e-commerce platform",
      "status": "Active",
      "created_by": 1,
      "role": "owner",
      "team_count": 5,
      "story_count": 8,
      "task_count": 24
    }
  ]
}
Create Project
Creates a new project.

Endpoint: POST /projects

Headers: Authorization: Bearer <token>
Request Body:
{
  "title": "Mobile App Development",
  "description": "Develop a cross-platform mobile app",
  "status": "Planning"
}
Response:
{
  "success": true,
  "message": "Project created successfully",
  "project": {
    "id": 2,
    "title": "Mobile App Development",
    "description": "Develop a cross-platform mobile app",
    "status": "Planning",
    "created_by": 1
  }
}
Get Project by ID
Returns a specific project.

Endpoint: GET /projects/:id

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "project": {
    "id": 1,
    "title": "E-commerce Website",
    "description": "Build a modern e-commerce platform",
    "status": "Active",
    "created_by": 1,
    "story_count": 8,
    "team_count": 5,
    "task_count": 24
  }
}
Update Project
Updates an existing project.

Endpoint: PUT /projects/:id

Headers: Authorization: Bearer <token>

Request Body:
{
  "title": "Updated Project Title",
  "description": "Updated description",
  "status": "Completed"
}
Response:
{
  "success": true,
  "message": "Project updated successfully"
}
Delete Project
Deletes a project and all associated data.

Endpoint: DELETE /projects/:id

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Project deleted successfully"
}
Story Endpoints
Get Stories by Project
Returns all stories for a specific project.

Endpoint: GET /stories/project/:projectId

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "stories": [
    {
      "id": 1,
      "project_id": 1,
      "title": "User Authentication",
      "description": "Implement login and registration",
      "status": "In Progress",
      "created_at": "2024-01-15 10:00:00"
    }
  ]
}
Create Story
Creates a new user story.

Endpoint: POST /stories

Headers: Authorization: Bearer <token>

Request Body:
{
  "project_id": 1,
  "title": "Payment Integration",
  "description": "Integrate payment gateway",
  "status": "To Do"
}
Response:
{
  "success": true,
  "message": "Story created successfully",
  "story": {
    "id": 2,
    "project_id": 1,
    "title": "Payment Integration",
    "description": "Integrate payment gateway",
    "status": "To Do"
  }
}
Update Story
Updates an existing story.

Endpoint: PUT /stories/:id

Headers: Authorization: Bearer <token>

Request Body:
{
  "title": "Updated Story Title",
  "description": "Updated description",
  "status": "Done"
}
Response:
{
  "success": true,
  "message": "Story updated successfully"
}
Delete Story
Deletes a story and all associated tasks.

Endpoint: DELETE /stories/:id

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Story deleted successfully"
}
Task Endpoints
Get My Tasks
Returns all tasks assigned to the authenticated user.

Endpoint: GET /tasks/my-tasks

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "tasks": [
    {
      "id": 1,
      "story_id": 1,
      "title": "Design Login Page",
      "assignee": "john@example.com",
      "deadline": "2024-01-20",
      "status": "In Progress",
      "story_title": "User Authentication",
      "project_title": "E-commerce Website"
    }
  ]
}
Get Tasks by Story
Returns all tasks for a specific story.

Endpoint: GET /tasks/story/:storyId

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "tasks": [
    {
      "id": 1,
      "story_id": 1,
      "title": "Design Login Page",
      "assignee": "john@example.com",
      "deadline": "2024-01-20",
      "status": "In Progress"
    }
  ]
}
Create Task
Creates a new task.

Endpoint: POST /tasks

Headers: Authorization: Bearer <token>

Request Body:
{
  "story_id": 1,
  "title": "Implement API Endpoints",
  "assignee": "jane@example.com",
  "deadline": "2024-01-25",
  "status": "To Do"
}
Response:
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "id": 2,
    "story_id": 1,
    "title": "Implement API Endpoints",
    "assignee": "jane@example.com",
    "deadline": "2024-01-25",
    "status": "To Do"
  }
}
Update Task
Updates an existing task (status only for non-owners).

Endpoint: PUT /tasks/:id

Headers: Authorization: Bearer <token>

Request Body:
{
  "status": "Done"
}
Response:
{
  "success": true,
  "message": "Task updated successfully"
}
Delete Task
Deletes a task (Owner only).

Endpoint: DELETE /tasks/:id

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Task deleted successfully"
}
Team Endpoints
Get Team Members
Returns all team members for a project.

Endpoint: GET /team/:projectId

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "members": [
    {
      "id": 1,
      "user_email": "john@example.com",
      "role": "Developer",
      "joined_at": "2024-01-10 09:00:00"
    }
  ]
}
Add Team Member
Adds a new member to the project (Owner only).

Endpoint: POST /team

Headers: Authorization: Bearer <token>

Request Body:
{
  "project_id": 1,
  "user_email": "newmember@example.com",
  "role": "Tester"
}
Response:
{
  "success": true,
  "message": "Member added successfully",
  "member": {
    "id": 2,
    "project_id": 1,
    "user_email": "newmember@example.com",
    "role": "Tester"
  }
}
Remove Team Member
Removes a member from the project (Owner only).

Endpoint: DELETE /team/:id

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Member removed successfully"
}
Chat Endpoints
Get Project Messages
Returns chat messages for a project.

Endpoint: GET /chat/:projectId

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "project_id": 1,
      "user_id": 1,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "message": "Hello team!",
      "created_at": "2024-01-15 14:30:00"
    }
  ]
}
Chat Endpoints
Get Project Messages
Returns chat messages for a project.

Endpoint: GET /chat/:projectId

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "project_id": 1,
      "user_id": 1,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "message": "Hello team!",
      "created_at": "2024-01-15 14:30:00"
    }
  ]
}
Send Message
Sends a chat message to the project.

Endpoint: POST /chat/:projectId

Headers: Authorization: Bearer <token>

Request Body:
{
  "message": "Meeting at 3 PM"
}
Response:
{
  "success": true,
  "message": "Message sent",
  "chatMessage": {
    "id": 2,
    "project_id": 1,
    "user_id": 1,
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "message": "Meeting at 3 PM",
    "created_at": "2024-01-15 14:31:00"
  }
}
Delete Message
Deletes a chat message (Owner only).

Endpoint: DELETE /chat/:messageId

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Message deleted"
}
Performance Endpoints
Get User Performance
Returns performance metrics for a user.

Endpoint: GET /performance/user/:userId

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "performance": {
    "total_tasks": 25,
    "completed_tasks": 18,
    "in_progress_tasks": 5,
    "pending_tasks": 2,
    "completion_rate": 72,
    "overdue_tasks": 1,
    "total_projects_involved": 3,
    "total_stories_contributed": 8
  }
}
Get Team Performance
Returns team performance metrics for a project.

Endpoint: GET /performance/team/:projectId

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "teamPerformance": {
    "overview": {
      "project_name": "E-commerce Website",
      "total_members": 5,
      "total_stories": 8,
      "total_tasks": 24,
      "completed_tasks": 15,
      "project_completion_rate": 62.5,
      "overdue_tasks": 3
    },
    "members": [
      {
        "user_email": "john@example.com",
        "name": "John Doe",
        "role": "Developer",
        "assigned_tasks": 12,
        "completed_tasks": 8,
        "completion_rate": 66.67
      }
    ]
  }
}
Get Company Analytics
Returns company-wide analytics.

Endpoint: GET /performance/company/analytics

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "analytics": {
    "total_users": 15,
    "total_projects": 8,
    "total_stories": 45,
    "total_tasks": 120,
    "completed_tasks": 78,
    "overall_completion_rate": 65,
    "total_overdue_tasks": 12,
    "avg_tasks_per_user": 8,
    "topPerformers": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "total_tasks": 25,
        "completed_tasks": 20,
        "completion_rate": 80
      }
    ]
  }
}
Profile Endpoints
Get User Profile
Returns user profile information.

Endpoint: GET /profile/:userId

Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "profile": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Full-stack developer",
    "department": "Engineering",
    "phone": "+1234567890",
    "location": "New York",
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "role": "UI Developer",
    "skills": [
      { "name": "React", "level": "Advanced" },
      { "name": "Node.js", "level": "Intermediate" }
    ]
  }
}
Update Profile
Updates user profile information.

Endpoint: PUT /profile/:userId

Headers: Authorization: Bearer <token>

Request Body:
{
  "name": "John Updated",
  "bio": "Senior full-stack developer",
  "phone": "+1987654321",
  "location": "San Francisco",
  "github": "https://github.com/johndoe-updated",
  "linkedin": "https://linkedin.com/in/johndoe-updated"
}
Response:
{
  "success": true,
  "message": "Profile updated successfully"
}
Setup User Role
Sets up user role during registration.

Endpoint: POST /profile/setup-role

Headers: Authorization: Bearer <token>

Request Body:
{
  "role": "UI Developer",
  "department": "Engineering",
  "skills": [
    { "name": "React", "level": "Advanced" },
    { "name": "TypeScript", "level": "Intermediate" }
  ]
}
Response:
{
  "success": true,
  "message": "Role setup completed successfully"
}
OTP Endpoints
Send OTP
Sends OTP to user's email for verification.

Endpoint: POST /otp/send

Request Body:
{
  "email": "john@example.com"
}
Response:
{
  "success": true,
  "message": "OTP sent to john@example.com",
  "expiresIn": 10,
  "needsOTP": true
}
Verify OTP
Verifies OTP code and marks user as verified.

Endpoint: POST /otp/verify

Request Body:
{
  "email": "john@example.com",
  "otpCode": "123456"
}
Response:
{
  "success": true,
  "message": "Email verified successfully",
  "isVerified": true
}
Resend OTP
Resends OTP to user's email.

Endpoint: POST /otp/resend

Request Body:
{
  "email": "john@example.com"
}
Response:
{
  "success": true,
  "message": "OTP resent to john@example.com",
  "expiresIn": 10
}
Error Responses
All endpoints return errors in the following format:
{
  "success": false,
  "error": "Error message description"
}
Common HTTP Status Codes
Status Code	Description
200	Success
201	Created successfully
400	Bad request (invalid input)
401	Unauthorized (invalid token)
403	Forbidden (insufficient permissions)
404	Resource not found
429	Too many requests (rate limit)
500	Internal server error
Rate Limiting
Window: 15 minutes

Max requests: 100 per window

Applied to: All API endpoints
{
  "success": false,
  "error": "Too many requests, please try again later."
}
Versioning
Current API Version: v1

Base URL includes version: /api

Changelog
v1.0.0 (Current)
Initial release

Authentication with JWT

Project, Story, Task CRUD

Team management

Real-time chat

Performance analytics

Profile management

OTP verification

Email notifications