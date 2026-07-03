import { get } from '../utils/request'

export const configAPI = {
  getConfig(key) {
    if (!key) return Promise.reject(new Error('缺少配置项'))
    return get(`/api/v0/config/${key}`)
  },
}
