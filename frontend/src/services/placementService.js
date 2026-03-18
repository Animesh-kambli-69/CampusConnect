import api from './api'

export const getInterviewExps = async ({ company, role } = {}) => {
  const params = {}
  if (company) params.company = company
  if (role) params.role = role
  const response = await api.get('/placement/interviews', { params })
  return response.data.data.experiences
}

export const createInterviewExp = async (data) => {
  const response = await api.post('/placement/interviews', data)
  return response.data.data.exp
}

export const deleteInterviewExp = async (id) => {
  await api.delete(`/placement/interviews/${id}`)
}

export const upvoteInterviewExp = async (id) => {
  const response = await api.post(`/placement/interviews/${id}/upvote`)
  return response.data.data
}

export const getOpportunities = async ({ company, type } = {}) => {
  const params = {}
  if (company) params.company = company
  if (type) params.type = type
  const response = await api.get('/placement/opportunities', { params })
  return response.data.data.opportunities
}

export const createOpportunity = async (data) => {
  const response = await api.post('/placement/opportunities', data)
  return response.data.data.opportunity
}

export const deleteOpportunity = async (id) => {
  await api.delete(`/placement/opportunities/${id}`)
}
