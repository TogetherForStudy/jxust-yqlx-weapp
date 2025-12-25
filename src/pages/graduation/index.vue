<template>
  <view class="min-h-screen bg-gray-50 p-4">
    <!-- 加载状态 -->
    <view v-if="loading" class="flex items-center justify-center mt-20">
      <view class="text-center">
        <text class="text-gray-600">正在加载图片...</text>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="flex items-center justify-center mt-20">
      <view class="text-center">
        <text class="text-red-500 mb-2 block">{{ error }}</text>
        <button
          @tap="loadImage"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          重新加载
        </button>
      </view>
    </view>

    <!-- 图片展示 -->
    <view v-else-if="imageUrl" class="flex items-center justify-center">
      <view class="w-full max-w-lg">
        <image
          :src="imageUrl"
          mode="widthFix"
          class="w-full rounded-lg shadow-lg active:scale-95 transition-transform duration-200"
          @error="onImageError"
          @load="onImageLoad"
          @tap="previewImage"
        />
        <text class="text-xs text-gray-500 text-center mt-2 block">点击图片预览</text>
      </view>
    </view>

    <!-- 无数据状态 -->
    <view v-else class="flex items-center justify-center mt-20">
      <view class="text-center">
        <text class="text-gray-600">暂无图片数据</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { configAPI } from '../../api/index.js'
import { getSignedImageUrl } from '../../utils/index.js'

const loading = ref(true)
const error = ref('')
const imageUrl = ref('')

// 加载图片
const loadImage = async () => {
  try {
    loading.value = true
    error.value = ''

    // 1. 先获取图片配置路径
    const response = await configAPI.getConfig('IMAGE_BYTJ')

    if (!response || !response.value) {
      error.value = '未获取到图片地址'
      return
    }

    // 2. 使用签名URL获取图片（支持缓存和token）
    const signedUrl = await getSignedImageUrl(response.value)
    imageUrl.value = signedUrl

  } catch (err) {
    console.error('获取图片失败:', err)
    // 根据错误类型提供更具体的错误信息
    if (err.message?.includes('图片路径不能为空')) {
      error.value = '图片配置无效'
    } else if (err.message?.includes('获取图片签名失败')) {
      error.value = '图片访问授权失败，请稍后重试'
    } else {
      error.value = '获取图片失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

// 图片加载成功
const onImageLoad = () => {

}

// 图片加载失败
const onImageError = (e) => {
  console.error('图片加载失败:', e)
  error.value = '图片显示失败，请重试'
  loading.value = false
}


// 预览图片
const previewImage = () => {
  if (!imageUrl.value) return

  Taro.previewImage({
    urls: [imageUrl.value], // 需要预览的图片链接列表
    current: imageUrl.value // 当前显示图片的链接，不填则默认为urls的第一张
  }).catch(err => {
    console.error('预览图片失败:', err)
    Taro.showToast({
      title: '预览失败',
      icon: 'error',
      duration: 2000
    })
  })
}

onMounted(() => {
  loadImage()
})

Taro.useShareAppMessage((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学小程序',
      path: '/pages/discover/index',
    }
  })

Taro.useShareTimeline((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学小程序',
      path: '/pages/discover/index',
    }
  })
</script>



