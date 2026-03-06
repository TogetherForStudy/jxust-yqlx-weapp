import { post } from '../utils/request'

export const ossAPI = {
  getToken(uri, expireSeconds = 600) {
    return post('/api/v0/oss/token', {
      uri,
      expire_seconds: expireSeconds
    })
  }
}
