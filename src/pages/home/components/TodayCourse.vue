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
        <view v-else-if="!authStore.userClass" class="flex flex-col items-center justify-center py-8" :class="{ 'active:bg-gray-50': authStore.isLoggedIn }" @tap="authStore.isLoggedIn && goToBindClass()">
          <view class="i-lucide-book-open text-2xl text-gray-400 mb-2"></view>
          <text class="text-gray-500 text-sm">绑定课表后查看今日课程</text>
          <text v-if="authStore.isLoggedIn" class="text-blue-500 text-xs mt-1">点击前往绑定 ›</text>
        </view>

        <!-- 非当前学期状态 -->
        <view v-else-if="scheduleStore.isSemesterMismatch" class="flex flex-col items-center justify-center py-8">
          <view class="i-lucide-info text-2xl text-orange-500 mb-2"></view>
          <text class="text-gray-700 font-medium">非本学期课表</text>
          <text class="text-gray-500 text-sm">查看今日课程需切换至当前学期</text>
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

        <!-- 有课程时显示课程列表（按时间段分组） -->
        <view v-else class="m-2 space-y-1">
          <view
            v-for="(group, gIndex) in groupedCourses"
            :key="group.period"
          >
            <!-- 单门课程：直接显示 -->
            <template v-if="group.courses.length === 1">
              <view
                class="flex items-center active:bg-gray-50 transition-all duration-200 border border-transparent"
                :class="[
                  { 'border-t border-gray-100': gIndex > 0 },
                  getCourseStatusClass(group.courses[0].timeStatus, group.courses[0].minutesToStart)
                ]"
              >
                <view class="flex-shrink-0 mr-2">
                  <view
                    class="w-1 h-12 rounded-full"
                    :class="getTimeSlotColorClass(group.courses[0].timeStatus, group.courses[0].minutesToStart)"
                  ></view>
                </view>
                <view class="flex-1 min-w-0">
                  <view class="font-semibold text-gray-900 text-sm mb-1 truncate">
                    {{ group.courses[0].course }}
                  </view>
                  <view class="grid grid-cols-3 text-sm text-gray-600">
                    <view class="flex items-center col-span-1">
                      <view class="i-lucide-user w-3 h-3 mr-1.5 text-gray-400 shrink-0"></view>
                      <text class="truncate">{{ group.courses[0].teacher }}</text>
                    </view>
                    <view class="flex items-center col-span-2">
                      <view class="i-lucide-map-pin w-3 h-3 mx-1.5 text-gray-400 shrink-0"></view>
                      <text class="truncate">{{ group.courses[0].classroom }}</text>
                    </view>
                  </view>
                </view>
                <view class="flex-shrink-0 text-right">
                  <view class="text-sm font-medium text-gray-800 mb-1 w-24">
                    {{ getTimeSlotTime(group.period) }}
                  </view>
                  <view>
                    <view v-if="group.courses[0].timeStatus === 'ongoing'" class="text-sm text-green-600 font-medium">
                      {{ group.courses[0].remainingMinutes }}分钟后下课
                    </view>
                    <view v-else-if="group.courses[0].timeStatus === 'upcoming' && group.courses[0].minutesToStart <= 20" class="text-sm text-orange-600 font-medium">
                      {{ group.courses[0].minutesToStart }}分钟后上课
                    </view>
                  </view>
                </view>
              </view>
            </template>

            <!-- 多门课程：折叠显示 -->
            <template v-else>
              <view>
                <!-- 第一门课程（始终显示） -->
                <view
                  class="flex items-center active:bg-gray-50 transition-all duration-200 border border-transparent"
                  :class="getCourseStatusClass(group.courses[0].timeStatus, group.courses[0].minutesToStart)"
                >
                  <view class="flex-shrink-0 mr-2">
                    <view
                      class="w-1 h-12 rounded-full"
                      :class="getTimeSlotColorClass(group.courses[0].timeStatus, group.courses[0].minutesToStart)"
                    ></view>
                  </view>
                  <view class="flex-1 min-w-0">
                    <view class="font-semibold text-gray-900 text-sm mb-1 truncate">
                      {{ group.courses[0].course }}
                    </view>
                    <view class="grid grid-cols-3 text-sm text-gray-600">
                      <view class="flex items-center col-span-1">
                        <view class="i-lucide-user w-3 h-3 mr-1.5 text-gray-400 shrink-0"></view>
                        <text class="truncate">{{ group.courses[0].teacher }}</text>
                      </view>
                      <view class="flex items-center col-span-2">
                        <view class="i-lucide-map-pin w-3 h-3 mx-1.5 text-gray-400 shrink-0"></view>
                        <text class="truncate">{{ group.courses[0].classroom }}</text>
                      </view>
                    </view>
                  </view>
                  <view class="flex-shrink-0 text-right">
                    <view class="text-sm font-medium text-gray-800 mb-1 w-24">
                      {{ getTimeSlotTime(group.period) }}
                    </view>
                    <view>
                      <view v-if="group.courses[0].timeStatus === 'ongoing'" class="text-sm text-green-600 font-medium">
                        {{ group.courses[0].remainingMinutes }}分钟后下课
                      </view>
                      <view v-else-if="group.courses[0].timeStatus === 'upcoming' && group.courses[0].minutesToStart <= 20" class="text-sm text-orange-600 font-medium">
                        {{ group.courses[0].minutesToStart }}分钟后上课
                      </view>
                    </view>
                  </view>
                </view>

                <!-- 展开/收起窄条（固定在第一条下方） -->
                <view
                  @tap="togglePeriod(group.period)"
                  class="flex items-center justify-center py-1 bg-gray-50 active:bg-gray-100 transition-colors"
                  :class="expandedPeriods[group.period] ? '' : 'rounded-b-lg'"
                >
                  <text class="text-xs text-gray-400 mr-1">
                    {{ expandedPeriods[group.period] ? '收起' : `还有${group.courses.length - 1}门课` }}
                  </text>
                  <view
                    class="i-lucide-chevron-down w-3 h-3 text-gray-400 transition-transform duration-200"
                    :class="{ 'rotate-180': expandedPeriods[group.period] }"
                  ></view>
                </view>

                <!-- 展开后的其余课程 -->
                <view v-if="expandedPeriods[group.period]" class="space-y-1">
                  <view
                    v-for="(course, cIndex) in group.courses.slice(1)"
                    :key="`${group.period}-${cIndex}-${course.course}`"
                    class="flex items-center active:bg-gray-50 transition-all duration-200 border border-transparent"
                    :class="getCourseStatusClass(course.timeStatus, course.minutesToStart)"
                  >
                    <view class="flex-shrink-0 mr-2">
                      <view
                        class="w-1 h-12 rounded-full"
                        :class="getTimeSlotColorClass(course.timeStatus, course.minutesToStart)"
                      ></view>
                    </view>
                    <view class="flex-1 min-w-0">
                      <view class="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {{ course.course }}
                      </view>
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
                    <view class="flex-shrink-0 text-right">
                      <view class="text-sm font-medium text-gray-800 mb-1 w-24">
                        {{ getTimeSlotTime(course.period) }}
                      </view>
                      <view>
                        <view v-if="course.timeStatus === 'ongoing'" class="text-sm text-green-600 font-medium">
                          {{ course.remainingMinutes }}分钟后下课
                        </view>
                        <view v-else-if="course.timeStatus === 'upcoming' && course.minutesToStart <= 20" class="text-sm text-orange-600 font-medium">
                          {{ course.minutesToStart }}分钟后上课
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </template>
          </view>
        </view>
      </view>
    </view>
  </template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import Taro from '@tarojs/taro'
import { useScheduleStore } from '../../../stores/schedule'
import { useAuthStore } from '../../../stores/auth'

defineOptions({
  name: 'TodayCourse'
})

const props = defineProps({
  debugDate: {
    type: Date,
    default: null
  }
})

const scheduleStore = useScheduleStore()
const authStore = useAuthStore()

const goToBindClass = () => {
  Taro.navigateTo({ url: '/pages/schedule/schedule-bind/index' })
}

const forceUpdate = ref(0)
const expandedPeriods = ref({})

const timeSlots = [
  { period: 1, label: '1-2节', time: '08:30-10:05', startMinutes: 510, endMinutes: 605 },
  { period: 2, label: '3-4节', time: '10:25-12:00', startMinutes: 625, endMinutes: 720 },
  { period: 3, label: '5-6节', time: '14:00-15:35', startMinutes: 840, endMinutes: 935 },
  { period: 4, label: '7-8节', time: '15:55-17:30', startMinutes: 955, endMinutes: 1050 },
  { period: 5, label: '9-10节', time: '19:00-20:35', startMinutes: 1140, endMinutes: 1235 }
]

const getNow = () => props.debugDate || new Date()

const getTodayIndex = () => {
  const today = getNow().getDay()
  return today === 0 ? 6 : today - 1
}

const getCurrentMinutes = () => {
  const now = getNow()
  return now.getHours() * 60 + now.getMinutes()
}

const todayCourses = computed(() => {
  forceUpdate.value

  if (!scheduleStore.courseData || Object.keys(scheduleStore.courseData).length === 0) {
    return []
  }

  const todayIndex = getTodayIndex()
  const courses = []
  const currentMinutes = getCurrentMinutes()
  const debugWeek = props.debugDate
    ? scheduleStore.calculateWeekNumber(props.debugDate)
    : null

  for (let period = 1; period <= 5; period++) {
    const courseIndex = todayIndex * 5 + period
    const courseData = scheduleStore.courseData[courseIndex.toString()]

    if (courseData) {
      const slot = timeSlots.find(s => s.period === period)
      if (!slot) continue

      let timeStatus, remainingMinutes = 0, minutesToStart = 0

      if (currentMinutes < slot.startMinutes) {
        timeStatus = 'upcoming'
        minutesToStart = slot.startMinutes - currentMinutes
      } else if (currentMinutes >= slot.startMinutes && currentMinutes <= slot.endMinutes) {
        timeStatus = 'ongoing'
        remainingMinutes = slot.endMinutes - currentMinutes
      } else {
        timeStatus = 'finished'
      }

      const coursesArray = Array.isArray(courseData) ? courseData : [courseData]

      coursesArray.forEach(course => {
        const isInCurrentWeek = debugWeek !== null
          ? scheduleStore.isCourseInWeek(course.week, debugWeek)
          : scheduleStore.isCourseInTodayWeek(course.week)
        if (isInCurrentWeek) {
          courses.push({
            ...course,
            period,
            isInCurrentWeek: true,
            timeStatus,
            remainingMinutes,
            minutesToStart
          })
        }
      })
    }
  }

  return courses
})

// 按时间段分组
const groupedCourses = computed(() => {
  const groups = new Map()
  for (const course of todayCourses.value) {
    if (!groups.has(course.period)) {
      groups.set(course.period, { period: course.period, courses: [] })
    }
    groups.get(course.period).courses.push(course)
  }
  return Array.from(groups.values())
})

const togglePeriod = (period) => {
  expandedPeriods.value[period] = !expandedPeriods.value[period]
}

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
  if (!authStore.isLoggedIn || !authStore.userClass || scheduleStore.isLoading) {
    return
  }

  try {
    await scheduleStore.initialize()
  } catch (error) {
    console.error('获取课程表失败:', error)
  }
}

// 定时更新状态
let statusUpdateInterval = null

onMounted(() => {
  if (authStore.isLoggedIn && authStore.userClass && Object.keys(scheduleStore.courseData).length === 0) {
    loadData()
  }
  // 每分钟更新一次课程状态
  statusUpdateInterval = setInterval(() => {
    // 更新强制刷新变量，触发计算属性重新计算
    forceUpdate.value++
  }, 60000)
})

// 页面显示时也更新一次状态
Taro.useDidShow(() => {
  forceUpdate.value++

  // 如果登录了但没有数据，则加载数据（处理首次登录场景）
  if (authStore.isLoggedIn && authStore.userClass && Object.keys(scheduleStore.courseData).length === 0) {
    loadData()
  }
})

onBeforeUnmount(() => {
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval)
    statusUpdateInterval = null
  }
})
</script>
