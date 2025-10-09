<template>
  <view class="min-h-screen bg-[#bc0300] text-[#fff5d3]">
    <!-- 头部标题 -->
    <view class="pt-8 pb-8">
      <view class="absolute left-0 top-0 z-10 flex flex-col">
          <text class="font-serif text-white text-opacity-20 text-4xl font-bold">TOGETHER FOR</text>
          <text class="font-serif text-white text-opacity-20 text-4xl font-bold">STUDY</text>
          <text class="font-serif text-white text-opacity-20 text-4xl font-bold">HERO</text>
      </view>
      <text class="block text-2xl font-normal mb-2 text-center">江理一起来学</text>
      <text class="block text-3xl font-bold text-center">英雄榜</text>
    </view>

    <!-- 描述文字 -->
    <view class="text-center px-8 pb-8">
      <text class="text-base leading-relaxed">
        Ta们为一起来学的资源共享和信息差弥补事业作出了不可磨灭的贡献，致敬平凡的伟大
      </text>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="flex flex-col items-center py-20">
      <view class="w-15 h-15 mb-5 rounded-full border-2 border-[#fff5d3] border-opacity-30 border-t-[#fff5d3] animate-spin"></view>
      <text class="text-[#fff5d3] text-sm opacity-80">正在加载英雄名单...</text>
    </view>

    <!-- 英雄名单表格 -->
    <view v-else-if="heroes.length > 0" class="px-4">
      <view class="grid grid-cols-2 gap-2">
        <view
          v-for="(hero, index) in heroes"
          :key="index"
          class="border border-[#fff5d3] border-opacity-30 p-1 text-center"
        >
          <text class="text-sm text-[#fff5d3]">{{ hero }}</text>
        </view>
      </view>
    <view class="mt-8 text-center flex flex-col items-center gap-2">
      <text class="text-[#fff5d3] text-sm">总计 {{ heroes.length }} 人</text>
      <text class="text-[#fff5d3] text-sm">答疑、投稿资料、分享信息、友善帮助</text>
     <text class="text-[#fff5d3] text-sm">欢迎一起拥抱开源，江理一起来学</text>
    </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="text-center py-20">
      <text class="text-[#fff5d3] text-sm opacity-60">暂无英雄名单</text>
    </view>

    <!-- 底部间距 -->
    <view class="h-16"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { heroAPI } from '../../api'
import Taro from '@tarojs/taro'

const heroes = ref([])
const loading = ref(false)

// 获取英雄名单
const fetchHeroes = async () => {
  try {
    loading.value = true
    const response = await heroAPI.getHeroes()

    // 假设后端返回的是字符串数组或者需要解析的格式
    if (Array.isArray(response)) {
      heroes.value = response
    } else {
      // 如果返回的是其他格式，根据实际情况调整
      heroes.value = []
    }
  } catch (error) {
    console.error('获取英雄名单失败:', error)
    Taro.showToast({
      title: '获取英雄名单失败',
      icon: 'error',
      duration: 2000
    })
    heroes.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHeroes()
})
</script>

