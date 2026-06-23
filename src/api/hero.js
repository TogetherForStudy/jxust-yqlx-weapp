import { get } from '../utils/request'

export const heroAPI = {
  getHeroes() {
    return get('/api/v0/heroes/')
  },
}
