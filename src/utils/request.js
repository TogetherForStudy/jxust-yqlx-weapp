import Taro from '@tarojs/taro'
import { useAuthStore } from '../stores/auth'

// API基础配置
const BASE_URL = '' // 请根据实际情况修改

// 请求拦截器
const interceptors = {
  request(config) {
    // 添加认证token
    const token = Taro.getStorageSync('token')
    if (token) {
      config.header = {
        ...config.header,
        'Authorization': `Bearer ${token}`
      }
    }

    // 添加通用头部
    config.header = {
      'Content-Type': 'application/json',
      ...config.header
    }

    return config
  },

  response(response) {
    const { statusCode, data } = response

    // 处理HTTP状态码
    if (statusCode >= 200 && statusCode < 300) {
      // 检查业务状态码
      if (data.StatusCode === 0) {
        return data.Result
      } else if (data.StatusCode === 401) {
        // token过期或无效，跳转到登录页
        useAuthStore().expireToken()
        return Promise.reject(new Error(data.StatusMessage || '登录已过期'))
      } else {
        return Promise.reject(new Error(data.StatusMessage || '请求失败'))
      }
    } else {
      return Promise.reject(new Error(`HTTP ${statusCode}`))
    }
  }
}

// 通用请求方法
export const request = (options) => {
  // 添加基础URL
  if (!options.url.startsWith('http')) {
    options.url = BASE_URL + options.url
  }

  // 应用请求拦截器
  options = interceptors.request(options)

  return Taro.request(options)
    .then(interceptors.response)
    .catch(error => {
      console.error('Request error:', error)

      // 显示错误提示
      Taro.showToast({
        title: error.message || '网络错误',
        icon: 'none',
        duration: 2000
      })

      return Promise.reject(error)
    })
}

// GET请求
export const get = (url, data) => {
  return request({
    url,
    method: 'GET',
    data
  })
}

// POST请求
export const post = (url, data) => {
  return request({
    url,
    method: 'POST',
    data
  })
}

// PUT请求
export const put = (url, data) => {
  return request({
    url,
    method: 'PUT',
    data
  })
}

// DELETE请求
export const del = (url, data) => {
  return request({
    url,
    method: 'DELETE',
    data
  })
}
