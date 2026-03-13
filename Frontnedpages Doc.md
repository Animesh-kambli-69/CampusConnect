# CampusConnect — Frontend Pages Documentation

## 1. Introduction

This document outlines the **complete list of frontend pages required for the CampusConnect platform**. These pages cover all major modules of the system including authentication, event discovery, team formation, collaboration workspace, marketplace, and administrative controls.

The goal of this document is to provide a **clear UI roadmap** so the frontend team can start designing and implementing the user interface efficiently.

CampusConnect will be built using **Next.js App Router**, therefore each page corresponds to a route inside the `app/` directory.

---

# 2. Public Pages (Before Login)

These pages are accessible to all users before authentication.

## 2.1 Landing Page

Route:

```
/
```

Purpose:

The landing page introduces the platform and explains its benefits to students and event committees.

Sections included:

* Hero section (platform introduction)
* Feature overview
* How the platform works
* Call-to-action buttons (Register / Login)

Key UI components:

* Navigation bar
* Feature cards
* Call-to-action buttons

---

## 2.2 Login Page

Route:

```
/auth/login
```

Purpose:

Allows existing users to log into the platform.

UI elements:

* Email input
* Password input
* Login button
* Forgot password link

Validation:

* Email format validation
* Password authentication

---

## 2.3 Register Page

Route:

```
/auth/register
```

Purpose:

Allows new students to create accounts using their **college email address**.

Form fields:

* Full name
* College email
* Password
* Confirm password
* Resume upload

Features:

* Email verification
* Resume upload for AI skill extraction

---

# 3. Student Dashboard

After login, students are redirected to the main dashboard.

## 3.1 Dashboard

Route:

```
/dashboard
```

Purpose:

Central overview of all platform activities.

Sections included:

* Upcoming events
* Suggested teammates
* User teams
* Marketplace highlights
* Notifications

Example widgets:

* Hackathon announcements
* Team requests
* Item listings
* collaboration updates

---

# 4. Event Module

This module allows students to discover and participate in campus events.

## 4.1 Event Board

Route:

```
/events
```

Purpose:

Displays all events organized within the student’s college.

Event card contains:

* Event title
* Date
* Location
* Prize pool
* Register button

Students can browse and open detailed event pages.

---

## 4.2 Event Details Page

Route:

```
/events/[eventId]
```

Purpose:

Displays full details of a selected event.

Information displayed:

* Event banner
* Event description
* Date and time
* Venue
* Organizer details
* Participant list
* Registration button

---

# 5. Team Finder Module

This module helps students find teammates based on skills.

## 5.1 Team Finder Page

Route:

```
/team-finder
```

Purpose:

Allows students to discover other students based on their skills.

Search filters include:

* Skills (React, Python, ML etc.)
* Department
* Role preference
* Hackathon experience

Results are shown as student profile cards.

Each card includes:

* Name
* Skills
* Projects
* Connect button

---

## 5.2 Student Profile Page

Route:

```
/team-finder/[userId]
```

Purpose:

Displays detailed information about a student.

Information shown:

* Student name
* Department
* Skills
* Projects
* Hackathon experience
* Resume link

Actions available:

* Send connection request
* Invite to team
* Message student

---

# 6. Collaboration Workspace

Each team gets a dedicated workspace to collaborate on projects.

## 6.1 Team Workspace

Route:

```
/collaboration/[teamId]
```

Purpose:

Central workspace for team members.

Tabs inside workspace:

* Chat
* Whiteboard
* Tasks
* Files
* Voice communication
* AI assistant

---

## 6.2 Team Chat

Route:

```
/collaboration/[teamId]/chat
```

Purpose:

Allows team members to communicate in real time.

Features:

* real-time messaging
* message history
* typing indicator

---

## 6.3 Whiteboard Page

Route:

```
/collaboration/[teamId]/whiteboard
```

Purpose:

Provides a collaborative drawing board for brainstorming and diagram creation.

Tools available:

* shapes
* arrows
* freehand drawing
* text notes

Implemented using **Excalidraw**.

---

## 6.4 Tasks Page

Route:

```
/collaboration/[teamId]/tasks
```

Purpose:

Allows teams to organize project tasks using a Kanban board.

Columns include:

* To Do
* In Progress
* Completed

Students can assign tasks to teammates.

---

## 6.5 Files Page

Route:

```
/collaboration/[teamId]/files
```

Purpose:

Allows teams to upload and share project files.

Supported files:

* documents
* images
* datasets
* design assets

Files are stored in cloud storage.

---

## 6.6 Voice Communication Page

Route:

```
/collaboration/[teamId]/voice
```

Purpose:

Allows team members to talk using voice meetings.

Voice communication is embedded using **Jitsi Meet**.

---

# 7. Marketplace Module

The marketplace allows students to buy and sell engineering equipment within their college.

## 7.1 Marketplace Feed

Route:

```
/marketplace
```

Purpose:

Displays all available items for sale within the campus.

Item card includes:

* item image
* title
* price
* seller name
* view details button

---

## 7.2 Create Listing Page

Route:

```
/marketplace/create
```

Purpose:

Allows students to post items for sale.

Form fields include:

* item name
* price
* condition
* description
* images

---

## 7.3 Item Details Page

Route:

```
/marketplace/[itemId]
```

Purpose:

Displays full details of an item.

Information includes:

* item images
* price
* condition
* seller information
* message seller button

---

# 8. User Profile Module

## 8.1 My Profile Page

Route:

```
/profile
```

Purpose:

Displays the logged-in user’s information.

Information shown:

* name
* skills
* projects
* resume
* teams
* connections

Users can edit their profile information.

---

## 8.2 Connections Page

Route:

```
/profile/connections
```

Purpose:

Shows all connection requests and accepted connections.

Sections include:

* pending requests
* accepted connections

Users can accept or reject requests.

---

# 9. Notifications Page

Route:

```
/notifications
```

Purpose:

Displays platform notifications.

Examples include:

* event announcements
* team invitations
* marketplace messages
* connection requests

---

# 10. Admin Dashboard

Admins are typically student committee members responsible for managing campus events.

## 10.1 Admin Dashboard

Route:

```
/admin
```

Purpose:

Overview of platform activity.

Statistics shown:

* total students
* active events
* marketplace listings

---

## 10.2 Create Event Page

Route:

```
/admin/events/create
```

Purpose:

Allows admins to create new campus events.

Fields include:

* event title
* date
* location
* description
* banner upload

AI can generate event announcements automatically.

---

## 10.3 Manage Events Page

Route:

```
/admin/events
```

Purpose:

Allows admins to manage all events.

Actions available:

* edit event
* delete event
* view participants

---

## 10.4 Manage Users Page

Route:

```
/admin/users
```

Purpose:

Allows admins to monitor users.

Actions available:

* view student accounts
* assign admin roles
* ban suspicious accounts

---

# 11. Complete Page List

```
/
 /auth/login
 /auth/register
 /dashboard
 /events
 /events/[eventId]
 /team-finder
 /team-finder/[userId]
 /collaboration/[teamId]
 /collaboration/[teamId]/chat
 /collaboration/[teamId]/whiteboard
 /collaboration/[teamId]/tasks
 /collaboration/[teamId]/files
 /collaboration/[teamId]/voice
 /marketplace
 /marketplace/create
 /marketplace/[itemId]
 /profile
 /profile/connections
 /notifications
 /admin
 /admin/events
 /admin/events/create
 /admin/users
```

Total pages required: **approximately 24 pages**.

---

# 12. Recommended Development Order

To accelerate development during a hackathon, the UI should be built in the following order:

1. Landing Page
2. Login / Register
3. Dashboard
4. Event Board
5. Team Finder
6. Student Profile
7. Collaboration Workspace
8. Marketplace
9. Admin Dashboard

This order ensures the **core platform functionality becomes usable early**.

---

# 13. Conclusion

This document provides a **complete roadmap for frontend page development** in CampusConnect.

By implementing these pages, the platform will support:

* campus event discovery
* skill-based teammate matching
* collaborative project workspaces
* campus marketplace transactions

This structure ensures the UI remains **organized, scalable, and easy to implement during rapid development cycles such as hackathons**.
