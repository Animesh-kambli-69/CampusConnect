campusconnect/
│
├── client/                     # Frontend (Next.js App)
│
│   ├── app/                    # Next.js App Router
│   │
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing page
│   │
│   │   ├── dashboard/          # Main dashboard
│   │   │   └── page.tsx
│   │
│   │   ├── events/             # Event board
│   │   │   ├── page.tsx
│   │   │   └── [eventId]/
│   │   │       └── page.tsx
│   │
│   │   ├── team-finder/        # Team discovery
│   │   │   ├── page.tsx
│   │   │   └── [userId]/
│   │   │       └── page.tsx
│   │
│   │   ├── collaboration/      # Team workspace
│   │   │   └── [teamId]/
│   │   │       ├── page.tsx
│   │   │       ├── chat/
│   │   │       ├── whiteboard/
│   │   │       ├── tasks/
│   │   │       └── voice/
│   │
│   │   ├── marketplace/        # Buy / sell items
│   │   │   ├── page.tsx
│   │   │   └── [itemId]/
│   │   │       └── page.tsx
│   │
│   │   ├── profile/
│   │   │   └── page.tsx
│   │
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── page.tsx
│   │   │   ├── events/
│   │   │   └── users/
│   │
│   │   └── auth/
│   │       ├── login/
│   │       └── register/
│
│   ├── components/             # Reusable UI components
│   │
│   │   ├── ui/                 # Generic UI
│   │   │   ├── button.tsx
│   │   │   ├── modal.tsx
│   │   │   └── card.tsx
│   │
│   │   ├── events/
│   │   │   └── EventCard.tsx
│   │
│   │   ├── teams/
│   │   │   └── TeamCard.tsx
│   │
│   │   ├── marketplace/
│   │   │   └── ItemCard.tsx
│   │
│   │   ├── chat/
│   │   │   └── ChatWindow.tsx
│   │
│   │   ├── whiteboard/
│   │   │   └── ExcalidrawCanvas.tsx
│   │
│   │   └── profile/
│   │       └── UserProfileCard.tsx
│
│   ├── hooks/                  # Custom React hooks
│   │
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   └── useTeam.ts
│
│   ├── stores/                 # Zustand stores
│   │
│   │   ├── userStore.ts
│   │   ├── socketStore.ts
│   │   └── teamStore.ts
│
│   ├── services/               # API calls
│   │
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── eventService.ts
│   │   ├── teamService.ts
│   │   └── marketplaceService.ts
│
│   ├── utils/
│   │   ├── constants.ts
│   │   └── helpers.ts
│
│   └── styles/
│       └── globals.css
│
│
├── server/                     # Backend (Node + Express)
│
│   ├── src/
│   │
│   │   ├── index.ts            # Server entry point
│   │   ├── app.ts
│   │
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   ├── cloudinary.ts
│   │   │   └── ai.ts
│   │
│   │   ├── routes/
│   │   │
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── event.routes.ts
│   │   │   ├── team.routes.ts
│   │   │   ├── marketplace.routes.ts
│   │   │   ├── collaboration.routes.ts
│   │   │   └── ai.routes.ts
│   │
│   │   ├── controllers/
│   │   │
│   │   │   ├── auth.controller.ts
│   │   │   ├── event.controller.ts
│   │   │   ├── team.controller.ts
│   │   │   ├── marketplace.controller.ts
│   │   │   ├── collaboration.controller.ts
│   │   │   └── ai.controller.ts
│   │
│   │   ├── services/
│   │   │
│   │   │   ├── auth.service.ts
│   │   │   ├── resumeParser.service.ts
│   │   │   ├── teamMatch.service.ts
│   │   │   ├── event.service.ts
│   │   │   ├── marketplace.service.ts
│   │   │   └── notification.service.ts
│   │
│   │   ├── middleware/
│   │   │
│   │   │   ├── auth.middleware.ts
│   │   │   ├── admin.middleware.ts
│   │   │   └── error.middleware.ts
│   │
│   │   ├── sockets/            # Real-time communication
│   │   │
│   │   │   ├── index.ts
│   │   │   ├── chat.socket.ts
│   │   │   └── whiteboard.socket.ts
│   │
│   │   ├── utils/
│   │   │
│   │   │   ├── email.ts
│   │   │   ├── logger.ts
│   │   │   └── helpers.ts
│   │
│   │   └── types/
│   │       └── index.ts
│
│   └── package.json
│
│
├── prisma/                     # Database ORM
│
│   ├── schema.prisma
│   └── migrations/
│
│
├── shared/                     # Shared types between client/server
│
│   ├── types/
│   │   ├── user.ts
│   │   ├── event.ts
│   │   ├── team.ts
│   │   └── marketplace.ts
│
│   └── constants/
│
│
├── docs/                       # Project documentation
│
│   ├── architecture.md
│   ├── api-spec.md
│   └── database-schema.md
│
│
├── .env
├── docker-compose.yml
├── package.json
└── README.md