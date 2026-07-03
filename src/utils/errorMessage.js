const DEFAULT_ERROR_MESSAGE = '操作失败，请稍后重试'
const DEFAULT_REQUEST_ERROR_MESSAGE = '操作失败，请稍后重试'
const AUTH_EXPIRED_MESSAGE = '请重新登录'

const TECHNICAL_ERROR_PATTERN = /(refresh[_\s-]?token|access[_\s-]?token|id[_\s-]?token|token|jwt|bearer|authorization|unauthorized|forbidden|invalid\s+(refresh[_\s-]?token|access[_\s-]?token|id[_\s-]?token|token)|sql|database|exception|stack|traceback|typeerror|referenceerror|syntaxerror|rangeerror|json|parse|undefined|null|nan|http\s*\d{3}|status\s*code|internal server error|bad gateway|gateway timeout|service unavailable|taro_app_api_base_url|request url|config key|semester is required|微信登录code|登录code|响应数据异常|数据格式异常|数据解析失败|刷新令牌|访问令牌|令牌|服务器内部错误)/i
const NETWORK_ERROR_PATTERN = /(request:fail|network|timeout|timed out|socket|econn|enotfound|eai_again|failed to fetch|offline)/i
const GENERIC_RAW_ERROR_PATTERN = /^(请求失败|网络错误|操作失败)$/

const normalizeMessage = (message) => {
  return typeof message === 'string' ? message.trim() : ''
}

export const getRawErrorMessage = (error) => {
  if (typeof error === 'string') {
    return normalizeMessage(error)
  }

  return normalizeMessage(error?.message || error?.errMsg || error?.statusMessage)
}

export const isTechnicalErrorMessage = (message) => {
  const normalizedMessage = normalizeMessage(message)

  if (!normalizedMessage) {
    return false
  }

  return normalizedMessage.length > 120 ||
    normalizedMessage.includes('\n') ||
    TECHNICAL_ERROR_PATTERN.test(normalizedMessage)
}

export const getSafeErrorMessage = (error, fallbackMessage = DEFAULT_ERROR_MESSAGE) => {
  const rawMessage = getRawErrorMessage(error)

  if (!rawMessage || GENERIC_RAW_ERROR_PATTERN.test(rawMessage) || isTechnicalErrorMessage(rawMessage)) {
    return fallbackMessage
  }

  return rawMessage
}

const getHttpStatusCode = (error) => {
  const statusCode = Number(error?.httpStatusCode)
  return Number.isFinite(statusCode) && statusCode > 0 ? statusCode : null
}

const getRequestFallbackMessage = (error, fallbackMessage = DEFAULT_REQUEST_ERROR_MESSAGE) => {
  const rawMessage = getRawErrorMessage(error)
  const httpStatusCode = getHttpStatusCode(error)

  if (error?.isAuthError || httpStatusCode === 401) {
    return AUTH_EXPIRED_MESSAGE
  }

  if (NETWORK_ERROR_PATTERN.test(rawMessage)) {
    return rawMessage.toLowerCase().includes('timeout')
      ? '网络请求超时，请稍后重试'
      : '网络异常，请检查网络后重试'
  }

  if (httpStatusCode === 403) {
    return '暂无操作权限'
  }

  if (httpStatusCode === 404) {
    return '请求的内容不存在'
  }

  if (httpStatusCode === 429) {
    return '操作太频繁，请稍后再试'
  }

  if (httpStatusCode >= 500) {
    return '服务暂时不可用，请稍后重试'
  }

  return fallbackMessage
}

const shouldForceRequestFallback = (error) => {
  const rawMessage = getRawErrorMessage(error)
  const httpStatusCode = getHttpStatusCode(error)

  return Boolean(error?.isAuthError) ||
    NETWORK_ERROR_PATTERN.test(rawMessage) ||
    httpStatusCode === 401 ||
    httpStatusCode === 403 ||
    httpStatusCode === 404 ||
    httpStatusCode === 429 ||
    httpStatusCode >= 500
}

export const getSafeRequestErrorMessage = (error, fallbackMessage = DEFAULT_REQUEST_ERROR_MESSAGE) => {
  const safeFallbackMessage = getRequestFallbackMessage(error, fallbackMessage)

  if (shouldForceRequestFallback(error)) {
    return safeFallbackMessage
  }

  return getSafeErrorMessage(error, safeFallbackMessage)
}
