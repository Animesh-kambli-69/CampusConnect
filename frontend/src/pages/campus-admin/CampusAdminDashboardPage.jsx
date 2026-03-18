import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import CampusAdminLayout from '../../components/campus-admin/CampusAdminLayout'
import useAuth from '../../hooks/useAuth'
import { getCampusAnalytics } from '../../services/campusAdminService'
import { getActivity } from '../../services/activityService'
import { getAnnouncements } from '../../services/announcementService'

function StatCard({ label, value, icon, color = 'indigo', href }) {
  const colorMap = {
    indigo: 'bg-indigo-900/40 border-indigo-700/40 text-indigo-400',
    green:  'bg-green-900/40 border-green-700/40 text-green-400',
    blue:   'bg-blue-900/40 border-blue-700/40 text-blue-400',
    purple: 'bg-purple-900/40 border-purple-700/40 text-purple-400',
    red:    'bg-red-900/40 border-red-700/40 text-red-400',
  }
  const content = (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 hover:border-indigo-500/40 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
  return href ? <Link to={href}>{content}</Link> : content
}

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const activityLabels = {
  'resource:uploaded': (a) => `${a.actorName} uploaded "${a.meta?.title}"`,
  'event:created':     (a) => `${a.actorName} created event "${a.meta?.title}"`,
  'connection:made':   (a) => `${a.actorName} connected with ${a.meta?.otherUserName}`,
  'team:created':      (a) => `${a.actorName} created team "${a.meta?.name}"`,
}
const activityIcons = {
  'resource:uploaded': '📚',
  'event:created':     '📅',
  'connection:made':   '🔗',
  'team:created':      '👥',
}

function CampusAdminDashboardPage() {
  const { user } = useAuth()

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['campus-admin-analytics'],
    queryFn: getCampusAnalytics,
  })

  const { data: activities = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: getActivity,
  })

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  })

  const campusName = user?.collegeId?.name || 'Your Campus'

  return (
    <CampusAdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{campusName} — Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-1">Campus-level overview and management</p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700/60 rounded-xl h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Students"        value={analytics?.students}  icon="🎓" color="indigo" href="/campus-admin/students" />
          <StatCard label="Committee"       value={analytics?.committee} icon="📋" color="blue" href="/campus-admin/students?role=committee" />
          <StatCard label="Events"          value={analytics?.events}    icon="📅" color="purple" />
          <StatCard label="Resources"       value={analytics?.resources} icon="📚" color="green" />
          <StatCard label="Suspended"       value={analytics?.suspended} icon="🚫" color="red" href="/campus-admin/students?suspended=true" />
        </div>
      )}

      {/* Two column: Activity + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
            Recent Campus Activity
          </h2>
          {activities.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 8).map((a) => (
                <div key={a._id} className="flex items-start gap-3">
                  <span className="text-base shrink-0 mt-0.5">{activityIcons[a.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-sm truncate">
                      {activityLabels[a.type]?.(a) || a.type}
                    </p>
                  </div>
                  <span className="text-gray-600 text-xs shrink-0">{timeAgo(a.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider text-gray-400">
              Announcements
            </h2>
            <Link to="/announcements" className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
              Manage →
            </Link>
          </div>
          {announcements.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-2">No announcements posted yet</p>
              <Link to="/announcements" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                Post first announcement →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 4).map((a) => (
                <div key={a._id} className="p-3 rounded-lg bg-gray-700/40 border border-gray-700/40">
                  <p className="text-white text-sm font-medium truncate">{a.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{timeAgo(a.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gray-800 border border-gray-700/60 rounded-xl p-5">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/campus-admin/students" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            🎓 Manage Students
          </Link>
          <Link to="/announcements" className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            📢 Post Announcement
          </Link>
          <Link to="/events/create" className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            📅 Create Event
          </Link>
          <Link to="/resources" className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            📚 View Resources
          </Link>
        </div>
      </div>
    </CampusAdminLayout>
  )
}

export default CampusAdminDashboardPage
