<template>
  <!-- 今日课程卡片 -->
  <view class="px-4">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">今日课程</text>
      </view>

      <!-- 今日课程内容 -->
      <view
        class="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <!-- 加载状态 -->
        <view v-if="scheduleStore.isLoading" class="flex items-center justify-center py-8">
          <text class="text-gray-500 text-sm">加载中...</text>
        </view>

        <!-- 未绑定班级状态 -->
        <view v-else-if="!authStore.userClass" class="flex flex-col items-center justify-center py-8">
          <view class="i-lucide-book-open text-2xl text-gray-400 mb-2"></view>
          <text class="text-gray-500 text-sm">绑定课表后查看今日课程</text>
        </view>

        <!-- 今日无课程状态 -->
        <view v-else-if="todayCourses.length === 0" class="flex flex-col items-center justify-center py-8">
          <view class="i-lucide-coffee text-2xl text-green-500 mb-2"></view>
          <text class="text-gray-700 font-medium">今日无课程</text>
          <text class="text-gray-500 text-sm">享受轻松的一天</text>
        </view>

        <!-- 全部课程已结束 -->
        <view v-else-if="allCoursesFinished" class="flex flex-col items-center justify-center py-8">
          <view class="i-lucide-coffee text-2xl text-green-500 mb-2"></view>
          <text class="text-gray-700 font-medium">今日课程已全部结束</text>
          <text class="text-gray-500 text-sm">学习一天啦，好好休息</text>
        </view>

        <!-- 有课程时显示课程列表 -->
        <view v-else class="m-2 space-y-1">
          <view
            v-for="(course, index) in todayCourses"
            :key="`${course.period}-${course.course}`"
            class="flex items-center active:bg-gray-50 transition-all duration-200 border border-transparent"
            :class="[
              { 'border-t border-gray-100': index > 0 },
              getCourseStatusClass(course.timeStatus, course.minutesToStart)
            ]"
          >
            <!-- 左侧彩色指示条 -->
            <view class="flex-shrink-0 mr-2">
              <view
                class="w-1 h-12 rounded-full"
                :class="getTimeSlotColorClass(course.timeStatus, course.minutesToStart)"
              ></view>
            </view>

            <!-- 中间课程信息 -->
            <view class="flex-1 min-w-0">
              <!-- 课程名称 -->
              <view class="font-semibold text-gray-900 text-sm mb-1 truncate">
                {{ course.course }}
              </view>

              <!-- 教师和教室信息 -->
              <view class="grid grid-cols-3 text-sm text-gray-600">
                <view class="flex items-center col-span-1">
                  <view class="i-lucide-user w-3 h-3 mr-1.5 text-gray-400 shrink-0"></view>
                  <text class="truncate">{{ course.teacher }}</text>
                </view>
                <view class="flex items-center col-span-2">
                  <view class="i-lucide-map-pin w-3 h-3 mx-1.5 text-gray-400 shrink-0"></view>
                  <text class="truncate">{{ course.classroom }}</text>
                </view>
              </view>
            </view>

            <!-- 右侧时间和状态信息 -->
            <view class="flex-shrink-0 text-right">
              <!-- 课程时间 -->
              <view class="text-sm font-medium text-gray-800 mb-1 w-24">
                {{ getTimeSlotTime(course.period) }}
              </view>

              <!-- 课程状态 -->
              <view>
                <!-- 正在进行 -->
                <view
                  v-if="course.timeStatus === 'ongoing'"
                  class="text-sm text-green-600 font-medium"
                >
                  {{ course.remainingMinutes }}分钟后下课
                </view>
                <!-- 即将开始 - 20分钟内显示倒计时 -->
                <view
                  v-else-if="course.timeStatus === 'upcoming' && course.minutesToStart <= 20"
                  class="text-sm text-orange-600 font-medium"
                >
                  {{ course.minutesToStart }}分钟后上课
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'
import { useScheduleStore } from '../../../stores/schedule'
import { useAuthStore } from '../../../stores/auth'

// 定义组件名称
defineOptions({
  name: 'TodayCourse'
})

const scheduleStore = useScheduleStore()
const authStore = useAuthStore()

// 用于强制更新时间状态的响应式变量
const forceUpdate = ref(0)

// 时间段配置
const timeSlots = [
  { period: 1, label: '1-2节', time: '08:30-10:05' },
  { period: 2, label: '3-4节', time: '10:25-12:00' },
  { period: 3, label: '5-6节', time: '14:00-15:35' },
  { period: 4, label: '7-8节', time: '15:55-17:30' },
  { period: 5, label: '9-10节', time: '19:00-20:35' }
]

// 获取今天是星期几 (0=周日, 1=周一, ..., 6=周六)
const getTodayIndex = () => {
  const today = new Date().getDay()
  return today === 0 ? 6 : today - 1 // 转换为 0=周一, 6=周日
}

// 计算今日课程
const todayCourses = computed(() => {
  // 依赖 forceUpdate 来强制重新计算时间状态
  forceUpdate.value

  if (!scheduleStore.courseData || Object.keys(scheduleStore.courseData).length === 0) {
    return []
  }

  const todayIndex = getTodayIndex()
  const courses = []

  // 遍历今天的5个时间段
  for (let period = 1; period <= 5; period++) {
    const courseIndex = todayIndex * 5 + period
    const courseData = scheduleStore.courseData[courseIndex.toString()]

    if (courseData) {
      // 处理课程数据（可能是数组或单个对象）
      const coursesArray = Array.isArray(courseData) ? courseData : [courseData]

        coursesArray.forEach(course => {
        const isInCurrentWeek = scheduleStore.isCourseInTodayWeek(course.week)
        // 只添加今天周的课程
        if (isInCurrentWeek) {
          const timeStatus = getCourseTimeStatus(period)
          courses.push({
            ...course,
            period,
            isInCurrentWeek: true,
            timeStatus,
            remainingMinutes: timeStatus === 'ongoing' ? getRemainingMinutes(period) : 0,
            minutesToStart: timeStatus === 'upcoming' ? getMinutesToStart(period) : 0
          })
        }
      })
    }
  }

  return courses
})

// 检查是否所有课程都已结束
const allCoursesFinished = computed(() => {
  if (todayCourses.value.length === 0) return false
  return todayCourses.value.every(course => course.timeStatus === 'finished')
})

// 获取时间段具体时间
const getTimeSlotTime = (period) => {
  const slot = timeSlots.find(s => s.period === period)
  return slot ? slot.time : ''
}

// 解析时间字符串为分钟数（从00:00开始计算）
const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// 获取真实当前时间的分钟数（不受调试模式影响）
const getRealCurrentMinutes = () => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

// 获取当前时间的分钟数（调试模式下返回调试时间）
const getCurrentMinutes = () => {
  return getRealCurrentMinutes()
}

// 判断课程时间状态
const getCourseTimeStatus = (period) => {
  const slot = timeSlots.find(s => s.period === period)
  if (!slot) return 'upcoming'

  const [startTime, endTime] = slot.time.split('-')
  const startMinutes = parseTimeToMinutes(startTime)
  const endMinutes = parseTimeToMinutes(endTime)
  const currentMinutes = getCurrentMinutes()

  if (currentMinutes < startMinutes) {
    return 'upcoming' // 还没开始
  } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    return 'ongoing' // 正在进行
  } else {
    return 'finished' // 已结束
  }
}

// 获取剩余分钟数（仅对正在进行的课程）
const getRemainingMinutes = (period) => {
  const slot = timeSlots.find(s => s.period === period)
  if (!slot) return 0

  const [, endTime] = slot.time.split('-')
  const endMinutes = parseTimeToMinutes(endTime)
  const currentMinutes = getCurrentMinutes()

  return Math.max(0, endMinutes - currentMinutes)
}

// 获取距离上课的分钟数（仅对未开始的课程）
const getMinutesToStart = (period) => {
  const slot = timeSlots.find(s => s.period === period)
  if (!slot) return 0

  const [startTime] = slot.time.split('-')
  const startMinutes = parseTimeToMinutes(startTime)
  const currentMinutes = getCurrentMinutes()

  return Math.max(0, startMinutes - currentMinutes)
}

// 获取时间段颜色指示器类
const getTimeSlotColorClass = (timeStatus, minutesToStart = 0) => {
  switch (timeStatus) {
    case 'finished':
      return 'bg-gray-300'  // 已结束 - 灰色
    case 'ongoing':
      return 'bg-green-400' // 正在进行 - 绿色
    case 'upcoming':
      // 30分钟内即将开始 - 橙色，否则蓝色
      return minutesToStart <= 20 ? 'bg-orange-400' : 'bg-blue-400'
    default:
      return 'bg-gray-300'
  }
}

// 获取课程状态样式类
const getCourseStatusClass = (timeStatus, minutesToStart = 0) => {
  switch (timeStatus) {
    case 'finished':
      return 'opacity-60'
    case 'ongoing':
      return 'bg-green-50 border-green-200'
    case 'upcoming':
      // 30分钟内即将开始 - 橙色背景
      return minutesToStart <= 20 ? 'bg-orange-50 border-orange-200' : ''
    default:
      return ''
  }
}

// 加载数据
const loadData = async () => {
  // 未登录时不发起请求
  if (!authStore.isLoggedIn) {
    return
  }

  if (authStore.userClass && !scheduleStore.isLoading) {
    try {
      await scheduleStore.fetchCourseTable()
    } catch (error) {
      console.error('获取课程表失败:', error)
    }
  }
}

// 定时更新状态
let statusUpdateInterval = null

onMounted(() => {
  if (authStore.isLoggedIn && authStore.userClass && Object.keys(scheduleStore.courseData).length === 0) {
    loadData()
    scheduleStore.setCurrentWeek(scheduleStore.currentWeekNumber)
  }
  // 每分钟更新一次课程状态（仅在非调试模式下）
  statusUpdateInterval = setInterval(() => {
    // 更新强制刷新变量，触发计算属性重新计算
    forceUpdate.value++
  }, 60000)
})

// 页面显示时也更新一次状态
Taro.useDidShow(() => {
  forceUpdate.value++
})

// 页面卸载时清理定时器
Taro.useUnload(() => {
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval)
    statusUpdateInterval = null
  }
})
</script>
