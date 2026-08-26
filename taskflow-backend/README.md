# TaskFlow — Backend API

A production-ready RESTful API for TaskFlow, a collaborative project management system with **workspaces**, two-tier RBAC (workspace + project level), rich task management (type / priority / due date / assignee), file attachments, project notes, and a workspace-level activity feed.

## Tech Stack
- **Node.js + Express.js** (ES Modules)
- **MongoDB + Mongoose**
- **JWT** — access + refresh tokens, httpOnly cookies
- **Nodemailer** — email verification, password reset (Mailtrap-ready)
- **Multer** — file uploads (served from `/public/images`)
- **express-validator** — input validation

## Data Model

```
Workspace ──< WorkspaceMember >── User
    │
    └──< Project ──< ProjectMember >── User
             │
             ├──< Task ──> User (assignee)
             │      └──< SubTask
             ├──< ProjectNote
             └──< Activity
```

## RBAC

### Workspace-level roles
| Role | Permissions |
|---|---|
| OWNER | Full control — update/delete workspace, manage all members |
| ADMIN | Add/remove members, create/manage projects |
| MEMBER | View workspace, join projects |

### Project-level roles
| Role | Permissions |
|---|---|
| admin | Full control over the project |
| project_admin | Create/update tasks, manage project members |
| member | View and update tasks, add subtasks/notes |

## Setup

```bash
npm install
cp .env.sample .env     # fill in MONGO_URI, token secrets, Mailtrap SMTP
npm run dev             # http://localhost:8000
```

## API Reference

All protected routes require `Authorization: Bearer <accessToken>` or the `accessToken` cookie.

### Auth — `/api/v1/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register, sends verification email |
| POST | `/login` | — | Login, returns tokens |
| GET | `/verify-email/:token` | — | Verify email |
| POST | `/refresh-token` | — | Refresh access token |
| POST | `/forgot-password` | — | Send reset email |
| POST | `/reset-password/:token` | — | Reset password |
| POST | `/logout` | ✅ | Logout |
| GET | `/current-user` | ✅ | Get logged-in user |
| POST | `/resend-email-verification` | ✅ | Resend verification |
| POST | `/change-password` | ✅ | Change password |

### Workspaces — `/api/v1/workspaces`
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/` | member+ | List user's workspaces |
| POST | `/` | any | Create workspace |
| GET | `/:workspaceId` | member+ | Get workspace with projects + members |
| PUT | `/:workspaceId` | owner/admin | Update workspace |
| DELETE | `/:workspaceId` | owner | Delete workspace |
| GET | `/:workspaceId/stats` | member+ | Dashboard stats (projects, tasks, overdue) |
| GET | `/:workspaceId/activity` | member+ | Recent activity feed |
| GET | `/:workspaceId/members` | member+ | List members |
| POST | `/:workspaceId/members` | owner/admin | Add member by email |
| PUT | `/:workspaceId/members/:userId` | owner/admin | Update member role |
| DELETE | `/:workspaceId/members/:userId` | owner/admin | Remove member |

### Projects — `/api/v1/workspaces/:workspaceId/projects`
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/` | ws-member | List projects |
| POST | `/` | ws-member | Create project |
| GET | `/:projectId` | proj-member | Get project with tasks + members |
| PUT | `/:projectId` | admin/proj-admin | Update project |
| DELETE | `/:projectId` | admin | Delete project |
| GET | `/:projectId/members` | proj-member | List project members |
| POST | `/:projectId/members` | admin/proj-admin | Add member |
| PUT | `/:projectId/members/:userId` | admin/proj-admin | Update role |
| DELETE | `/:projectId/members/:userId` | admin/proj-admin | Remove member |

### Tasks — `/api/v1/workspaces/:workspaceId/projects/:projectId/tasks`
| Method | Path | Description |
|---|---|---|
| GET | `/` | List tasks (supports `?status=&type=&priority=&assignee=`) |
| POST | `/` | Create task (multipart — field `attachments`) |
| GET | `/:taskId` | Get task + subtasks |
| PUT | `/:taskId` | Update task |
| DELETE | `/:taskId` | Delete task + subtasks |
| POST | `/:taskId/subtasks` | Create subtask |
| PUT | `/:taskId/subtasks/:subTaskId` | Update subtask / toggle `isCompleted` |
| DELETE | `/:taskId/subtasks/:subTaskId` | Delete subtask |

**Task fields:** `title`, `description`, `status` (TODO/IN_PROGRESS/DONE), `type` (TASK/BUG/FEATURE/IMPROVEMENT/OTHER), `priority` (LOW/MEDIUM/HIGH), `due_date` (ISO 8601), `assignee` (user ObjectId)

### Notes — `/api/v1/workspaces/:workspaceId/projects/:projectId/notes`
| Method | Path | Description |
|---|---|---|
| GET | `/` | List notes |
| POST | `/` | Create note |
| PUT | `/:noteId` | Update note |
| DELETE | `/:noteId` | Delete note |
