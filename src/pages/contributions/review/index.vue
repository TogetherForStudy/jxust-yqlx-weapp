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
              <text class="text-gray-500 text-sm">没有找到相关投稿</text>
            </view>
          </view>
        </view>

        <!-- 投稿卡片列表 -->
        <view v-else class="space-y-3">
          <!-- 统计信息 -->
          <view class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <view class="flex justify-between items-center mb-3">
              <text class="text-gray-800 font-medium">投稿统计</text>
              <text class="text-blue-500 text-sm" @tap="refreshData">
                刷新
              </text>
            </view>

            <view class="grid grid-cols-5 gap-1">
              <view class="text-center">
                <text class="text-lg font-bold text-gray-800 block">{{ stats.total }}</text>
                <text class="text-xs text-gray-500">总数</text>
              </view>
              <view class="text-center">
                <text class="text-lg font-bold text-yellow-600 block">{{ stats.pending }}</text>
                <text class="text-xs text-gray-500">待审核</text>
              </view>
              <view class="text-center">
                <text class="text-lg font-bold text-green-600 block">{{ stats.approved }}</text>
                <text class="text-xs text-gray-500">已采纳</text>
              </view>
              <view class="text-center">
                <text class="text-lg font-bold text-red-600 block">{{ stats.rejected }}</text>
                <text class="text-xs text-gray-500">已拒绝</text>
              </view>
              <view class="text-center">
                <text class="text-lg font-bold text-cyan-600 block">{{ stats.points }}</text>
                <text class="text-xs text-gray-500">总积分</text>
              </view>
            </view>
          </view>

          <view v-for="contribution in contributions" :key="contribution.id"
            class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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

            <!-- 投稿内容预览 -->
            <view class="mb-3">
              <text class="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {{ contribution.content }}
              </text>
            </view>

            <!-- 投稿信息 -->
            <view class="flex justify-between items-center mb-3">
              <view class="flex items-center space-x-3">
                <!-- 投稿者 -->
                <view v-if="contribution.user" class="flex items-center">
                  <text class="i-lucide-user text-gray-400 w-3 h-3 mr-1"></text>
                  <text class="text-gray-500 text-xs">{{ contribution.user.id }}</text>
                </view>

                <!-- 分类标签 -->
                <view v-if="contribution.categories && contribution.categories.length > 0" class="flex space-x-1">
                  <view v-for="category in contribution.categories.slice(0, 2)" :key="category.id"
                    class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                    {{ category.name }}
                  </view>
                </view>
              </view>

              <view class="flex items-center space-x-3">
                <!-- 积分 -->
                <view v-if="contribution.points_awarded > 0" class="flex items-center">
                  <text class="i-lucide-star text-yellow-500 w-3 h-3 mr-1"></text>
                  <text class="text-yellow-600 text-xs">{{ contribution.points_awarded }}积分</text>
                </view>

                <!-- 创建时间 -->
                <text class="text-gray-400 text-xs">
                  {{ formatDate(contribution.created_at) }}
                </text>
              </view>
            </view>

            <!-- 审核信息 -->
            <view v-if="contribution.review_note" class="mb-3">
              <view class="p-2 rounded-lg text-xs" :class="contribution.status === 2
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'">
                <text class="font-medium block mb-1">
                  {{ contribution.status === 2 ? '审核意见：' : '拒绝原因：' }}
                </text>
                <text>{{ contribution.review_note }}</text>
                <view v-if="contribution.reviewer" class="mt-1 text-right">
                  <text class="opacity-70">审核人：{{ contribution.reviewer.nickname }}</text>
                </view>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="flex space-x-2 justify-end">
              <!-- 查看详情 -->
              <view class="px-3 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
                @tap="goToContributionDetail(contribution)">
                <text class="i-lucide-eye w-4 h-4"></text>
              </view>

              <!-- 审核按钮 - 仅待审核状态显示 -->
              <view v-if="contribution.status === 1"
                class="px-3 py-2 bg-purple-500 text-white rounded-lg active:bg-purple-600 transition-colors"
                @tap="showReviewModal(contribution)">
                <text class="i-lucide-check w-4 h-4"></text>
              </view>

              <!-- 查看发布的通知 - 已采纳状态显示 -->
              <view v-else-if="contribution.status === 2 && contribution.notification"
                class="px-3 py-2 bg-green-500 text-white rounded-lg active:bg-green-600 transition-colors"
                @tap="goToNotification(contribution.notification.id)">
                <text class="i-lucide-external-link w-4 h-4"></text>
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

    <!-- 审核弹窗 -->
    <view v-if="showReview" class="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50" @tap="showReview = false">
      <view class="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto" @tap.stop>
        <view class="p-4 border-b border-gray-100">
          <view class="flex justify-between items-center">
            <text class="text-lg font-medium text-gray-800">审核投稿</text>
            <text class="i-lucide-x text-gray-500 w-6 h-6" @tap="showReview = false"></text>
          </view>
        </view>

        <view class="p-4">
          <!-- 审核选项 -->
          <view>
            <text class="text-sm font-medium text-gray-700 mb-2 block">审核结果</text>
            <view class="flex space-x-2">
              <view class="flex flex-1 items-center p-3 border border-gray-200 rounded-lg"
                :class="reviewForm.status === 2 ? 'border-green-500 bg-green-50' : ''" @tap="reviewForm.status = 2">
                <view class="w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center transition-colors"
                  :class="reviewForm.status === 2
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'">
                  <view v-if="reviewForm.status === 2" class="w-2 h-2 bg-white rounded-full"></view>
                </view>
                <view>
                  <text class="text-gray-700 block">采纳投稿</text>
                  <text class="text-gray-500 text-xs">将发布为新信息</text>
                </view>
              </view>

              <view class="flex flex-1 items-center p-3 border border-gray-200 rounded-lg"
                :class="reviewForm.status === 3 ? 'border-red-500 bg-red-50' : ''" @tap="reviewForm.status = 3">
                <view class="w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center transition-colors"
                  :class="reviewForm.status === 3
                    ? 'bg-red-500 border-red-500'
                    : 'border-gray-300'">
                  <view v-if="reviewForm.status === 3" class="w-2 h-2 bg-white rounded-full"></view>
                </view>
                <view>
                  <text class="text-gray-700 block">拒绝投稿</text>
                  <text class="text-gray-500 text-xs">需要填写拒绝原因</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 采纳时的编辑选项 -->
          <view v-if="reviewForm.status === 2">
            <!-- 通知标题 -->
            <view>
              <text class="text-sm font-medium text-gray-700 my-2 block">信息标题</text>
              <input v-model="reviewForm.title" placeholder="请输入发布的信息标题"
                class="border-solid border-[1px] border-gray-400 rounded-lg p-2" :maxlength="50" />
            </view>

            <!-- 通知内容 -->
            <view>
              <text class="text-sm font-medium text-gray-700 my-2 block">信息内容</text>
              <textarea v-model="reviewForm.content" placeholder="请输入发布的信息内容"
                class="border-solid border-[1px] border-gray-400 rounded-lg p-2 box-border w-full" :maxlength="1000" />
            </view>

            <!-- 分类选择 -->
            <view>
              <text class="text-sm font-medium text-gray-700 my-2 block">
                选择分类 <text class="text-red-500">*</text>
              </text>
              <view class="flex flex-wrap gap-2 mb-2">
                <view v-for="category in categories" :key="category.id"
                  class="flex items-center p-1 rounded-lg active:bg-gray-50 transition-colors"
                  @tap="toggleReviewCategory(category.id)">
                  <view class="flex items-center">
                    <view class="w-5 h-5 border-2 rounded mr-3 flex items-center justify-center transition-colors"
                      :class="reviewForm.categories.includes(category.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'">
                      <text v-if="reviewForm.categories.includes(category.id)"
                        class="i-lucide-check text-white w-3 h-3"></text>
                    </view>
                    <text class="text-gray-700">{{ category.name }}</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- 积分奖励 -->
            <view>
              <text class="text-sm font-medium text-gray-700 my-2 block">积分奖励</text>
              <input v-model.number="reviewForm.points" type="number" placeholder="请输入奖励积分（建议10-100）"
                class="border-solid border-[1px] border-gray-400 rounded-lg p-2" :min="0" :max="100" />
            </view>
          </view>

          <!-- 审核意见 -->
          <view>
            <text class="text-sm font-medium text-gray-700 my-2 block">
              审核意见 {{ reviewForm.status === 3 ? '(必填)' : '(可选)' }}
            </text>
            <textarea v-model="reviewForm.reviewNote"
              :placeholder="reviewForm.status === 2 ? '请输入审核意见...' : '请输入拒绝原因...'"
              class="border-solid border-[1px] border-gray-400 rounded-lg p-2 box-border w-full" :maxlength="500" />
            <text class="text-gray-400 text-xs mt-1 block">{{ reviewForm.reviewNote.length }}/500</text>
          </view>

          <!-- 操作按钮 -->
          <view class="flex space-x-3 pt-4">
            <view class="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg active:bg-gray-200 transition-colors"
              @tap="showReview = false">
              <text class="text-center text-sm block">取消</text>
            </view>
            <view class="flex-1 py-3 rounded-lg transition-colors" :class="reviewForm.status === 2
              ? 'bg-green-500 text-white active:bg-green-600'
              : 'bg-red-500 text-white active:bg-red-600'" @tap="submitReview">
              <text class="text-center text-sm block">
                {{ reviewForm.status === 2 ? '采纳' : '拒绝' }}
              </text>
            </view>
          </view>
        </view>
      </view>
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
const statusFilter = ref(1) // 默认显示待审核
const showReview = ref(false)
const currentContribution = ref(null)
const isFirstLoad = ref(true) // 标志位，用于控制首次加载
const reviewForm = ref({
  status: 2, // 2: 采纳, 3: 拒绝
  title: '',
  content: '',
  categories: [],
  points: 50,
  reviewNote: ''
})

// 计算属性
const contributions = computed(() => notificationStore.contributions)
const categories = computed(() => notificationStore.categories)
const isAdmin = computed(() => authStore.isAdmin)

const stats = computed(() => {
  return {
    total: notificationStore.adminContributionStats.total_count,
    pending: notificationStore.adminContributionStats.pending_count,
    approved: notificationStore.adminContributionStats.approved_count,
    rejected: notificationStore.adminContributionStats.rejected_count,
    points: notificationStore.adminContributionStats.total_points
  }
})

// 页面生命周期
onMounted(async () => {
  // 检查权限
  if (!authStore.requireAuth()) {
    return
  }

  if (!isAdmin.value) {
    Taro.showToast({
      title: '权限不足',
      icon: 'error'
    })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
    return
  }

  await initPage()
  isFirstLoad.value = false // 标记首次加载完成
})

// 页面显示时刷新数据
useDidShow(async () => {
  // 检查权限和登录状态
  if (!authStore.isLoggedIn || !isAdmin.value) {
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
    // 获取分类列表、投稿列表和统计数据
    await Promise.all([
      notificationStore.fetchCategories(),
      notificationStore.fetchContributions({ page: 1, status: 1 }),
      notificationStore.fetchContributionStatsAdmin()
    ])
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

// 刷新数据
const refreshData = async () => {
  const params = { page: 1 }
  if (statusFilter.value !== null) {
    params.status = statusFilter.value
  }

  await Promise.all([
    notificationStore.fetchContributions(params),
    notificationStore.fetchContributionStatsAdmin()
  ])
  Taro.showToast({
    title: '刷新成功',
    icon: 'success',
    duration: 1500
  })
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

const goToNotification = (id) => {
  Taro.navigateTo({
    url: `/pages/notifications/detail/index?id=${id}`
  })
}

// 审核相关
const showReviewModal = (contribution) => {
  currentContribution.value = contribution
  reviewForm.value = {
    status: 2,
    title: contribution.title,
    content: contribution.content,
    categories: [...(contribution.categories?.map(c => c.id) || [])],
    points: 50,
    reviewNote: ''
  }
  showReview.value = true
}

const toggleReviewCategory = (categoryId) => {
  const index = reviewForm.value.categories.indexOf(categoryId)
  if (index > -1) {
    // 如果已存在，则删除
    reviewForm.value.categories.splice(index, 1)
  } else {
    // 如果不存在，则添加
    reviewForm.value.categories.push(categoryId)
  }
}

const submitReview = async () => {
  if (reviewForm.value.status === 3 && !reviewForm.value.reviewNote.trim()) {
    Taro.showToast({
      title: '请填写拒绝原因',
      icon: 'error'
    })
    return
  }

  if (reviewForm.value.status === 2) {
    if (!reviewForm.value.title.trim()) {
      Taro.showToast({
        title: '请填写信息标题',
        icon: 'error'
      })
      return
    }

    if (!reviewForm.value.content.trim()) {
      Taro.showToast({
        title: '请填写信息内容',
        icon: 'error'
      })
      return
    }

    if (reviewForm.value.categories.length === 0) {
      Taro.showToast({
        title: '请选择至少一个分类',
        icon: 'error'
      })
      return
    }
  }

  try {
    const data = {
      status: reviewForm.value.status,
      review_note: reviewForm.value.reviewNote.trim() ||
        (reviewForm.value.status === 2 ? '内容质量很好,采纳发布' : '内容不符合要求'),
      ...(reviewForm.value.status === 2 && { points: reviewForm.value.points }),
      title: reviewForm.value.title.trim(),
      content: reviewForm.value.content.trim(),
      categories: reviewForm.value.categories
    }

    await notificationStore.reviewContribution(currentContribution.value.id, data)

    Taro.showToast({
      title: reviewForm.value.status === 2 ? '采纳成功' : '拒绝成功',
      icon: 'success',
      duration: 1500
    })

    showReview.value = false
    await refreshData()
  } catch (error) {
    console.error('审核投稿失败:', error)
    Taro.showToast({
      title: '操作失败',
      icon: 'error'
    })
  }
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

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未知分类'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return formatDateTime(new Date(dateString), 'yyyy-MM-dd HH:mm')
}
</script>

<style>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.active\:scale-95:active {
  transform: scale(0.95);
}
</style>
