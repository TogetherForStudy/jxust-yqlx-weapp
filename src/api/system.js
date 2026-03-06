import Taro from '@tarojs/taro'
import { get } from '../utils/request'

export const systemAPI = {
  healthCheck() {
    return new Promise((resolve, reject) => {
      Taro.request({
        url: 'https://wx.ntrun.com/health',
        method: 'GET',
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(new Error(`Health check failed: HTTP ${res.statusCode}`))
          }
        },
        fail: (err) => reject(new Error(err.errMsg || 'Health check failed'))
      })
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
