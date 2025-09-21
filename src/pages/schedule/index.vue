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
          <view
            @tap="previousWeek"
            class="i-lucide-chevron-left w-5 h-5 transition-all duration-200"
            :class="{ 'animate-pulse bg-blue-500 rounded-full scale-125': previousWeekAnimate }"
          >
          </view>
          <view
            @tap="handleWeekClick"
            class="text-sm font-medium mx-2 transition-all duration-200"
            :class="{ 'animate-pulse  text-blue-500 scale-125': previousWeekAnimate || nextWeekAnimate }"
          >
            第{{ scheduleStore.currentWeek }}周
          </view>
          <view
            @tap="nextWeek"
            class="i-lucide-chevron-right w-5 h-5 transition-all duration-200"
            :class="{ 'animate-pulse bg-blue-500 rounded-full scale-125': nextWeekAnimate }"
          >
          </view>
        </view>

        <!-- 右侧帮助按钮和非本周课程控制 -->
        <view class="flex items-center justify-end gap-2">
          <view
            @tap="showHelpModal = true"
            class="i-lucide-help-circle w-4 h-4 text-gray-500 active:text-blue-500"
          ></view>
          <view
            @tap="toggleNotCurrentWeek"
            class="text-xs px-3 py-1 rounded"
            :class="showNotCurrentWeek ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'"
          >
            显示全部
          </view>
        </view>
      </view>

      <!-- 课程表网格 -->
      <view class="flex-1 overflow-hidden">
        <schedule-table
          :show-weekend="showWeekend"
          :show-not-current-week="showNotCurrentWeek"
          @course-click="handleCourseClick"
          @empty-cell-click="handleEmptyCellClick"
          @swipe-gesture="handleSwipeGesture"
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
      @edit="handleEditCourse"
      @delete="handleDeleteCourse"
      @add-new="handleAddNewCourse"
    />

    <!-- 课程编辑弹窗 -->
    <course-edit-modal
      v-if="editModalVisible"
      :course="editingCourse"
      :time-info="editTimeInfo"
      :operation-type="editOperationType"
      :original-course="originalCourse"
      @close="handleCloseEdit"
      @submit="handleSubmitCourse"
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
              :class="{
                'bg-blue-50 text-blue-600': option.value === scheduleStore.currentWeek,
                'ring-2 ring-blue-600': option.isCurrentWeek
              }"
            >
              {{ option.label }}
            </view>
          </view>
        </view>
      </view>
    </view>


    <!-- 功能指示弹窗 -->
    <view v-if="showHelpModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩层 -->
      <view
        class="absolute inset-0 bg-black bg-opacity-50"
        @tap="showHelpModal = false"
      ></view>

      <!-- 弹窗内容 -->
      <view class="relative bg-white rounded-lg mx-6 max-w-sm w-full">
        <!-- 标题 -->
        <view class="px-6 pt-2 pb-2 border-b border-gray-200">
          <view class="text-lg font-semibold text-center text-gray-800 mb-1">功能说明</view>
          <view class="text-sm text-gray-500 text-center">快速掌握课程表操作</view>
        </view>

        <!-- 功能说明列表 -->
        <view class="px-6 py-4 space-y-4">
          <!-- 离线数据提醒 -->
          <view class="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <view class="i-lucide-alert-triangle w-5 h-5 text-yellow-500 mt-0.5"></view>
            <view class="flex-1">
              <view class="text-sm font-medium text-yellow-800">数据提醒</view>
              <view class="text-xs text-yellow-700 mt-1">当前课程表数据为离线数据，可能与实际课程安排存在差异，请务必与教务系统核对后使用，您可自由编辑课程表内容！</view>
            </view>
          </view>

          <!-- 班级绑定 -->
          <view class="flex items-start space-x-3">
            <view class="i-lucide-user-plus w-5 h-5 text-blue-500 mt-0.5"></view>
            <view class="flex-1">
              <view class="text-sm font-medium text-gray-800">绑定班级</view>
              <view class="text-xs text-gray-500 mt-1">点击左上角班级名称重新绑定</view>
            </view>
          </view>

          <!-- 课程操作 -->
          <view class="flex items-start space-x-3">
            <view class="i-lucide-edit w-5 h-5 text-green-500 mt-0.5"></view>
            <view class="flex-1">
              <view class="text-sm font-medium text-gray-800">编辑课程</view>
              <view class="text-xs text-gray-500 mt-1">点击课程格子新增或编辑课程</view>
            </view>
          </view>

          <!-- 周切换 - 手势 -->
          <view class="flex items-start space-x-3">
            <view class="i-lucide-move-horizontal w-5 h-5 text-purple-500 mt-0.5"></view>
            <view class="flex-1">
              <view class="text-sm font-medium text-gray-800">周切换</view>
              <view class="text-xs text-gray-500 mt-1">左右滑动或点击箭头切换周</view>
            </view>
          </view>

          <!-- 快速回到当前周 -->
          <view class="flex items-start space-x-3">
            <view class="i-lucide-calendar-days w-5 h-5 text-orange-500 mt-0.5"></view>
            <view class="flex-1">
              <view class="text-sm font-medium text-gray-800">回到当前周</view>
              <view class="text-xs text-gray-500 mt-1">点击星期栏(周一-周五)回到当前周</view>
            </view>
          </view>

          <!-- 选择周数 -->
          <view class="flex items-start space-x-3">
            <view class="i-lucide-calendar-check w-5 h-5 text-red-500 mt-0.5"></view>
            <view class="flex-1">
              <view class="text-sm font-medium text-gray-800">选择周数</view>
              <view class="text-xs text-gray-500 mt-1">点击顶部第X周弹窗选择任意周</view>
            </view>
          </view>
        </view>

        <!-- 底部按钮 -->
        <view class="px-6 pb-6 flex justify-between gap-3 border-t border-gray-100 pt-4">
          <view
            @tap="handleHelpModalConfirm(true)"
            class="bg-blue-500 text-white text-center py-2 px-4 flex-1 rounded-lg font-medium active:bg-blue-600"
          >
            不再显示
          </view>
          <view
            @tap="handleHelpModalConfirm(false)"
            class="bg-gray-100 text-gray-700 text-center py-2 px-4 flex-1 rounded-lg font-medium active:bg-gray-200"
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
import CourseEditModal from './components/CourseEditModal.vue'

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
const showHelpModal = ref(false)

// 编辑相关状态
const editModalVisible = ref(false)
const editingCourse = ref(null)
const editTimeInfo = ref(null)
const editOperationType = ref('add')
const originalCourse = ref(null)

// 按钮动画状态
const previousWeekAnimate = ref(false)
const nextWeekAnimate = ref(false)

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

// 处理空格子点击（添加课程）
const handleEmptyCellClick = (timeInfo) => {
  editingCourse.value = null
  editTimeInfo.value = timeInfo
  editOperationType.value = 'add'
  originalCourse.value = null
  editModalVisible.value = true
}

// 处理编辑课程
const handleEditCourse = (data) => {
  editingCourse.value = data.course
  editTimeInfo.value = data.timeInfo
  editOperationType.value = 'edit'
  originalCourse.value = data.course
  selectedCourse.value = null // 关闭详情弹窗
  editModalVisible.value = true // 打开编辑弹窗
}

// 处理添加新课程（从课程详情页添加）
const handleAddNewCourse = (data) => {
  editingCourse.value = null
  editTimeInfo.value = data.timeInfo
  editOperationType.value = 'add'
  originalCourse.value = null
  selectedCourse.value = null // 关闭详情弹窗
  editModalVisible.value = true // 打开编辑弹窗
}

// 处理删除课程
const handleDeleteCourse = async (data) => {
  try {
    const index = scheduleStore.calculateCourseIndex(data.timeInfo.dayIndex, data.timeInfo.period)
    await scheduleStore.editCourseCell(scheduleStore.semester, index, null, 'delete', data.course)

    selectedCourse.value = null
    Taro.showToast({
      title: '删除成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('删除课程失败:', error)
    Taro.showToast({
      title: '删除失败',
      icon: 'none'
    })
  }
}

// 关闭编辑弹窗
const handleCloseEdit = () => {
  editModalVisible.value = false
  editingCourse.value = null
  editTimeInfo.value = null
  editOperationType.value = 'add'
  originalCourse.value = null
}

// 提交课程数据（添加或编辑）
const handleSubmitCourse = async (submitData) => {
  try {
    const { courseData, operationType, originalCourse: originalCourseData } = submitData
    const index = scheduleStore.calculateCourseIndex(editTimeInfo.value.dayIndex, editTimeInfo.value.period)
    await scheduleStore.editCourseCell(scheduleStore.semester, index, courseData, operationType, originalCourseData)

    // 清理状态
    editModalVisible.value = false
    editingCourse.value = null
    editTimeInfo.value = null
    editOperationType.value = 'add'
    originalCourse.value = null

    Taro.showToast({
      title: operationType === 'edit' ? '修改成功' : '添加成功',
      icon: 'success'
    })
  } catch (error) {
    Taro.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
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

// 处理手势动画
const handleSwipeGesture = (direction) => {
  if (direction === 'previous') {
    // 触发上一周按钮动画
    previousWeekAnimate.value = true
    setTimeout(() => {
      previousWeekAnimate.value = false
    }, 200)
  } else if (direction === 'next') {
    // 触发下一周按钮动画
    nextWeekAnimate.value = true
    setTimeout(() => {
      nextWeekAnimate.value = false
    }, 200)
  }
}

// 检查是否需要显示功能指示弹窗
const shouldShowHelpModal = () => {
  try {
    const dontShowHelpModal = Taro.getStorageSync('dontShowHelpModal')
    // 任一功能未禁用都应显示
    return !dontShowHelpModal
  } catch (error) {
    console.error('读取存储失败:', error)
    return true
  }
}

// 处理功能指示弹窗确认
const handleHelpModalConfirm = (dontShowAgain = false) => {
  if (dontShowAgain) {
    try {
      // 同时设置两个标志，表示用户不再需要任何提示
      Taro.setStorageSync('dontShowHelpModal', true)
    } catch (error) {
      console.error('保存存储失败:', error)
    }
  }
  showHelpModal.value = false
}

// 显示功能指示弹窗
const showHelpGuide = () => {
  if (shouldShowHelpModal()) {
    showHelpModal.value = true

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
      // 显示功能指示弹窗（包含离线数据提醒）
      showHelpGuide()
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
  // 监听 reloadSchedule 事件，收到后刷新课表
  Taro.eventCenter.on('reloadSchedule', () => {
    loadCourseData()
  })
})

// 页面显示时检查是否需要重新加载数据
Taro.useDidShow(async () => {
  // 等待2秒后再执行
  await new Promise(resolve => setTimeout(resolve, 2000))
  // 如果用户有班级信息但课程表数据为空，则重新加载
  if (authStore.userClass && Object.keys(scheduleStore.courseData).length === 0) {
    await loadCourseData()
  }
})
</script>

<style scoped>
</style>
