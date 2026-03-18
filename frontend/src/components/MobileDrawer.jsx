import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink as RouterNavLink } from 'react-router-dom'

const navSections = [
  {
    label: 'MAIN',
    items: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/announcements', icon: '📢', label: 'Announcements' },
    ],
  },
  {
    label: 'DISCOVER',
    items: [
      { to: '/team-finder', icon: '🔍', label: 'Team Finder' },
      { to: '/events', icon: '📅', label: 'Events' },
      { to: '/projects', icon: '🚀', label: 'Projects' },
      { to: '/resources', icon: '📚', label: 'Resources' },
      { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    ],
  },
  {
    label: 'CAMPUS',
    items: [
      { to: '/marketplace', icon: '🛒', label: 'Marketplace' },
      { to: '/lost-found', icon: '📍', label: 'Lost & Found' },
      { to: '/placement', icon: '🧑‍💼', label: 'Placement Hub' },
    ],
  },
  {
    label: 'SOCIAL',
    items: [
      { to: '/connections', icon: '🔗', label: 'Connections' },
      { to: '/messages', icon: '💬', label: 'Messages' },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { to: '/workspace', icon: '🗂', label: 'Workspace' },
      { to: '/study-rooms', icon: '🕐', label: 'Study Rooms' },
    ],
  },
]

export default function MobileDrawer({ isOpen, onClose }) {
  const drawerRef = useRef(null)

  // Block scrolling when drawer is open and handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on the backdrop or outside the drawer content
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer Container */}
          <motion.div
            ref={drawerRef}
            className="fixed inset-y-0 left-0 w-72 bg-gray-900 border-r border-gray-800 z-[70] md:hidden flex flex-col shadow-2xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            role="navigation"
            aria-label="Mobile menu"
          >
            {/* Header / Logo Area inside Drawer */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Menu
              </span>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Nav Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              {navSections.map((section, sectionIdx) => (
                <div key={section.label} className={sectionIdx > 0 ? 'mt-8' : ''}>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 px-3">
                    {section.label}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <RouterNavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                            isActive
                              ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                          }`
                        }
                      >
                        <span className="text-xl opacity-80 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </RouterNavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Optional Footer (e.g., Settings or Help) */}
            <div className="p-4 border-t border-gray-800">
              <p className="text-[10px] text-gray-600 text-center">
                HirePrep v1.0 • Built for Students
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}