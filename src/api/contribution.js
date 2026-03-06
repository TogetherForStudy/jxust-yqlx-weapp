import { get, post } from '../utils/request'

export const contributionAPI = {
  createContribution(data) {
    return post('/api/v0/contributions', data)
  },

  getContributions(params) {
    return get('/api/v0/contributions', params)
  },

  getContributionDetail(id) {
    return get(`/api/v0/contributions/${id}`)
  },

  reviewContribution(id, data) {
    return post(`/api/v0/contributions/${id}/review`, data)
  },

  getContributionStats() {
    return get('/api/v0/contributions/stats')
  },

  getContributionStatsAdmin() {
    return get('/api/v0/contributions/stats-admin')
  }
}
