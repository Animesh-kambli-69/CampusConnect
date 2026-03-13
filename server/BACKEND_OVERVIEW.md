# CampusConnect Backend MVP — Implementation Overview

This document summarizes the complete backend implementation for the CampusConnect platform. The backend is built using **Node.js, Express, TypeScript, Prisma (PostgreSQL), and Socket.IO**, and is fully completed and compiling with zero TypeScript errors.

## 🏗️ Architecture & Stack

- **Runtime:** Node.js (v18+)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma
- **Real-time:** Socket.IO
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **File Storage:** Cloudinary (configured)
- **AI Integration:** Gemini/Claude (configured)

## 🗄️ Database Schema (13 Models)

The Prisma schema (`prisma/schema.prisma`) enforces the core platform rule: **Strict College Isolation**. Users, Teams, Events, and Marketplace Listings are all bound to a specific `collegeId`, ensuring students only interact within their campus.

1. **College**: Auto-created based on email domains.
2. **User**: Students and Admins.
3. **Skill**: Extracted from resumes (AI) or added manually.
4. **Connection**: Peer-to-peer networking (Pending/Accepted/Rejected).
5. **Team**: Project and hackathon teams.
6. **TeamMember**: Junction table handling roles (Leader/Member).
7. **Event**: Campus events created by admins.
8. **EventRegistration**: Tracks student sign-ups.
9. **Message**: Real-time team chat messages.
10. **Task**: Kanban board tasks for teams.
11. **Board**: Real-time collaborative whiteboard state (JSON).
12. **MarketplaceListing**: Buy/sell items on campus.
13. **Notification**: System alerts (invites, events, connections).

## 🔌 API Modules & Endpoints (30+ Routes)

All routes (except Auth) are protected by JWT middleware.

| Module | Purpose | Key Endpoints |
|--------|---------|---------------|
| **Auth** | Registration, Login, JWT | `POST /register`, `POST /login` |
| **Users** | Profiles, Skill Search | `GET /me`, `GET /search?skill=X` |
| **Events** | Campus events, Sign-ups | `POST /` (Admin), `POST /:id/register` |
| **Teams** | Creation, Joining | `POST /`, `POST /:id/join` |
| **Connections** | Networking requests | `POST /`, `PATCH /:id/accept` |
| **Marketplace** | Buy/sell listings | `POST /`, `PATCH /:id/sold` |
| **Collaboration**| Task Kanban, Whiteboard | `POST /tasks`, `POST /boards/save` |
| **Notifications**| Read/Unread alerts | `GET /`, `PATCH /read-all` |
| **AI** | Intelligent features | `/parse-resume`, `/team-match` |
| **Admin** | Moderation | `PATCH /users/:id/ban`, `DELETE /listings/:id` |

## ⚡ Real-Time Features (Socket.IO)

The `sockets/` directory handles real-time bidirectional communication, strictly gated by JWT authentication during connection handshakes.

1. **Team Chat (`chat.socket.ts`)**
   - **Events:** `join-room`, `send-message`, `leave-room`
   - **Functionality:** Verifies team membership, loads the last 100 messages from the database upon joining, and broadcasts new messages to all active room members while saving them to PostgreSQL.

2. **Collaborative Whiteboard (`whiteboard.socket.ts`)**
   - **Events:** `join-board`, `board-update`, `leave-board`
   - **Functionality:** Broadcasts drawing updates to team members in real-time. Employs a **5-second debounced save mechanism** to persist the Excalidraw JSON state to the database without overwhelming the DB with constant write requests.

## 🛡️ Security & Error Handling

- **Error Middleware**: A global `AppError` class catches all operational errors, Prisma database violations, and Zod validation failures, returning a consistent `{ success: false, error: { message, code } }` JSON structure.
- **Middleware Protections**:
  - `cors` configured for specific frontend origins.
  - `helmet` applied for standard HTTP security headers.
  - Express JSON body parser limited to `10mb` to prevent payload abuse.
  - Explicit Admin-only middleware for destructive actions.

## 🚀 Next Steps (Ready for Frontend)

The backend is structurally complete. To run the server and begin frontend integration:

1. Copy `.env.example` to `.env` and fill in the Neon PostgreSQL URL and JWT secrets.
2. Run database migrations: `npx prisma migrate dev`.
3. Start the server: `npm run dev` (runs on port 5000).
4. Utilize tools like Postman to hit the endpoints and integrate them into the Next.js frontend pages.
