import { get, request } from '../utils/request'

export const systemAPI = {
  healthCheck() {
    return request({
      url: 'https://wx.ntrun.com/health',
      method: 'GET',
      data: {},
      silent: true,
      skipAuthRefresh: true,
      retryOnAuthFailure: false,
      handleAuthFailure: false
    })
  }
}

export const statAPI = {
  getSystemOnline() {
    return get('/api/v0/stat/system/online')
  },

  getProjectOnline(projectId) {
    return get(`/api/v0/stat/project/${projectId}/online`)
  }
}
