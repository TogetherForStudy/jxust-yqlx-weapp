<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <!-- 筛选栏 -->
    <view class="bg-white px-4 py-3 border-b border-gray-100">
      <view class="flex items-center justify-between mb-3">
        <text class="text-gray-800 font-medium">状态筛选</text>
        <text class="text-blue-500 text-sm" @tap="clearFilters">
          清除筛选
        </text>
      </view>

      <view class="flex space-x-2">
        <view class="px-3 py-1 rounded-full text-sm transition-colors" :class="statusFilter === null
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-600'" @tap="setStatusFilter(null)">
          全部
        </view>
        <view class="px-3 py-1 rounded-full text-sm transition-colors" :class="statusFilter === 1
          ? 'bg-yellow-500 text-white'
          : 'bg-gray-100 text-gray-600'" @tap="setStatusFilter(1)">
          待审核
        </view>
        <view class="px-3 py-1 rounded-full text-sm transition-colors" :class="statusFilter === 2
          ? 'bg-green-500 text-white'
          : 'bg-gray-100 text-gray-600'" @tap="setStatusFilter(2)">
          已采纳
        </view>
        <view class="px-3 py-1 rounded-full text-sm transition-colors" :class="statusFilter === 3
          ? 'bg-red-500 text-white'
          : 'bg-gray-100 text-gray-600'" @tap="setStatusFilter(3)">
          已拒绝
        </view>
      </view>
    </view>

    <!-- 投稿列表 -->
    <view class="p-4 flex-1 h-[1px]">
      <scroll-view :scroll-y="true" class="h-full" @scrolltolower="loadMore" :lower-threshold="100">
        <!-- 加载状态 -->
        <view v-if="notificationStore.isLoading && contributions.length === 0">
          <view class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <view class="flex items-center justify-center">
              <text class="text-gray-500 text-sm">加载中...</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else-if="contributions.length === 0">
          <view class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <view class="flex flex-col items-center justify-center">
              <text class="i-lucide-file-text text-gray-300 text-4xl mb-2"></text>
              <text class="text-gray-500 text-sm mb-4">还没有投稿记录</text>
              <view class="px-4 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
                @tap="goToCreateContribution">
                <text class="text-sm">创建投稿</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 投稿卡片列表 -->

        <view v-else class="space-y-3">
          <!-- 统计概览 -->
          <view class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <view class="flex justify-between items-center mb-3">
              <text class="text-gray-800 font-medium">投稿统计</text>
              <text class="text-blue-500 text-sm" @tap="refreshStats">
                刷新
              </text>
            </view>

            <view class="grid grid-cols-4 gap-2">
              <view class="bg-blue-50 rounded-lg p-1">
                <view class="text-center">
                  <text class="text-sm font-bold text-blue-600 block">{{ contributionStats.total_count }}</text>
                  <text class="text-sm text-blue-700">总投稿</text>
                </view>
              </view>

              <view class="bg-green-50 rounded-lg p-1">
                <view class="text-center">
                  <text class="text-sm font-bold text-green-600 block">{{ contributionStats.approved_count }}</text>
                  <text class="text-sm text-green-700">已采纳</text>
                </view>
              </view>

              <view class="bg-yellow-50 rounded-lg p-1">
                <view class="text-center">
                  <text class="text-sm font-bold text-yellow-600 block">{{ contributionStats.pending_count }}</text>
                  <text class="text-sm text-yellow-700">待审核</text>
                </view>
              </view>

              <view class="bg-purple-50 rounded-lg p-1">
                <view class="text-center">
                  <text class="text-sm font-bold text-purple-600 block">{{ contributionStats.total_points }}</text>
                  <text class="text-sm text-purple-700">总积分</text>
                </view>
              </view>
            </view>
          </view>

          <view v-for="contribution in contributions" :key="contribution.id"
            class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-98 transition-transform"
            @tap="goToContributionDetail(contribution)">
            <!-- 投稿头部 -->
            <view class="flex justify-between items-start mb-2">
              <view class="flex-1 pr-2">
                <text class="text-gray-800 font-medium text-base leading-tight">
                  {{ contribution.title }}
                </text>
              </view>

              <!-- 状态标识 -->
              <view class="ml-2">
                <view class="px-2 py-1 rounded-full text-xs" :class="getStatusClass(contribution.status)">
                  {{ getStatusText(contribution.status) }}
                </view>
              </view>
            </view>

            <!-- 审核信息 -->
            <view v-if="contribution.review_note" class="mb-3">
              <view class="p-2 rounded-lg text-xs" :class="contribution.status === 2
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'">
                <text class="font-medium">
                  {{ contribution.status === 2 ? "审核意见：" : "拒绝原因：" }}
                </text>
                <text>{{ contribution.review_note }}</text>
              </view>
            </view>

            <!-- 投稿底部信息 -->
            <view class="flex justify-between items-center">
              <view class="flex items-center space-x-3">
                <!-- 分类标签 -->
                <view v-if="contribution.categories && contribution.categories.length > 0" class="flex space-x-1">
                  <view v-for="category in contribution.categories.slice(0, 2)" :key="category.id"
                    class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                    {{ category.name }}
                  </view>
                </view>

                <!-- 积分奖励 -->
                <view v-if="contribution.points_awarded > 0" class="flex items-center">
                  <text class="i-lucide-star text-yellow-500 w-3 h-3 mr-1"></text>
                  <text class="text-yellow-600 text-xs">+{{ contribution.points_awarded }}积分</text>
                </view>
              </view>

              <view class="flex items-center space-x-3">
                <!-- 如果已发布，显示浏览量 -->
                <view v-if="contribution.notification" class="flex items-center">
                  <text class="i-lucide-eye text-gray-400 w-3 h-3 mr-1"></text>
                  <text class="text-gray-500 text-xs">{{ contribution.notification.view_count || 0 }}</text>
                </view>

                <!-- 创建时间 -->
                <text class="text-gray-400 text-xs">
                  {{ formatDate(contribution.created_at) }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多指示器 -->
        <view v-if="notificationStore.isLoading || notificationStore.contributionHasMore" class="text-center py-4">
          <text v-if="notificationStore.isLoading" class="text-gray-500 text-sm">加载中...</text>
          <text v-else-if="!notificationStore.contributionHasMore && contributions.length > 0"
            class="text-gray-400 text-sm">已加载全部</text>
        </view>
      </scroll-view>
    </view>

    <!-- 创建投稿悬浮按钮 -->
    <view
      class="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-10"
      @tap="goToCreateContribution">
      <text class="i-lucide-plus text-white w-6 h-6"></text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { useNotificationStore } from '../../../stores/notifications'
import { useAuthStore } from '../../../stores/auth'
import { formatDateTime } from '../../../utils/time'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// 响应式数据
const statusFilter = ref(null)
const isFirstLoad = ref(true) // 标志位，用于控制首次加载

// 计算属性
const contributions = computed(() => notificationStore.contributions)
const contributionStats = computed(() => notificationStore.contributionStats)

// 页面生命周期
onMounted(async () => {
  // 检查登录状态
  if (!authStore.requireAuth()) {
    return
  }

  await initPage()
  isFirstLoad.value = false // 标记首次加载完成
})

// 页面显示时刷新数据
useDidShow(async () => {
  // 检查登录状态
  if (!authStore.isLoggedIn) {
    return
  }

  // 只在非首次加载时刷新数据，避免与 onMounted 冲突
  if (!isFirstLoad.value) {
    await refreshPageData()
  }
})

// 初始化页面数据
const initPage = async () => {
  try {
    // 获取投稿统计
    await notificationStore.fetchContributionStats()

    // 获取投稿列表
    await notificationStore.fetchContributions({ page: 1 })
  } catch (error) {
    console.error('初始化页面失败:', error)
    Taro.showToast({
      title: '加载失败',
      icon: 'error'
    })
  }
}

// 刷新页面数据（用于页面显示时自动刷新）
const refreshPageData = async () => {
  try {
    // 刷新投稿统计
    await notificationStore.fetchContributionStats()

    // 应用当前的筛选条件重新获取投稿列表
    const params = { page: 1 }
    if (statusFilter.value !== null) {
      params.status = statusFilter.value
    }

    await notificationStore.fetchContributions(params)
  } catch (error) {
    console.error('刷新页面数据失败:', error)
    // 静默失败，不显示错误提示，避免影响用户体验
  }
}

// 刷新统计
const refreshStats = async () => {
  try {
    await notificationStore.fetchContributionStats()
    Taro.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('刷新统计失败:', error)
    Taro.showToast({
      title: '刷新失败',
      icon: 'error'
    })
  }
}

// 筛选功能
const setStatusFilter = async (status) => {
  statusFilter.value = status
  const params = { page: 1 }
  if (status !== null) {
    params.status = status
  }

  await notificationStore.fetchContributions(params)
}

const clearFilters = async () => {
  statusFilter.value = null
  await notificationStore.fetchContributions({ page: 1 })
}

// 加载更多
const loadMore = async () => {
  if (notificationStore.isLoading || !notificationStore.contributionHasMore) return

  const params = { page: notificationStore.contributionCurrentPage + 1 }
  if (statusFilter.value !== null) {
    params.status = statusFilter.value
  }

  await notificationStore.fetchContributions(params)
}

// 页面跳转
const goToCreateContribution = () => {
  Taro.navigateTo({
    url: '/pages/contributions/create/index'
  })
}

const goToContributionDetail = (contribution) => {
  // 准备预加载数据（只包含基础信息，减少URL长度）
  const preloadData = {
    id: contribution.id,
    title: contribution.title,
    content: contribution.content || '',
    categories: contribution.categories || [],
    status: contribution.status,
    created_at: contribution.created_at,
    user: contribution.user,
    review_note: contribution.review_note,
    reviewer: contribution.reviewer,
    reviewed_at: contribution.reviewed_at,
    points_awarded: contribution.points_awarded || 0,
    notification: contribution.notification
  }

  // 将预加载数据编码到URL中
  const encodedData = encodeURIComponent(JSON.stringify(preloadData))

  Taro.navigateTo({
    url: `/pages/contributions/detail/index?id=${contribution.id}&preloadData=${encodedData}`
  })
}

// 工具函数
const getStatusClass = (status) => {
  switch (status) {
    case 1: return 'bg-yellow-100 text-yellow-700' // 待审核
    case 2: return 'bg-green-100 text-green-700' // 已采纳
    case 3: return 'bg-red-100 text-red-700' // 已拒绝
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 1: return '待审核'
    case 2: return '已采纳'
    case 3: return '已拒绝'
    default: return '未知'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return formatDateTime(new Date(dateString), 'yyyy-MM-dd HH:mm')
}

Taro.useShareAppMessage((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学信息投稿',
      path: '/pages/contributions/mine/index',
    }
  })

Taro.useShareTimeline((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学信息投稿',
      path: '/pages/contributions/mine/index',
    }
  })
</script>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.active\:scale-98:active {
  transform: scale(0.98);
}

.active\:scale-95:active {
  transform: scale(0.95);
}
</style>
