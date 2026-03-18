import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuth from '../hooks/useAuth'

const MobileNavItems = [
  { to: '/dashboard', icon: '🏠', label: 'Home' },
  { to: '/events', icon: '📅', label: 'Events' },
  { to: '/messages', icon: '💬', label: 'Messages' },
  { to: '/profile', icon: '👤', label: 'Profile' },
]

function MobileBottomNav() {
  const location = useLocation()
  const { user } = useAuth()

  if (!user) return null

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800/50 z-40"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around h-16">
        {MobileNavItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')

          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 group relative"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.span
                className={`text-xl transition-all ${isActive ? 'scale-110' : 'scale-100'}`}
                whileTap={{ scale: 0.9 }}
              >
                {item.icon}
              </motion.span>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default MobileBottomNav
