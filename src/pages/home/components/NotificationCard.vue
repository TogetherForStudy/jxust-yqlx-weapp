<template>
  <!-- 通知公告卡片 -->
  <view class="px-4">
    <view class="flex justify-between items-center mb-2">
      <text class="text-gray-800 font-medium">信息海洋</text>
      <text
        v-if="authStore.isLoggedIn"
        class="text-blue-500 text-sm"
        @tap="goToNotifications"
      >
        查看全部
      </text>
    </view>

    <!-- 通知公告内容 -->
    <view class="bg-white rounded-xl shadow-sm border border-gray-100">
      <!-- 加载状态 -->
      <view v-if="notificationStore.isLoading" class="flex items-center justify-center py-8">
        <text class="text-gray-500 text-sm">加载中...</text>
      </view>

      <!-- 未登录状态 -->
      <view v-else-if="!authStore.isLoggedIn" class="flex flex-col items-center justify-center py-8">
        <view class="i-lucide-info text-2xl text-gray-400 mb-2"></view>
        <text class="text-gray-500 text-sm">让信息差无所遁形</text>
      </view>

      <!-- 无通知状态 -->
      <view v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center py-8">
        <view class="i-lucide-info text-2xl text-gray-400 mb-2"></view>
        <text class="text-gray-500 text-sm">暂无信息</text>
      </view>

      <!-- 通知列表 -->
      <view v-else class="divide-y divide-gray-100">
        <view
          v-for="(notification) in notifications"
          :key="notification.id"
          class="px-4 py-3 active:bg-gray-50 transition-colors"
          @tap="goToNotificationDetail(notification.id)"
        >
          <view class="flex justify-between items-start">
              <!-- 通知标题 -->
              <view class="flex items-center flex-1 mr-2">
                <!-- 置顶标识 -->
                <view v-if="notification.is_pinned" class="flex items-center justify-center w-4.5 h-4.5 bg-white rounded-full mr-1.5 shrink-0">
                  <text class="i-lucide-pin text-red-500 w-3 h-3"></text>
                </view>
                <text class="text-gray-800 font-medium leading-tight line-clamp-1">
                  {{ notification.title }}
                </text>
                <!-- 日程图标 -->
                <text v-if="hasScheduleData(notification)" class="i-lucide-calendar text-blue-500 mx-2 shrink-0 text-sm"></text>
              </view>
                <!-- 发布时间 -->
                <text v-if="!notification.is_pinned" class="text-gray-400 text-xs shrink-0">
                  {{ formatDate(notification.published_at || notification.created_at) }}
                </text>
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
import { formatDateTime } from '../../../utils/time'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// 计算属性
const notifications = computed(() => {
  return notificationStore.notifications.slice(0, 6)
})

// 页面初始化
onMounted(async () => {
  if (authStore.isLoggedIn && notificationStore.notifications.length === 0) {
    await loadNotifications()
  }
})

// 加载通知
const loadNotifications = async () => {
  // 未登录时不发起请求
  if (!authStore.isLoggedIn) {
    return
  }

  try {
    await notificationStore.fetchNotifications({
      page: 1,
      size: 10,
      status: 3 // 只获取已发布的通知
    })
  } catch (error) {
    console.error('加载信息失败:', error)
  }
}

// 页面跳转
const goToNotifications = () => {
  if (!authStore.requireAuth()) return;
  Taro.navigateTo({
    url: '/pages/notifications/index'
  })
}

const goToNotificationDetail = (id) => {
  if (!authStore.requireAuth()) return;
  Taro.navigateTo({
    url: `/pages/notifications/detail/index?id=${id}`
  })
}

// 工具函数
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else if (days < 30) {
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? '1周前' : `${weeks}周前`
  } else if (days < 365) {
    const months = Math.floor(days / 30)
    return months === 1 ? '1月前' : `${months}月前`
  } else {
    return formatDateTime(date, 'yyyy-MM-dd HH:mm')
  }
}

// 判断通知是否有日程数据
const hasScheduleData = (notification) => {
  return notification.schedule?.time_slots && Array.isArray(notification.schedule.time_slots) && notification.schedule.time_slots.length > 0
}

// 页面显示时检查并加载数据（处理首次登录场景）
Taro.useDidShow(async () => {
  if (authStore.isLoggedIn && notificationStore.notifications.length === 0) {
    await loadNotifications()
  }
})

</script>

<style>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
