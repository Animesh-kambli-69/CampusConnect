import api from './api'

export const getLeaderboard = async () => {
  const response = await api.get('/leaderboard')
  return response.data.data
}

export const getMyStats = async () => {
  const response = await api.get('/leaderboard/me')
  return response.data.data
}

export const getTeamRecommendations = async (skills) => {
  const response = await api.get('/teams/match', { params: { skills: skills.join(',') } })
  return response.data.data.recommendations
}
