# CampusConnect

A full-stack campus social platform that connects students within their college — built with Node.js, React, Socket.io, and Groq AI.

![Dashboard](images/Dashbord.png)

---

## Features

### Phase 1 — Quick Wins
| Feature | Description |
|---|---|
| 📢 Campus Announcements | Committee/admin posts campus-wide announcements with category badges (Academic, Placements, Events, General). Real-time broadcast via Socket.io. |
| 🏠 Dashboard | Personalized dashboard with upcoming events, pinned announcements, activity feed, stats row, quick actions, and AI recommendations. |
| 📰 Activity Feed | Live campus feed tracking resource uploads, new connections, event creation, and project launches. |

### Phase 2 — Infrastructure
| Feature | Description |
|---|---|
| 🎓 Campus Admin Dashboard | Campus admins manage students (roles, suspend), view analytics, and post announcements — scoped to their own campus. |
| 📅 Event Attendance QR | Organizers open attendance and display a QR code. Students scan to mark themselves present. Attendee list visible to organizer. |

### Phase 3 — Core USP
| Feature | Description |
|---|---|
| 🎯 Project Showcase | Students publish projects with tech stack, GitHub/demo links, and images. Campus gallery with tech filter and likes. |
| 🤖 AI Team Matching | Enter required skills and get top 5 campus matches ranked by skill overlap percentage, powered by Groq AI. |
| 🔍 AI Notes Search | PDFs uploaded as resources are automatically summarized by Groq AI. Summaries are stored and searched alongside titles. |

### Phase 4 — Retention
| Feature | Description |
|---|---|
| 🏆 Gamification | Points awarded for uploads (+20), projects (+15), attendance (+10), connections (+5). Badges: Resource Hero, Showcase Star, Well Connected. Campus leaderboard. |
| 🧑‍💼 Placement Prep Hub | Share and browse interview experiences (company, role, difficulty, outcome, tips) and job/internship opportunities. Upvotes and company filter. |

### Phase 5 — Advanced
| Feature | Description |
|---|---|
| 📊 Smart Recommendations | Personalized "For You" feed on Dashboard: recommended events, resources, and teammates based on skills and branch. |
| 📍 Lost & Found | Post lost or found items with optional photo. Filter by type and status. Mark as resolved. |
| 🕐 Study Rooms | Create Pomodoro-based study rooms. Shared synchronized timer (focus/break phases) across all members via Socket.io. |

### Core Platform
| Feature | Description |
|---|---|
| 🔐 Auth | Register/login with role selection. JWT-based auth. Campus isolation — users only see data from their own college. |
| 🤝 Team Finder | Post team requests with required roles and skills. Browse open teams. |
| 🛍️ Marketplace | Buy/sell items within campus. Image upload via Cloudinary. |
| 🔗 Connections | Send/accept connection requests. Mutual connection feed. |
| 📅 Events | Committee creates events. Students register. Real-time notification on creation. |
| 📄 Resume AI | Upload PDF resume → Groq AI extracts skills, education, experience, summary. Fire-and-forget with real-time completion notification. |
| 💬 Messaging | Real-time direct messaging between connected users. |
| 🖼️ Workspace | Collaborative whiteboard (tldraw) with live sync + Jitsi voice call. |
| 📚 Resources | Upload notes/PDFs (stored on AWS S3). Campus-scoped browsing with AI summary search. |
| 🛡️ Super Admin | Platform-wide management: campuses, users, roles, analytics. |

---

## Tech Stack

### Backend
- **Runtime:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Real-time:** Socket.io
- **Auth:** JWT (`jsonwebtoken` + `bcryptjs`)
- **File Storage:** AWS S3 (resources/notes), Cloudinary (images, lost & found, projects)
- **AI:** Groq API via OpenAI-compatible SDK (`llama-3.1-8b-instant`) + `pdf-parse`
- **Validation:** express-validator

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Data Fetching:** TanStack Query v5
- **State:** Zustand (persisted to localStorage)
- **Routing:** React Router v6
- **Real-time:** socket.io-client
- **Whiteboard:** @tldraw/tldraw
- **QR Code:** qrcode.react

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

---

## Project Structure

```
CampusConnect/
├── backend/
│   └── src/
│       ├── config/         # DB, Cloudinary, Socket.io, Groq AI
│       ├── controllers/    # Route handlers (23 controllers)
│       ├── middleware/     # Auth (protect, restrictTo)
│       ├── models/         # Mongoose schemas (17 models)
│       ├── routes/         # Express routers (19 route files)
│       ├── scripts/        # createSuperAdmin.js seed script
│       ├── utils/          # logActivity helper
│       └── index.js        # HTTP server + Socket.io init
└── frontend/
    └── src/
        ├── components/     # Navbar, Sidebar, admin/, campus-admin/
        ├── hooks/          # useAuth, useSocket
        ├── pages/          # All page components (27 pages)
        ├── services/       # Axios API calls (20 service files)
        ├── store/          # Zustand stores (userStore, adminStore)
        └── App.jsx         # Routes + global socket init
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- AWS S3 bucket
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repository

```bash
git clone <repo-url>
cd CampusConnect
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/campusconnect

# Auth
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Cloudinary (images, lost & found, project images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AWS S3 (resource/notes file storage)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name

# Groq AI (resume parsing + resource AI summaries)
GROK_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# Super Admin seed (optional — defaults shown)
SUPER_ADMIN_EMAIL=admin@campusconnect.io
SUPER_ADMIN_PASSWORD=admin123
SUPER_ADMIN_NAME=Super Admin
```

Start the backend:

```bash
npm run dev
```

### 3. Seed the Super Admin

```bash
cd backend
node src/scripts/createSuperAdmin.js
```

Default credentials: `admin@campusconnect.io` / `admin123`

### 4. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `AWS_REGION` | Yes | AWS region for S3 |
| `AWS_ACCESS_KEY_ID` | Yes | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS secret key |
| `AWS_S3_BUCKET_NAME` | Yes | S3 bucket for resource uploads |
| `GROK_API_KEY` | No | Groq API key (`gsk_...`) — disables AI if missing |
| `SUPER_ADMIN_EMAIL` | No | Seed script super admin email |
| `SUPER_ADMIN_PASSWORD` | No | Seed script super admin password |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL (e.g. `http://localhost:5000/api`) |

---

## User Roles

| Role | Access |
|---|---|
| `student` | Default role. Access to all student features. |
| `committee` | Can create events and post announcements. |
| `campusAdmin` | Campus admin dashboard — manage students, analytics. |
| `admin` | Reserved (same as campusAdmin for most purposes). |
| `superAdmin` | Platform-wide access — manage all campuses and users. Login at `/admin/login`. |

---

## API Overview

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/events
POST   /api/events                    (committee)
POST   /api/events/:id/attendance/open
POST   /api/events/:id/attendance/mark

GET    /api/projects
POST   /api/projects
POST   /api/projects/:id/like

GET    /api/teams/match?skills=...    (AI team matching)

GET    /api/placement/interviews
POST   /api/placement/interviews
GET    /api/placement/opportunities
POST   /api/placement/opportunities

GET    /api/leaderboard
GET    /api/leaderboard/me

GET    /api/lost-found
POST   /api/lost-found
PATCH  /api/lost-found/:id/resolve

GET    /api/study-rooms
POST   /api/study-rooms
POST   /api/study-rooms/:id/join
POST   /api/study-rooms/:id/timer/:action

GET    /api/recommendations
GET    /api/resources
GET    /api/announcements
GET    /api/activity
GET    /api/connections

GET    /api/campus-admin/analytics    (campusAdmin)
GET    /api/campus-admin/students     (campusAdmin)

POST   /api/admin/login               (superAdmin)
GET    /api/admin/campuses            (superAdmin)
GET    /api/admin/analytics           (superAdmin)
```

---

## Real-time Events (Socket.io)

| Event | Direction | Description |
|---|---|---|
| `announcement:new` | Server → Client | New campus announcement |
| `activity:new` | Server → Client | New campus activity |
| `event:new` | Server → Client | New event created |
| `project:new` | Server → Client | New project published |
| `studyroom:timer_update` | Server → Client | Timer state sync |
| `studyroom:member_joined` | Server → Client | Member joined room |
| `resume:analyzed` | Server → Client | AI resume extraction complete |
| `workspace:draw` | Bidirectional | Whiteboard sync |

Socket rooms: `college:${collegeId}`, `user:${userId}`, `studyroom:${roomId}`

---

## Screenshots

| Landing Page | Dashboard |
|---|---|
| ![Landing](images/gemini%20landing%20page.png) | ![Dashboard](images/Dashbord.png) |
