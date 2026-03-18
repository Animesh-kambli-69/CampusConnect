import api from './api'

export const getLostFoundItems = async ({ type, status } = {}) => {
  const params = {}
  if (type) params.type = type
  if (status) params.status = status
  const response = await api.get('/lost-found', { params })
  return response.data.data.items
}

export const createLostFoundItem = async (formData) => {
  const response = await api.post('/lost-found', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data.item
}

export const resolveLostFoundItem = async (id) => {
  const response = await api.patch(`/lost-found/${id}/resolve`)
  return response.data.data.item
}

export const deleteLostFoundItem = async (id) => {
  await api.delete(`/lost-found/${id}`)
}
