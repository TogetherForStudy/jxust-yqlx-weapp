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

      <!-- 条款同意 -->
      <view class="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <view class="flex items-center">
          <view
            class="flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center mr-3"
            :class="isTermsAgreed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'"
            @tap="toggleTermsAgreement"
          >
            <text v-if="isTermsAgreed" class="text-white text-xs">✓</text>
          </view>
          <view class="flex-1">
            <text class="text-sm text-gray-700">
              我已阅读并同意
            </text>
            <text @tap="goToTermsOfService" class="text-sm text-blue-500 underline">
              《用户协议与法律协议》
            </text>
          </view>
        </view>
      </view>

      <!-- 登录按钮 -->
      <view class="space-y-4">
        <view
          class="w-full py-4 px-6 rounded-xl font-bold shadow-lg transition-all duration-200 text-center"
          :class="[
            isLoading ? 'opacity-50' : '',
            canLogin ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white active:scale-95' : 'bg-gray-300 text-gray-500'
          ]"
          @tap="handleWechatLogin"
        >
          <text v-if="!isLoading">
            微信一键登录
          </text>
          <text v-else>登录中...</text>
        </view>

        <view v-if="!isTermsAgreed" class="text-center">
          <text class="text-xs text-red-500">
            请先阅读并同意用户协议
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
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import Taro from '@tarojs/taro'
import LogoPng from './logo.png'

const authStore = useAuthStore()
const isLoading = ref(false)
const isTermsAgreed = ref(false)

// 计算是否可以登录
const canLogin = computed(() => {
  return isTermsAgreed.value && !isLoading.value
})

// 切换条款同意状态
const toggleTermsAgreement = () => {
  isTermsAgreed.value = !isTermsAgreed.value
}

const goToTermsOfService = () => {
  Taro.navigateTo({ url: '/pages/terms-of-service/index' })
}

// 微信登录
const handleWechatLogin = async () => {
  if (isLoading.value) return

  // 检查是否同意条款
  if (!isTermsAgreed.value) {
    Taro.showToast({
      title: '请先阅读并同意用户协议',
      icon: 'none',
      duration: 2000
    })
    return
  }

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
