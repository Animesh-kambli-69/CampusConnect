import { NavLink, Link } from 'react-router-dom'

const navItems = [
  { to: '/campus-admin/dashboard', icon: '📊', label: 'Overview' },
  { to: '/campus-admin/students', icon: '🎓', label: 'Students' },
  { to: '/announcements', icon: '📢', label: 'Announcements' },
]

function CampusAdminSidebar() {
  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <Link to="/campus-admin/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🏫</span>
          <div>
            <p className="text-white font-bold text-sm leading-none">CampusConnect</p>
            <p className="text-indigo-400 text-xs mt-0.5">Campus Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-gray-800">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
          >
            <span className="text-base leading-none">↩️</span>
            <span>Back to Campus</span>
          </NavLink>
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">CampusConnect v1.0</p>
      </div>
    </aside>
  )
}

export default CampusAdminSidebar
