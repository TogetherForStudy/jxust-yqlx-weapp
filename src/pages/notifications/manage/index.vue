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
          ? 'bg-gray-500 text-white'
          : 'bg-gray-100 text-gray-600'" @tap="setStatusFilter(1)">
          草稿
        </view>
        <view class="px-3 py-1 rounded-full text-sm transition-colors" :class="statusFilter === 2
          ? 'bg-yellow-500 text-white'
          : 'bg-gray-100 text-gray-600'" @tap="setStatusFilter(2)">
          待审核
        </view>
        <view class="px-3 py-1 rounded-full text-sm transition-colors" :class="statusFilter === 3
          ? 'bg-green-500 text-white'
          : 'bg-gray-100 text-gray-600'" @tap="setStatusFilter(3)">
          已发布
        </view>
      </view>

      <!-- 搜索框 -->
      <view class="mt-3">
        <view class="relative">
          <input v-model="searchKeyword" placeholder="搜索信息标题..."
            class="w-full px-3 py-2 pr-8 bg-gray-50 rounded-lg text-sm" @input="onSearchInput" />
          <text
            class="absolute right-2 top-1/2 transform -translate-y-1/2 i-lucide-search text-gray-400 w-4 h-4"></text>
        </view>
      </view>
    </view>

    <!-- 通知列表 -->
    <view class="p-4 flex-1 h-[1px]">
      <scroll-view :scroll-y="true" class="h-full" @scrolltolower="loadMore" :lower-threshold="100">
        <!-- 加载状态 -->
        <view v-if="notificationStore.isLoading && notifications.length === 0">
          <view class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <view class="flex items-center justify-center">
              <text class="text-gray-500 text-sm">加载中...</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else-if="notifications.length === 0">
          <view class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <view class="flex flex-col items-center justify-center">
              <text class="i-lucide-bell-off text-gray-300 text-4xl mb-2"></text>
              <text class="text-gray-500 text-sm mb-4">没有找到相关信息</text>
              <view class="px-4 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
                @tap="goToCreateNotification">
                <text class="text-sm">创建信息</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 通知卡片列表 -->

        <view v-else class="space-y-3">

          <!-- 统计信息 -->
          <view class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <view class="flex justify-between items-center mb-3">
              <text class="text-gray-800 font-medium">信息统计</text>
              <text class="text-blue-500 text-sm" @tap="refreshData">
                刷新
              </text>
            </view>

            <view class="grid grid-cols-4 gap-3">
              <view class="text-center">
                <text class="text-lg font-bold text-gray-800 block">{{ stats.total }}</text>
                <text class="text-xs text-gray-500">总数</text>
              </view>
              <view class="text-center">
                <text class="text-lg font-bold text-yellow-600 block">{{ stats.pending }}</text>
                <text class="text-xs text-gray-500">待审核</text>
              </view>
              <view class="text-center">
                <text class="text-lg font-bold text-green-600 block">{{ stats.published }}</text>
                <text class="text-xs text-gray-500">已发布</text>
              </view>
              <view class="text-center">
                <text class="text-lg font-bold text-gray-600 block">{{ stats.draft }}</text>
                <text class="text-xs text-gray-500">草稿</text>
              </view>
            </view>
          </view>

          <view v-for="notification in notifications" :key="notification.id"
            class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <!-- 通知头部 -->
            <view class="flex justify-between items-start mb-2">
              <view class="flex-1 pr-2">
                <view class="flex items-center">
                  <!-- 置顶标识 -->
                  <view v-if="notification.is_pinned" class="flex items-center justify-center w-5 h-5 bg-white rounded-full mr-1 shrink-0">
                    <text class="i-lucide-pin text-red-500 w-3.5 h-3.5"></text>
                  </view>
                  <text class="text-gray-800 font-medium text-base leading-tight">
                    {{ notification.title }}
                  </text>
                  <!-- 日程图标 -->
                  <text v-if="hasScheduleData(notification)"
                    class="i-lucide-calendar text-blue-500 mx-2 text-sm shrink-0"></text>
                </view>
              </view>

              <!-- 状态标识 -->
              <view class="ml-2">
                <view class="px-2 py-1 rounded-full text-xs" :class="getStatusClass(notification.status)">
                  {{ getStatusText(notification.status) }}
                </view>
              </view>
            </view>

            <!-- 通知信息 -->
            <view class="flex justify-between items-center mb-3">
              <view class="flex items-center space-x-3">
                <!-- 分类标签 -->
                <view v-if="notification.categories && notification.categories.length > 0" class="flex space-x-1">
                  <view v-for="category in notification.categories.slice(0, 2)" :key="category.id"
                    class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                    {{ category.name }}
                  </view>
                </view>

                <!-- 发布者 -->
                <view v-if="notification.publisher" class="flex items-center">
                  <text class="i-lucide-user text-gray-400 w-3 h-3 mr-1"></text>
                  <text class="text-gray-500 text-xs">{{ notification.publisher.nickname }}</text>
                </view>
              </view>

              <view class="flex items-center space-x-3">
                <!-- 浏览量 -->
                <view v-if="notification.status === 3" class="flex items-center">
                  <text class="i-lucide-eye text-gray-400 w-3 h-3 mr-1"></text>
                  <text class="text-gray-500 text-xs">{{ notification.view_count || 0 }}</text>
                </view>

                <!-- 创建时间 -->
                <text class="text-gray-400 text-xs">
                  {{ formatDate(notification.created_at) }}
                </text>
              </view>
            </view>

            <!-- 审核汇总信息 (紧凑版，仅待审核状态显示) -->
            <view v-if="notification.status === 2 && notification.approval_summary"
              class="my-2 px-3 py-2 bg-gray-50 rounded-lg text-xs">
              <!-- 第一行：通过人数和用户信息，右侧显示比例 -->
              <view class="flex items-center justify-between mb-1">
                <view class="flex items-center flex-1 mr-3">
                  <text class="text-green-600 font-medium mr-2">
                    通过{{ notification.approval_summary.approved_count || 0 }}人:
                  </text>
                  <view class="flex-1 text-gray-600">
                    <text
                      v-if="notification.approval_summary.approved_users && notification.approval_summary.approved_users.length > 0">
                      {{notification.approval_summary.approved_users.map(user =>
                        `${user.nickname}(${user.id})`).join('、') }}
                    </text>
                    <text v-else class="text-gray-400">暂无</text>
                  </view>
                </view>
                <!-- 右上角显示通过人数/总人数 -->
                <view class="text-gray-700 font-medium whitespace-nowrap">
                  {{ notification.approval_summary.approved_count || 0 }}/{{
                    notification.approval_summary.rejected_count || 0 }}/{{ notification.approval_summary.pending_count ||
                  0 }}
                </view>
              </view>

              <!-- 第二行：通过人数和用户信息，右侧显示比例 -->
              <view class="flex items-center justify-between mb-1">
                <view class="flex items-center flex-1 mr-3">
                  <text class="text-red-600 font-medium mr-2">
                    拒绝{{ notification.approval_summary.rejected_count || 0 }}人:
                  </text>
                  <view class="flex-1 text-gray-600">
                    <text
                      v-if="notification.approval_summary.rejected_users && notification.approval_summary.rejected_users.length > 0">
                      {{notification.approval_summary.rejected_users.map(user =>
                        `${user.nickname}(${user.id})`).join('、') }}
                    </text>
                    <text v-else class="text-gray-400">暂无</text>
                  </view>
                </view>
              </view>

              <!-- 第三行：待审核人数、用户信息和当前用户状态 -->
              <view class="flex items-center justify-between">
                <view class="flex items-center flex-1">
                  <text class="text-yellow-600 font-medium mr-2">
                    待审{{ notification.approval_summary.pending_count || 0 }}人:
                  </text>
                  <view class="flex-1 text-gray-600 mr-3">
                    <text
                      v-if="notification.approval_summary.pending_users && notification.approval_summary.pending_users.length > 0">
                      {{notification.approval_summary.pending_users.map(user =>
                        `${user.nickname}(${user.id})`).join('、') }}
                    </text>
                    <text v-else class="text-gray-400">暂无</text>
                  </view>
                </view>

                <!-- 当前用户状态 -->
                <view v-if="getCurrentUserApprovalStatus(notification)" class="flex items-center ml-2">
                  <text class="w-2 h-2 rounded-full mr-1" :class="{
                    'bg-green-500': getCurrentUserApprovalStatus(notification) === 'approved',
                    'bg-red-500': getCurrentUserApprovalStatus(notification) === 'rejected',
                    'bg-blue-500': getCurrentUserApprovalStatus(notification) === 'pending'
                  }"></text>
                  <text class="text-xs whitespace-nowrap" :class="{
                    'text-green-700': getCurrentUserApprovalStatus(notification) === 'approved',
                    'text-red-700': getCurrentUserApprovalStatus(notification) === 'rejected',
                    'text-blue-700': getCurrentUserApprovalStatus(notification) === 'pending'
                  }">
                    {{
                      getCurrentUserApprovalStatus(notification) === 'approved' ? '您已通过' :
                        getCurrentUserApprovalStatus(notification) === 'rejected' ? '您已拒绝' :
                          '待您审核'
                    }}
                  </text>
                </view>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="flex space-x-2 justify-end">
              <!-- 查看详情 -->
              <view class="px-3 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
                @tap="goToNotificationDetail(notification)">
                <text class="i-lucide-eye w-4 h-4"></text>
              </view>

              <!-- 置顶/取消置顶 -->
              <view v-if="canPin(notification)"
                class="px-3 py-2 text-white rounded-lg active:opacity-80 transition-colors"
                :class="notification.is_pinned ? 'bg-gray-500' : 'bg-pink-500'"
                @tap="togglePin(notification)">
                <text class="w-4 h-4" :class="notification.is_pinned ? 'i-lucide-pin-off' : 'i-lucide-pin'"></text>
              </view>

              <!-- 编辑 -->
              <view v-if="canEdit(notification)"
                class="flex items-center px-3 py-2 bg-yellow-500 text-white rounded-lg active:bg-yellow-600 transition-colors"
                @tap="editNotification(notification.id)">
                <text class="i-lucide-edit w-4 h-4"></text>
              </view>

              <!-- 发布 -->
              <view v-if="canPublish(notification)"
                class="px-3 py-2 bg-green-500 text-white rounded-lg active:bg-green-600 transition-colors"
                @tap="publishNotification(notification.id)">
                <text class="i-lucide-upload w-4 h-4"></text>
              </view>

              <!-- 管理员直通发布 -->
              <view v-if="canPublishAdmin(notification)"
                class="px-3 py-2 bg-orange-500 text-white rounded-lg active:bg-orange-600 transition-colors"
                @tap="publishAdminNotification(notification.id)">
                <text class="i-lucide-zap w-4 h-4"></text>
              </view>

              <!-- 审核 -->
              <view v-if="canApprove(notification)"
                class="px-3 py-2 bg-purple-500 text-white rounded-lg active:bg-purple-600 transition-colors"
                @tap="showApprovalModal(notification)">
                <text class="i-lucide-check w-4 h-4"></text>
              </view>

              <!-- 删除 -->
              <view v-if="canDelete(notification)"
                class="px-3 py-2 bg-red-500 text-white rounded-lg active:bg-red-600 transition-colors"
                @tap="deleteNotification(notification.id)">
                <text class="i-lucide-trash w-4 h-4"></text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多指示器 -->
        <view v-if="notificationStore.isLoading || notificationStore.adminHasMore" class="text-center py-4">
          <text v-if="notificationStore.isLoading" class="text-gray-500 text-sm">加载中...</text>
          <text v-else-if="!notificationStore.adminHasMore && notifications.length > 0"
            class="text-gray-400 text-sm">已加载全部</text>
        </view>
      </scroll-view>
    </view>

    <!-- 审核弹窗 -->
    <view v-if="showApproval" class="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
      @tap="showApproval = false">
      <view class="bg-white rounded-t-2xl w-full max-h-[60vh] overflow-y-auto" @tap.stop>
        <view class="p-4 border-b border-gray-100">
          <view class="flex justify-between items-center">
            <text class="text-lg font-medium text-gray-800">审核信息</text>
            <text class="i-lucide-x text-gray-500 w-6 h-6" @tap="showApproval = false"></text>
          </view>
        </view>

        <view class="p-4 space-y-4">
          <!-- 审核选项 -->
          <view>
            <text class="text-sm font-medium text-gray-700 mb-2 block">审核结果</text>
            <view class="flex space-x-2">
              <view class="flex flex-1 items-center p-3 border border-gray-200 rounded-lg"
                :class="approvalForm.status === 1 ? 'border-green-500 bg-green-50' : ''" @tap="approvalForm.status = 1">
                <view class="w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center transition-colors"
                  :class="approvalForm.status === 1
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'">
                  <view v-if="approvalForm.status === 1" class="w-2 h-2 bg-white rounded-full"></view>
                </view>
                <view>
                  <text class="text-gray-700 block">通过审核</text>
                  <text class="text-gray-500 text-xs">信息将会发布</text>
                </view>
              </view>

              <view class="flex flex-1 items-center p-3 border border-gray-200 rounded-lg"
                :class="approvalForm.status === 2 ? 'border-red-500 bg-red-50' : ''" @tap="approvalForm.status = 2">
                <view class="w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center transition-colors"
                  :class="approvalForm.status === 2
                    ? 'bg-red-500 border-red-500'
                    : 'border-gray-300'">
                  <view v-if="approvalForm.status === 2" class="w-2 h-2 bg-white rounded-full"></view>
                </view>
                <view>
                  <text class="text-gray-700 block">拒绝审核</text>
                  <text class="text-gray-500 text-xs">需要填写拒绝原因</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 审核意见 -->
          <view>
            <text class="text-sm font-medium text-gray-700 mb-2 block">
              审核意见 {{ approvalForm.status === 2 ? '(必填)' : '(可选)' }}
            </text>
            <textarea v-model="approvalForm.note" :placeholder="approvalForm.status === 1 ? '请输入审核意见...' : '请输入拒绝原因...'"
              class="border-solid border-[1px] border-gray-400 rounded-lg p-2 box-border w-full" :maxlength="500" />
            <text class="text-gray-400 text-xs mt-1 block">{{ approvalForm.note.length }}/500</text>
          </view>

          <!-- 操作按钮 -->
          <view class="flex space-x-3 pt-4">
            <view class="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg active:bg-gray-200 transition-colors"
              @tap="showApproval = false">
              <text class="text-center text-sm block">取消</text>
            </view>
            <view class="flex-1 py-3 rounded-lg transition-colors" :class="approvalForm.status === 1
              ? 'bg-green-500 text-white active:bg-green-600'
              : 'bg-red-500 text-white active:bg-red-600'" @tap="submitApproval">
              <text class="text-center text-sm block">
                {{ approvalForm.status === 1 ? '通过审核' : '拒绝审核' }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建通知悬浮按钮 -->
    <view
      class="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-10"
      @tap="goToCreateNotification">
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
const searchKeyword = ref('')
const searchTimer = ref(null)
const showApproval = ref(false)
const currentNotification = ref(null)
const isFirstLoad = ref(true) // 标志位，用于控制首次加载
const approvalForm = ref({
  status: 1, // 1: 通过, 2: 拒绝
  note: ''
})

// 计算属性
const notifications = computed(() => notificationStore.adminNotifications)
const isAdmin = computed(() => authStore.isAdmin)
const isOperator = computed(() => authStore.userInfo?.role === 3)

const stats = computed(() => {
  return {
    total: notificationStore.notificationStats.total_count,
    pending: notificationStore.notificationStats.pending_count,
    published: notificationStore.notificationStats.published_count,
    draft: notificationStore.notificationStats.draft_count
  }
})

// 页面生命周期
onMounted(async () => {
  // 检查权限
  if (!authStore.requireAuth()) {
    return
  }

  if (!isAdmin.value && !isOperator.value) {
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
  if (!authStore.isLoggedIn || (!isAdmin.value && !isOperator.value)) {
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
    await Promise.all([
      notificationStore.fetchAdminNotifications({ page: 1 }),
      notificationStore.fetchNotificationStats()
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
    // 应用当前的筛选条件重新获取通知列表
    const params = { page: 1 }
    if (statusFilter.value !== null) {
      params.status = statusFilter.value
    }
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }

    await notificationStore.fetchAdminNotifications(params)
  } catch (error) {
    console.error('刷新页面数据失败:', error)
    // 静默失败，不显示错误提示，避免影响用户体验
  }
}

// 刷新数据
const refreshData = async () => {
  await Promise.all([
    notificationStore.fetchAdminNotifications({ page: 1 }),
    notificationStore.fetchNotificationStats()
  ])
  Taro.showToast({
    title: '刷新成功',
    icon: 'success'
  })
}

// 筛选功能
const setStatusFilter = async (status) => {
  statusFilter.value = status
  const params = { page: 1 }
  if (status !== null) {
    params.status = status
  }
  if (searchKeyword.value.trim()) {
    params.keyword = searchKeyword.value.trim()
  }

  await notificationStore.fetchAdminNotifications(params)
}

const clearFilters = async () => {
  statusFilter.value = null
  searchKeyword.value = ''
  await notificationStore.fetchAdminNotifications({ page: 1 })
}

// 搜索
const onSearchInput = () => {
  clearTimeout(searchTimer.value)
  searchTimer.value = setTimeout(async () => {
    const params = { page: 1 }
    if (statusFilter.value !== null) {
      params.status = statusFilter.value
    }
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }

    await notificationStore.fetchAdminNotifications(params)
  }, 500)
}

// 加载更多
const loadMore = async () => {
  if (notificationStore.isLoading || !notificationStore.adminHasMore) return

  const params = { page: notificationStore.adminCurrentPage + 1 }
  if (statusFilter.value !== null) {
    params.status = statusFilter.value
  }
  if (searchKeyword.value.trim()) {
    params.keyword = searchKeyword.value.trim()
  }

  await notificationStore.fetchAdminNotifications(params)
}

// 权限检查
const canEdit = (notification) => {
  return isAdmin.value || (notification.status === 1 && (notification.publisher_id === authStore.userId))
}

const canPublish = (notification) => {
  // 管理员可以发布任何草稿；运营只能发布自己创建的草稿
  return notification.status === 1 && (isAdmin.value || notification.publisher_id === authStore.userId)
}

const canApprove = (notification) => {
  // 只能审核待审核状态的通知，且需要管理员或运营权限
  if (notification.status !== 2 || (!isAdmin.value && !isOperator.value)) {
    return false
  }

  // 检查当前用户是否已经审核过（不能重复审核）
  if (notification.approval_summary) {
    const currentUserId = authStore.userId

    // 检查是否已通过审核
    if (notification.approval_summary.approved_users?.some(user => user.id === currentUserId)) {
      return false
    }

    // 检查是否已拒绝审核
    if (notification.approval_summary.rejected_users?.some(user => user.id === currentUserId)) {
      return false
    }
  }

  return true
}

const canDelete = (notification) => {
  // 只有管理员可以删除通知
  return isAdmin.value
}

const canPublishAdmin = (notification) => {
  // 只有管理员可以使用直通发布功能，可以直通草稿或待审核状态的通知
  return isAdmin.value && (notification.status === 1 || notification.status === 2)
}

const canPin = (notification) => {
  // 只有管理员可以置顶已发布的通知
  return isAdmin.value && notification.status === 3
}

// 操作方法
const goToCreateNotification = () => {
  Taro.navigateTo({
    url: '/pages/notifications/create/index'
  })
}

const goToNotificationDetail = (notification) => {
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

const editNotification = (id) => {
  Taro.navigateTo({
    url: `/pages/notifications/create/index?id=${id}`
  })
}

const publishNotification = async (id) => {
  const result = await Taro.showModal({
    title: '确认发布',
    content: '确定要发布这个信息吗？'
  })

  if (result.confirm) {
    try {
      await notificationStore.publishNotification(id)

      Taro.showToast({
        title: '发布成功',
        icon: 'success'
      })

      // 刷新列表
      await refreshData()
    } catch (error) {
      console.error('发布信息失败:', error)
      Taro.showToast({
        title: '发布失败',
        icon: 'error'
      })
    }
  }
}

const publishAdminNotification = async (id) => {
  const result = await Taro.showModal({
    title: '直通发布',
    content: '确定要直接发布这个信息吗？此操作将跳过审核流程，直接发布信息。'
  })

  if (result.confirm) {
    try {
      await notificationStore.publishAdminNotification(id)

      Taro.showToast({
        title: '直通成功',
        icon: 'success'
      })

      // 刷新列表
      await refreshData()
    } catch (error) {
      console.error('直通失败:', error)
      Taro.showToast({
        title: '发布失败',
        icon: 'error'
      })
    }
  }
}

const deleteNotification = async (id) => {
  const result = await Taro.showModal({
    title: '确认删除',
    content: '确定要删除这个信息吗？此操作不可恢复。'
  })

  if (result.confirm) {
    try {
      await notificationStore.deleteNotification(id)

      Taro.showToast({
        title: '删除成功',
        icon: 'success'
      })

      // 刷新列表
      await refreshData()
    } catch (error) {
      console.error('删除信息失败:', error)
      Taro.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  }
}

const showApprovalModal = (notification) => {
  currentNotification.value = notification
  approvalForm.value = {
    status: 1,
    note: ''
  }
  showApproval.value = true
}

const submitApproval = async () => {
  if (approvalForm.value.status === 2 && !approvalForm.value.note.trim()) {
    Taro.showToast({
      title: '请填写拒绝原因',
      icon: 'error'
    })
    return
  }

  try {
    await notificationStore.approveNotification(currentNotification.value.id, {
      status: approvalForm.value.status,
      note: approvalForm.value.note.trim() || (approvalForm.value.status === 1 ? '审核通过' : '审核未通过')
    })

    Taro.showToast({
      title: approvalForm.value.status === 1 ? '审核通过' : '审核拒绝',
      icon: 'success'
    })

    showApproval.value = false
    await refreshData()
  } catch (error) {
    console.error('审核信息失败:', error)
    Taro.showToast({
      title: '操作失败',
      icon: 'error'
    })
  }
}

const togglePin = async (notification) => {
  const isPinned = notification.is_pinned
  const actionText = isPinned ? '取消置顶' : '置顶'

  const result = await Taro.showModal({
    title: `确认${actionText}`,
    content: `确定要${actionText}这个信息吗？`
  })

  if (result.confirm) {
    try {
      if (isPinned) {
        await notificationStore.unpinNotification(notification.id)
      } else {
        await notificationStore.pinNotification(notification.id)
      }

      Taro.showToast({
        title: `${actionText}成功`,
        icon: 'success'
      })

      // 刷新列表
      await refreshData()
    } catch (error) {
      console.error(`${actionText}信息失败:`, error)
      Taro.showToast({
        title: `${actionText}失败`,
        icon: 'error'
      })
    }
  }
}

// 工具函数
const getCurrentUserApprovalStatus = (notification) => {
  if (!notification.approval_summary) {
    return null
  }

  const currentUserId = authStore.userId

  // 检查是否已通过审核
  if (notification.approval_summary.approved_users?.some(user => user.id === currentUserId)) {
    return 'approved'
  }

  // 检查是否已拒绝审核
  if (notification.approval_summary.rejected_users?.some(user => user.id === currentUserId)) {
    return 'rejected'
  }

  // 检查是否在待审核列表中
  if (notification.approval_summary.pending_users?.some(user => user.id === currentUserId)) {
    return 'pending'
  }

  return null
}

const getStatusClass = (status) => {
  switch (status) {
    case 1: return 'bg-gray-100 text-gray-600' // 草稿
    case 2: return 'bg-yellow-100 text-yellow-700' // 待审核
    case 3: return 'bg-green-100 text-green-700' // 已发布
    case 4: return 'bg-red-100 text-red-700' // 已删除
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 1: return '草稿'
    case 2: return '待审核'
    case 3: return '已发布'
    case 4: return '已删除'
    default: return '未知'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return formatDateTime(date, 'yyyy-MM-dd HH:mm')

}

// 判断通知是否有日程数据
const hasScheduleData = (notification) => {
  return notification.schedule?.time_slots && Array.isArray(notification.schedule.time_slots) && notification.schedule.time_slots.length > 0
}
</script>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.active\:scale-95:active {
  transform: scale(0.95);
}
</style>
