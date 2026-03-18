import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import UserCard from '../components/UserCard'
import useAuth from '../hooks/useAuth'
import { getUsers } from '../services/userService'
import { getConnections } from '../services/connectionService'
import { getListings } from '../services/marketplaceService'
import { getEvents } from '../services/eventService'
import { getAnnouncements } from '../services/announcementService'
import { getActivity } from '../services/activityService'
import { getRecommendations } from '../services/recommendationService'

const CATEGORY_COLOR = {
  academic:   'bg-blue-900/40 text-blue-300 border-blue-700/40',
  placements: 'bg-green-900/40 text-green-300 border-green-700/40',
  events:     'bg-purple-900/40 text-purple-300 border-purple-700/40',
  general:    'bg-gray-700/60 text-gray-300 border-gray-600/40',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function StatCard({ label, value, icon, href, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-900/40 border-indigo-700/40 text-indigo-400',
    green:  'bg-green-900/40 border-green-700/40 text-green-400',
    blue:   'bg-blue-900/40 border-blue-700/40 text-blue-400',
    purple: 'bg-purple-900/40 border-purple-700/40 text-purple-400',
  }
  return (
    <Link
      to={href}
      className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-900/20 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
          <p className="text-indigo-400 text-xs mt-2 group-hover:text-indigo-300 transition-colors">View all →</p>
        </div>
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-full" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 bg-gray-700 rounded-full w-14" />
        <div className="h-5 bg-gray-700 rounded-full w-20" />
        <div className="h-5 bg-gray-700 rounded-full w-16" />
      </div>
      <div className="h-px bg-gray-700 mb-3" />
      <div className="flex justify-between">
        <div className="h-4 bg-gray-700 rounded w-20" />
        <div className="h-6 bg-gray-700 rounded w-16" />
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Student'

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  })

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
  })

  const { data: listings = [] } = useQuery({
    queryKey: ['marketplace'],
    queryFn: getListings,
  })

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  })

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  })

  const { data: activities = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: getActivity,
  })

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: getRecommendations,
  })

  // Upcoming events: sort by date ascending, pick next 3
  const upcomingEvents = [...events]
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3)

  // Latest 2 announcements for pinned banner
  const pinnedAnnouncements = announcements.slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 max-w-full">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Welcome back, {firstName} 👋</h1>
            <p className="text-gray-400 mt-1 text-sm">Here's what's happening in your campus community</p>
          </div>

          {/* Pinned Announcements Banner */}
          {pinnedAnnouncements.length > 0 && (
            <div className="mb-6 space-y-2">
              {pinnedAnnouncements.map((a) => (
                <Link
                  key={a._id}
                  to="/announcements"
                  className="flex items-start gap-3 bg-indigo-950/50 border border-indigo-700/40 rounded-xl px-4 py-3 hover:border-indigo-500/60 transition-all"
                >
                  <span className="text-lg shrink-0 mt-0.5">📢</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${CATEGORY_COLOR[a.category] || CATEGORY_COLOR.general}`}>
                        {a.category}
                      </span>
                      <span className="text-gray-500 text-xs">{timeAgo(a.createdAt)}</span>
                    </div>
                    <p className="text-white text-sm font-medium truncate">{a.title}</p>
                    <p className="text-gray-400 text-xs truncate">{a.body}</p>
                  </div>
                  <span className="text-gray-600 text-xs shrink-0 mt-1">View →</span>
                </Link>
              ))}
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="My Connections" value={connections.length} icon="🔗" href="/connections" color="indigo" />
            <StatCard label="Marketplace" value={listings.length} icon="🛒" href="/marketplace" color="blue" />
            <StatCard label="Campus Students" value={users.length} icon="🎓" href="/team-finder" color="green" />
            <StatCard label="Events" value={events.length} icon="📅" href="/events" color="purple" />
          </div>

          {/* Two-column: Upcoming Events + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Upcoming Events */}
            <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-sm uppercase tracking-wider text-gray-400">
                  Upcoming Events
                </h2>
                <Link to="/events" className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                  View all →
                </Link>
              </div>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No upcoming events</p>
                  <Link to="/events" className="text-indigo-400 hover:text-indigo-300 text-xs mt-1 inline-block">
                    Browse all events →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-900/40 border border-indigo-700/40 flex flex-col items-center justify-center shrink-0">
                        <span className="text-indigo-300 text-xs font-bold leading-none">
                          {new Date(event.date).toLocaleDateString('en', { day: '2-digit' })}
                        </span>
                        <span className="text-indigo-400 text-[10px] leading-none uppercase">
                          {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{event.title}</p>
                        <p className="text-gray-500 text-xs">{event.venue || 'Venue TBD'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { to: '/team-finder', icon: '🔍', label: 'Find Teammates', primary: true },
                  { to: '/projects/create', icon: '🚀', label: 'Share Project' },
                  { to: '/events', icon: '📅', label: 'Browse Events' },
                  { to: '/resources', icon: '📚', label: 'Browse Notes' },
                  { to: '/study-rooms', icon: '🕐', label: 'Study Room' },
                  { to: '/placement', icon: '🧑‍💼', label: 'Placement Hub' },
                  { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
                  { to: '/lost-found', icon: '📍', label: 'Lost & Found' },
                ].map(({ to, icon, label, primary }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      primary
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white col-span-2'
                        : 'bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white'
                    }`}
                  >
                    {icon} {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* For You — Smart Recommendations */}
          {recommendations && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">For You ✨</h2>
                <span className="text-gray-500 text-xs">Personalized picks</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recommended Events */}
                {recommendations.events?.length > 0 && (
                  <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">📅 Upcoming Events</p>
                    <div className="space-y-2">
                      {recommendations.events.slice(0, 3).map((ev) => (
                        <Link key={ev._id} to={`/events/${ev._id}`} className="block p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                          <p className="text-white text-sm font-medium truncate">{ev.title}</p>
                          <p className="text-gray-500 text-xs">{new Date(ev.date).toLocaleDateString()}</p>
                        </Link>
                      ))}
                    </div>
                    <Link to="/events" className="text-indigo-400 hover:text-indigo-300 text-xs mt-2 inline-block">View all →</Link>
                  </div>
                )}
                {/* Recommended Resources */}
                {recommendations.resources?.length > 0 && (
                  <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">📚 Resources For You</p>
                    <div className="space-y-2">
                      {recommendations.resources.slice(0, 3).map((r) => (
                        <div key={r._id} className="p-2 rounded-lg">
                          <p className="text-white text-sm font-medium truncate">{r.title}</p>
                          <p className="text-gray-500 text-xs">{r.subject} • Sem {r.semester}</p>
                        </div>
                      ))}
                    </div>
                    <Link to="/resources" className="text-indigo-400 hover:text-indigo-300 text-xs mt-2 inline-block">Browse all →</Link>
                  </div>
                )}
                {/* Suggested Teammates */}
                {recommendations.teammates?.length > 0 && (
                  <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">👥 Suggested Teammates</p>
                    <div className="space-y-2">
                      {recommendations.teammates.slice(0, 3).map((u) => (
                        <Link key={u._id} to={`/profile/${u._id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} className="w-7 h-7 rounded-full object-cover" alt="" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                              {u.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{u.name}</p>
                            <p className="text-gray-500 text-xs">{u.branch}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link to="/team-finder" className="text-indigo-400 hover:text-indigo-300 text-xs mt-2 inline-block">Find more →</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {activities.length > 0 && (
            <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 mb-8">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
                Recent Campus Activity
              </h2>
              <div className="space-y-3">
                {activities.slice(0, 5).map((a) => {
                  const icons = {
                    'resource:uploaded': '📚',
                    'event:created': '📅',
                    'connection:made': '🔗',
                    'team:created': '👥',
                  }
                  const labels = {
                    'resource:uploaded': `uploaded ${a.meta?.title || 'a resource'} (${a.meta?.subject || ''})`,
                    'event:created': `created event "${a.meta?.title || ''}"`,
                    'connection:made': `connected with ${a.meta?.otherUserName || 'someone'}`,
                    'team:created': `created team "${a.meta?.name || ''}"`,
                  }
                  return (
                    <div key={a._id} className="flex items-center gap-3">
                      <span className="text-base shrink-0">{icons[a.type] || '📌'}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-sm font-medium">{a.actorName} </span>
                        <span className="text-gray-400 text-sm">{labels[a.type]}</span>
                      </div>
                      <span className="text-gray-600 text-xs shrink-0">{timeAgo(a.createdAt)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Discover Students */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg">Discover Students</h2>              <Link to="/team-finder" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                View all →
              </Link>
            </div>

            {usersLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 border border-gray-700/60 rounded-xl">
                <p className="text-4xl mb-3">🎓</p>
                <p className="text-white font-semibold">No students found</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to complete your profile and get discovered!</p>
                <Link to="/profile" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300 text-sm">
                  Complete your profile →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.slice(0, 6).map((u) => <UserCard key={u.id} user={u} />)}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}

export default Dashboard
