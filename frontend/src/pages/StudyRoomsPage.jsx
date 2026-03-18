import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { getStudyRooms, createStudyRoom } from '../services/studyRoomService'

function StudyRoomsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', subject: '', goal: '', focusDuration: 25, breakDuration: 5 })
  const [error, setError] = useState('')

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['study-rooms'],
    queryFn: getStudyRooms,
    refetchInterval: 30000,
  })

  const createMutation = useMutation({
    mutationFn: createStudyRoom,
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['study-rooms'] })
      navigate(`/study-rooms/${room._id}`)
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create room.'),
  })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Room name is required.'); return }
    setError('')
    createMutation.mutate(form)
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Study Rooms</h1>
              <p className="text-gray-400 text-sm mt-1">Focus together with Pomodoro timers</p>
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Create Room
            </button>
          </div>

          {/* Create Form */}
          {showCreate && (
            <div className="bg-gray-800 border border-indigo-500/40 rounded-xl p-5 mb-6">
              <h3 className="text-white font-semibold mb-4">New Study Room</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <input value={form.name} onChange={set('name')} placeholder="Room name *" className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.subject} onChange={set('subject')} placeholder="Subject (optional)" className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
                  <input value={form.goal} onChange={set('goal')} placeholder="Today's goal (optional)" className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Focus (mins)</label>
                    <select value={form.focusDuration} onChange={set('focusDuration')} className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                      {[15, 20, 25, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Break (mins)</label>
                    <select value={form.breakDuration} onChange={set('breakDuration')} className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                      {[5, 10, 15].map(m => <option key={m} value={m}>{m} min</option>)}
                    </select>
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    {createMutation.isPending ? 'Creating...' : 'Create & Join'}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Rooms List */}
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse h-24" />)}</div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20 bg-gray-800 border border-gray-700/60 rounded-xl">
              <p className="text-4xl mb-3">🕐</p>
              <p className="text-white font-semibold">No active study rooms</p>
              <p className="text-gray-400 text-sm mt-1">Create a room and invite classmates to focus together!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <Link
                  key={room._id}
                  to={`/study-rooms/${room._id}`}
                  className="block bg-gray-800 border border-gray-700/60 hover:border-indigo-500/40 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${room.timerState?.isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                        <h3 className="text-white font-semibold text-sm">{room.name}</h3>
                      </div>
                      {room.subject && <p className="text-indigo-400 text-xs mb-1">📖 {room.subject}</p>}
                      {room.goal && <p className="text-gray-400 text-xs">🎯 {room.goal}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white text-sm font-medium">
                        {room.focusDuration}m / {room.breakDuration}m
                      </p>
                      <p className="text-gray-500 text-xs">
                        {room.members?.length || 0} member{room.members?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {room.members?.slice(0, 5).map((m) => (
                      <div key={m.userId?.toString() || m._id} className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold" title={m.name}>
                        {m.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    ))}
                    {room.members?.length > 5 && (
                      <span className="text-gray-500 text-xs">+{room.members.length - 5}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default StudyRoomsPage
