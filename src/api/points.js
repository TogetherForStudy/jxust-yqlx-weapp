import { get, post } from '../utils/request'

export const pointsAPI = {
  getPoints() {
    return get('/api/v0/points')
  },

  getTransactions(params) {
    return get('/api/v0/points/transactions', params)
  },

  getStats(params) {
    return get('/api/v0/points/stats', params)
  },
}
