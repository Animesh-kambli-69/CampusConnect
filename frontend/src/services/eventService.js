import api from './api'

export const getEvents = async () => {
  const response = await api.get('/events')
  return response.data.data.events
}

export const createEvent = async (data) => {
  const response = await api.post('/events', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data.event
}

export const getEventById = async (id) => {
  const response = await api.get(`/events/${id}`)
  return response.data.data.event
}

export const openAttendance = async (eventId) => {
  const response = await api.post(`/events/${eventId}/attendance/open`)
  return response.data.data // { token, eventId }
}

export const closeAttendance = async (eventId) => {
  await api.post(`/events/${eventId}/attendance/close`)
}

export const markAttendance = async (eventId, token) => {
  const response = await api.post(`/events/${eventId}/attendance/mark`, { token })
  return response.data
}

export const getAttendees = async (eventId) => {
  const response = await api.get(`/events/${eventId}/attendance`)
  return response.data.data // { attendees, attendanceOpen }
}
