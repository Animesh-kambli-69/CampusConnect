# Design Document

## Overview

The CampusConnect backend is a Node.js/Express REST API with real-time capabilities built using Socket.IO. The system provides authentication, AI-powered features, real-time collaboration, and a campus marketplace for engineering college students.

The architecture follows a layered approach with clear separation of concerns:
- API Layer (routes and controllers)
- Service Layer (business logic)
- Data Layer (Prisma ORM with PostgreSQL)
- Real-time Layer (Socket.IO)
- External Services (Cloudinary, AI APIs)

The backend ensures college isolation, meaning students can only interact with users, events, and marketplace items from their own college, verified through email domain authentication.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS / WebSocket
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Express API Server                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routes     │→ │ Controllers  │→ │   Services   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  Middleware  │  │  Socket.IO   │                    │
│  └──────────────┘  └──────────────┘                    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │PostgreSQL│  │Cloudinary│  │ AI APIs │
   │  (Neon)  │  │         │  │Claude/  │
   │          │  │         │  │Gemini   │
   └─────────┘  └─────────┘  └─────────┘
```

### Layered Architecture Pattern

1. **Presentation Layer (Routes)**: Defines API endpoints and request/response handling
2. **Controller Layer**: Validates input, orchestrates service calls, formats responses
3. **Service Layer**: Contains business logic, interacts with database and external services
4. **Data Access Layer**: Prisma ORM for type-safe database operations
5. **Real-time Layer**: Socket.IO for bidirectional communication

### College Isolation Strategy

Every data query and operation is scoped to the user's college:
- User's college ID is extracted from JWT token
- Database queries include `collegeId` filter
- Middleware enforces college-level access control
- Cross-college data access is prevented at the database level

## Components and Interfaces

### 1. Authentication System

**Components:**
- `auth.routes.ts`: Defines `/auth/register` and `/auth/login` endpoints
- `auth.controller.ts`: Handles registration and login logic
- `auth.service.ts`: Business logic for user creation and validation
- `auth.middleware.ts`: JWT verification for protected routes

**Flow:**
```
Registration:
Client → POST /auth/register
      → Validate email domain
      → Check if college exists (create if not)
      → Hash password with bcrypt
      → Create user in database
      → Generate JWT token
      → Return token + user data

Login:
Client → POST /auth/login
      → Validate credentials
      → Compare password hash
      → Generate JWT token
      → Return token + user data
```

**Interfaces:**
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    collegeId: string;
    role: 'STUDENT' | 'ADMIN';
  };
}
```

### 2. User Profile and Resume Parsing

**Components:**
- `user.routes.ts`: Profile endpoints
- `user.controller.ts`: Profile management
- `resumeParser.service.ts`: AI-powered resume extraction
- `ai.service.ts`: Integration with Claude/Gemini APIs

**Resume Parsing Flow:**
```
Client → POST /users/upload-resume (multipart/form-data)
      → Upload file to Cloudinary
      → Extract text from PDF
      → Send to AI API with structured prompt
      → Parse AI response (JSON format)
      → Save skills to database
      → Return extracted data
```

**AI Prompt Structure:**
```
Extract the following from this resume:
- Skills (array of strings)
- Projects (array with name and description)
- Technologies (array of strings)
- Experience level
- Preferred role

Return as JSON.
```

**Interfaces:**
```typescript
interface ResumeData {
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  experience: string;
  preferredRole: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  resumeUrl?: string;
  skills: Skill[];
  projects: Project[];
  collegeId: string;
}
```

### 3. Event Management System

**Components:**
- `event.routes.ts`: Event CRUD endpoints
- `event.controller.ts`: Event operations
- `event.service.ts`: Event business logic
- `notification.service.ts`: Event notifications

**Event Creation Flow:**
```
Admin → POST /events
     → Verify admin role
     → Validate event data
     → Upload banner to Cloudinary (if provided)
     → Create event in database
     → Generate AI announcement (optional)
     → Create notifications for all college students
     → Return event data
```

**Interfaces:**
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  bannerUrl?: string;
  collegeId: string;
  createdBy: string;
  registrations: EventRegistration[];
}

interface EventRegistration {
  userId: string;
  eventId: string;
  registeredAt: Date;
}
```

### 4. Team Finder and Matching

**Components:**
- `team.routes.ts`: Team and connection endpoints
- `team.controller.ts`: Team operations
- `teamMatch.service.ts`: AI-powered team matching
- `connection.service.ts`: Connection management

**Team Matching Algorithm:**
```
Input: User's skills and preferences
Process:
1. Query all users from same college
2. Calculate skill compatibility score
3. Consider complementary skills (frontend + backend)
4. Rank by compatibility
5. Return top matches

Scoring:
- Shared skills: +10 points
- Complementary skills: +15 points
- Similar experience level: +5 points
```

**Interfaces:**
```typescript
interface Connection {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  collegeId: string;
  members: TeamMember[];
  createdAt: Date;
}

interface TeamMember {
  userId: string;
  teamId: string;
  role?: string;
  joinedAt: Date;
}
```

### 5. Real-Time Chat System

**Components:**
- `chat.socket.ts`: Socket.IO event handlers
- `message.service.ts`: Message persistence
- Socket events: `join-room`, `send-message`, `receive-message`

**Chat Flow:**
```
User connects → Socket.IO handshake
           → Verify JWT token
           → Join team room
           → Load chat history
           
User sends message → Validate team membership
                  → Save to database
                  → Broadcast to room
                  → Emit to all connected clients
```

**Socket Events:**
```typescript
// Client → Server
socket.emit('join-room', { teamId: string })
socket.emit('send-message', { teamId: string, content: string })

// Server → Client
socket.on('receive-message', { 
  id: string,
  content: string,
  senderId: string,
  senderName: string,
  timestamp: Date 
})
socket.on('user-joined', { userId: string, userName: string })
socket.on('user-left', { userId: string })
```

**Interfaces:**
```typescript
interface Message {
  id: string;
  content: string;
  senderId: string;
  teamId: string;
  createdAt: Date;
  sender: {
    name: string;
    email: string;
  };
}
```

### 6. Collaboration Workspace

**Components:**
- `task.routes.ts`: Task management endpoints
- `task.controller.ts`: Task CRUD operations
- `file.routes.ts`: File upload endpoints
- `board.service.ts`: Whiteboard state management

**Task Management:**
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assigneeId?: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**File Upload Flow:**
```
Client → POST /teams/:teamId/files
      → Verify team membership
      → Upload to Cloudinary
      → Save file metadata to database
      → Return file URL
```

### 7. Whiteboard Synchronization

**Components:**
- `whiteboard.socket.ts`: Real-time whiteboard sync
- `board.service.ts`: Board state persistence

**Whiteboard Flow:**
```
User draws → Emit 'board-update' event
          → Broadcast to all team members
          → Debounced save to database (every 5 seconds)

User joins → Load latest board state from database
          → Render on canvas
```

**Socket Events:**
```typescript
socket.emit('board-update', { 
  teamId: string, 
  elements: ExcalidrawElement[] 
})

socket.on('board-sync', { 
  elements: ExcalidrawElement[] 
})
```

**Interfaces:**
```typescript
interface Board {
  id: string;
  teamId: string;
  state: string; // JSON stringified Excalidraw state
  updatedAt: Date;
}
```

### 8. Campus Marketplace

**Components:**
- `marketplace.routes.ts`: Listing endpoints
- `marketplace.controller.ts`: Marketplace operations
- `marketplace.service.ts`: Listing business logic

**Listing Flow:**
```
Seller → POST /marketplace
      → Validate listing data
      → Upload images to Cloudinary
      → Create listing in database
      → Return listing data

Buyer → GET /marketplace
     → Filter by college
     → Return active listings
```

**Interfaces:**
```typescript
interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  sellerId: string;
  collegeId: string;
  status: 'ACTIVE' | 'SOLD' | 'DELETED';
  createdAt: Date;
  seller: {
    name: string;
    email: string;
  };
}
```

### 9. Notification System

**Components:**
- `notification.service.ts`: Notification creation and delivery
- `notification.routes.ts`: Notification endpoints

**Notification Types:**
- Team invite
- Connection request
- Event announcement
- Marketplace inquiry

**Interfaces:**
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'TEAM_INVITE' | 'CONNECTION_REQUEST' | 'EVENT' | 'MARKETPLACE';
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}
```

### 10. Admin System

**Components:**
- `admin.routes.ts`: Admin endpoints
- `admin.middleware.ts`: Admin role verification
- `admin.controller.ts`: Admin operations

**Admin Capabilities:**
- View all college users
- Ban/unban users
- Delete marketplace listings
- Manage events
- View platform analytics

## Data Models

### Prisma Schema Overview

```prisma
model College {
  id        String   @id @default(uuid())
  name      String
  domain    String   @unique
  users     User[]
  events    Event[]
  teams     Team[]
  listings  MarketplaceListing[]
  createdAt DateTime @default(now())
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  password     String
  name         String
  role         Role     @default(STUDENT)
  collegeId    String
  college      College  @relation(fields: [collegeId], references: [id])
  resumeUrl    String?
  banned       Boolean  @default(false)
  skills       Skill[]
  teams        TeamMember[]
  messages     Message[]
  notifications Notification[]
  listings     MarketplaceListing[]
  createdAt    DateTime @default(now())
}

model Skill {
  id     String @id @default(uuid())
  name   String
  userId String
  user   User   @relation(fields: [userId], references: [id])
}

model Team {
  id          String       @id @default(uuid())
  name        String
  description String?
  leaderId    String
  collegeId   String
  college     College      @relation(fields: [collegeId], references: [id])
  members     TeamMember[]
  messages    Message[]
  tasks       Task[]
  board       Board?
  createdAt   DateTime     @default(now())
}

model TeamMember {
  userId   String
  teamId   String
  role     String?
  user     User     @relation(fields: [userId], references: [id])
  team     Team     @relation(fields: [teamId], references: [id])
  joinedAt DateTime @default(now())
  
  @@id([userId, teamId])
}

model Event {
  id          String   @id @default(uuid())
  title       String
  description String
  date        DateTime
  location    String
  bannerUrl   String?
  collegeId   String
  college     College  @relation(fields: [collegeId], references: [id])
  createdBy   String
  createdAt   DateTime @default(now())
}

model Message {
  id        String   @id @default(uuid())
  content   String
  senderId  String
  sender    User     @relation(fields: [senderId], references: [id])
  teamId    String
  team      Team     @relation(fields: [teamId], references: [id])
  createdAt DateTime @default(now())
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  assigneeId  String?
  teamId      String
  team        Team       @relation(fields: [teamId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Board {
  id        String   @id @default(uuid())
  teamId    String   @unique
  team      Team     @relation(fields: [teamId], references: [id])
  state     String   @db.Text
  updatedAt DateTime @updatedAt
}

model MarketplaceListing {
  id          String          @id @default(uuid())
  title       String
  description String
  price       Float
  images      String[]
  sellerId    String
  seller      User            @relation(fields: [sellerId], references: [id])
  collegeId   String
  college     College         @relation(fields: [collegeId], references: [id])
  status      ListingStatus   @default(ACTIVE)
  createdAt   DateTime        @default(now())
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id])
  type      NotificationType
  title     String
  message   String
  read      Boolean          @default(false)
  metadata  Json?
  createdAt DateTime         @default(now())
}

enum Role {
  STUDENT
  ADMIN
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum ListingStatus {
  ACTIVE
  SOLD
  DELETED
}

enum NotificationType {
  TEAM_INVITE
  CONNECTION_REQUEST
  EVENT
  MARKETPLACE
}
```

## Error Handling

### Error Response Format

All errors follow a consistent structure:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Error Types

1. **Validation Errors (400)**
   - Invalid input data
   - Missing required fields
   - Format errors

2. **Authentication Errors (401)**
   - Invalid credentials
   - Expired token
   - Missing token

3. **Authorization Errors (403)**
   - Insufficient permissions
   - Cross-college access attempt
   - Admin-only resource

4. **Not Found Errors (404)**
   - Resource doesn't exist
   - Invalid ID

5. **Server Errors (500)**
   - Database errors
   - External service failures
   - Unexpected errors

### Error Middleware

```typescript
// Global error handler
app.use((err, req, res, next) => {
  logger.error(err);
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details
      }
    });
  }
  
  // Default 500 error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

## Testing Strategy

### Unit Testing

Test individual services and utilities:
- Authentication logic
- Resume parsing
- Team matching algorithm
- Validation functions

**Tools:** Jest, ts-jest

### Integration Testing

Test API endpoints with database:
- Auth flow (register → login)
- Event creation and retrieval
- Team operations
- Marketplace CRUD

**Tools:** Jest, Supertest, test database

### Real-Time Testing

Test Socket.IO events:
- Chat message delivery
- Whiteboard synchronization
- Connection handling

**Tools:** Socket.IO client for testing

### Test Structure

```
server/
  ├─ src/
  └─ tests/
      ├─ unit/
      │   ├─ services/
      │   └─ utils/
      ├─ integration/
      │   ├─ auth.test.ts
      │   ├─ events.test.ts
      │   ├─ teams.test.ts
      │   └─ marketplace.test.ts
      └─ socket/
          ├─ chat.test.ts
          └─ whiteboard.test.ts
```

### Test Coverage Goals

- Services: 80%+ coverage
- Controllers: 70%+ coverage
- Routes: 90%+ coverage (critical paths)

## Security Considerations

### Authentication Security

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens with expiration (24 hours)
- Refresh token mechanism for extended sessions
- Rate limiting on auth endpoints (5 attempts per 15 minutes)

### Authorization

- Role-based access control (STUDENT, ADMIN)
- College-level data isolation
- Team membership verification for workspace access
- Admin middleware for protected routes

### Input Validation

- Sanitize all user inputs
- Validate email formats
- Check file types and sizes for uploads
- Prevent SQL injection (Prisma parameterized queries)
- XSS protection (escape HTML in user content)

### API Security

- CORS configuration (whitelist frontend domain)
- Helmet.js for security headers
- Rate limiting on all endpoints
- Request size limits
- HTTPS only in production

### File Upload Security

- Validate file types (PDF for resumes, images for marketplace)
- Limit file sizes (5MB for resumes, 2MB per image)
- Scan for malicious content
- Use Cloudinary's security features

## Performance Optimization

### Database Optimization

- Index frequently queried fields (email, collegeId, teamId)
- Use database connection pooling
- Implement pagination for list endpoints
- Optimize N+1 queries with Prisma includes

### Caching Strategy

- Cache college data (rarely changes)
- Cache user profiles (invalidate on update)
- Redis for session storage (future enhancement)

### Real-Time Optimization

- Debounce whiteboard updates (save every 5 seconds)
- Limit message history loaded (last 100 messages)
- Use Socket.IO rooms for efficient broadcasting

### API Response Optimization

- Compress responses with gzip
- Return only necessary fields
- Implement field selection (GraphQL-style in future)

## Deployment Architecture

### Environment Configuration

```
Development:
- Local PostgreSQL or Neon dev database
- Local file storage (development mode)
- Mock AI responses

Production:
- Neon PostgreSQL (cloud)
- Cloudinary for file storage
- Real AI API integration
- Environment variables for secrets
```

### Environment Variables

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
AI_API_KEY=...
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://campusconnect.com
```

### Deployment Steps

1. Build TypeScript: `npm run build`
2. Run migrations: `npx prisma migrate deploy`
3. Start server: `npm start`
4. Health check endpoint: `GET /health`

### Monitoring

- Log all errors to file/service
- Track API response times
- Monitor database query performance
- Alert on high error rates

## API Documentation

### Base URL

```
Development: http://localhost:5000/api
Production: https://api.campusconnect.com/api
```

### Authentication Header

```
Authorization: Bearer <JWT_TOKEN>
```

### Key Endpoints

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

**Users:**
- `GET /users/me` - Get current user profile
- `GET /users/:id` - Get user by ID
- `POST /users/upload-resume` - Upload resume
- `POST /ai/parse-resume` - Parse resume with AI

**Events:**
- `GET /events` - List events
- `GET /events/:id` - Get event details
- `POST /events` - Create event (admin)
- `POST /ai/event-announcement` - Generate announcement

**Teams:**
- `GET /users?skill=<skill>` - Search users by skill
- `POST /connections` - Send connection request
- `GET /connections` - Get connections
- `POST /teams` - Create team
- `POST /teams/:id/join` - Join team
- `GET /teams/:id` - Get team details

**Collaboration:**
- `POST /tasks` - Create task
- `GET /tasks/team/:teamId` - Get team tasks
- `POST /teams/:teamId/files` - Upload file
- `POST /boards/save` - Save whiteboard state

**Marketplace:**
- `GET /marketplace` - List items
- `GET /marketplace/:id` - Get item details
- `POST /marketplace` - Create listing
- `PATCH /marketplace/:id/sold` - Mark as sold

**Notifications:**
- `GET /notifications` - Get user notifications
- `PATCH /notifications/:id/read` - Mark as read

**Admin:**
- `GET /admin/users` - List all users
- `PATCH /admin/users/:id/ban` - Ban user
- `DELETE /admin/listing/:id` - Delete listing

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

