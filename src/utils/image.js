import { ossAPI } from '../api/index.js'
import Taro from '@tarojs/taro'

/**
 * 图片 URL 缓存
 * 结构: { uri: { signedUrl: string, expireAt: number } }
 */
const imageUrlCache = new Map()

/**
 * 本地文件缓存信息
 * 结构: { uri: { localPath: string, saveTime: number, expireTime: number } }
 */
const localFileCache = new Map()

// 本地缓存配置
const LOCAL_CACHE_CONFIG = {
  EXPIRE_DAYS: 7, // 缓存7天
  MAX_CACHE_SIZE: 8 * 1024 * 1024, // 最大缓存8MB (留2MB给其他文件)
  MAX_CACHE_COUNT: 800, // 最大缓存文件数 (留200个给其他文件)
  STORAGE_KEY: 'image_local_cache_info' // 本地存储键名
}

/**
 * 从本地存储加载缓存信息
 */
const loadLocalCacheInfo = () => {
  try {
    const cacheInfo = Taro.getStorageSync(LOCAL_CACHE_CONFIG.STORAGE_KEY)
    if (cacheInfo && typeof cacheInfo === 'object') {
      Object.entries(cacheInfo).forEach(([uri, info]) => {
        localFileCache.set(uri, info)
      })
    }
  } catch (error) {
    console.warn('加载本地缓存信息失败:', error)
  }
}

/**
 * 保存缓存信息到本地存储
 */
const saveLocalCacheInfo = () => {
  try {
    const cacheInfo = {}
    localFileCache.forEach((value, key) => {
      cacheInfo[key] = value
    })
    Taro.setStorageSync(LOCAL_CACHE_CONFIG.STORAGE_KEY, cacheInfo)
  } catch (error) {
    console.warn('保存本地缓存信息失败:', error)
  }
}

/**
 * 生成本地文件名
 * @param {string} uri - 原始图片路径
 * @returns {string} 本地文件名
 */
const generateLocalFileName = (uri) => {
  // 使用 uri 生成哈希值作为文件名，保留原始扩展名
  const hash = btoa(uri).replace(/[+/=]/g, '_')
  const ext = uri.split('.').pop() || 'jpg'
  return `img_${hash}.${ext}`
}

/**
 * 检查本地文件是否过期
 * @param {Object} cacheInfo - 缓存信息
 * @returns {boolean} 是否过期
 */
const isLocalFileExpired = (cacheInfo) => {
  if (!cacheInfo || !cacheInfo.expireTime) return true
  return Date.now() > cacheInfo.expireTime
}

/**
 * 检查本地文件是否存在且有效
 * @param {string} filePath - 本地文件路径
 * @returns {Promise<boolean>} 文件是否存在且有效
 */
const checkLocalFileExists = async (filePath) => {
  try {
    await Taro.getFileSystemManager().getFileInfo({ filePath })
    return true
  } catch (error) {
    return false
  }
}

/**
 * 下载并保存图片到本地
 * @param {string} url - 图片URL
 * @param {string} uri - 原始图片路径
 * @returns {Promise<string>} 本地文件路径
 */
const downloadAndSaveImage = async (url, uri) => {
  try {
    // 下载文件到临时目录
    const downloadResult = await Taro.downloadFile({ url })

    if (downloadResult.statusCode !== 200) {
      throw new Error(`下载失败，状态码: ${downloadResult.statusCode}`)
    }

    // 检查临时文件路径是否存在
    if (!downloadResult.tempFilePath) {
      throw new Error('下载文件路径为空')
    }

    // 保存到本地缓存
    const saveResult = await new Promise((resolve, reject) => {
      Taro.getFileSystemManager().saveFile({
        tempFilePath: downloadResult.tempFilePath,
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          console.error('图片保存失败:', err)
          reject(new Error(`保存文件失败: ${err.errMsg || JSON.stringify(err)}`))
        }
      })
    })

    // 检查保存结果
    if (!saveResult || !saveResult.savedFilePath) {
      throw new Error('保存文件结果无效')
    }

    // 记录缓存信息
    const now = Date.now()
    const expireTime = now + (LOCAL_CACHE_CONFIG.EXPIRE_DAYS * 24 * 60 * 60 * 1000)

    localFileCache.set(uri, {
      localPath: saveResult.savedFilePath,
      saveTime: now,
      expireTime: expireTime
    })

    // 保存缓存信息到本地存储
    saveLocalCacheInfo()
    return saveResult.savedFilePath
  } catch (error) {
    console.error('下载并保存图片失败:', error)
    throw error
  }
}

/**
 * 清理过期的本地缓存文件
 */
const cleanExpiredLocalFiles = async () => {
  try {
    const expiredFiles = []
    const now = Date.now()

    // 查找过期文件
    localFileCache.forEach((cacheInfo, uri) => {
      if (now > cacheInfo.expireTime) {
        expiredFiles.push({ uri, ...cacheInfo })
      }
    })

    // 删除过期文件
    for (const fileInfo of expiredFiles) {
      try {
        await Taro.getFileSystemManager().removeSavedFile({ filePath: fileInfo.localPath })
        localFileCache.delete(fileInfo.uri)
      } catch (error) {
        console.warn('删除过期文件失败:', fileInfo.uri, error)
        // 即使删除失败，也从缓存记录中移除
        localFileCache.delete(fileInfo.uri)
      }
    }

    if (expiredFiles.length > 0) {
      saveLocalCacheInfo()
    }
  } catch (error) {
    console.error('清理过期文件失败:', error)
  }
}

/**
 * 管理缓存容量（删除最旧的文件以释放空间）
 */
const manageCacheCapacity = async () => {
  try {
    // 获取当前已保存的文件列表
    const result = await new Promise((resolve, reject) => {
      Taro.getFileSystemManager().getSavedFileList({
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          console.error('获取文件列表失败:', err)
          reject(new Error(`获取文件列表失败: ${err.errMsg || JSON.stringify(err)}`))
        }
      })
    })

    // 检查返回结果
    if (!result || !result.fileList || !Array.isArray(result.fileList)) {
      console.warn('文件列表结果无效，跳过缓存容量管理')
      return
    }

    const fileList = result.fileList

    if (fileList.length <= LOCAL_CACHE_CONFIG.MAX_CACHE_COUNT) {
      return
    }

    // 按保存时间排序，删除最旧的文件
    const sortedCache = Array.from(localFileCache.entries())
      .sort((a, b) => a[1].saveTime - b[1].saveTime)

    const deleteCount = fileList.length - LOCAL_CACHE_CONFIG.MAX_CACHE_COUNT
    const filesToDelete = sortedCache.slice(0, deleteCount)


    for (const [uri, cacheInfo] of filesToDelete) {
      try {
        await new Promise((resolve, reject) => {
          Taro.getFileSystemManager().removeSavedFile({
            filePath: cacheInfo.localPath,
            success: (res) => {
              resolve(res)
            },
            fail: (err) => {
              console.warn('删除文件失败:', uri, err)
              reject(err)
            }
          })
        })
        localFileCache.delete(uri)
      } catch (error) {
        console.warn('删除旧文件失败:', uri, error)
        localFileCache.delete(uri)
      }
    }

    if (filesToDelete.length > 0) {
      saveLocalCacheInfo()
    }
  } catch (error) {
    console.error('管理缓存容量失败:', error)
  }
}

// 初始化时加载本地缓存信息
loadLocalCacheInfo()

/**
 * 获取签名的图片URL（优先使用本地缓存）
 * @param {string} uri - 图片路径，如 "/images/avatar/123.jpg"
 * @param {number} expireSeconds - 过期时间（秒），默认600秒（10分钟）
 * @param {boolean} useCache - 是否使用缓存，默认true
 * @param {boolean} useLocalCache - 是否使用本地文件缓存，默认true
 * @returns {Promise<string>} 本地文件路径或签名后的完整图片URL
 */
export async function getSignedImageUrl(uri, expireSeconds = 600, useCache = true, useLocalCache = true) {
  if (!uri) {
    throw new Error('图片路径不能为空')
  }

  // 1. 优先检查本地文件缓存
  if (useLocalCache && localFileCache.has(uri)) {
    const localInfo = localFileCache.get(uri)

    // 检查本地文件是否过期
    if (!isLocalFileExpired(localInfo)) {
      // 检查文件是否真实存在
      const exists = await checkLocalFileExists(localInfo.localPath)
      if (exists) {
        return localInfo.localPath
      } else {
        // 文件不存在，清除缓存记录
        localFileCache.delete(uri)
        saveLocalCacheInfo()
      }
    } else {
      // 文件过期，删除本地文件和缓存记录
      try {
        await Taro.getFileSystemManager().removeSavedFile({ filePath: localInfo.localPath })
      } catch (error) {
        console.warn('删除过期本地文件失败:', error)
      }
      localFileCache.delete(uri)
      saveLocalCacheInfo()
    }
  }

  // 2. 检查在线URL缓存
  if (useCache && imageUrlCache.has(uri)) {
    const cached = imageUrlCache.get(uri)
    const now = Math.floor(Date.now() / 1000)

    // 如果URL缓存还没过期（提前30秒刷新）
    if (cached.expireAt - now > 30) {
      // 如果需要本地缓存，异步下载文件到本地
      if (useLocalCache) {
        downloadAndSaveImage(cached.signedUrl, uri).catch(error => {
          console.warn('异步下载图片到本地失败:', uri, error)
        })
      }
      return cached.signedUrl
    } else {
      // URL缓存过期，删除缓存
      imageUrlCache.delete(uri)
    }
  }

  try {
    // 3. 请求新的签名URL
    const response = await ossAPI.getToken(uri, expireSeconds)
    const { signed_url, expire_at } = response

    // 4. 缓存URL结果
    if (useCache) {
      imageUrlCache.set(uri, {
        signedUrl: signed_url,
        expireAt: expire_at
      })
    }

    // 5. 如果需要本地缓存，下载文件到本地
    if (useLocalCache) {
      try {
        const localPath = await downloadAndSaveImage(signed_url, uri)

        // 定期清理过期文件（每10次下载执行一次清理）
        if (Math.random() < 0.1) {
          cleanExpiredLocalFiles().catch(error => {
            console.warn('清理过期文件失败:', error)
          })
        }

        // 管理缓存容量
        await manageCacheCapacity()

        return localPath
      } catch (downloadError) {
        console.warn('下载图片到本地失败，返回在线URL:', uri, downloadError)
        return signed_url
      }
    }

    return signed_url
  } catch (error) {
    console.error('获取图片签名URL失败:', error)
    throw new Error(`获取图片签名失败: ${error.message}`)
  }
}

/**
 * 批量获取签名的图片URLs（优先使用本地缓存）
 * @param {string[]} uris - 图片路径数组
 * @param {number} expireSeconds - 过期时间（秒），默认600秒
 * @param {boolean} useCache - 是否使用缓存，默认true
 * @param {boolean} useLocalCache - 是否使用本地文件缓存，默认true
 * @returns {Promise<{[uri: string]: string}>} uri到本地文件路径或签名URL的映射对象
 */
export async function getBatchSignedImageUrls(uris, expireSeconds = 600, useCache = true, useLocalCache = true) {
  if (!Array.isArray(uris) || uris.length === 0) {
    return {}
  }

  const results = {}
  const promises = uris.map(async (uri) => {
    try {
      const imageUrl = await getSignedImageUrl(uri, expireSeconds, useCache, useLocalCache)
      results[uri] = imageUrl
    } catch (error) {
      console.warn(`获取图片 ${uri} 失败:`, error)
      results[uri] = null
    }
  })

  await Promise.all(promises)
  return results
}

/**
 * 清除指定图片的缓存（包括本地文件和URL缓存）
 * @param {string} uri - 要清除的图片路径，不传则清除所有缓存
 * @param {boolean} clearLocalFile - 是否同时删除本地文件，默认true
 */
export async function clearImageCache(uri = null, clearLocalFile = true) {
  if (uri) {
    // 清除指定图片缓存
    imageUrlCache.delete(uri)

    if (clearLocalFile && localFileCache.has(uri)) {
      const localInfo = localFileCache.get(uri)
      try {
        await Taro.getFileSystemManager().removeSavedFile({ filePath: localInfo.localPath })
      } catch (error) {
        console.warn('删除本地缓存文件失败:', error)
      }
      localFileCache.delete(uri)
      saveLocalCacheInfo()
    }
  } else {
    // 清除所有缓存
    imageUrlCache.clear()

    if (clearLocalFile) {
      // 删除所有本地缓存文件
      const filesToDelete = Array.from(localFileCache.values())
      for (const fileInfo of filesToDelete) {
        try {
          await Taro.getFileSystemManager().removeSavedFile({ filePath: fileInfo.localPath })
        } catch (error) {
          console.warn('删除本地缓存文件失败:', error)
        }
      }
      localFileCache.clear()
      saveLocalCacheInfo()
    }
  }
}

/**
 * 检查图片是否需要重新获取（URL过期或本地文件不存在）
 * @param {string} uri - 图片路径
 * @param {number} bufferSeconds - 缓冲时间（秒），默认60秒
 * @returns {Promise<boolean>} 是否需要重新获取
 */
export async function isImageExpiring(uri, bufferSeconds = 60) {
  // 检查本地文件缓存
  if (localFileCache.has(uri)) {
    const localInfo = localFileCache.get(uri)

    // 检查是否过期
    if (!isLocalFileExpired(localInfo)) {
      // 检查文件是否存在
      const exists = await checkLocalFileExists(localInfo.localPath)
      if (exists) {
        return false // 本地文件有效，不需要重新获取
      }
    }
  }

  // 检查URL缓存
  if (!imageUrlCache.has(uri)) {
    return true
  }

  const cached = imageUrlCache.get(uri)
  const now = Math.floor(Date.now() / 1000)
  return (cached.expireAt - now) <= bufferSeconds
}

/**
 * 预加载图片到本地缓存（适用于已知即将使用的图片）
 * @param {string[]} uris - 要预加载的图片路径数组
 * @param {number} expireSeconds - 过期时间（秒），默认600秒
 * @param {boolean} useLocalCache - 是否保存到本地缓存，默认true
 * @returns {Promise<void>}
 */
export async function preloadImageUrls(uris, expireSeconds = 600, useLocalCache = true) {
  if (!Array.isArray(uris) || uris.length === 0) {
    return
  }

  // 过滤出需要预加载的图片
  const needPreload = []
  for (const uri of uris) {
    const isExpiring = await isImageExpiring(uri, 120)
    if (isExpiring) {
      needPreload.push(uri)
    }
  }

  if (needPreload.length > 0) {
    await getBatchSignedImageUrls(needPreload, expireSeconds, true, useLocalCache)
  }
}

/**
 * 获取本地缓存统计信息
 * @returns {Promise<{totalCount: number, totalSize: number, expiredCount: number}>}
 */
export async function getLocalCacheStats() {
  try {
    const result = await new Promise((resolve, reject) => {
      Taro.getFileSystemManager().getSavedFileList({
        success: (res) => resolve(res),
        fail: (err) => reject(new Error(`获取文件列表失败: ${err.errMsg || JSON.stringify(err)}`))
      })
    })

    // 检查返回结果
    if (!result || !result.fileList || !Array.isArray(result.fileList)) {
      console.warn('获取缓存统计信息时文件列表结果无效')
      return {
        totalCount: 0,
        totalSize: 0,
        expiredCount: 0
      }
    }

    const fileList = result.fileList
    const now = Date.now()

    let totalSize = 0
    let expiredCount = 0

    // 计算总大小和过期文件数
    for (const file of fileList) {
      totalSize += file.size || 0
    }

    localFileCache.forEach((cacheInfo) => {
      if (now > cacheInfo.expireTime) {
        expiredCount++
      }
    })

    return {
      totalCount: fileList.length,
      totalSize: totalSize,
      expiredCount: expiredCount
    }
  } catch (error) {
    console.error('获取缓存统计失败:', error)
    return {
      totalCount: 0,
      totalSize: 0,
      expiredCount: 0
    }
  }
}

/**
 * 手动清理过期的本地缓存文件
 * @returns {Promise<number>} 清理的文件数量
 */
export async function cleanExpiredLocalCache() {
  try {
    await cleanExpiredLocalFiles()
    await manageCacheCapacity()

    // 返回清理后的统计信息
    const stats = await getLocalCacheStats()
    return stats.totalCount
  } catch (error) {
    console.error('清理过期缓存失败:', error)
    return 0
  }
}
