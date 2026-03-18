import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import { markAttendance } from '../services/eventService'

function AttendancePage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [status, setStatus] = useState('pending') // pending | loading | success | already | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/attend/${id}?token=${token}`, { replace: true })
      return
    }
    if (!token || !id) {
      setStatus('error')
      setMessage('Invalid attendance link.')
      return
    }

    setStatus('loading')
    markAttendance(id, token)
      .then((data) => {
        if (data.alreadyMarked) {
          setStatus('already')
          setMessage('Your attendance was already marked for this event.')
        } else {
          setStatus('success')
          setMessage(data.message || 'Attendance marked successfully!')
        }
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Failed to mark attendance.')
      })
  }, [id, token, isAuthenticated])

  const statusConfig = {
    loading: { icon: null, spinner: true, title: 'Marking attendance...', color: 'text-indigo-400' },
    success: { icon: '✅', title: 'Attendance Marked!', color: 'text-green-400' },
    already: { icon: '📋', title: 'Already Registered', color: 'text-yellow-400' },
    error:   { icon: '❌', title: 'Failed', color: 'text-red-400' },
    pending: { icon: null, spinner: true, title: 'Loading...', color: 'text-gray-400' },
  }

  const cfg = statusConfig[status] || statusConfig.pending

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center">
            <div className="bg-gray-800 border border-gray-700/60 rounded-2xl p-8">
              {cfg.spinner ? (
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="text-5xl mb-4">{cfg.icon}</div>
              )}
              <h2 className={`text-xl font-bold mb-2 ${cfg.color}`}>{cfg.title}</h2>
              {message && <p className="text-gray-400 text-sm mb-6">{message}</p>}
              {['success', 'already', 'error'].includes(status) && (
                <Link
                  to={`/events/${id}`}
                  className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Back to Event
                </Link>
              )}
            </div>
            {status === 'success' && user && (
              <p className="text-gray-500 text-xs mt-3">
                Marked as: {user.name}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AttendancePage
