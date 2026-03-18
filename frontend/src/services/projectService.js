import api from './api'

export const getProjects = async (tech) => {
  const params = tech ? { tech } : {}
  const response = await api.get('/projects', { params })
  return response.data.data.projects
}

export const getProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`)
  return response.data.data.project
}

export const getUserProjects = async (userId) => {
  const response = await api.get(`/projects/user/${userId}`)
  return response.data.data.projects
}

export const createProject = async (data) => {
  const response = await api.post('/projects', data)
  return response.data.data.project
}

export const updateProject = async (id, data) => {
  const response = await api.patch(`/projects/${id}`, data)
  return response.data.data.project
}

export const deleteProject = async (id) => {
  await api.delete(`/projects/${id}`)
}

export const likeProject = async (id) => {
  const response = await api.post(`/projects/${id}/like`)
  return response.data.data
}
