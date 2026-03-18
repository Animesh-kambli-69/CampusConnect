import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { memo } from 'react'
import { motion } from 'framer-motion'
import { formatDate, getInitials } from '../utils/helpers'
import { optimizeCloudinaryUrl } from '../lib/optimization'

const CATEGORY_COLORS = {
  hackathon: 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-300 border-purple-500/30',
  workshop: 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-blue-300 border-blue-500/30',
  seminar: 'bg-gradient-to-r from-cyan-600/30 to-sky-600/30 text-cyan-300 border-cyan-500/30',
  cultural: 'bg-gradient-to-r from-pink-600/30 to-rose-600/30 text-pink-300 border-pink-500/30',
  sports: 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-300 border-green-500/30',
  other: 'bg-gray-700/50 text-gray-300 border-gray-600/30',
}

// Calculate countdown for upcoming events
function getCountdown(targetDate) {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = target - now

  if (diff < 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `Starts in ${days}d ${hours}h`
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`
  if (minutes > 0) return `Starts in ${minutes}m`
  return 'Starting soon'
}

function EventCard({ event }) {
  // Destructuring with fallbacks to prevent crashes
  const {
    id,
    _id,
    title = 'Untitled Event',
    description = '',
    date,
    venue = 'TBD',
    category = 'other',
    organizer,
    imageUrl,
    registeredUsers = []
  } = event || {}

  const eventId = id || _id
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.other
  const isPast = date ? new Date(date) < new Date() : false
  const [countdown, setCountdown] = useState(getCountdown(date))

  // Update countdown every minute for upcoming events
  useEffect(() => {
    if (isPast || !date) return

    const interval = setInterval(() => {
      setCountdown(getCountdown(date))
    }, 60000)

    return () => clearInterval(interval)
  }, [date, isPast])

  // Improved check for registration status
  const isRegistered = Array.isArray(registeredUsers) && registeredUsers.length > 0

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(79, 70, 229, 0.3)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        to={`/events/${eventId}`}
        className="block bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border border-gray-700/60 rounded-2xl overflow-hidden hover:border-indigo-500/60 transition-all group relative shadow-lg shadow-black/20"
      >
        {/* Registered indicator - Animated Badge */}
        {isRegistered && !isPast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-3 right-3 z-20"
          >
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 backdrop-blur-sm">
              ✓ Registered
            </span>
          </motion.div>
        )}

        {/* Header/Image Section */}
        <div className="h-36 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
          {imageUrl ? (
            <>
              <motion.img
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
                src={optimizeCloudinaryUrl(imageUrl, { width: 600, height: 300, crop: 'fill' })}
                alt={title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {/* Dark overlay for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 via-grad-800 to-violet-900/40 flex items-center justify-center group-hover:from-indigo-900/60 group-hover:to-violet-900/60 transition-all">
              <motion.span
                whileHover={{ scale: 1.2 }}
                className="text-5xl opacity-40 group-hover:opacity-60 transition-opacity"
              >
                📅
              </motion.span>
            </div>
          )}

          {/* Category badge - styled with gradient */}
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={`absolute bottom-3 left-3 text-xs uppercase font-bold px-3 py-1.5 rounded-full border z-10 ${colorClass} shadow-md backdrop-blur-sm`}
          >
            {category}
          </motion.span>

          {isPast && (
            <span className="absolute top-3 left-3 text-xs uppercase font-bold px-3 py-1.5 rounded-full bg-gray-900/80 text-gray-400 border border-gray-700 z-10 shadow-md backdrop-blur-sm">
              Ended
            </span>
          )}
        </div>

        {/* Body Section */}
        <div className="p-4 flex flex-col h-full">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 group-hover:text-indigo-300 transition-colors mb-3">
            {title}
          </h3>

          <div className="space-y-2 mb-3">
            <motion.div
              whileHover={{ x: 2 }}
              className="flex items-center gap-2 text-indigo-400 font-semibold"
            >
              <span className="text-base">🗓</span>
              <span className="text-xs">{formatDate(date)}</span>
            </motion.div>

            {venue && (
              <div className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors">
                <span className="text-base">📍</span>
                <span className="text-xs truncate font-medium">{venue}</span>
              </div>
            )}

            {/* Countdown for upcoming events - with animation */}
            {!isPast && countdown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-amber-300 bg-gradient-to-r from-amber-500/20 to-orange-500/20 w-fit px-3 py-1.5 rounded-lg mt-1 border border-amber-500/30 font-bold text-xs uppercase tracking-wide"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm inline-block"
                >
                  ⏱
                </motion.span>
                {countdown}
              </motion.div>
            )}
          </div>

          {description && (
            <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-3">
              {description}
            </p>
          )}

          {/* Organizer Footer */}
          {organizer && (
            <motion.div
              whileHover={{ x: 2 }}
              className="flex items-center gap-2 pt-3 mt-auto border-t border-gray-700/40"
            >
              <motion.div
                whileHover={{ scale: 1.15 }}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0 ring-2 ring-indigo-500/30 shadow-md"
              >
                {organizer.avatarUrl ? (
                  <img src={organizer.avatarUrl} alt={organizer.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(organizer.name || 'U')}</span>
                )}
              </motion.div>
              <span className="text-gray-500 text-xs truncate font-medium">
                By <span className="text-indigo-300 font-semibold">{organizer.name}</span>
              </span>
            </motion.div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default memo(EventCard)