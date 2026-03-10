import Taro from '@tarojs/taro'
import { useAuthStore } from '../stores/auth'

// API基础配置
const BASE_URL = 'https://wx.ntrun.com' // 请根据实际情况修改
const AUTH_REFRESH_BUFFER_MS = 60 * 1000
const AUTH_BYPASS_REFRESH_ENDPOINTS = [
  '/api/v0/auth/refresh',
  '/api/v0/auth/wechat-login'
]

// 生成UUID v4（使用微信小程序加密随机数生成器）
const generateUUID = () => {
  return new Promise((resolve) => {
    try {
      // 使用微信小程序的加密级随机数生成器
      const cryptoManager = Taro.getUserCryptoManager()

      // 生成16个随机字节（128位）
      cryptoManager.getRandomValues({
        length: 16,
        success: (res) => {
          // Convert ArrayBuffer to Uint8Array
          const buffer = new Uint8Array(res.randomValues)

          // 设置版本号（第7字节的高4位为0100，表示版本4）
          buffer[6] = (buffer[6] & 0x0f) | 0x40
          // 设置变体位（第9字节的高2位为10）
          buffer[8] = (buffer[8] & 0x3f) | 0x80

          // 将字节数组转换为 UUID 字符串格式
          const hex = Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('')
          const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`

          resolve(uuid)
        },
        fail: (err) => {
          console.error('Failed to generate random values:', err)
          // Fallback: 使用 Math.random() + 时间戳
          resolve(generateFallbackUUID())
        }
      })
    } catch (error) {
      console.error('getUserCryptoManager failed, falling back to Math.random:', error)
      // Fallback: 使用 Math.random() + 时间戳
      resolve(generateFallbackUUID())
    }
  })
}

// 降级方案：使用 Math.random() 生成 UUID
const generateFallbackUUID = () => {
  const timestamp = Date.now().toString(16)
  const random1 = Math.random().toString(16).substring(2, 10)
  const random2 = Math.random().toString(16).substring(2, 14)
  const random3 = Math.random().toString(16).substring(2, 10)

  return `${random1}-${timestamp.substring(0, 4)}-4${random2.substring(0, 3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${random3.substring(0, 3)}-${random2.substring(3)}${random3.substring(3)}`
}

// 幂等性 Key 缓存：存储正在进行的请求的幂等性 Key
// 格式：{ 'method:url:dataHash': { key: 'uuid', timestamp: number } }
const idempotencyKeyCache = {}

// 生成请求的唯一标识（用于缓存 Key）
const generateRequestIdentifier = (method, url, data) => {
  // 对于写操作，使用 method + url + data 的简单哈希作为标识
  // 对 data 进行排序以确保相同内容但键顺序不同的对象生成相同的标识
  const dataStr = data ? JSON.stringify(sortObjectKeys(data)) : ''
  return `${method}:${url}:${dataStr}`
}

// 递归排序对象的键（用于生成一致的请求标识）
const sortObjectKeys = (obj, seen = new WeakSet()) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (seen.has(obj)) {
    return '[Circular]'
  }
  seen.add(obj)

  if (Array.isArray(obj)) {
    return obj.map(item => sortObjectKeys(item, seen))
  }

  return Object.keys(obj)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = sortObjectKeys(obj[key], seen)
      return sorted
    }, {})
}

// 获取或创建幂等性 Key
const getOrCreateIdempotencyKey = async (method, url, data) => {
  const identifier = generateRequestIdentifier(method, url, data)
  const now = Date.now()

  // 检查缓存中是否有未过期的 Key（1分钟内）
  if (idempotencyKeyCache[identifier]) {
    const cached = idempotencyKeyCache[identifier]
    // 如果 Key 在 1 分钟内，复用它
    if (now - cached.timestamp < 1 * 60 * 1000) {
      return cached.key
    }
  }

  // 生成新的 Key 并缓存
  const newKey = await generateUUID()
  idempotencyKeyCache[identifier] = {
    key: newKey,
    timestamp: now
  }

  return newKey
}

// 清除幂等性 Key（请求完成后调用）
const clearIdempotencyKey = (method, url, data) => {
  const identifier = generateRequestIdentifier(method, url, data)
  delete idempotencyKeyCache[identifier]
}

// 定期清理过期的缓存（每2分钟），保存引用以便必要时清除
let _cacheCleanupTimer = null
const startCacheCleanup = () => {
  if (_cacheCleanupTimer) return
  _cacheCleanupTimer = setInterval(() => {
    const now = Date.now()
    Object.keys(idempotencyKeyCache).forEach(key => {
      const cached = idempotencyKeyCache[key]
      if (cached && now - cached.timestamp > 2 * 60 * 1000) {
        delete idempotencyKeyCache[key]
      }
    })
  }, 2 * 60 * 1000)
}
startCacheCleanup()

const createRequestError = (message, extra = {}) => {
  return Object.assign(new Error(message), extra)
}

let isRequestErrorModalVisible = false
let queuedRequestErrorMessage = null

const buildRequestErrorContent = (error) => {
  const message = error?.message || error?.errMsg || '网络错误'
  const requestId = error?.requestId

  if (!requestId) {
    return message
  }

  return `${message}\n\n请求ID: ${requestId}`
}

const showRequestErrorModal = async (error) => {
  const content = buildRequestErrorContent(error)

  if (isRequestErrorModalVisible) {
    queuedRequestErrorMessage = content
    return
  }

  isRequestErrorModalVisible = true

  try {
    await Taro.showModal({
      title: '请求失败',
      content,
      showCancel: false,
      confirmText: '知道了'
    })
  } finally {
    isRequestErrorModalVisible = false

    if (queuedRequestErrorMessage && queuedRequestErrorMessage !== content) {
      const nextMessage = queuedRequestErrorMessage
      queuedRequestErrorMessage = null
      await showRequestErrorModal({ message: nextMessage })
    } else {
      queuedRequestErrorMessage = null
    }
  }
}

const isStandardResponseEnvelope = (data) => {
  return Boolean(data) &&
    typeof data === 'object' &&
    Object.prototype.hasOwnProperty.call(data, 'StatusCode')
}

const getHeaderValue = (headers = {}, targetName = '') => {
  if (!headers || !targetName) {
    return null
  }

  const matchedKey = Object.keys(headers).find(key => key.toLowerCase() === targetName.toLowerCase())
  return matchedKey ? headers[matchedKey] : null
}

const getResponseRequestId = (response = {}) => {
  if (response?.data?.RequestId) {
    return response.data.RequestId
  }

  return getHeaderValue(response?.header || response?.headers, 'x-request-id')
}

const getBusinessStatusCode = (data) => {
  if (!isStandardResponseEnvelope(data)) {
    return null
  }

  return data.StatusCode
}

const createResponseError = (response, fallbackMessage, extra = {}) => {
  const data = response?.data
  const httpStatusCode = response?.statusCode ?? null
  const businessStatusCode = getBusinessStatusCode(data)
  const requestId = getResponseRequestId(response)
  const message = (data && typeof data === 'object' && data.StatusMessage) || fallbackMessage || '请求失败'

  return createRequestError(message, {
    httpStatusCode,
    businessStatusCode,
    requestId,
    statusMessage: message,
    statusCode: businessStatusCode ?? httpStatusCode,
    response,
    ...extra
  })
}

const getRequestPath = (url = '') => {
  if (!url) {
    return ''
  }

  return url.replace(/^https?:\/\/[^/]+/i, '')
}

const shouldBypassAuthRefresh = (url = '') => {
  const requestPath = getRequestPath(url)
  return AUTH_BYPASS_REFRESH_ENDPOINTS.some(endpoint => requestPath.endsWith(endpoint))
}

const shouldRetryAfterAuthFailure = (error, options = {}) => {
  if (!error?.isAuthError || options.retryOnAuthFailure === false) {
    return false
  }

  if (options.skipAuthRefresh || shouldBypassAuthRefresh(options.url)) {
    return false
  }

  return Boolean(useAuthStore().refreshToken)
}

// 请求拦截器
const interceptors = {
  async request(config) {
    const authStore = useAuthStore()
    const authToken = config.authToken
    const skipAuthRefresh = config.skipAuthRefresh || shouldBypassAuthRefresh(config.url)

    if (!skipAuthRefresh) {
      await authStore.ensureValidAccessToken(AUTH_REFRESH_BUFFER_MS)
    }

    const token = authToken || authStore.token
    if (token) {
      config.header = {
        ...config.header,
        'Authorization': `Bearer ${token}`
      }
    }

    // 添加通用头部
    config.header = {
      'Content-Type': 'application/json',
      'X-Request-ID': await generateUUID(),
      ...config.header
    }

    // 为写操作添加 X-Idempotency-Key
    const method = config.method?.toUpperCase()
    const writeMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
    if (writeMethod && !config.header['X-Idempotency-Key']) {
      // 使用相同请求内容的缓存 Key，防止快速重复点击
      config.header['X-Idempotency-Key'] = await getOrCreateIdempotencyKey(
        method,
        config.url,
        config.data
        )
    }

    delete config.authToken
    delete config.skipAuthRefresh
    delete config.retryOnAuthFailure
    delete config.handleAuthFailure
    delete config.returnEnvelope

    return config
  },

  response(response, options = {}) {
    const { statusCode, data } = response
    const businessStatusCode = getBusinessStatusCode(data)
    const isAuthError = statusCode === 401 || businessStatusCode === 401
    const hasStandardEnvelope = isStandardResponseEnvelope(data)

    // 处理HTTP状态码
    if (statusCode >= 200 && statusCode < 300) {
      if (!hasStandardEnvelope) {
        return data
      }

      // 检查业务状态码
      if (data.StatusCode === 0) {
        return options.returnEnvelope ? data : data.Result
      }

      return Promise.reject(createResponseError(
        response,
        data.StatusMessage || '请求失败',
        { isAuthError }
      ))
    }

    return Promise.reject(createResponseError(
      response,
      data?.StatusMessage || `HTTP ${statusCode}`,
      { isAuthError }
    ))
  }
}

const executeRequest = async (options) => {
  let requestOptions = { ...options }
  const responseOptions = {
    returnEnvelope: requestOptions.returnEnvelope
  }
  delete requestOptions.silent

  // 添加基础URL
  if (!requestOptions.url.startsWith('http')) {
    requestOptions.url = BASE_URL + requestOptions.url
  }

  // 应用请求拦截器
  requestOptions = await interceptors.request(requestOptions)

  return Taro.request(requestOptions).then(response => interceptors.response(response, responseOptions))
}

// 通用请求方法
export const request = async (options) => {
  if (!options?.url) {
    return Promise.reject(new Error('Request URL is required'))
  }

  // 是否静默（不显示全局错误 Toast），由调用方自行处理错误提示
  const {
    silent = false,
    retryOnAuthFailure = true,
    handleAuthFailure = true
  } = options

  // 保存原始请求信息（用于清除幂等性 Key）
  const originalMethod = options.method
  const originalUrl = options.url
  const originalData = options.data

  const requestOptions = {
    ...options,
    silent,
    retryOnAuthFailure,
    handleAuthFailure
  }

  try {
    return await executeRequest(requestOptions)
  } catch (error) {
    console.error('Request error:', {
      message: error?.message,
      httpStatusCode: error?.httpStatusCode,
      businessStatusCode: error?.businessStatusCode,
      requestId: error?.requestId,
      error
    })

    let finalError = error
    if (shouldRetryAfterAuthFailure(error, requestOptions)) {
      try {
        await useAuthStore().refreshAccessToken({
          silent: true,
          force: true
        })

        return await request({
          ...options,
          retryOnAuthFailure: false
        })
      } catch (refreshError) {
        console.error('Retry after token refresh failed:', refreshError)
        finalError = refreshError
      }
    }

    if (finalError?.isAuthError && handleAuthFailure) {
      useAuthStore().expireToken(finalError.message || '请重新登录')
    } else if (!silent) {
      await showRequestErrorModal(finalError)
    }

    return Promise.reject(finalError)
  } finally {
    const method = originalMethod?.toUpperCase()
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      clearIdempotencyKey(method, originalUrl, originalData)
    }
  }
}

// GET请求
export const get = (url, data, options = {}) => {
  if (!data) {
    return request({
      url,
      method: 'GET',
      data: {},
      ...options
    })
  }

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
    data: {}, // 传空对象，参数已经在URL中
    ...options
  })
}

// POST请求
export const post = (url, data, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

// PUT请求
export const put = (url, data, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

// DELETE请求
export const del = (url, data, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

