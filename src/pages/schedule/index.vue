<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 当用户未绑定班级时的提示页面 -->
    <view v-if="!authStore.userClass && !scheduleStore.isLoading" class="flex flex-col items-center justify-center h-screen px-8">
      <view class="i-lucide-book-open text-3xl mb-4"></view>
      <view class="text-xl font-semibold text-gray-700 mb-2">课程表</view>
      <view class="text-gray-500 text-center mb-8">绑定班级后即可查看课程表</view>
      <view
        class="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg"
        @tap="handleBindClass"
      >
        绑定班级
      </view>
    </view>

    <!-- 课程表页面 -->
    <view v-if="authStore.userClass && !scheduleStore.isLoading" class="h-screen flex flex-col">
      <!-- 顶部控制栏 -->
      <view class="bg-white shadow-sm p-2 grid grid-cols-3">
        <!-- 左侧班级信息 -->
        <view @tap="handleBindClass" class="flex items-center">
          <view class="text-sm font-medium max-w-30 truncate">{{ authStore.userClass }}</view>
        </view>

        <!-- 中间周切换 -->
        <view class="flex items-center justify-center">
          <view @tap="previousWeek" class="i-lucide-chevron-left w-5 h-5">
          </view>
          <view @tap="handleWeekClick" class="text-sm font-medium mx-2">
            第{{ scheduleStore.currentWeek }}周
          </view>
          <view @tap="nextWeek" class="i-lucide-chevron-right w-5 h-5">
          </view>
        </view>

        <!-- 右侧周末显示控制 -->
        <!-- <view
          @tap="toggleWeekend"
          class="text-xs bg-gray-100 px-3 py-1 rounded justify-self-end"
          :class="{ 'bg-blue-100 text-blue-600': showWeekend }"
        >
          {{ showWeekend ? '隐藏' : '显示' }}周末
        </view> -->
        <!-- 右侧非本周课程控制 -->
        <view
          @tap="toggleNotCurrentWeek"
          class="text-xs px-3 py-1 rounded justify-self-end"
          :class="showNotCurrentWeek ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'"
        >
          显示全部
        </view>
      </view>

      <!-- 课程表网格 -->
      <view class="flex-1 overflow-hidden">
        <schedule-table
          :show-weekend="showWeekend"
          :show-not-current-week="showNotCurrentWeek"
          @course-click="handleCourseClick"
        />
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="scheduleStore.isLoading" class="flex items-center justify-center h-screen">
      <view class="text-gray-500">加载中...</view>
    </view>

    <!-- 课程详情弹窗 -->
    <course-detail-modal
      v-if="selectedCourse"
      :course="selectedCourse"
      @close="handleCloseDetail"
    />

    <!-- 周选择器弹窗 -->
    <view v-if="showWeekSelector" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩层 -->
      <view
        class="absolute inset-0 bg-black bg-opacity-50"
        @tap="handleCloseWeekSelector"
      ></view>

      <!-- 弹窗内容 -->
      <view class="relative bg-white rounded-lg mx-8 max-w-xs w-full max-h-96">
        <!-- 标题 -->
        <view class="px-4 py-3 border-b border-gray-200">
          <view class="text-base font-semibold text-center">选择周数</view>
        </view>

        <!-- 周数列表 -->
        <view class="max-h-74 overflow-y-auto px-4 py-4">
          <view class="grid grid-cols-4 gap-2">
            <view
              v-for="option in scheduleStore.weekOptions"
              :key="option.value"
              @tap="handleWeekSelect(option.value)"
              class="rounded-lg bg-gray-100 text-center py-3 active:bg-gray-200 text-base"
              :class="{ 'bg-blue-50 text-blue-600': option.value === scheduleStore.currentWeek }"
            >
              {{ option.label }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 离线数据提示弹窗 -->
    <view v-if="showOfflineNotice" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩层 -->
      <view class="absolute inset-0 bg-black bg-opacity-50"></view>

      <!-- 弹窗内容 -->
      <view class="relative bg-white rounded-lg mx-8 max-w-sm w-full">
        <!-- 图标和标题 -->
        <view class="px-6 pt-6 pb-4 text-center">
          <view class="text-lg font-semibold text-gray-800 mb-2">提醒</view>
          <view class=" text-gray-600">
            当前课程表数据为离线数据，可能与实际课程安排存在差异。请务必与教务系统核对后使用！
          </view>
        </view>

        <!-- 按钮区域 -->
        <view class="px-6 pb-6 flex flex-col gap-3">
          <view
            @tap="handleOfflineNoticeConfirm(true)"
            class="bg-blue-500 text-white text-center py-3 rounded-lg font-medium active:bg-blue-600"
          >
            不再提醒
          </view>
          <view
            @tap="handleOfflineNoticeConfirm(false)"
            class="bg-gray-100 text-gray-700 text-center py-3 rounded-lg font-medium active:bg-gray-200"
          >
            我知道了
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useScheduleStore } from '../../stores/schedule'
import { useAuthStore } from '../../stores/auth'
import ScheduleTable from './components/ScheduleTable.vue'
import CourseDetailModal from './components/CourseDetailModal.vue'

// 定义组件名称
defineOptions({
  name: 'SchedulePage'
})

const scheduleStore = useScheduleStore()
const authStore = useAuthStore()

const showWeekend = ref(false)
const showNotCurrentWeek = ref(false)
const selectedCourse = ref(null)
const showWeekSelector = ref(false)
const showOfflineNotice = ref(false)

// 处理绑定班级
const handleBindClass = () => {
  if (!authStore.isLoggedIn) {
    Taro.navigateTo({ url: '/pages/login/index' })
    return
  }

  Taro.navigateTo({ url: '/pages/schedule/schedule-bind/index' })
}

// 上一周
const previousWeek = () => {
  if (scheduleStore.currentWeek > 1) {
    scheduleStore.setCurrentWeek(scheduleStore.currentWeek - 1)
  }
}

// 下一周
const nextWeek = () => {
  if (scheduleStore.currentWeek < 20) {
    scheduleStore.setCurrentWeek(scheduleStore.currentWeek + 1)
  }
}

// 切换周末显示
const toggleWeekend = () => {
  showWeekend.value = !showWeekend.value
}

// 切换非本周课程显示
const toggleNotCurrentWeek = () => {
  showNotCurrentWeek.value = !showNotCurrentWeek.value
}

// 处理课程点击
const handleCourseClick = (course) => {
  selectedCourse.value = course
}

// 关闭课程详情
const handleCloseDetail = () => {
  selectedCourse.value = null
}

// 处理周点击
const handleWeekClick = () => {
  showWeekSelector.value = true
}

// 选择周
const handleWeekSelect = (week) => {
  scheduleStore.setCurrentWeek(week)
  showWeekSelector.value = false
}

// 关闭周选择器
const handleCloseWeekSelector = () => {
  showWeekSelector.value = false
}

// 检查是否需要显示离线数据提醒
const shouldShowOfflineNotice = () => {
  try {
    const dontShowAgain = Taro.getStorageSync('dontShowOfflineNotice')
    return !dontShowAgain
  } catch (error) {
    console.error('读取存储失败:', error)
    return true
  }
}

// 处理离线数据提醒确认
const handleOfflineNoticeConfirm = (dontShowAgain = false) => {
  if (dontShowAgain) {
    try {
      Taro.setStorageSync('dontShowOfflineNotice', true)
    } catch (error) {
      console.error('保存存储失败:', error)
    }
  }
  showOfflineNotice.value = false
}

// 显示离线数据提醒
const showOfflineDataNotice = () => {
  if (shouldShowOfflineNotice()) {
    showOfflineNotice.value = true
  }
}

// 加载课程表数据的函数
const loadCourseData = async () => {
  if (authStore.userClass && !scheduleStore.isLoading) {
    try {
      await authStore.fetchUserInfo()
      await scheduleStore.fetchCourseTable()
      // 设置当前周为系统计算的当前周
      scheduleStore.setCurrentWeek(scheduleStore.currentWeekNumber)
      // 成功拉取课程表后显示离线数据提醒
      showOfflineDataNotice()
    } catch (error) {
      if (error.message && error.message.includes('未设置班级')) {
        // 用户未绑定班级，显示绑定提示
        return
      }

      Taro.showToast({
        title: '获取课程表失败',
        icon: 'none'
      })
    }
  }
}

// 页面加载时初始化
onMounted(async () => {
  await loadCourseData()
})

// 页面显示时检查是否需要重新加载数据
Taro.useDidShow(async () => {
  // 如果用户有班级信息但课程表数据为空，则重新加载
  if (authStore.userClass && Object.keys(scheduleStore.courseData).length === 0) {
    await loadCourseData()
  }
})
</script>

<style scoped>
</style>
