# Dissertation Registration Web Application

A modern web application designed to streamline the dissertation coordination request process for academic institutions.

## Overview

This application handles the complete registration workflow for dissertation coordination requests, providing an intuitive interface for students and professors. Built with a Single Page Application (SPA) architecture, it's accessible from desktop, mobile devices, and tablets.

## Features

- **User Roles**: Students and Professors with role-specific dashboards
- **Registration Sessions**: Professors can create time-bounded sessions for accepting students
- **Coordination Requests**: Students can request coordination from professors
- **Document Management**: Upload and review signed coordination documents
- **Request Workflow**: Full approval/rejection workflow with notifications
- **Responsive Design**: Mobile-first design that works on all devices

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for database access
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Multer** - File upload handling

## Project Structure

```
/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── auth/              # Authentication forms
│   ├── student/           # Student dashboard components
│   ├── professor/         # Professor dashboard components
│   └── ui/                # Reusable UI components
├── lib/                    # Utilities and API client
├── backend/               # Express.js REST API
│   ├── config/            # Database configuration
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── scripts/           # Database scripts
│   └── uploads/           # Uploaded files
└── public/                # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database server
- pnpm (recommended) or npm

### Database Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE dissertation_db;
```

2. Note your PostgreSQL credentials (host, port, username, password)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dissertation_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secure_random_string
JWT_EXPIRES_IN=24h

PORT=5000
NODE_ENV=development
```

5. Initialize the database:
```bash
npm run db:sync
```

6. (Optional) Seed sample data:
```bash
npm run db:seed
```

7. Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. From the project root, install dependencies:
```bash
pnpm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Verify the API URL in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update profile
- `PUT /api/auth/password` - Change password

### Sessions
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/active` - Get active sessions
- `GET /api/sessions/:id` - Get session details
- `GET /api/sessions/professor/my` - Get professor's sessions
- `POST /api/sessions` - Create session (professors)
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Requests
- `GET /api/requests` - Get user's requests
- `GET /api/requests/stats` - Get request statistics
- `GET /api/requests/:id` - Get request details
- `POST /api/requests` - Create request (students)
- `PUT /api/requests/:id/approve` - Approve request (professors)
- `PUT /api/requests/:id/reject` - Reject request (professors)
- `DELETE /api/requests/:id` - Cancel request (students)

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/request/:requestId` - Get documents for request
- `GET /api/documents/:id/download` - Download document
- `PUT /api/documents/:id/accept` - Accept document (professors)
- `PUT /api/documents/:id/reject` - Reject document (professors)

## Sample Users (after seeding)

**Professors:**
- maria.ionescu@university.edu / password123
- alexandru.popescu@university.edu / password123
- elena.dumitrescu@university.edu / password123

**Students:**
- andrei.stan@student.edu / password123
- ioana.marin@student.edu / password123
- mihai.popa@student.edu / password123

## Usage Workflow

### For Students
1. Register/Login as a student
2. Browse active registration sessions
3. Submit coordination requests with dissertation topic
4. Wait for professor approval
5. Once approved, upload signed coordination document
6. Wait for document acceptance

### For Professors
1. Register/Login as a professor
2. Create registration sessions with dates and slots
3. Review incoming coordination requests
4. Approve or reject requests (with justification)
5. Review uploaded documents
6. Accept or reject documents (student must reupload if rejected)

## Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Configure production database credentials
3. Use process manager like PM2
4. Set up reverse proxy (nginx)

### Frontend Deployment
1. Build the application: `pnpm build`
2. Deploy to Vercel, Netlify, or similar platform
3. Configure `NEXT_PUBLIC_API_URL` to production API

## Contributors

- Trușcă Fabian
- Sohbetov Nurmuhammet
