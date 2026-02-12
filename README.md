**MERN Multitenant Task Manager**

**Overview**

A complete task management system with tenant isolation, role-based access control, user invitations, and task lifecycle management. Built with modern web technologies for scalability and maintainability.

**Features**

- **Multitenant**: tenant model and tenant-scoped resources.
- **Auth**: register tenant, login, invite users, JWT-based auth.
- **Role-based access**: `admin` and `user` roles with middleware enforcement.
- **Tasks**: create, update, assign, list, soft-delete, and status updates.

**Tech stack**

- **Backend**: Node.js, Express, Mongoose (MongoDB) — see [backend/server.js](backend/server.js)
- **Frontend**: React (Vite) — see `frontend/`
- **Dev**: workspace scripts (root `package.json`) to run frontend and backend concurrently.

**Quick start**

1. Clone the repo:

```bash
git clone https://github.com/Lmda-Lhafi/Tasks_manager_multitenant_api.git
cd Tasks_manager_multitenant_api
```

2. Install dependencies (root workspace):

```bash
npm install
npm run setup
```

3. Create a `.env` in the repo root. See `Environment variables` below for required keys.

4. Start backend and frontend in separate terminals (or use `npm run dev`):

```bash
npm run backend
npm run frontend
# or
npm run dev
```

**Environment variables (.env.example)**

Create a `.env` file at repository root with at least:

```
MONGO_URI=your_mongo_connection_string
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# JWT & invites
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
INVITE_EXPIRES_IN=1d

# Mailer (development)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=you@example.com
MAIL_PASS=yourpass
EMAIL_FROM_NAME="Your App"
EMAIL_FROM=no-reply@example.com
```

These keys are referenced in the code (see [backend/config/db.js](backend/config/db.js), [backend/config/mailer.js](backend/config/mailer.js), and auth controllers).

**API overview**

- Base URL: `/api`
- Auth:
  - `POST /api/auth/register-tenant` — register tenant + admin (public)
  - `POST /api/auth/login` — login (public)
- Users (tenant-scoped, admin only for most actions):
  - `POST /api/user/invite` — invite user (admin)
  - `POST /api/user/accept-invite` — accept invite (public)
  - `GET /api/user` — list tenant users (admin)
  - `PATCH /api/user/:id/status` — update isActive/isDeleted (admin)
- Tasks:
  - `POST /api/task` — create task (admin)
  - `PUT /api/task/:id` — update task (admin)
  - `PATCH /api/task/:id/status` — update only status (assigned user or admin)
  - `GET /api/task` — list tenant tasks (admin)
  - `GET /api/task/me` — list tasks assigned to current user
  - `DELETE /api/task/:id` — soft-delete task (admin)

For route implementations see `backend/routes/*` and controllers in `backend/controllers/`.

**Models (summary)**

- `Tenant` — minimal schema with `name`, `status`, soft-delete fields ([backend/models/tenant.model.js](backend/models/tenant.model.js)).
- `User` — fields: `name`, `email`, `password`, `role`, `tenant`, `isActive`, soft-delete ([backend/models/user.model.js](backend/models/user.model.js)).
- `Task` — `title`, `description`, `status`, `tenant`, `assignedUsers`, `createdBy`, soft-delete ([backend/models/task.model.js](backend/models/task.model.js)).

**Auth & security notes**

- JWT is used for authentication (`process.env.JWT_SECRET`). Tokens are issued in `auth.controll.js` and `user.controll.js`.
- Role enforcement via `middleware/role.middleware.js` and authentication in `middleware/auth.middleware.js`.

**Development tips & troubleshooting**

- Ensure MongoDB is accessible via `MONGO_URI` before starting the backend.
- If CORS/FRONTEND_URL issues appear, check `FRONTEND_URL` in `.env` and `backend/server.js`.
- Use `npm run setup` to install workspace dependencies.

**Future improvements**

- Implement refresh tokens and secure httpOnly cookie authentication.
- Add pagination and filtering for lists.
- Upgrade to a full Role-Based Access Control (RBAC) system with dedicated Role model, permission-based authorization, custom roles per tenant, and dynamic permission management (currently uses simplified `admin`/`user` enum).

**Notes**

The current role system was kept simple for MVP clarity. The architecture supports future RBAC expansion without major refactoring.

**Contributing**

Contributions welcome — please fork the repo, make a feature branch, and open a PR with a clear description and tests.

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


