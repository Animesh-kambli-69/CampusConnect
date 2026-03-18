import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useUserStore from './store/userStore'
import useAdminStore from './store/adminStore'
import useSocket from './hooks/useSocket'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import TeamFinderPage from './pages/TeamFinderPage'
import StudentProfilePage from './pages/StudentProfilePage'
import MarketplacePage from './pages/MarketplacePage'
import MarketplaceItemPage from './pages/MarketplaceItemPage'
import CreateListingPage from './pages/CreateListingPage'
import ProfilePage from './pages/ProfilePage'
import ConnectionsPage from './pages/ConnectionsPage'
import EventsPage from './pages/EventsPage'
import CreateEventPage from './pages/CreateEventPage'
import EventDetailPage from './pages/EventDetailPage'
import MessagesPage from './pages/MessagesPage'
import WorkspacePage from './pages/WorkspacePage'
import WorkspaceDetailPage from './pages/WorkspaceDetailPage'
import ResourcesPage from './pages/ResourcesPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import AttendancePage from './pages/AttendancePage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import CreateProjectPage from './pages/CreateProjectPage'
import PlacementPage from './pages/PlacementPage'
import LeaderboardPage from './pages/LeaderboardPage'
import LostFoundPage from './pages/LostFoundPage'
import StudyRoomsPage from './pages/StudyRoomsPage'
import StudyRoomDetailPage from './pages/StudyRoomDetailPage'
import CampusAdminDashboardPage from './pages/campus-admin/CampusAdminDashboardPage'
import CampusAdminStudentsPage from './pages/campus-admin/CampusAdminStudentsPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminCampusesPage from './pages/admin/AdminCampusesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'

function ProtectedRoute({ children }) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const hasHydrated = useUserStore((state) => state._hasHydrated)

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function AdminProtectedRoute({ children }) {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated)
  const hasHydrated = useAdminStore((state) => state._hasHydrated)

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

function CampusAdminProtectedRoute({ children }) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const user = useUserStore((state) => state.user)
  const hasHydrated = useUserStore((state) => state._hasHydrated)

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!['campusAdmin', 'superAdmin'].includes(user?.role)) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  useSocket()

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
        }}
      />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/team-finder" element={<ProtectedRoute><TeamFinderPage /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/marketplace/create" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
      <Route path="/marketplace/:id" element={<ProtectedRoute><MarketplaceItemPage /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
      <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
      <Route path="/messages/:userId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/workspace/:id" element={<ProtectedRoute><WorkspaceDetailPage /></ProtectedRoute>} />
      <Route path="/workspace" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
      <Route path="/attend/:id" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />

      {/* ── Phase 3-5 Features ──────────────────────────────────────── */}
      <Route path="/projects/create" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/placement" element={<ProtectedRoute><PlacementPage /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/lost-found" element={<ProtectedRoute><LostFoundPage /></ProtectedRoute>} />
      <Route path="/study-rooms/:id" element={<ProtectedRoute><StudyRoomDetailPage /></ProtectedRoute>} />
      <Route path="/study-rooms" element={<ProtectedRoute><StudyRoomsPage /></ProtectedRoute>} />

      {/* ── Admin Routes ─────────────────────────────────────────────── */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />
      <Route path="/admin/campuses" element={<AdminProtectedRoute><AdminCampusesPage /></AdminProtectedRoute>} />
      <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>} />
      <Route path="/admin/analytics" element={<AdminProtectedRoute><AdminAnalyticsPage /></AdminProtectedRoute>} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* ── Campus Admin Routes ───────────────────────────────────────── */}
      <Route path="/campus-admin/dashboard" element={<CampusAdminProtectedRoute><CampusAdminDashboardPage /></CampusAdminProtectedRoute>} />
      <Route path="/campus-admin/students" element={<CampusAdminProtectedRoute><CampusAdminStudentsPage /></CampusAdminProtectedRoute>} />
      <Route path="/campus-admin" element={<Navigate to="/campus-admin/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
