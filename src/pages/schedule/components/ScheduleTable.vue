<template>
  <view class="flex flex-col h-full bg-white">
    <!-- 课程表头部 - 星期 -->
    <view
      class="flex items-center py-1 border-b border-gray-100"
      @tap="goToCurrentWeek"
    >
      <view class="w-8"></view>
      <view
        v-for="(day, index) in displayDays"
        :key="index"
        class="flex-1 text-center items-center justify-center"
      >
        <view
          class="text-xs"
          :class="isToday(day.date) ? 'text-blue-600 font-bold' : 'text-gray-700'"
        >
          {{ day.name }}
        </view>
        <view
          class="text-xs"
          :class="isToday(day.date) ? 'text-blue-600 font-bold' : 'text-gray-500'"
        >
          {{ day.date }}
        </view>
      </view>
    </view>

    <!-- 课程表内容 - 可滑动区域 -->
    <view class="flex-1 flex">
      <!-- 时间列 - 固定不滑动 -->
      <view class="w-8 flex flex-col border-r border-gray-100">
        <view
          v-for="(timeSlot) in timeSlots"
          :key="timeSlot.period"
          class="flex-1 flex flex-col items-center justify-center border-b border-gray-100"
        >
          <view class="text-xs text-gray-500">{{ timeSlot.time.split('-')[0] }}</view>
          <view class="text-xs text-gray-500">{{ timeSlot.time.split('-')[1] }}</view>
        </view>
      </view>

      <!-- 课程内容容器 - 可滑动 -->
      <view
        class="flex-1 overflow-hidden relative"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 滑动容器 -->
        <view
          class="w-full h-full movable-view"
        >
          <!-- 当前周课程内容 -->
          <view class="absolute inset-0 flex flex-col">
            <view
              v-for="(timeSlot) in timeSlots"
              :key="timeSlot.period"
              class="flex flex-1 border-b border-gray-100"
            >
              <!-- 课程列 -->
              <view
                v-for="(day, dayIndex) in displayDays"
                :key="dayIndex"
                class="flex-1 p-[2px] border-r border-gray-100 flex justify-center items-center min-w-0"
                :class="{ 'border-r-0': dayIndex === displayDays.length - 1 }"
                @tap="handleCourseClick(timeSlot.period, dayIndex)"
              >
                <!-- 课程卡片 -->
                <view
                  v-if="getCourse(timeSlot.period, dayIndex)"
                  class="h-full w-full min-w-0 flex flex-col shrink-0 rounded-md p-2 shadow-sm overflow-hidden transform transition-transform duration-200 active:scale-95"
                  :class="[
                    getCourseColorConfig(getCourse(timeSlot.period, dayIndex))?.backgroundColor,
                    getCourseColorConfig(getCourse(timeSlot.period, dayIndex))?.textColor
                  ]"
                >
                  <!-- 课程名 -->
                  <view
                    class="text-xs font-bold leading-tight mb-1 line-clamp-2"
                  >
                    {{ getCourse(timeSlot.period, dayIndex).course }}
                  </view>
                  <!-- 教室 -->
                  <view
                    class="text-xs line-clamp-2"
                  >
                    {{ '@' + getCourse(timeSlot.period, dayIndex).classroom }}
                  </view>
                  <!-- 教师 -->
                  <view
                    class="text-xs line-clamp-1"
                  >
                    {{ getCourse(timeSlot.period, dayIndex).teacher }}
                  </view>
                  <!-- 多课程指示器 -->
                  <view
                    v-if="getCourse(timeSlot.period, dayIndex).hasMultipleCourses"
                    class="absolute bottom-1 right-1 bg-white bg-opacity-95 text-xs px-1 rounded-full font-bold"
                    :class="getCourseColorConfig(getCourse(timeSlot.period, dayIndex))?.textColor"
                    :style="{
                      minWidth: '20px',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      zIndex: 20
                    }"
                  >
                    +{{ getCourse(timeSlot.period, dayIndex).totalCourses - 1 }}
                  </view>
                </view>
              </view>
            </view>
          </view>

        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useScheduleStore } from '../../../stores/schedule'
import { WEEK_DAYS, TIME_SLOTS, COURSE_COLORS } from '../../../utils/constants'

const props = defineProps({
  showWeekend: {
    type: Boolean,
    default: false
  },
  showNotCurrentWeek: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['course-click', 'empty-cell-click', 'swipe-gesture'])

const scheduleStore = useScheduleStore()

// 课程时间段
const timeSlots = computed(() => {
  return Object.keys(TIME_SLOTS).map(period => ({
    period: parseInt(period),
    time: TIME_SLOTS[period]
  }))
})

// 显示的天数（根据是否显示周末决定）
const displayDays = computed(() => {
  const days = props.showWeekend ? WEEK_DAYS : WEEK_DAYS.slice(0, 5)

  return days.map((dayName, index) => ({
    name: dayName,
    date: getDateForDay(index),
    index
  }))
})

// 获取指定星期的日期
const getDateForDay = (dayIndex) => {
  const currentWeek = scheduleStore.currentWeek
  const semesterStartDate = scheduleStore.semesterStartDate

  // 计算当前周的周一日期
  const weekStartDate = new Date(semesterStartDate)
  weekStartDate.setDate(weekStartDate.getDate() + (currentWeek - 1) * 7)

  // 计算指定星期的日期
  const targetDate = new Date(weekStartDate)
  targetDate.setDate(targetDate.getDate() + dayIndex)

  return `${targetDate.getMonth() + 1}/${targetDate.getDate()}`
}

// 判断给定日期是否是今天
const isToday = (dateString) => {
  const today = new Date()
  const todayString = `${today.getMonth() + 1}/${today.getDate()}`
  return dateString === todayString
}

// 回到当前周
const goToCurrentWeek = () => {
  const currentWeekNumber = scheduleStore.currentWeekNumber
  scheduleStore.setCurrentWeek(currentWeekNumber)
}

// 获取指定位置的课程
const getCourse = (period, dayIndex) => {
  const courseIndex = dayIndex * 5 + period
  const courses = scheduleStore.courseData[courseIndex.toString()]

  // 新数据结构是数组格式
  if (Array.isArray(courses) && courses.length > 0) {
    // 过滤出当前周有效的课程
    const currentWeekCourses = courses.filter(course =>
      scheduleStore.isCourseInCurrentWeek(course.week)
    )

    // 过滤出非本周的课程
    const notCurrentWeekCourses = courses.filter(course =>
      !scheduleStore.isCourseInCurrentWeek(course.week)
    )

    // 如果有当前周课程，优先显示当前周课程
    if (currentWeekCourses.length > 0) {
      // 构建完整的课程列表，包含当前周和非本周课程（用于弹窗切换）
      const allCoursesForModal = props.showNotCurrentWeek ?
        [...currentWeekCourses, ...notCurrentWeekCourses] :
        currentWeekCourses

      return {
        ...currentWeekCourses[0],
        hasMultipleCourses: allCoursesForModal.length > 1,
        allCourses: allCoursesForModal,
        totalCourses: allCoursesForModal.length,
        isCurrentWeek: true
      }
    }

    // 如果没有当前周课程，但开启了显示非本周课程且有非本周课程
    if (props.showNotCurrentWeek && notCurrentWeekCourses.length > 0) {
      return {
        ...notCurrentWeekCourses[0],
        hasMultipleCourses: notCurrentWeekCourses.length > 1,
        allCourses: notCurrentWeekCourses,
        totalCourses: notCurrentWeekCourses.length,
        isCurrentWeek: false
      }
    }
  }

  return null
}

// 获取课程样式类
const getCourseClasses = (course) => {
  if (!course) return ''

  return [
    'has-course',
    course.isInCurrentWeek ? 'current-week' : 'not-current-week'
  ]
}

// 获取课程样式
const getCourseStyle = (course) => {
  if (!course) return {}

  const colorKey = `${course.course}-${course.teacher}`
  let colorIndex = scheduleStore.courseColors.get(colorKey)

  if (colorIndex === undefined) {
    colorIndex = scheduleStore.generateCourseColorIndex(colorKey)
    scheduleStore.courseColors.set(colorKey, colorIndex)
  }

  const colorConfig = COURSE_COLORS[colorIndex % COURSE_COLORS.length]

  return {
    '--bg-class': colorConfig.backgroundColor,
    '--text-class': colorConfig.textColor
  }
}

// 获取课程颜色配置
const getCourseColorConfig = (course) => {
  if (!course) return null

  // 非本周课程使用浅灰色
  if (!course.isCurrentWeek) {
    return {
      backgroundColor: 'bg-gray-100',
      textColor: 'text-gray-500'
    }
  }

  const colorKey = `${course.course}-${course.teacher}`
  let colorIndex = scheduleStore.courseColors.get(colorKey)

  if (colorIndex === undefined) {
    colorIndex = scheduleStore.generateCourseColorIndex(colorKey)
    scheduleStore.courseColors.set(colorKey, colorIndex)
  }

  return COURSE_COLORS[colorIndex % COURSE_COLORS.length]
}

// 手势相关的状态
const touchState = ref({
  startX: 0,
  startY: 0,
  startTime: 0,
  isMoving: false
})

// 处理触摸开始
const handleTouchStart = (e) => {
  const touch = e.touches[0]
  touchState.value = {
    startX: touch.clientX,
    startY: touch.clientY,
    startTime: Date.now(),
    isMoving: false
  }
}

// 处理触摸移动
const handleTouchMove = (e) => {
  if (!e.touches[0]) return

  const touch = e.touches[0]
  const deltaX = Math.abs(touch.clientX - touchState.value.startX)
  const deltaY = Math.abs(touch.clientY - touchState.value.startY)

  // 如果水平移动距离大于垂直移动距离，且移动距离超过阈值，则认为是水平滑动
  if (deltaX > 10 && deltaX > deltaY) {
    touchState.value.isMoving = true
    // 阻止默认的滚动行为
    e.preventDefault()
  }
}

// 处理触摸结束
const handleTouchEnd = (e) => {
  if (!touchState.value.isMoving) {
    touchState.value = { startX: 0, startY: 0, startTime: 0, isMoving: false }
    return
  }

  const touch = e.changedTouches[0]
  const deltaX = touch.clientX - touchState.value.startX
  const deltaY = touch.clientY - touchState.value.startY
  const deltaTime = Date.now() - touchState.value.startTime

  // 判断是否为有效的滑动手势
  const isValidSwipe = Math.abs(deltaX) > 50 && // 水平移动距离超过50px
                       Math.abs(deltaX) > Math.abs(deltaY) && // 水平移动大于垂直移动
                       deltaTime < 500 // 滑动时间小于500ms

  if (isValidSwipe) {
    const currentWeek = scheduleStore.currentWeek

    if (deltaX > 0) {
      // 右滑 - 切换到上一周
      if (currentWeek > 1) {
        scheduleStore.setCurrentWeek(currentWeek - 1)
        // 发射手势事件，告诉父组件触发了右滑（上一周）
        emit('swipe-gesture', 'previous')
      }
    } else {
      // 左滑 - 切换到下一周
      if (currentWeek < 20) { // 假设最多20周
        scheduleStore.setCurrentWeek(currentWeek + 1)
        // 发射手势事件，告诉父组件触发了左滑（下一周）
        emit('swipe-gesture', 'next')
      }
    }
  }

  // 重置触摸状态
  touchState.value = { startX: 0, startY: 0, startTime: 0, isMoving: false }
}

// 处理课程点击
const handleCourseClick = (period, dayIndex) => {
  const course = getCourse(period, dayIndex)
  const timeInfo = {
    period,
    dayIndex,
    dayName: displayDays.value[dayIndex].name,
    time: TIME_SLOTS[period]
  }

  if (course) {
    // 有课程，发射课程点击事件
    emit('course-click', {
      ...course,
      ...timeInfo
    })
  } else {
    // 空格子，发射空格子点击事件
    emit('empty-cell-click', timeInfo)
  }
}
</script>


