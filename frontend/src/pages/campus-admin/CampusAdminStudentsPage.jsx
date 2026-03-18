import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import CampusAdminLayout from '../../components/campus-admin/CampusAdminLayout'
import {
  getCampusUsers,
  changeUserRole,
  toggleSuspend,
} from '../../services/campusAdminService'

const ROLE_LABELS = { student: 'Student', committee: 'Committee' }
const ROLE_COLORS = {
  student:   'bg-gray-700/60 text-gray-300 border-gray-600/40',
  committee: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
}

function CampusAdminStudentsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [actionLoading, setActionLoading] = useState({})

  const queryKey = ['campus-admin-users', search, roleFilter]

  const { data: users = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getCampusUsers({ search, role: roleFilter }),
    keepPreviousData: true,
  })

  const setLoading = (userId, key, val) =>
    setActionLoading((prev) => ({ ...prev, [`${userId}-${key}`]: val }))

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => changeUserRole(userId, role),
    onMutate: ({ userId }) => setLoading(userId, 'role', true),
    onSettled: (_, __, { userId }) => {
      setLoading(userId, 'role', false)
      queryClient.invalidateQueries({ queryKey: ['campus-admin-users'] })
    },
  })

  const suspendMutation = useMutation({
    mutationFn: (userId) => toggleSuspend(userId),
    onMutate: (userId) => setLoading(userId, 'suspend', true),
    onSettled: (_, __, userId) => {
      setLoading(userId, 'suspend', false)
      queryClient.invalidateQueries({ queryKey: ['campus-admin-users'] })
    },
  })

  return (
    <CampusAdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-gray-400 text-sm mt-1">Manage roles and access for your campus</p>
        </div>
        <span className="text-gray-500 text-sm">{users.length} users</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="committee">Committee</option>
        </select>
        {(search || roleFilter) && (
          <button
            onClick={() => { setSearch(''); setRoleFilter('') }}
            className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700/60 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-700/40">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-700 rounded-full shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-40 mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-56" />
                </div>
                <div className="h-6 bg-gray-700 rounded w-20" />
                <div className="h-8 bg-gray-700 rounded w-24" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/40">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3 bg-gray-900/40">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">User</span>
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider w-24 text-center">Role</span>
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider w-28 text-center">Status</span>
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider w-24 text-center">Actions</span>
            </div>

            {users.map((u) => (
              <div key={u._id} className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-gray-700/20 transition-colors ${u.isSuspended ? 'opacity-60' : ''}`}>

                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{u.name}</p>
                    <p className="text-gray-500 text-xs truncate">{u.email}</p>
                  </div>
                </div>

                {/* Role badge */}
                <div className="w-24 flex justify-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role] || ROLE_COLORS.student}`}>
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </div>

                {/* Status */}
                <div className="w-28 flex justify-center">
                  {u.isSuspended ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-900/40 text-red-300 border border-red-700/40">
                      Suspended
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-900/40 text-green-300 border border-green-700/40">
                      Active
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="w-24 flex flex-col gap-1.5 items-center">
                  {/* Role toggle */}
                  <select
                    value={u.role}
                    onChange={(e) => roleMutation.mutate({ userId: u._id, role: e.target.value })}
                    disabled={actionLoading[`${u._id}-role`]}
                    className="w-full bg-gray-700 border border-gray-600 rounded text-white text-xs px-1.5 py-1 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="student">Student</option>
                    <option value="committee">Committee</option>
                  </select>

                  {/* Suspend toggle */}
                  <button
                    onClick={() => suspendMutation.mutate(u._id)}
                    disabled={actionLoading[`${u._id}-suspend`]}
                    className={`w-full text-xs py-1 rounded border transition-colors disabled:opacity-50 ${
                      u.isSuspended
                        ? 'bg-green-900/30 border-green-700/40 text-green-400 hover:bg-green-900/60'
                        : 'bg-red-900/30 border-red-700/40 text-red-400 hover:bg-red-900/60'
                    }`}
                  >
                    {actionLoading[`${u._id}-suspend`] ? '...' : u.isSuspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CampusAdminLayout>
  )
}

export default CampusAdminStudentsPage
