import api from './api'

export const getCampusAnalytics = async () => {
  const response = await api.get('/campus-admin/analytics')
  return response.data.data.analytics
}

export const getCampusUsers = async ({ search = '', role = '' } = {}) => {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (role) params.set('role', role)
  const response = await api.get(`/campus-admin/users?${params}`)
  return response.data.data.users
}

export const changeUserRole = async (userId, role) => {
  const response = await api.patch(`/campus-admin/users/${userId}/role`, { role })
  return response.data.data.user
}

export const toggleSuspend = async (userId) => {
  const response = await api.patch(`/campus-admin/users/${userId}/suspend`)
  return response.data.data.user
}
