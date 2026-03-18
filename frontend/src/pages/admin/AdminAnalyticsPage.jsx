import { useEffect, useState } from 'react'
import {
  Building2, Users, BookOpen, Calendar, Layers, UserX,
  Activity, Rocket, Link2, Megaphone, Briefcase, Clock, MapPin,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import adminApi from '../../services/adminApi'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ROLE_COLOR = { student: 'bg-indigo-600', committee: 'bg-amber-500', campusAdmin: 'bg-emerald-600' }
const ROLE_LABEL = { student: 'Students', committee: 'Committee', campusAdmin: 'Campus Admins' }

function MetricCard({ icon: Icon, label, value, note, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        {note && <p className="text-xs text-gray-500 mt-0.5">{note}</p>}
      </div>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get('/analytics')
      .then(({ data: res }) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const ov = data?.overview || {}
  const maxSignup = Math.max(...(data?.monthlySignups?.map((m) => m.count) || [1]))
  const maxCampus = data?.topCampuses?.[0]?.count || 1
  const totalRoles = data?.roleDistribution?.reduce((s, r) => s + r.count, 0) || 1

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Platform Analytics</h1>
          <p className="text-gray-400 text-sm mt-0.5">Aggregated metrics across all campuses</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Core Metrics */}
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Core Platform</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={Building2} label="Campuses" value={ov.totalCampuses} note={`${ov.activeCampuses} active`} color="bg-indigo-600" />
                <MetricCard icon={Users} label="Total Users" value={ov.totalUsers} note={`${ov.suspendedUsers} suspended`} color="bg-emerald-600" />
                <MetricCard icon={BookOpen} label="Resources" value={ov.totalResources} color="bg-violet-600" />
                <MetricCard icon={Calendar} label="Events" value={ov.totalEvents} color="bg-amber-600" />
              </div>
            </div>

            {/* Feature Metrics */}
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Feature Activity</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={Layers} label="Workspaces" value={ov.totalTeams} color="bg-cyan-600" />
                <MetricCard icon={Link2} label="Connections" value={ov.totalConnections} color="bg-teal-600" />
                <MetricCard icon={Rocket} label="Projects" value={ov.totalProjects} color="bg-pink-600" />
                <MetricCard icon={Megaphone} label="Announcements" value={ov.totalAnnouncements} color="bg-orange-600" />
                <MetricCard icon={Briefcase} label="Interview Experiences" value={ov.totalInterviews} color="bg-blue-600" />
                <MetricCard icon={Clock} label="Study Rooms Created" value={ov.totalStudyRooms} color="bg-purple-600" />
                <MetricCard icon={MapPin} label="Lost & Found Posts" value={ov.totalLostFound} color="bg-rose-600" />
                <MetricCard icon={UserX} label="Suspended Users" value={ov.suspendedUsers} color="bg-red-600" />
              </div>
            </div>

            {/* Monthly Signups Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-5">User Signups — Last 6 Months</h2>
              {data?.monthlySignups?.length > 0 ? (
                <div className="flex items-end justify-around gap-3 border-b border-gray-800" style={{ height: '160px' }}>
                  {data.monthlySignups.map((m, i) => {
                    const heightPct = maxSignup > 0 ? Math.max((m.count / maxSignup) * 100, 6) : 6
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 w-12">
                        <span className="text-gray-300 text-xs font-medium">{m.count}</span>
                        <div className="w-full flex items-end" style={{ height: '120px' }}>
                          <div
                            className="w-full rounded-t-md bg-indigo-600 hover:bg-indigo-500 transition-colors"
                            style={{ height: `${heightPct}%` }}
                            title={`${MONTHS[m._id.month - 1]} ${m._id.year}: ${m.count} signups`}
                          />
                        </div>
                        <span className="text-gray-500 text-xs mt-1">{MONTHS[m._id.month - 1]}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-gray-500 text-sm">No signup data in the last 6 months</p>
                </div>
              )}
            </div>

            {/* Role Distribution + Top Campuses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Role Distribution */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-5">User Role Distribution</h2>
                {data?.roleDistribution?.length > 0 ? (
                  <div className="space-y-4">
                    {data.roleDistribution.map((r) => (
                      <div key={r._id}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-gray-200 text-sm font-medium">{ROLE_LABEL[r._id] || r._id}</span>
                          <span className="text-gray-400 text-sm">{r.count} ({Math.round((r.count / totalRoles) * 100)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${ROLE_COLOR[r._id] || 'bg-gray-600'}`}
                            style={{ width: `${(r.count / totalRoles) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No data yet</p>
                )}
              </div>

              {/* Top Campuses */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-5">Top Campuses by Students</h2>
                {data?.topCampuses?.length > 0 ? (
                  <div className="space-y-4">
                    {data.topCampuses.map((c, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm w-6 text-right">#{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1.5">
                            <span className="text-gray-200 text-sm font-medium">{c.name}</span>
                            <span className="text-gray-400 text-sm">{c.count} students</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                              style={{ width: `${(c.count / maxCampus) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No campus data available.</p>
                )}
              </div>
            </div>

            {/* Top Points Users */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-5">Top Users by Points (Platform-wide)</h2>
              {data?.topPointUsers?.length > 0 ? (
                <div className="space-y-3">
                  {data.topPointUsers.map((u, i) => (
                    <div key={u._id} className="flex items-center gap-4 p-3 bg-gray-800/60 rounded-lg">
                      <span className="text-xl w-8 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-100 font-medium">{u.name}</p>
                        <p className="text-gray-500 text-sm">{u.collegeId?.name || 'Unknown campus'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-400 font-bold text-lg">{u.points} pts</p>
                        {u.badges?.length > 0 && (
                          <p className="text-gray-500 text-xs">{u.badges.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No points earned yet across the platform.</p>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
