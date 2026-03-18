import api from './api'

export const getAnnouncements = async () => {
  const response = await api.get('/announcements')
  return response.data.data.announcements
}

export const createAnnouncement = async (data) => {
  const response = await api.post('/announcements', data)
  return response.data.data.announcement
}

export const deleteAnnouncement = async (id) => {
  await api.delete(`/announcements/${id}`)
}
