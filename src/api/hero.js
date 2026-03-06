import { get, post, put, del } from '../utils/request'

export const heroAPI = {
  getHeroes() {
    return get('/api/v0/heroes/')
  },

  searchHeroes(params) {
    return get('/api/v0/heroes/search', params)
  },

  createHero(data) {
    return post('/api/v0/heroes/', data)
  },

  updateHero(id, data) {
    return put(`/api/v0/heroes/${id}`, data)
  },

  deleteHero(id) {
    return del(`/api/v0/heroes/${id}`)
  }
}
