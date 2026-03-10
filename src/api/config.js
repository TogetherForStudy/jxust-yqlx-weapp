import { get } from '../utils/request'

export const configAPI = {
  getConfig(key) {
    if (!key) return Promise.reject(new Error('Config key is required'))
    return get(`/api/v0/config/${key}`)
  },
}
