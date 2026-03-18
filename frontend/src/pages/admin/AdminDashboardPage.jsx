import { useEffect, useState } from 'react'
import {
  Building2, Users, BookOpen, Calendar, Layers, UserX,
  TrendingUp, Activity, Rocket, Link2, Megaphone, Briefcase, Clock, MapPin,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import adminApi from '../../services/adminApi'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ROLE_COLOR = { student: 'bg-indigo-600', committee: 'bg-amber-500', campusAdmin: 'bg-emerald-600' }
const ROLE_LABEL = { student: 'Students', committee: 'Committee', campusAdmin: 'Campus Admins' }

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get('/analytics')
      .then(({ data }) => setAnalytics(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const ov = analytics?.overview || {}
  const maxSignup = Math.max(...(analytics?.monthlySignups?.map((m) => m.count) || [1]))
  const totalRoles = analytics?.roleDistribution?.reduce((s, r) => s + r.count, 0) || 1

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Platform Overview</h1>
          <p className="text-gray-400 text-sm mt-0.5">Real-time statistics across all campuses</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Core Stats */}
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Core</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Building2} label="Total Campuses" value={ov.totalCampuses} color="bg-indigo-600" sub={`${ov.activeCampuses} active`} />
                <StatCard icon={Users} label="Total Users" value={ov.totalUsers} color="bg-emerald-600" sub={`${ov.suspendedUsers} suspended`} />
                <StatCard icon={BookOpen} label="Resources" value={ov.totalResources} color="bg-violet-600" />
                <StatCard icon={Calendar} label="Events" value={ov.totalEvents} color="bg-amber-600" />
              </div>
            </div>

            {/* Platform Activity Stats */}
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Platform Activity</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Layers} label="Workspaces" value={ov.totalTeams} color="bg-cyan-600" />
                <StatCard icon={Link2} label="Connections" value={ov.totalConnections} color="bg-teal-600" />
                <StatCard icon={Rocket} label="Projects" value={ov.totalProjects} color="bg-pink-600" />
                <StatCard icon={Megaphone} label="Announcements" value={ov.totalAnnouncements} color="bg-orange-600" />
                <StatCard icon={Briefcase} label="Interview Exps" value={ov.totalInterviews} color="bg-blue-600" />
                <StatCard icon={Clock} label="Study Rooms" value={ov.totalStudyRooms} color="bg-purple-600" />
                <StatCard icon={MapPin} label="Lost & Found" value={ov.totalLostFound} color="bg-rose-600" />
                <StatCard icon={UserX} label="Suspended Users" value={ov.suspendedUsers} color="bg-red-600" />
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Monthly Signups */}
              <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white font-semibold text-sm mb-4">Monthly User Signups (last 6 months)</h2>
                {analytics?.monthlySignups?.length > 0 ? (
                  <div className="flex items-end justify-around gap-2 h-32 border-b border-gray-800">
                    {analytics.monthlySignups.map((m, i) => {
                      const heightPct = maxSignup > 0 ? Math.max((m.count / maxSignup) * 100, 8) : 8
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 w-10">
                          <span className="text-xs text-gray-400 font-medium">{m.count}</span>
                          <div className="w-full flex items-end" style={{ height: '96px' }}>
                            <div className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-t transition-colors" style={{ height: `${heightPct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{MONTHS[m._id.month - 1]}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">No signup data yet</p>
                  </div>
                )}
              </div>

              {/* Role Distribution */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white font-semibold text-sm mb-4">User Role Breakdown</h2>
                <div className="space-y-3">
                  {analytics?.roleDistribution?.length > 0 ? (
                    analytics.roleDistribution.map((r) => (
                      <div key={r._id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-300 text-xs">{ROLE_LABEL[r._id] || r._id}</span>
                          <span className="text-gray-400 text-xs">{r.count} ({Math.round((r.count / totalRoles) * 100)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${ROLE_COLOR[r._id] || 'bg-gray-600'}`} style={{ width: `${(r.count / totalRoles) * 100}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Campuses + Top Points Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white font-semibold text-sm mb-4">Top Campuses by Users</h2>
                <div className="space-y-3">
                  {analytics?.topCampuses?.length > 0 ? analytics.topCampuses.map((c, i) => {
                    const maxC = analytics.topCampuses[0]?.count || 1
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-gray-500 text-xs w-5">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-300 text-xs truncate">{c.name}</span>
                            <span className="text-gray-400 text-xs">{c.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(c.count / maxC) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  }) : <p className="text-gray-500 text-sm">No data yet</p>}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white font-semibold text-sm mb-4">Top Users by Points (Platform-wide)</h2>
                <div className="space-y-3">
                  {analytics?.topPointUsers?.length > 0 ? analytics.topPointUsers.map((u, i) => (
                    <div key={u._id} className="flex items-center gap-3">
                      <span className="text-lg w-6 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 text-sm font-medium truncate">{u.name}</p>
                        <p className="text-gray-500 text-xs truncate">{u.collegeId?.name || 'Unknown campus'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-indigo-400 text-sm font-semibold">{u.points} pts</p>
                        {u.badges?.length > 0 && <p className="text-gray-500 text-xs">{u.badges.length} badge{u.badges.length !== 1 ? 's' : ''}</p>}
                      </div>
                    </div>
                  )) : <p className="text-gray-500 text-sm">No points earned yet</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
