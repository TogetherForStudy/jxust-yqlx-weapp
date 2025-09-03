<template>
  <view class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
    <!-- 顶部装饰 -->
    <view class="relative overflow-hidden">
      <view class="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-indigo-600 transform -skew-y-3 origin-top-left"></view>
      <view class="absolute top-8 right-8 w-16 h-16 bg-white bg-opacity-20 rounded-full"></view>
      <view class="absolute top-16 right-16 w-8 h-8 bg-white bg-opacity-30 rounded-full"></view>
    </view>

    <!-- 主要内容 -->
    <view class="flex-1 flex flex-col px-8">
      <!-- Logo和标题 -->
      <view class="flex flex-col items-center mb-8 mt-32">
        <image :src="LogoPng" class="w-20 h-20 mx-auto mb-6"></image>
        <text class="text-3xl font-bold text-gray-800 mb-2">江理一起来学</text>
        <text class="text-gray-600">学习生活信息共享交流平台</text>
      </view>

      <!-- 登录按钮 -->
      <view class="space-y-4">
        <view
          class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold shadow-lg active:scale-95 transition-transform duration-200 text-center"
          :class="{ 'opacity-50': isLoading }"
          @tap="handleWechatLogin"
        >
          <text v-if="!isLoading">
            微信一键登录
          </text>
          <text v-else>登录中...</text>
        </view>

        <view class="text-center">
          <text class="text-xs text-gray-500 mt-4">
            登录即表示同意
          </text>
          <text @tap="goToTermsOfService" class="text-xs underline text-blue-500 mt-4">
            使用条款
          </text>
        </view>
      </view>
    </view>

    <!-- 底部装饰 -->
    <view class="relative">
      <view class="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-r from-indigo-600 to-blue-500 transform skew-y-3 origin-bottom-left"></view>
    </view>

    <!-- 加载提示 -->
    <view v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <view class="bg-white rounded-lg p-6 flex flex-col items-center">
        <view class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></view>
        <text class="text-gray-700">正在登录...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import Taro from '@tarojs/taro'
import LogoPng from './logo.png'

const authStore = useAuthStore()
const isLoading = ref(false)

const goToTermsOfService = () => {
  Taro.navigateTo({ url: '/pages/terms-of-service/index' })
}

// 微信登录
const handleWechatLogin = async () => {
  console.log('handleWechatLogin')
  if (isLoading.value) return

  try {
    isLoading.value = true

    await authStore.wechatLogin()

    // 登录成功，返回上一页或跳转到首页
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/discover/index' })
    }, 1000)

  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 页面显示时检查是否已登录
Taro.useDidShow(() => {
  if (authStore.isLoggedIn) {
    // 已登录，跳转到首页
    Taro.switchTab({ url: '/pages/discover/index' })
  }
})
</script>

<style scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

button:active {
  transform: scale(0.95);
}
</style>
