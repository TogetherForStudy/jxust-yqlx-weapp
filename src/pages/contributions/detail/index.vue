<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 骨架屏加载状态 -->
    <SkeletonDetail v-if="isLoading && !contribution" :show-extra="true" />

    <!-- 投稿详情 -->
    <view v-else-if="contribution" class="p-4">
      <!-- 主要内容卡片 -->
      <view class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <!-- 投稿头部 -->
        <view class="mb-4">
          <!-- 标题 -->
          <text class="font-bold text-base text-gray-800 leading-tight block mb-3">
            {{ contribution.title }}
          </text>

          <!-- 元信息 -->
          <view class="flex flex-wrap items-center gap-3 text-gray-500 text-xs">
            <!-- 投稿者 -->
            <view v-if="contribution.user" class="flex items-center">
              <text class="i-lucide-user w-4 h-4 mr-1"></text>
              <text>{{ contribution.user.id }}</text>
            </view>

            <!-- 投稿时间 -->
            <view class="flex items-center">
              <text class="i-lucide-calendar w-4 h-4 mr-1"></text>
              <text>{{ formatDateTime(contribution.created_at) }}</text>
            </view>

            <!-- 状态 -->
            <view class="flex items-center">
              <view
                class="px-2 py-1 rounded-full text-xs"
                :class="getStatusClass(contribution.status)"
              >
                {{ getStatusText(contribution.status) }}
              </view>
            </view>
          </view>

          <!-- 分类标签 -->
          <view v-if="contribution.categories && contribution.categories.length > 0" class="flex flex-wrap gap-2 mt-3">
            <view
              v-for="category in contribution.categories"
              :key="category.id"
              class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
            >
              {{ category.name }}
            </view>
          </view>
        </view>

        <!-- 分割线 -->
        <view class="border-t border-gray-100 my-4"></view>

        <!-- 投稿内容 -->
        <view class="mb-2">
          <view class="text-gray-700 leading-relaxed">
            <text class="whitespace-pre-wrap">{{ contribution.content }}</text>
          </view>
        </view>

        <!-- 审核信息 -->
        <view v-if="contribution.review_note || contribution.reviewer" class="mb-4">
          <view
            class="p-4 rounded-lg border-l-4"
            :class="contribution.status === 2
              ? 'bg-green-50 border-green-500'
              : contribution.status === 3
                ? 'bg-red-50 border-red-500'
                : 'bg-gray-50 border-gray-300'"
          >
            <view class="flex items-center mb-2">
              <text
                class="w-5 h-5 mr-2"
                :class="contribution.status === 2
                  ? 'i-lucide-check-circle text-green-600'
                  : contribution.status === 3
                    ? 'i-lucide-x-circle text-red-600'
                    : 'i-lucide-clock text-gray-600'"
              ></text>
              <text
                class="font-medium"
                :class="contribution.status === 2
                  ? 'text-green-800'
                  : contribution.status === 3
                    ? 'text-red-800'
                    : 'text-gray-800'"
              >
                {{ contribution.status === 2 ? '审核通过' : contribution.status === 3 ? '审核未通过' : '等待审核' }}
              </text>
            </view>

            <view v-if="contribution.review_note" class="mb-2">
              <text
                class="text-sm font-medium"
                :class="contribution.status === 2
                  ? 'text-green-700'
                  : contribution.status === 3
                    ? 'text-red-700'
                    : 'text-gray-700'"
              >
                审核意见：
              </text>
              <text
                class="text-sm"
                :class="contribution.status === 2
                  ? 'text-green-700'
                  : contribution.status === 3
                    ? 'text-red-700'
                    : 'text-gray-700'"
              >
                {{ contribution.review_note }}
              </text>
            </view>

            <view v-if="contribution.reviewer" class="flex items-center justify-between">
              <view class="flex items-center">
                <text
                  class="text-xs"
                  :class="contribution.status === 2
                    ? 'text-green-600'
                    : contribution.status === 3
                      ? 'text-red-600'
                      : 'text-gray-600'"
                >
                  审核人：{{ contribution.reviewer.nickname }}
                </text>
              </view>

              <view v-if="contribution.reviewed_at">
                <text
                  class="text-xs"
                  :class="contribution.status === 2
                    ? 'text-green-600'
                    : contribution.status === 3
                      ? 'text-red-600'
                      : 'text-gray-600'"
                >
                  {{ formatDateTime(contribution.reviewed_at) }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 积分奖励信息 -->
        <view v-if="contribution.points_awarded > 0" class="mb-4">
          <view class="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
            <view class="flex items-center mb-2">
              <text class="i-lucide-star text-yellow-600 w-5 h-5 mr-2"></text>
              <text class="text-yellow-800 font-medium">积分奖励</text>
            </view>
            <text class="text-yellow-700 text-sm">获得 {{ contribution.points_awarded }} 积分奖励</text>
          </view>
        </view>

        <!-- 发布通知信息 -->
        <view v-if="contribution.notification" class="mb-4">
          <view class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <view class="flex items-center mb-2">
              <text class="i-lucide-bell text-blue-600 w-5 h-5 mr-2"></text>
              <text v-if="contribution.notification.status == 3" class="text-blue-800 font-medium">已发布信息</text>
              <text v-else class="text-blue-800 font-medium">投稿已采纳，信息审核中</text>
            </view>
            <text class="text-blue-700 text-sm block mb-2">{{ contribution.notification.title }}</text>
            <view class="flex items-center justify-between">
              <text class="text-blue-600 text-xs">
                浏览量：{{ contribution.notification.view_count || 0 }}
              </text>
              <view
                class="px-3 py-1 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
                @tap="goToNotification"
              >
                <text class="text-xs">查看信息</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else class="p-4">
      <view class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <view class="flex flex-col items-center justify-center">
          <text class="i-lucide-alert-circle text-red-400 text-4xl mb-2"></text>
          <text class="text-gray-500 text-sm">投稿不存在或已被删除</text>
          <view
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
            @tap="goBack"
          >
            <text class="text-sm">返回</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useNotificationStore } from '../../../stores/notifications'
import { useAuthStore } from '../../../stores/auth'
import SkeletonDetail from '../../../components/SkeletonDetail.vue'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// 页面参数
const contributionId = ref('')
const isLoading = ref(true)
const preloadData = ref(null)

// 计算属性
const contribution = computed(() => notificationStore.contributionDetail || preloadData.value)
const canEdit = computed(() => {
  if (!contribution.value) return false
  return contribution.value.user_id === authStore.userId
})

// 页面生命周期
onMounted(() => {
  const instance = Taro.getCurrentInstance()
  const params = instance.router?.params || {}
  contributionId.value = params.id

  // 尝试从路由参数中获取预加载数据
  if (params.preloadData) {
    try {
      preloadData.value = JSON.parse(decodeURIComponent(params.preloadData))
      isLoading.value = false
    } catch (error) {
      console.error('解析预加载数据失败:', error)
    }
  }

  if (contributionId.value) {
    fetchContributionDetail()
  }
})

// 获取投稿详情
const fetchContributionDetail = async () => {
  try {
    isLoading.value = true
    await notificationStore.fetchContributionDetail(contributionId.value)
    // 数据加载完成后，清除预加载数据
    preloadData.value = null
  } catch (error) {
    console.error('获取投稿详情失败:', error)
    Taro.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

const goToNotification = () => {
  if (contribution.value?.notification?.id) {
    const notification = contribution.value.notification

    // 准备预加载数据（只包含基础信息，减少URL长度）
    const preloadData = {
      id: notification.id,
      title: notification.title,
      content: notification.content || '',
      categories: notification.categories || [],
      view_count: notification.view_count || 0,
      created_at: notification.created_at,
      published_at: notification.published_at,
      publisher: notification.publisher,
      schedule: notification.schedule,
      status: notification.status
    }

    // 将预加载数据编码到URL中
    const encodedData = encodeURIComponent(JSON.stringify(preloadData))

    Taro.navigateTo({
      url: `/pages/notifications/detail/index?id=${notification.id}&preloadData=${encodedData}`
    })
  }
}

const goBack = () => {
  Taro.navigateBack()
}

// 删除投稿
const deleteContribution = async () => {
  const result = await Taro.showModal({
    title: '确认删除',
    content: '确定要删除这个投稿吗？此操作不可恢复。'
  })

  if (result.confirm) {
    try {
      // 注意：这里需要实现删除投稿的API
      Taro.showToast({
        title: '删除成功',
        icon: 'success'
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('删除投稿失败:', error)
      Taro.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
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

const formatDateTime = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

}
</script>

<style>
.whitespace-pre-wrap {
  white-space: pre-wrap;
}

.active\:scale-95:active {
  transform: scale(0.95);
}
</style>
