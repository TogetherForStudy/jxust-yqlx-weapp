import { get } from '../utils/request'

export const failRateAPI = {
  search(params) {
    return get('/api/v0/failrate/search', params)
  },

  getRandom() {
    return get('/api/v0/failrate/rand')
  }
}
