# LearnSphere Dashboard

This project is a dashboard for the LearnSphere e-learning platform. It consists of a React frontend and a Node.js/Express backend.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Getting Started

### 1. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
npm run dev
```

The backend server must be running for the application to function correctly. It listens on port 3000 by default.

### 2. Frontend Setup

Open a new terminal window and navigate to the root directory (`dashboard-src`):

```bash
# Ensure you are in the root directory (dashboard-src)
npm install
npm run dev
```

The frontend application uses Vite and will start on port 5173 (or another available port).

## Usage

Once both servers are running, open your browser and go to:
[http://localhost:5173](http://localhost:5173)

### Default Login
- **Guest Access**: Click on "Guest Access" on the login screen.
- **Admin Access**: 
  - Email: `admin@learnsphere.com`
  - Password: `password`

## Project Structure

- `src/`: Frontend React source code.
- `backend/`: Node.js/Express backend API.
- `backend/src/server.js`: Main backend entry point.
- `backend/prisma/`: Database schema and migrations.
