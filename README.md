
# MERN Task Manager - Multitenant

This is a full-stack MERN project with a **shared node_modules setup** for both backend and frontend.

## Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd Tasks_manager_multitenant
```

2. **Install dependencies (once)**

```bash
npm install
```

> This installs all dependencies in the root `node_modules`.
> No need to install separately in `frontend/` if all required packages are listed in the root `package.json`.

---

## Running the Project

### Start Backend

```bash
npm run backend
```

### Start Frontend

Open a **new terminal** and run:

```bash
npm run frontend
```

> Make sure backend and frontend are running in separate terminals.


* Node.js version >= 16 recommended.
* MongoDB must be running or accessible through your connection string.
* Do not commit `.env` or `node_modules` to Git.

npm run frontend  # Start frontend (in another terminal)
