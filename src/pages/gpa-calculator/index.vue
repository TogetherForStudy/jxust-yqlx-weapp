<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <view class="px-4 pt-4 flex-shrink-0">
      <!-- 绩点结果显示区域 -->
      <view class="bg-white rounded-xl shadow-sm p-6 mb-4">
        <view class="text-center">
          <view class="grid grid-cols-3 gap-4">
            <!-- 五分制 -->
            <view class="flex flex-col items-center">
              <text class="text-gray-400 text-xs mb-1">五分制</text>
              <text class="text-2xl font-bold text-green-600" :selectable="true">
                {{ gpaResults.fivePoint.toFixed(2) }}
              </text>
            </view>
            <!-- 百分制 -->
            <view class="flex flex-col items-center">
              <text class="text-gray-400 text-xs mb-1">百分制</text>
              <text class="text-2xl font-bold text-blue-600" :selectable="true">
                {{ gpaResults.percentage.toFixed(2) }}
              </text>
            </view>
            <!-- 四分制 -->
            <view class="flex flex-col items-center">
              <text class="text-gray-400 text-xs mb-1">四分制</text>
              <text class="text-2xl font-bold text-purple-600" :selectable="true">
                {{ gpaResults.fourPoint.toFixed(2) }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 输入区域 -->
      <view class="bg-white rounded-xl shadow-sm p-4 mb-4">
        <view>
          <!-- 课程名称和添加按钮 -->
          <view class="mb-3">
            <text class="text-gray-700 text-sm mb-2 block">课程名称</text>
            <view class="flex items-center gap-2">
              <view class="flex-1 flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
                <input
                  v-model="currentCourse.courseName"
                  placeholder="请输入课程名称"
                  class="flex-1 bg-transparent text-sm outline-none h-full"
                />
              </view>
              <view
                @tap="addCourse"
                :class="[
                  'px-4 py-2 rounded-lg text-white font-medium text-sm h-10 flex items-center justify-center',
                  canAdd ? 'bg-blue-500 active:bg-blue-600' : 'bg-gray-300'
                ]"
              >
                添加
              </view>
            </view>
          </view>

          <!-- 学分和成绩 -->
          <view class="grid grid-cols-2 gap-3">
            <view>
              <text class="text-gray-700 text-sm mb-2 block">学分</text>
              <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
                <input
                  v-model.number="currentCourse.credits"
                  type="digit"
                  placeholder="请输入学分"
                  class="flex-1 bg-transparent text-sm outline-none h-full"
                />
              </view>
            </view>
            <view>
              <text class="text-gray-700 text-sm mb-2 block">成绩</text>
              <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
                <input
                  v-model.number="currentCourse.score"
                  type="digit"
                  placeholder="请输入成绩"
                  class="flex-1 bg-transparent text-sm outline-none h-full"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 历史数据列表 -->
    <view class="px-4 flex-1 h-[1px] flex flex-col">
      <view v-if="courses.length > 0" class="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col h-full">
        <view class="px-4 py-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
          <text class="text-gray-700 font-medium text-sm">已添加课程</text>
          <view class="flex items-center flex-shrink-0">
            <view
              @tap="selectAll"
              class="mx-2 active:bg-gray-100 rounded"
            >
              <text class="text-blue-500 text-xs">全选</text>
            </view>
            <view
              @tap="toggleAll"
              class="mx-2 active:bg-gray-100 rounded"
            >
              <text class="text-blue-500 text-xs">不选</text>
            </view>
          </view>
        </view>
        <scroll-view :scroll-y="true" class="flex-1 h-[0px]">
          <view class="divide-y divide-gray-100">
            <view
              v-for="(course, index) in courses"
              :key="index"
              class="px-4 py-3 flex items-center"
            >
              <!-- 左侧勾选框 -->
              <view class="mr-3 flex-shrink-0" @tap.stop="toggleCourseSelection(index)">
                <view
                  class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                  :class="course.selected
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'"
                >
                  <text
                    v-if="course.selected"
                    class="i-lucide-check text-white text-xs"
                  ></text>
                </view>
              </view>

              <!-- 课程信息 -->
              <view class="flex-1" @tap="toggleCourseSelection(index)">
                <text class="text-gray-800 font-medium text-sm block mb-1">
                  {{ course.courseName }}
                </text>
                <view class="flex items-center space-x-4 text-xs text-gray-500">
                  <text>学分: {{ course.credits }}</text>
                  <text>成绩: {{ course.score }}</text>
                </view>
              </view>

              <!-- 右侧操作按钮 -->
              <view class="flex items-center flex-shrink-0">
                <view
                  @tap.stop="editCourse(index)"
                  class="ml-3 p-2 active:bg-gray-100 rounded"
                >
                  <text class="i-lucide-edit text-blue-500 w-5 h-5"></text>
                </view>
                <view
                  @tap.stop="removeCourse(index)"
                  class="ml-2 p-2 active:bg-gray-100 rounded"
                >
                  <text class="i-lucide-trash-2 text-red-500 w-5 h-5"></text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 空状态 -->
      <view v-else class="bg-white rounded-xl shadow-sm p-8">
        <view class="text-center">
          <text class="i-lucide-book-open w-12 h-12 text-gray-300 block mx-auto mb-3"></text>
          <text class="text-gray-500 text-sm block">暂无课程数据</text>
          <text class="text-gray-400 text-xs mt-1 block">请在上方添加课程信息</text>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="p-4 flex-shrink-0">
      <text class="text-gray-400 text-xs text-center block">
        您的数据不会被上传
      </text>
    </view>

    <!-- 编辑弹窗 -->
    <view v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @tap="closeEditModal">
      <view class="bg-white rounded-xl p-6 w-full max-w-sm mx-4" @tap.stop>
        <view class="text-gray-800 font-medium text-lg mb-4">编辑课程</view>

        <!-- 课程名称 -->
        <view class="mb-3">
          <text class="text-gray-700 text-sm mb-2 block">课程名称</text>
          <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
            <input
              v-model="editCourseData.courseName"
              placeholder="请输入课程名称"
              class="flex-1 bg-transparent text-sm outline-none h-full"
            />
          </view>
        </view>

        <!-- 学分和成绩 -->
        <view class="grid grid-cols-2 gap-3 mb-4">
          <view>
            <text class="text-gray-700 text-sm mb-2 block">学分</text>
            <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
              <input
                v-model.number="editCourseData.credits"
                type="digit"
                placeholder="请输入学分"
                class="flex-1 bg-transparent text-sm outline-none h-full"
              />
            </view>
          </view>
          <view>
            <text class="text-gray-700 text-sm mb-2 block">成绩</text>
            <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
              <input
                v-model.number="editCourseData.score"
                type="digit"
                placeholder="请输入成绩"
                class="flex-1 bg-transparent text-sm outline-none h-full"
              />
            </view>
          </view>
        </view>

        <!-- 按钮 -->
        <view class="flex gap-2 pt-2">
          <view
            @tap="closeEditModal"
            class="flex-1 bg-gray-100 text-gray-600 text-center py-3 rounded-lg active:bg-gray-200 transition-colors"
          >
            <text class="text-sm">取消</text>
          </view>
          <view
            @tap="saveEditCourse"
            :class="[
              'flex-1 text-center py-3 rounded-lg transition-colors',
              canSaveEdit ? 'bg-blue-100 text-blue-700 active:bg-blue-200' : 'bg-gray-100 text-gray-400 opacity-50'
            ]"
          >
            <text class="text-sm">保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'

// 当前输入的课程信息
const currentCourse = ref({
  courseName: '',
  credits: '',
  score: ''
})

// 课程列表
const courses = ref([])

// 编辑相关
const showEditModal = ref(false)
const editCourseIndex = ref(-1)
const editCourseData = ref({
  courseName: '',
  credits: '',
  score: ''
})

// 是否可以添加
const canAdd = computed(() => {
  return (
    currentCourse.value.courseName.trim() &&
    currentCourse.value.credits &&
    currentCourse.value.credits > 0 &&
    currentCourse.value.score !== '' &&
    currentCourse.value.score >= 0 &&
    currentCourse.value.score <= 100
  )
})

// 是否可以保存编辑
const canSaveEdit = computed(() => {
  return (
    editCourseData.value.courseName.trim() &&
    editCourseData.value.credits &&
    editCourseData.value.credits > 0 &&
    editCourseData.value.score !== '' &&
    editCourseData.value.score >= 0 &&
    editCourseData.value.score <= 100
  )
})

// 绩点计算结果（只计算选中的课程）
const gpaResults = computed(() => {
  const selectedCourses = courses.value.filter(course => course.selected !== false)

  if (selectedCourses.length === 0) {
    return {
      percentage: 0,
      fivePoint: 0,
      fourPoint: 0
    }
  }

  let totalCredits = 0
  let totalScoreWeighted = 0
  let totalFivePointWeighted = 0
  let totalFourPointWeighted = 0

  selectedCourses.forEach(course => {
    const credits = parseFloat(course.credits) || 0
    const score = parseFloat(course.score) || 0

    if (credits > 0 && score >= 0 && score <= 100) {
      totalCredits += credits
      totalScoreWeighted += score * credits

      // 五分制转换
      const fivePoint = convertToFivePoint(score)
      totalFivePointWeighted += fivePoint * credits

      // 四分制转换
      const fourPoint = convertToFourPoint(score)
      totalFourPointWeighted += fourPoint * credits
    }
  })

  if (totalCredits === 0) {
    return {
      percentage: 0,
      fivePoint: 0,
      fourPoint: 0
    }
  }

  return {
    percentage: totalScoreWeighted / totalCredits,
    fivePoint: totalFivePointWeighted / totalCredits,
    fourPoint: totalFourPointWeighted / totalCredits
  }
})

// 百分制转五分制
const convertToFivePoint = (score) => {
  if (score >= 90) return 5
  if (score >= 80) return 4
  if (score >= 70) return 3
  if (score >= 60) return 2
  return 1
}

// 百分制转四分制
const convertToFourPoint = (score) => {
  if (score >= 90) return 4.0
  if (score >= 85) return 3.7
  if (score >= 82) return 3.3
  if (score >= 78) return 3.0
  if (score >= 75) return 2.7
  if (score >= 72) return 2.3
  if (score >= 68) return 2.0
  if (score >= 64) return 1.5
  if (score >= 60) return 1.0
  return 0
}

// 切换课程选中状态
const toggleCourseSelection = (index) => {
  if (courses.value[index]) {
    courses.value[index].selected = !courses.value[index].selected
    saveToLocalStorage()
  }
}

// 全选
const selectAll = () => {
  courses.value.forEach(course => {
    course.selected = true
  })
  saveToLocalStorage()
}

// 反选
const toggleAll = () => {
  courses.value.forEach(course => {
    course.selected = !course.selected
  })
  saveToLocalStorage()
}

// 添加课程
const addCourse = () => {
  if (!canAdd.value) {
    Taro.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  const newCourse = {
    courseName: currentCourse.value.courseName.trim(),
    credits: parseFloat(currentCourse.value.credits),
    score: parseFloat(currentCourse.value.score),
    selected: true // 默认选中
  }

  // 使用unshift确保新课程添加到数组开头（显示在顶部）
  courses.value.unshift(newCourse)

  // 清空输入
  currentCourse.value = {
    courseName: '',
    credits: '',
    score: ''
  }

  // 保存到本地存储
  saveToLocalStorage()
}

// 编辑课程
const editCourse = (index) => {
  editCourseIndex.value = index
  editCourseData.value = {
    courseName: courses.value[index].courseName,
    credits: courses.value[index].credits,
    score: courses.value[index].score
  }
  showEditModal.value = true
}

// 保存编辑
const saveEditCourse = () => {
  if (!canSaveEdit.value) {
    Taro.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  // 保留原有的 selected 状态
  const originalSelected = courses.value[editCourseIndex.value]?.selected !== undefined
    ? courses.value[editCourseIndex.value].selected
    : true

  courses.value[editCourseIndex.value] = {
    courseName: editCourseData.value.courseName.trim(),
    credits: parseFloat(editCourseData.value.credits),
    score: parseFloat(editCourseData.value.score),
    selected: originalSelected // 保留原有的选中状态
  }

  saveToLocalStorage()
  closeEditModal()
}

// 关闭编辑弹窗
const closeEditModal = () => {
  showEditModal.value = false
  editCourseIndex.value = -1
  editCourseData.value = {
    courseName: '',
    credits: '',
    score: ''
  }
}

// 删除课程
const removeCourse = (index) => {
  Taro.showModal({
    title: '提示',
    content: '确定要删除这条课程记录吗？',
    success: (res) => {
      if (res.confirm) {
        courses.value.splice(index, 1)
        saveToLocalStorage()
      }
    }
  })
}

// 保存到本地存储
const saveToLocalStorage = () => {
  try {
    Taro.setStorageSync('gpa_calculator_courses', courses.value)
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}

// 从本地存储加载
const loadFromLocalStorage = () => {
  try {
    const saved = Taro.getStorageSync('gpa_calculator_courses')
    if (saved && Array.isArray(saved)) {
      // 确保每个课程都有selected属性，默认为true
      courses.value = saved.map(course => ({
        ...course,
        selected: course.selected !== undefined ? course.selected : true
      }))
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 页面加载时恢复数据
onMounted(() => {
  loadFromLocalStorage()
})

Taro.useShareAppMessage((res) => {
  if (res.from === 'button') {
  }
  return {
    title: '绩点计算 - 江理一起来学',
    path: '/pages/gpa-calculator/index',
  }
})

Taro.useShareTimeline((res) => {
  if (res.from === 'button') {
  }
  return {
    title: '绩点计算 - 江理一起来学',
    path: '/pages/gpa-calculator/index',
  }
})
</script>

<style scoped></style>

