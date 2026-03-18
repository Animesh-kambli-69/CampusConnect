import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import useUserStore from '../store/userStore'
import {
  getStudyRoomById,
  joinStudyRoom,
  leaveStudyRoom,
  controlTimer,
} from '../services/studyRoomService'

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function StudyRoomDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const token = useUserStore((state) => state.token)
  const queryClient = useQueryClient()
  const socketRef = useRef(null)
  const [liveTimer, setLiveTimer] = useState(null) // { elapsed, isRunning, phase, startedAt }
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const intervalRef = useRef(null)

  const { data: room, isLoading } = useQuery({
    queryKey: ['study-room', id],
    queryFn: () => getStudyRoomById(id),
  })

  const joinMutation = useMutation({
    mutationFn: () => joinStudyRoom(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-room', id] }),
  })

  const leaveMutation = useMutation({
    mutationFn: () => leaveStudyRoom(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-room', id] }),
  })

  const timerMutation = useMutation({
    mutationFn: (action) => controlTimer(id, action),
    onSuccess: (timerState) => {
      setLiveTimer(timerState)
    },
  })

  // Join socket room
  useEffect(() => {
    if (!token || !id) return
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.emit('studyroom:join', id)

    socket.on('studyroom:timer_update', ({ timerState }) => {
      setLiveTimer(timerState)
    })
    socket.on('studyroom:member_joined', () => queryClient.invalidateQueries({ queryKey: ['study-room', id] }))
    socket.on('studyroom:member_left', () => queryClient.invalidateQueries({ queryKey: ['study-room', id] }))

    return () => {
      socket.emit('studyroom:leave', id)
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, id, queryClient])

  // Initialize timer from room data
  useEffect(() => {
    if (room?.timerState) setLiveTimer(room.timerState)
  }, [room])

  // Live tick
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!liveTimer?.isRunning || !liveTimer?.startedAt) return

    intervalRef.current = setInterval(() => {
      setLiveTimer((prev) => {
        if (!prev?.isRunning || !prev?.startedAt) return prev
        return { ...prev }
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [liveTimer?.isRunning, liveTimer?.startedAt])

  const computeElapsed = useCallback(() => {
    if (!liveTimer) return 0
    let base = liveTimer.elapsed || 0
    if (liveTimer.isRunning && liveTimer.startedAt) {
      base += Math.floor((Date.now() - new Date(liveTimer.startedAt).getTime()) / 1000)
    }
    return base
  }, [liveTimer])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6">
            <div className="animate-pulse max-w-lg">
              <div className="h-8 bg-gray-700 rounded w-1/3 mb-6" />
              <div className="h-48 bg-gray-700 rounded-xl" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex pt-16 items-center justify-center">
          <p className="text-white">Room not found.</p>
        </div>
      </div>
    )
  }

  const isMember = room.members?.some((m) => m.userId?.toString() === user?._id?.toString())
  const isCreator = room.createdBy?._id?.toString() === user?._id?.toString()

  const elapsed = computeElapsed()
  const totalSecs = (liveTimer?.phase === 'break' ? room.breakDuration : room.focusDuration) * 60
  const remaining = Math.max(0, totalSecs - elapsed)
  const progress = totalSecs > 0 ? ((totalSecs - remaining) / totalSecs) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 max-w-2xl">
          {/* Back */}
          <Link to="/study-rooms" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-5 transition-colors">
            ← Study Rooms
          </Link>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${room.timerState?.isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <h1 className="text-2xl font-bold text-white">{room.name}</h1>
            </div>
            {room.subject && <p className="text-indigo-400 text-sm">📖 {room.subject}</p>}
            {room.goal && <p className="text-gray-400 text-sm mt-0.5">🎯 {room.goal}</p>}
          </div>

          {/* Timer */}
          <div className="bg-gray-800 border border-gray-700/60 rounded-2xl p-8 mb-6 text-center">
            <div className="mb-2">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                liveTimer?.phase === 'break'
                  ? 'bg-green-900/40 text-green-300'
                  : 'bg-indigo-900/40 text-indigo-300'
              }`}>
                {liveTimer?.phase === 'break' ? '☕ Break Time' : '🎯 Focus Session'}
              </span>
            </div>
            <div className="text-6xl font-bold text-white font-mono my-6">
              {formatTime(remaining)}
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-700/40 rounded-full h-2 mb-6">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${liveTimer?.phase === 'break' ? 'bg-green-500' : 'bg-indigo-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Controls */}
            <div className="flex gap-3 justify-center">
              {!liveTimer?.isRunning ? (
                <button
                  onClick={() => timerMutation.mutate('start')}
                  disabled={timerMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  ▶ Start
                </button>
              ) : (
                <button
                  onClick={() => timerMutation.mutate('pause')}
                  disabled={timerMutation.isPending}
                  className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  ⏸ Pause
                </button>
              )}
              <button
                onClick={() => timerMutation.mutate('reset')}
                disabled={timerMutation.isPending}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                ↺ Reset
              </button>
              <button
                onClick={() => timerMutation.mutate('next_phase')}
                disabled={timerMutation.isPending}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                ⏭ {liveTimer?.phase === 'break' ? 'Focus' : 'Break'}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              {room.focusDuration}m focus / {room.breakDuration}m break
            </p>
          </div>

          {/* Members */}
          <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 mb-4">
            <h2 className="text-white font-semibold mb-3">
              Members ({room.members?.length || 0})
            </h2>
            <div className="space-y-2">
              {room.members?.map((m) => (
                <div key={m.userId?.toString()} className="flex items-center gap-3">
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                      {m.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="text-gray-300 text-sm">{m.name}</span>
                  {m.userId?.toString() === room.createdBy?._id?.toString() && (
                    <span className="text-xs text-indigo-400">host</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Join/Leave */}
          <div className="flex gap-3">
            {!isMember && room.isActive && (
              <button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {joinMutation.isPending ? 'Joining...' : 'Join Room'}
              </button>
            )}
            {isMember && (
              <button
                onClick={() => setShowLeaveModal(true)}
                disabled={leaveMutation.isPending}
                className="bg-gray-700 hover:bg-red-900/40 text-gray-300 hover:text-red-300 disabled:opacity-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
              >
                {leaveMutation.isPending ? 'Leaving...' : 'Leave Room'}
              </button>
            )}
          </div>

          {/* Leave Confirmation Modal */}
          <AnimatePresence>
            {showLeaveModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !leaveMutation.isPending && setShowLeaveModal(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border border-gray-700/60 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-black/50"
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                      <span className="text-2xl">⚠️</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-white text-lg font-bold text-center mb-2">
                    Leave Study Room?
                  </h2>

                  {/* Description */}
                  <p className="text-gray-400 text-sm text-center mb-6">
                    You will be removed from <span className="text-white font-semibold">{room.name}</span>. You can rejoin anytime.
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowLeaveModal(false)}
                      disabled={leaveMutation.isPending}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Stay
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        leaveMutation.mutate()
                      }}
                      disabled={leaveMutation.isPending}
                      className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {leaveMutation.isPending ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Leaving...
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          Leave Room
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default StudyRoomDetailPage
