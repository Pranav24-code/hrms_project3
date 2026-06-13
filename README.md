# HRMS & Payroll Dashboard Suite

A comprehensive, full-stack Human Resource Management System (HRMS) and Payroll Dashboard designed to streamline HR administration, manage employee profiles, track attendance, handle leave approvals, and process payroll securely.

---

## 🏗️ Architecture Overview

This project is built using a decoupled client-server architecture:
- **Frontend (`/frontend`)**: A high-performance single-page application (SPA) built using React, Vite, TypeScript, and styled with Tailwind CSS and shadcn/ui.
- **Backend (`/server`)**: A RESTful API built on Node.js and Express.js, connected to a MongoDB database for persistence.

---

## 🛠️ Prerequisites & Requirements

Ensure you have the following installed on your machine before setting up the application:

1. **Node.js**: Version `18.x` or higher (LTS recommended)
2. **Package Manager**: `npm` (v9+) or `yarn` / `pnpm`
3. **Database**: MongoDB (Local community server running on port `27017` or a MongoDB Atlas connection string)

---

## 📂 Project Structure

```text
hrms_project3/
├── frontend/               # React Client application
│   ├── public/             # Static assets
│   ├── src/                # React Source Code
│   │   ├── components/     # UI Components (layout/ui)
│   │   ├── constants/      # Client-side mock data & static constants
│   │   ├── context/        # React Contexts (AuthContext)
│   │   ├── hooks/          # Custom hooks (useAuth, etc.)
│   │   ├── layouts/        # Layout shells (MainLayout)
│   │   ├── pages/          # App Pages (Dashboard, Employees, Leave, Payroll, etc.)
│   │   ├── types/          # TypeScript declarations
│   │   └── App.tsx         # Route router and page shells
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite bundler configuration
│
└── server/                 # Express Backend server
    ├── controllers/        # Request handlers & logic (auth controller)
    ├── middleware/         # Custom Express middlewares (auth guards)
    ├── models/             # Mongoose schemas (user.model.js)
    ├── routes/             # Express routes (auth.route.js)
    ├── index.js            # Entry point of Express server
    └── package.json        # Backend dependencies
```

---

## 🚀 Setup & Installation Instructions

Follow these steps to run both frontend and backend services:

### 1. Backend Setup (`/server`)

Navigate to the server directory and set up configuration:
```bash
cd server
```

Install backend dependencies:
```bash
npm install
```

Configure your environment variables:
- Create a `.env` file based on `.env.example`:
  ```bash
  cp .env.example .env
  ```
- Open `.env` and configure your settings:
  ```env
  PORT=5000
  MONGO_URI=mongodb://localhost:27017/hrms_db
  JWT_SECRET=your_jwt_secret_key_here
  NODE_ENV=development
  ```

Start the backend server in development mode (runs with `nodemon` for auto-reload):
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

### 2. Frontend Setup (`/frontend`)

Open a new terminal window, navigate to the frontend directory:
```bash
cd frontend
```

Install frontend dependencies:
```bash
npm install
```

Configure environment variables:
- Create a `.env` file based on `.env.example`:
  ```bash
  cp .env.example .env
  ```

Start the Vite development server:
```bash
npm run dev
```
The client app will launch at `http://localhost:5173/` (or the next available port).

---

## 🔑 Default Authentication Credentials (Mock Mode)

In the frontend's mock auth mode, you can log in using:
- **HR Manager Dashboard**:
  - Email: `hr@nexahr.com`
  - Password: `Admin@123`
- **Employee Portal**:
  - Email: `employee@nexahr.com` (or any email containing `"employee"` or `"john"`)
  - Password: Any password

---

## 📄 License
This application is proprietary software. All rights reserved.
