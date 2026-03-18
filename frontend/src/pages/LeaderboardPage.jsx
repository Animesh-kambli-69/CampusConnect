import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import { getLeaderboard, getMyStats } from '../services/gamificationService'

const BADGE_META = {
  'Resource Hero':    { icon: '📚', color: 'bg-blue-900/40 text-blue-300 border-blue-700/40' },
  'Well Connected':   { icon: '🔗', color: 'bg-green-900/40 text-green-300 border-green-700/40' },
  'Showcase Star':    { icon: '⭐', color: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40' },
  'Project Pioneer':  { icon: '🚀', color: 'bg-purple-900/40 text-purple-300 border-purple-700/40' },
  'Hackathon Veteran':{ icon: '🏆', color: 'bg-orange-900/40 text-orange-300 border-orange-700/40' },
  'Team Builder':     { icon: '👥', color: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/40' },
}

function BadgeChip({ badge }) {
  const meta = BADGE_META[badge] || { icon: '🏅', color: 'bg-gray-700/60 text-gray-300 border-gray-600/40' }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${meta.color}`}>
      {meta.icon} {badge}
    </span>
  )
}

function LeaderboardPage() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
  })

  const { data: myStats } = useQuery({
    queryKey: ['my-stats'],
    queryFn: getMyStats,
  })

  const { leaderboard = [], myRank } = data || {}

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 max-w-3xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Campus Leaderboard</h1>
            <p className="text-gray-400 text-sm mt-1">Top contributors on your campus</p>
          </div>

          {/* My Stats Card */}
          {myStats && (
            <div className="bg-gray-800 border border-indigo-500/30 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Your Stats</h2>
                <span className="text-indigo-400 text-sm font-medium">Rank #{myRank || '—'}</span>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Points', value: myStats.points || 0, icon: '⭐' },
                  { label: 'Resources', value: myStats.resourceCount || 0, icon: '📚' },
                  { label: 'Events', value: myStats.eventCount || 0, icon: '📅' },
                  { label: 'Projects', value: myStats.projectCount || 0, icon: '🚀' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-700/40 rounded-lg p-3 text-center">
                    <div className="text-lg mb-0.5">{stat.icon}</div>
                    <div className="text-white font-bold text-lg">{stat.value}</div>
                    <div className="text-gray-400 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
              {myStats.badges?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {myStats.badges.map((b) => <BadgeChip key={b} badge={b} />)}
                </div>
              )}
              {myStats.badges?.length === 0 && (
                <p className="text-gray-500 text-sm">Keep contributing to earn your first badge!</p>
              )}
            </div>
          )}

          {/* Leaderboard */}
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-700 rounded-full" />
                  <div className="w-8 h-8 bg-gray-700 rounded-full" />
                  <div className="flex-1"><div className="h-4 bg-gray-700 rounded w-1/3 mb-1" /><div className="h-3 bg-gray-700 rounded w-1/4" /></div>
                  <div className="h-6 bg-gray-700 rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((member, idx) => {
                const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null
                const isMe = member._id === user?._id || member._id?.toString() === user?._id?.toString()
                return (
                  <div
                    key={member._id}
                    className={`flex items-center gap-4 bg-gray-800 ${isMe ? 'border-indigo-500/40' : 'border-gray-700/60'} border rounded-xl px-4 py-3 transition-all`}
                  >
                    <div className="w-8 text-center">
                      {rankEmoji || <span className="text-gray-500 text-sm font-medium">#{idx + 1}</span>}
                    </div>
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} className="w-9 h-9 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm text-white font-bold">
                        {member.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${member._id}`}
                        className={`font-medium text-sm ${isMe ? 'text-indigo-300' : 'text-white'} hover:text-indigo-300 transition-colors`}
                      >
                        {member.name} {isMe && <span className="text-gray-500">(you)</span>}
                      </Link>
                      <p className="text-gray-500 text-xs">{member.branch} {member.year && `• Year ${member.year}`}</p>
                    </div>
                    {member.badges?.length > 0 && (
                      <div className="hidden sm:flex gap-1">
                        {member.badges.slice(0, 2).map((b) => {
                          const meta = BADGE_META[b]
                          return meta ? (
                            <span key={b} title={b} className="text-base cursor-default">{meta.icon}</span>
                          ) : null
                        })}
                      </div>
                    )}
                    <div className="text-right shrink-0">
                      <span className="text-indigo-400 font-bold text-sm">{member.points || 0}</span>
                      <p className="text-gray-600 text-xs">pts</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* How to earn points */}
          <div className="mt-8 bg-gray-800 border border-gray-700/60 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">How to Earn Points</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { action: 'Upload a resource', pts: '+20' },
                { action: 'Create a project', pts: '+15' },
                { action: 'Mark attendance', pts: '+10' },
                { action: 'Make a connection', pts: '+5' },
                { action: 'Project gets 10 likes', badge: 'Showcase Star' },
                { action: '5+ resources uploaded', badge: 'Resource Hero' },
                { action: '20+ connections', badge: 'Well Connected' },
              ].map((item) => (
                <div key={item.action} className="flex items-center justify-between bg-gray-700/30 rounded-lg px-3 py-2">
                  <span className="text-gray-300 text-xs">{item.action}</span>
                  {item.pts && <span className="text-green-400 font-medium text-xs">{item.pts} pts</span>}
                  {item.badge && <span className="text-yellow-400 text-xs">🏅 badge</span>}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default LeaderboardPage
