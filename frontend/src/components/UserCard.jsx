import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getInitials } from '../utils/helpers'
import ConnectionButton from './ConnectionButton'

function UserCard({ user }) {
  const {
    id,
    name,
    skills = [],
    bio,
    avatarUrl,
    collegeId,
    connectionStatus,
  } = user

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(79, 70, 229, 0.25)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border border-gray-700/60 p-5 hover:border-indigo-500/60 transition-all shadow-lg shadow-black/20"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-violet-600/0 group-hover:from-indigo-600/5 group-hover:to-violet-600/5 transition-all duration-300 pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header: avatar + name */}
        <div className="flex items-start gap-3.5 mb-4">
          <Link to={`/profile/${id}`} className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-lg overflow-hidden ring-3 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all shadow-lg"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <span>{getInitials(name)}</span>
              )}
            </motion.div>
          </Link>
          <div className="flex-1 min-w-0 pt-1">
            <Link
              to={`/profile/${id}`}
              className="text-white font-bold text-base hover:text-indigo-300 transition-colors block truncate leading-snug"
            >
              {name}
            </Link>
            {collegeId && (
              <p className="text-indigo-400/80 text-xs mt-0.5 truncate font-semibold uppercase tracking-wide">
                {typeof collegeId === 'object' ? collegeId.name || collegeId.domain : collegeId}
              </p>
            )}
            {bio && (
              <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">{bio}</p>
            )}
          </div>
        </div>

        {/* Skills badges */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.slice(0, 4).map((skill, idx) => (
              <motion.span
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 bg-gradient-to-r from-indigo-600/30 to-violet-600/30 border border-indigo-500/40 text-indigo-200 rounded-full text-xs font-semibold shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all"
              >
                {skill}
              </motion.span>
            ))}
            {skills.length > 4 && (
              <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs font-medium border border-gray-600/30">
                +{skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer: view link + message (if connected) + connect button */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-700/40">
          <Link
            to={`/profile/${id}`}
            className="text-xs text-indigo-300 hover:text-indigo-200 font-bold transition-colors flex items-center gap-1 group/link"
          >
            View Profile
            <span className="group-hover/link:translate-x-0.5 transition-transform">→</span>
          </Link>
          <div className="flex items-center gap-2">
            {connectionStatus === 'accepted' && (
              <Link
                to={`/messages/${id}`}
                className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold transition-all shadow-md shadow-purple-600/20 hover:shadow-purple-600/40"
              >
                💬 Message
              </Link>
            )}
            <ConnectionButton userId={id} connectionStatus={connectionStatus} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default UserCard
