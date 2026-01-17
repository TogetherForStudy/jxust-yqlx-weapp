<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 骨架屏加载状态 -->
    <SkeletonDetail v-if="isLoading && !notification" :show-extra="true" />

    <!-- 通知详情 -->
    <view v-else-if="notification" class="p-4">
      <!-- 主要内容卡片 -->
      <view class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <!-- 通知头部 -->
        <view class="mb-4">
          <!-- 标题 -->
          <text class="font-bold text-base text-gray-800 leading-tight block mb-3" :user-select="true">
            {{ notification.title }}
          </text>

          <!-- 元信息 -->
          <view class="flex flex-wrap items-center gap-3 text-gray-500 text-xs">
            <!-- 发布者 -->
            <view v-if="notification.publisher" class="flex items-center">
              <text class="i-lucide-user w-4 h-4 mr-1"></text>
              <text>{{ notification.publisher.nickname }}</text>
            </view>

            <!-- 发布时间 -->
            <view class="flex items-center">
              <text class="i-lucide-calendar w-4 h-4 mr-1"></text>
              <text>{{ formatDateTime(notification.published_at || notification.created_at) }}</text>
            </view>

            <!-- 浏览量 -->
            <view class="flex items-center">
              <text class="i-lucide-eye w-4 h-4 mr-1"></text>
              <text>{{ notification.view_count || 0 }}</text>
            </view>

            <!-- 状态 -->
            <view v-if="notification.status !== 3" class="flex items-center">
              <view
                class="px-2 py-1 rounded-full"
                :class="getStatusClass(notification.status)"
              >
                {{ getStatusText(notification.status) }}
              </view>
            </view>
          </view>

          <!-- 分类标签 -->
          <view v-if="notification.categories && notification.categories.length > 0" class="flex flex-wrap gap-2 mt-3">
            <view
              v-for="category in notification.categories"
              :key="category.id"
              class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
            >
              {{ category.name }}
            </view>
          </view>
        </view>

        <!-- 分割线 -->
        <view class="border-t border-gray-100 my-4"></view>

        <!-- 通知内容 -->
        <view class="mb-6">
          <view class="text-gray-700 leading-relaxed break-words">
            <text class="whitespace-pre-wrap break-words" :user-select="true">{{ notification.content }}</text>
          </view>
        </view>

        <!-- 如果有关联日程信息 -->
        <view v-if="getScheduleTimeSlots().length > 0" class="mb-4">
          <view class="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
            <view class="flex items-center mb-2">
              <text class="i-lucide-calendar-check text-blue-600 w-4 h-4 mr-2"></text>
              <text class="text-blue-800 text-sm font-medium">{{ notification.schedule.title }}</text>
            </view>

            <!-- 日程描述 -->
            <view v-if="notification.schedule?.description" class="mb-2">
              <text class="text-blue-700 text-sm">{{ notification.schedule.description }}</text>
            </view>

            <!-- 多个时间段列表 -->
            <view class="space-y-1">
              <view
                v-for="(timeSlot, index) in getScheduleTimeSlots()"
                :key="index"
                class="rounded p-2 border transition-colors"
                :class="isTimeSlotActive(timeSlot)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-blue-100'"
              >
                <view class="flex items-center justify-between">
                  <view class="flex-1">
                    <!-- 时间段名称和状态 -->
                    <view v-if="timeSlot.name && timeSlot.name !== notification.schedule?.title"
                          class="flex items-center mb-1">
                      <text class="text-sm font-medium"
                            :class="isTimeSlotActive(timeSlot) ? 'text-green-800' : 'text-blue-800'">
                        {{ timeSlot.name }}
                      </text>
                      <view v-if="isTimeSlotActive(timeSlot)" class="ml-2 px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                        进行中
                      </view>
                    </view>

                    <!-- 时间信息 -->
                    <view class="flex items-center text-xs"
                          :class="isTimeSlotActive(timeSlot) ? 'text-green-600' : 'text-blue-600'">
                      <text class="w-3 h-3 mr-1"
                            :class="isTimeSlotActive(timeSlot) ? 'i-lucide-play-circle' : 'i-lucide-clock'"></text>
                      <text v-if="timeSlot.is_all_day">
                        {{ timeSlot.start_date }}{{ timeSlot.end_date && timeSlot.end_date !== timeSlot.start_date ? ' ~ ' + timeSlot.end_date : '' }} (全天)
                      </text>
                      <text v-else>
                        {{ timeSlot.start_date }} {{ timeSlot.start_time }} - {{ timeSlot.end_date || timeSlot.start_date }} {{ timeSlot.end_time }}
                      </text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 投稿信息（如果是从投稿转化来的） -->
        <view v-if="notification.publisher_type == 2" class="mb-4">
          <view class="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <view class="flex items-center mb-2">
              <text class="i-lucide-heart text-green-600 w-5 h-5 mr-2"></text>
              <text class="text-green-800 text-sm">感谢投稿</text>
            </view>
            <text class="text-green-700 text-sm">来自 {{ notification.contributor_id }} 的投稿</text>
          </view>
        </view>

        <text class="text-gray-500 text-xs">@江理一起来学小程序 · 信息海洋</text>
      </view>
    </view>
    <!-- 错误状态 -->
    <view v-else class="p-4">
      <view class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <view class="flex flex-col items-center justify-center">
          <text class="i-lucide-alert-circle text-red-400 text-4xl mb-2"></text>
          <text class="text-gray-500 text-sm">信息不存在或已被删除</text>
          <view
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
            @tap="goBack"
          >
            <text class="text-sm">返回</text>
          </view>
        </view>
      </view>
    </view>
    <view v-if="isAdmin || isOperator" class="flex justify-end px-4">
      <view @tap="openScheduleModal" class="flex w-36 items-center justify-center p-3 rounded-lg bg-cyan-600">
            <text class="i-lucide-calendar-check w-5 h-5 mr-2 text-white"></text>
            <text class="font-medium text-white">添加日程</text>
      </view>
    </view>

    <!-- 转为日程弹窗 -->
    <view
      v-if="showScheduleModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
      @tap="showScheduleModal = false"
    >
      <view
        class="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto"
        @tap.stop
      >
        <view class="px-4 py-3 border-b border-gray-100">
          <view class="flex justify-between items-center">
            <text class="text-lg font-medium text-gray-800">添加到日程</text>
            <text
              class="i-lucide-x text-gray-500 w-6 h-6"
              @tap="showScheduleModal = false"
            ></text>
          </view>
        </view>

        <view class="p-4 space-y-4">
          <!-- 日程标题 -->
          <view>
            <text class="text-sm text-gray-600 mb-2 block">日程标题</text>
            <input
              v-model="scheduleForm.title"
              placeholder="请输入日程标题"
              class="border-solid border-[1px] border-gray-400 rounded-lg p-2"
            />
          </view>

          <!-- 日程描述 -->
          <view>
            <text class="text-sm text-gray-600 mb-2 block">日程描述</text>
            <textarea
              v-model="scheduleForm.description"
              placeholder="请输入日程描述"
              class="border-solid border-[1px] border-gray-400 rounded-lg p-2 box-border w-full"
              :maxlength="500"
            />
          </view>

          <!-- 时间段设置 -->
          <view>
            <view class="flex items-center justify-between mb-2">
              <text class="text-sm text-gray-600">时间段设置</text>
              <view
                v-if="scheduleForm.timeSlots.length < 5"
                class="px-2 py-1 bg-blue-500 text-white text-sm rounded active:bg-blue-600"
                @tap="addTimeSlot"
              >
                <text class="i-lucide-plus w-3 h-3 mr-1"></text>
                <text>添加时间段</text>
              </view>
            </view>

            <view class="space-y-3">
              <view
                v-for="(timeSlot, index) in scheduleForm.timeSlots"
                :key="index"
                class="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <!-- 时间段标题 -->
                <view class="flex items-center justify-between mb-3">
                  <text class="text-sm text-gray-700 font-medium">
                    时间段 {{ index + 1 }}
                  </text>
                  <view v-if="scheduleForm.timeSlots.length > 1" class="flex items-center space-x-2">
                    <text
                      class="i-lucide-trash-2 w-4 h-4 text-red-500"
                      @tap="removeTimeSlot(index)"
                    ></text>
                  </view>
                </view>

                <!-- 时间段名称 -->
                <view class="mb-3">
                  <text class="text-sm text-gray-600 mb-1 block">时间段名称（选填）</text>
                  <input
                    v-model="timeSlot.name"
                    class="border-solid border-[1px] border-gray-300 rounded-lg w-full box-border p-2 h-10"
                  />
                </view>

                <!-- 开始时间 -->
                <view class="flex items-center space-x-2 mb-2">
                  <text class="text-sm text-gray-600 w-12">开始</text>
                  <picker
                    mode="date"
                    :value="timeSlot.startDate"
                    @change="(e) => onTimeSlotDateChange(index, 'startDate', e)"
                    class="flex-1"
                  >
                    <view class="px-2 py-1 border border-gray-300 rounded bg-white">
                      <text class="text-sm">{{ timeSlot.startDate || '选择日期' }}</text>
                    </view>
                  </picker>
                  <picker
                    v-if="!timeSlot.isAllDay"
                    mode="time"
                    :value="timeSlot.startTime"
                    @change="(e) => onTimeSlotTimeChange(index, 'startTime', e)"
                    class="flex-1"
                  >
                    <view class="px-2 py-1 border border-gray-300 rounded bg-white">
                      <text class="text-sm">{{ timeSlot.startTime || '选择时间' }}</text>
                    </view>
                  </picker>
                </view>

                <!-- 结束时间 -->
                <view class="flex items-center space-x-2 mb-3">
                  <text class="text-sm text-gray-600 w-12">结束</text>
                  <picker
                    mode="date"
                    :value="timeSlot.endDate"
                    @change="(e) => onTimeSlotDateChange(index, 'endDate', e)"
                    class="flex-1"
                  >
                    <view class="px-2 py-1 border border-gray-300 rounded bg-white">
                      <text class="text-sm">{{ timeSlot.endDate || '选择日期' }}</text>
                    </view>
                  </picker>
                  <picker
                    v-if="!timeSlot.isAllDay"
                    mode="time"
                    :value="timeSlot.endTime"
                    @change="(e) => onTimeSlotTimeChange(index, 'endTime', e)"
                    class="flex-1"
                  >
                    <view class="px-2 py-1 border border-gray-300 rounded bg-white">
                      <text class="text-sm">{{ timeSlot.endTime || '选择时间' }}</text>
                    </view>
                  </picker>
                </view>

                <!-- 全天选项 -->
                <view class="flex items-center" @tap="() => toggleAllDay(index)">
                  <view class="flex items-center justify-center w-4 h-4 mr-2 border rounded transition-colors"
                        :class="timeSlot.isAllDay
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 bg-white'">
                    <text v-if="timeSlot.isAllDay" class="i-lucide-check text-white w-3 h-3"></text>
                  </view>
                  <text class="text-sm text-gray-600">全天</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="flex space-x-3">
            <view
              class="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg active:bg-gray-200 transition-colors"
              @tap="showScheduleModal = false"
            >
              <text class="text-center text-sm block">取消</text>
            </view>
            <view
              class="flex-1 py-3 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
              @tap="convertToSchedule"
            >
              <text class="text-center text-sm block">确认添加</text>
            </view>
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
const notificationId = ref('')
const isLoading = ref(true)
const preloadData = ref(null)
const showScheduleModal = ref(false)
const scheduleForm = ref({
  title: '',
  description: '',
  timeSlots: [{
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isAllDay: false
  }]
})

// 计算属性
const notification = computed(() => {
  // 优先使用预加载数据，然后使用store中的详情数据
  const storeData = (isAdmin.value || isOperator.value)
    ? notificationStore.adminNotificationDetail
    : notificationStore.notificationDetail

  return storeData || preloadData.value
})
const isAdmin = computed(() => authStore.isAdmin)
const isOperator = computed(() => authStore.userInfo?.role === 3)

// 页面生命周期
onMounted(() => {
  const instance = Taro.getCurrentInstance()
  const params = instance.router?.params || {}
  notificationId.value = params.id

  // 尝试从路由参数中获取预加载数据
  if (params.preloadData) {
    try {
      preloadData.value = JSON.parse(decodeURIComponent(params.preloadData))
      isLoading.value = false
    } catch (error) {
      console.error('解析预加载数据失败:', error)
    }
  }

  if (notificationId.value) {
    fetchNotificationDetail()
  }
})

// 获取通知详情
const fetchNotificationDetail = async () => {
  try {
    isLoading.value = true

    // 如果没有预加载数据，清理之前的详情数据
    if (!preloadData.value) {
      notificationStore.notificationDetail = null
      notificationStore.adminNotificationDetail = null
    }

    // 根据用户权限调用不同的API
    if (isAdmin.value || isOperator.value) {
      await notificationStore.fetchAdminNotificationDetail(notificationId.value)
    } else {
      await notificationStore.fetchNotificationDetail(notificationId.value)
    }

    // 数据加载完成后，清除预加载数据
    preloadData.value = null
  } catch (error) {
    console.error('获取信息详情失败:', error)
    Taro.showToast({
      title: '加载失败',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// 日程相关方法
const openScheduleModal = () => {
  // 重置表单数据
  scheduleForm.value = {
    title: '',
    description: '',
    timeSlots: [{
      name: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      isAllDay: false
    }]
  }

  // 如果已经有日程数据，填充到编辑表单
  if (notification.value?.schedule) {
    scheduleForm.value.title = notification.value.schedule.title || ''
    scheduleForm.value.description = notification.value.schedule.description || ''

    // 将后端的time_slots数据转换为前端表单格式
    if (notification.value.schedule.time_slots && Array.isArray(notification.value.schedule.time_slots)) {
      scheduleForm.value.timeSlots = notification.value.schedule.time_slots.map(slot => ({
        name: slot.name || '',
        startDate: slot.start_date || '',
        startTime: slot.start_time || '',
        endDate: slot.end_date || '',
        endTime: slot.end_time || '',
        isAllDay: slot.is_all_day || false
      }))

    } else {
    }
  } else {
  }

  // 打开模态框
  showScheduleModal.value = true
}

const addTimeSlot = () => {
  scheduleForm.value.timeSlots.push({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isAllDay: false
  })
}

const removeTimeSlot = (index) => {
  if (scheduleForm.value.timeSlots.length > 1) {
    scheduleForm.value.timeSlots.splice(index, 1)
  }
}

const onTimeSlotDateChange = (index, field, e) => {
  scheduleForm.value.timeSlots[index][field] = e.detail.value
}

const onTimeSlotTimeChange = (index, field, e) => {
  scheduleForm.value.timeSlots[index][field] = e.detail.value
}

// 切换全天状态
const toggleAllDay = (index) => {
  scheduleForm.value.timeSlots[index].isAllDay = !scheduleForm.value.timeSlots[index].isAllDay
}

// 获取日程时间段列表（支持多种数据结构）
const getScheduleTimeSlots = () => {
  if (!notification.value) return []

  // 新格式：notification.schedule.time_slots (数组)
  if (notification.value.schedule?.time_slots && Array.isArray(notification.value.schedule.time_slots)) {
    return notification.value.schedule.time_slots
  }
  return []
}

// 判断时间段是否在当前时间内
const isTimeSlotActive = (timeSlot) => {
  if (!timeSlot) return false

  const now = new Date()
  const currentDate = now.toISOString().split('T')[0] // 格式：YYYY-MM-DD
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` // 格式：HH:MM

  // 检查日期范围
  const startDate = timeSlot.start_date
  const endDate = timeSlot.end_date || timeSlot.start_date

  if (currentDate < startDate || currentDate > endDate) {
    return false
  }

  // 如果是全天事件
  if (timeSlot.is_all_day) {
    return true
  }

  // 检查时间范围
  const startTime = timeSlot.start_time || '00:00'
  const endTime = timeSlot.end_time || '23:59'

  // 如果是同一天，直接比较时间
  if (startDate === endDate && startDate === currentDate) {
    return currentTime >= startTime && currentTime <= endTime
  }

  // 如果是跨天事件
  if (currentDate === startDate) {
    // 在开始日期，检查是否在开始时间之后
    return currentTime >= startTime
  } else if (currentDate === endDate) {
    // 在结束日期，检查是否在结束时间之前
    return currentTime <= endTime
  } else {
    // 在中间日期，全天有效
    return true
  }
}

const convertToSchedule = async () => {
  if (!scheduleForm.value.title.trim()) {
    Taro.showToast({
      title: '请输入日程标题',
      icon: 'error'
    })
    return
  }

  // 验证至少有一个有效的时间段
  const validTimeSlots = scheduleForm.value.timeSlots.filter(slot => slot.startDate)
  if (validTimeSlots.length === 0) {
    Taro.showToast({
      title: '请至少添加一个时间段',
      icon: 'error'
    })
    return
  }

  // 验证每个时间段的完整性
  for (let i = 0; i < validTimeSlots.length; i++) {
    const slot = validTimeSlots[i]
    if (!slot.startDate) {
      Taro.showToast({
        title: `请设置时间段${i + 1}的开始日期`,
        icon: 'error'
      })
      return
    }
    if (!slot.isAllDay && !slot.startTime) {
      Taro.showToast({
        title: `请设置时间段${i + 1}的开始时间`,
        icon: 'error'
      })
      return
    }
  }

  try {
    // 构建多个时间段的数据
    const timeSlots = validTimeSlots.map((slot, index) => ({
      name: slot.name || `${scheduleForm.value.title} - 时间段${index + 1}`,
      start_date: slot.startDate,
      end_date: slot.endDate || slot.startDate,
      start_time: slot.isAllDay ? '00:00' : slot.startTime || '09:00',
      end_time: slot.isAllDay ? '23:59' : slot.endTime || '17:00',
      is_all_day: slot.isAllDay
    }))

    const data = {
      title: scheduleForm.value.title,
      description: scheduleForm.value.description,
      time_slots: timeSlots
    }

    await notificationStore.convertToSchedule(notificationId.value, data)

    Taro.showToast({
      title: `添加成功，共${timeSlots.length}个时间段`,
      icon: 'success'
    })

    showScheduleModal.value = false

    // 重新获取通知详情以显示最新的日程信息
    await fetchNotificationDetail()
  } catch (error) {
    console.error('转换为日程失败:', error)
    Taro.showToast({
      title: '添加失败',
      icon: 'error'
    })
  }
}

// 工具函数
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

const formatDateTime = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const goBack = () => {
  Taro.navigateBack()
}

Taro.useShareAppMessage((res) => {
    if (res.from === 'button') {
    }
    return {
      title: notification.value.title,
      path: '/pages/notifications/detail/index?id='+notificationId.value,
    }
  })

Taro.useShareTimeline((res) => {
    if (res.from === 'button') {
    }
    return {
      title: notification.value.title,
      path: '/pages/notifications/detail/index?id='+notificationId.value,
    }
  })
</script>

