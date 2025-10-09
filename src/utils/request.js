import Taro from '@tarojs/taro'
import { useAuthStore } from '../stores/auth'

// API基础配置
const BASE_URL = 'https://wx.ntrun.com' // 请根据实际情况修改

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
        icon: 'error',
        duration: 2000
      })

      return Promise.reject(error)
    })
}

// GET请求
export const get = (url, data) => {
  // 处理数组参数（如categories），转换为多个同名参数
  let processedData = { ...data }
  let urlParams = new URLSearchParams()

  Object.keys(processedData).forEach(key => {
    const value = processedData[key]
    if (Array.isArray(value)) {
      // 数组参数：添加多个同名参数
      value.forEach(item => {
        urlParams.append(key, item)
      })
      delete processedData[key] // 从data中删除，避免重复处理
    } else if (value !== undefined && value !== null && value !== '') {
      urlParams.append(key, value)
      delete processedData[key] // 从data中删除，避免重复处理
    }
  })

  // 如果有URL参数，添加到URL中
  if (urlParams.toString()) {
    url += (url.includes('?') ? '&' : '?') + urlParams.toString()
  }

  return request({
    url,
    method: 'GET',
    data: {} // 传空对象，参数已经在URL中
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

// ============ 倒数日相关接口 ============

// 获取用户倒数日列表
export const getCountdowns = () => {
  return get('/api/v0/countdowns')
}

// 获取倒数日详情
export const getCountdownDetail = (id) => {
  return get(`/api/v0/countdowns/${id}`)
}

// 创建倒数日
export const createCountdown = (data) => {
  return post('/api/v0/countdowns', data)
}

// 更新倒数日
export const updateCountdown = (id, data) => {
  return put(`/api/v0/countdowns/${id}`, data)
}

// 删除倒数日
export const deleteCountdown = (id) => {
  return del(`/api/v0/countdowns/${id}`)
}

// ============ 学习任务相关接口 ============

// 获取学习任务列表
export const getStudyTasks = (params) => {
  return get('/api/v0/study-tasks', params)
}

// 获取学习任务详情
export const getStudyTaskDetail = (id) => {
  return get(`/api/v0/study-tasks/${id}`)
}

// 创建学习任务
export const createStudyTask = (data) => {
  return post('/api/v0/study-tasks', data)
}

// 更新学习任务
export const updateStudyTask = (id, data) => {
  return put(`/api/v0/study-tasks/${id}`, data)
}

// 删除学习任务
export const deleteStudyTask = (id) => {
  return del(`/api/v0/study-tasks/${id}`)
}

// 获取学习任务统计
export const getStudyTaskStats = () => {
  return get('/api/v0/study-tasks/stats')
}
