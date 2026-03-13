# CampusConnect — Complete Project Plan & Technical Design Document

## 1. Project Overview

CampusConnect is an **AI-powered collaboration platform designed specifically for engineering colleges**.
It provides a **centralized ecosystem where students can discover events, find hackathon teammates, collaborate on projects in real time, and trade engineering equipment within their campus community.**

Currently, these activities happen across **multiple disconnected platforms** such as WhatsApp groups, Google Docs, random chats, and external marketplaces. CampusConnect unifies these workflows into **one platform built specifically for college ecosystems**.

---

# 2. Problem Statement

Engineering colleges face several fragmented collaboration problems.

### 1. Event Communication is Inefficient

Event committees must manually send announcements to multiple departments through:

* WhatsApp groups
* Posters
* Email chains

This results in:

* delayed communication
* missed opportunities for students
* lack of centralized event information

---

### 2. Hackathon Team Formation is Difficult

Students struggle to find teammates with the right skills.

Current methods:

* WhatsApp messages
* random friend groups
* last-minute team formation

Problems:

* skills mismatch
* weak teams
* missed opportunities for collaboration

---

### 3. Lack of Real-Time Collaboration Tools

When teams form, they typically use scattered tools:

* WhatsApp for chat
* Google Docs for planning
* Draw.io for diagrams
* Discord for calls

This causes:

* fragmented communication
* poor coordination
* inefficient brainstorming

---

### 4. No Trusted Marketplace for Engineering Items

Students frequently need to buy or sell:

* Arduino kits
* Sensors
* robotics components
* engineering textbooks

Current options:

* OLX
* random campus groups

Problems:

* unsafe transactions
* unreliable sellers
* no campus verification

---

# 3. Proposed Solution

CampusConnect provides **one unified platform** with four major modules.

### 1. Smart Event Board

Centralized platform where college committees can post events once and notify all students instantly.

### 2. Resume-Powered Team Finder

Students upload resumes and AI extracts skills to create smart profiles. Teams can discover members based on skills and compatibility.

### 3. Live Collaboration Room

Each team gets a collaborative workspace with chat, whiteboard, tasks, file sharing, and voice communication.

### 4. Campus Engineering Marketplace

A campus-only marketplace for buying and selling engineering equipment safely.

---

# 4. Target Users

### Students

* discover events
* find teammates
* collaborate on projects
* buy/sell engineering items

### Event Committees

* create events
* broadcast announcements
* manage registrations

### College Administration

* moderate marketplace
* manage platform users
* monitor campus activity

---

# 5. Key Features

## 5.1 Authentication & College Verification

Students must sign up using **college email domains**.

Example:

```
student@vjti.ac.in
student@iitb.ac.in
```

The system automatically maps the email domain to the correct college workspace.

Each college operates in its **own isolated environment**.

---

# 5.2 AI Resume Parsing

Students upload resumes.

AI extracts:

* skills
* projects
* technologies
* hackathon experience

Example extracted data:

```
Skills: React, Node.js, Python
Projects: AI Chatbot
Preferred Role: Backend Developer
```

This data is stored in the student profile.

---

# 5.3 Skill-Based Team Finder

Students can search teammates by:

* skills
* technologies
* roles

Example search:

```
React Developer
Machine Learning Engineer
UI Designer
```

Students can:

* view profiles
* send connection requests
* invite teammates

---

# 5.4 Smart Event Board

Admins create events through a dashboard.

Example event:

```
Title: AI Hackathon 2026
Date: April 12
Location: College Auditorium
Prize: ₹50,000
```

AI generates event announcement text automatically.

Students receive notifications.

---

# 5.5 Collaboration Room

Each team gets a **dedicated workspace** containing:

### Team Chat

Real-time messaging between team members.

### Task Board

Kanban board for project planning.

```
To Do
In Progress
Completed
```

### Whiteboard

Collaborative brainstorming board using Excalidraw.

### Voice Communication

Audio meetings via Jitsi integration.

### File Sharing

Upload and share project files.

### AI Assistant

Helps generate ideas, architecture suggestions, and debugging help.

---

# 5.6 Campus Marketplace

Students can post listings:

```
Arduino UNO — ₹500
DSA Book — ₹300
Raspberry Pi — ₹1200
```

Features:

* item listing
* seller contact
* buyer-seller chat
* mark item as sold

Transactions occur offline on campus.

---

# 6. AI Features in the Platform

### Resume Skill Extraction

Automatically extracts skills from resumes.

### Team Matching

Recommends teammates based on skill compatibility.

### Event Announcement Generation

Generates engaging event announcements.

### Collaboration Assistant

Helps teams brainstorm ideas and architecture.

### Skill Recommendations

Suggests technologies students should learn next.

---

# 7. Technology Stack

## Frontend

* Next.js
* Tailwind CSS
* ShadCN UI
* TanStack Query
* Zustand

---

## Backend

* Node.js
* Express.js
* REST APIs

---

## Database

* PostgreSQL
* Prisma ORM
* Neon (cloud PostgreSQL)

---

## Realtime Features

* Socket.IO

Used for:

* chat
* notifications
* whiteboard sync

---

## Whiteboard

* Excalidraw

Used for:

* diagrams
* brainstorming
* architecture sketches

---

## Voice Communication

* Jitsi Meet

Used for:

* team voice calls

---

## AI Integration

* Claude API / Gemini API

Used for:

* resume parsing
* team matching
* collaboration assistant

---

## File Storage

* Cloudinary

Used for:

* resumes
* marketplace images
* profile pictures

---

# 8. System Architecture

```
Students
   │
   ▼
Next.js Frontend
   │
   ├── REST APIs
   ├── Socket.IO
   │
   ▼
Node.js Backend
   │
   ├── PostgreSQL Database
   ├── AI APIs
   ├── Cloudinary
   │
   ▼
Neon PostgreSQL Cloud
```

---

# 9. Database Design

Main tables:

```
colleges
users
skills
connections
teams
team_members
events
tasks
messages
boards
marketplace_listings
notifications
```

Relationships:

```
College
   │
Users
   │
Teams
   │
Collaboration Rooms
```

---

# 10. Frontend Project Structure

Example Next.js structure:

```
app/
 ├─ dashboard/
 ├─ events/
 ├─ team-finder/
 ├─ collaboration/
 ├─ marketplace/
 ├─ profile/
 └─ admin/

components/
 ├─ event-card
 ├─ user-profile
 ├─ team-card
 ├─ marketplace-card
 ├─ whiteboard
 └─ chat

stores/
 ├─ userStore
 ├─ socketStore

services/
 ├─ api
 ├─ auth
 ├─ events
 ├─ teams
 └─ marketplace
```

---

# 11. Backend Project Structure

```
server/
 ├─ controllers/
 ├─ routes/
 ├─ middleware/
 ├─ services/
 ├─ prisma/
 ├─ sockets/
 └─ utils/

controllers/
 ├─ authController
 ├─ eventController
 ├─ teamController
 ├─ marketplaceController
```

---

# 12. Expected Impact

CampusConnect will create a **digital collaboration ecosystem for engineering colleges**.

Benefits:

* faster event communication
* better hackathon teams
* improved collaboration
* safe campus marketplace
* stronger student innovation culture

---

# 13. Future Improvements

Possible future features:

* internship matching
* project showcase
* alumni mentorship
* campus startup network
* inter-college collaboration

---

# 14. Conclusion

CampusConnect transforms how engineering students **connect, collaborate, and innovate** by providing a unified platform designed specifically for campus ecosystems.

By combining **AI-powered discovery, real-time collaboration tools, and campus marketplaces**, the platform enables students to work together more efficiently and build stronger technical communities.
