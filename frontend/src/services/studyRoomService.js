import api from './api'

export const getStudyRooms = async () => {
  const response = await api.get('/study-rooms')
  return response.data.data.rooms
}

export const getStudyRoomById = async (id) => {
  const response = await api.get(`/study-rooms/${id}`)
  return response.data.data.room
}

export const createStudyRoom = async (data) => {
  const response = await api.post('/study-rooms', data)
  return response.data.data.room
}

export const joinStudyRoom = async (id) => {
  const response = await api.post(`/study-rooms/${id}/join`)
  return response.data.data.room
}

export const leaveStudyRoom = async (id) => {
  await api.post(`/study-rooms/${id}/leave`)
}

export const controlTimer = async (id, action) => {
  const response = await api.post(`/study-rooms/${id}/timer/${action}`)
  return response.data.data.timerState
}
