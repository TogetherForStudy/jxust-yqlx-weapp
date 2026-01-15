<template>
  <view class="min-h-screen flex flex-col">
    <!-- 主要内容 -->
    <view class="flex-1 flex flex-col">
      <!-- Logo和标题 -->
      <view class="flex flex-col items-center mb-8 mt-24">
        <image :src="LogoJPG" class="w-[539px] h-[155px]" mode="aspectFit"></image>
      </view>

      <!-- 登录按钮 -->
        <view
          class="mx-10 py-3 px-4 rounded-xl transition-all duration-200 text-center"
          :class="[
            isLoading ? 'opacity-50' : '',
            canLogin ? 'bg-blue-500 text-white active:scale-95' : 'bg-gray-300 text-gray-500'
          ]"
          @tap="handleWechatLogin"
        >
          <text v-if="!isLoading">
            微信一键登录
          </text>
          <text v-else>登录中...</text>
      </view>

      <!-- 条款同意 -->

        <view class="flex items-center justify-center my-6">
          <view
            class="flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center mr-2"
            :class="isTermsAgreed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'"
            @tap="toggleTermsAgreement"
          >
            <text v-if="isTermsAgreed" class="text-white text-xs">✓</text>
          </view>
          <view class="flex">
            <text class="text-sm text-gray-600">
              我已阅读并同意《
            </text>
            <text @tap="goToTermsOfService" class="text-sm text-blue-500 underline underline-offset-4">
              用户协议与隐私政策
            </text>
            <text class="text-sm text-gray-600">
              》
            </text>
          </view>
        </view>

      <!-- 版权信息 -->
      <view class="text-center pb-6">
        <text class="text-xs text-gray-400">© 2026 江理一起来学 版权所有</text>
      </view>
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
import LogoJPG from './logo.jpg'

const authStore = useAuthStore()
const isLoading = ref(false)
const isTermsAgreed = ref(false)
const loginButtonDisabled = ref(false) // 额外的按钮禁用状态

// 计算是否可以登录
const canLogin = computed(() => {
  return isTermsAgreed.value && !isLoading.value && !loginButtonDisabled.value
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
  if (isLoading.value || loginButtonDisabled.value) return

  // 检查是否同意条款
  if (!isTermsAgreed.value) {
    Taro.showToast({
      title: '请先阅读并同意用户协议',
      duration: 1500
    })
    return
  }

  try {
    isLoading.value = true
    loginButtonDisabled.value = true

    await authStore.wechatLogin()

    // 登录成功，保持按钮禁用状态，跳转到首页
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/home/index' })
    }, 1000)
    // 注意：登录成功后不重新启用按钮

  } catch (error) {
    console.error('登录失败:', error)
    
    // 登录失败，等待2秒（错误提示消失）后再启用按钮
    setTimeout(() => {
      loginButtonDisabled.value = false
    }, 2000)
  } finally {
    isLoading.value = false
  }
}

// 页面显示时检查是否已登录
Taro.useDidShow(() => {
  if (authStore.isLoggedIn) {
    // 已登录，跳转到首页
    Taro.switchTab({ url: '/pages/home/index' })
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
