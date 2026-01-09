<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <view class="px-4 pt-4 flex-shrink-0">
      <!-- 绩点结果显示区域 -->
      <view class="bg-white rounded-xl shadow-sm px-6 py-3 mb-4">
        <view class="text-center">
          <view class="grid grid-cols-3 gap-4">
            <!-- 五分制 -->
            <view class="flex flex-col items-center">
              <text class="text-gray-400 text-xs mb-1">五分制</text>
              <text class="text-2xl font-bold" :user-select="true">
                {{ gpaResults.fivePoint.toFixed(2) }}
              </text>
            </view>
            <!-- 百分制 -->
            <view class="flex flex-col items-center">
              <text class="text-gray-400 text-xs mb-1">百分制</text>
              <text class="text-2xl font-bold text-blue-600" :user-select="true">
                {{ gpaResults.percentage.toFixed(2) }}
              </text>
            </view>
            <!-- 四分制 -->
            <view class="flex flex-col items-center">
              <text class="text-gray-400 text-xs mb-1">四分制</text>
              <text class="text-2xl font-bold" :user-select="true">
                {{ gpaResults.fourPoint.toFixed(2) }}
              </text>
            </view>
          </view>
          <!-- 总学分显示 -->
          <view class="mt-2 pt-2 border-t border-gray-100">
            <text class="text-gray-500 text-xs">总学分：</text>
            <text class="text-blue-600 text-sm font-medium">{{ totalSelectedCredits.toFixed(1) }}</text>
            <text class="text-gray-400 text-xs"> / </text>
            <text class="text-gray-600 text-sm font-medium">{{ totalCredits.toFixed(1) }}</text>
          </view>
        </view>
      </view>

      <!-- 功能按钮区域 -->
      <view class="mb-4 grid grid-cols-3 gap-3">
        <!-- 反向计算 -->
        <view
          @tap="openReverseCalcModal"
          class="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-sm p-2 active:opacity-90 transition-opacity"
        >
          <view class="flex flex-col items-center justify-center">
            <text class="i-lucide-calculator w-5 h-5 text-white mb-1"></text>
            <text class="text-white text-xs font-medium">反向计算</text>
          </view>
        </view>

        <!-- 保研均分 -->
        <view
          @tap="openGraduateModal"
          class="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-sm p-2 active:opacity-90 transition-opacity"
        >
          <view class="flex flex-col items-center justify-center">
            <text class="i-lucide-graduation-cap w-5 h-5 text-white mb-1"></text>
            <text class="text-white text-xs font-medium">保研均分</text>
          </view>
        </view>

        <!-- 添加课程 -->
        <view
          @tap="openAddModal"
          class="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-sm p-2 active:opacity-90 transition-opacity"
        >
          <view class="flex flex-col items-center justify-center">
            <text class="i-lucide-plus w-5 h-5 text-white mb-1"></text>
            <text class="text-white text-xs font-medium">添加课程</text>
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

    <!-- 添加课程弹窗 -->
    <view v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @tap="closeAddModal">
      <view class="bg-white rounded-xl p-6 w-full max-w-sm mx-4" @tap.stop>
        <view class="text-gray-800 font-medium text-lg mb-4">添加课程</view>

        <!-- 课程名称 -->
        <view class="mb-3">
          <text class="text-gray-700 text-sm mb-2 block">课程名称</text>
          <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
            <input
              v-model="currentCourse.courseName"
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

        <!-- 按钮 -->
        <view class="flex gap-2 pt-2">
          <view
            @tap="closeAddModal"
            class="flex-1 bg-gray-100 text-gray-600 text-center py-3 rounded-lg active:bg-gray-200 transition-colors"
          >
            <text class="text-sm">取消</text>
          </view>
          <view
            @tap="addCourse"
            :class="[
              'flex-1 text-center py-3 rounded-lg transition-colors',
              canAdd ? 'bg-blue-500 text-white active:bg-blue-600' : 'bg-gray-100 text-gray-400 opacity-50'
            ]"
          >
            <text class="text-sm">添加</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 反向计算弹窗 -->
    <view v-if="showReverseCalcModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @tap="closeReverseCalcModal">
      <view class="bg-white rounded-xl p-6 w-full max-w-sm mx-4" @tap.stop>
        <view class="text-gray-800 font-medium text-lg mb-4">反向计算</view>

        <!-- 说明文本 -->
        <view class="bg-blue-50 rounded-lg p-3 mb-4">
          <text class="text-blue-700 text-xs leading-relaxed">
            输入目标绩点，计算剩余课程需要达到的平均分数
          </text>
        </view>

        <!-- 目标绩点 -->
        <view class="mb-3">
          <text class="text-gray-700 text-sm mb-2 block">目标绩点（百分制）</text>
          <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
            <input
              v-model.number="reverseCalc.targetGPA"
              type="digit"
              placeholder="例如：85"
              class="flex-1 bg-transparent text-sm outline-none h-full"
            />
          </view>
        </view>

        <!-- 剩余学分 -->
        <view class="mb-4">
          <text class="text-gray-700 text-sm mb-2 block">剩余学分</text>
          <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
            <input
              v-model.number="reverseCalc.remainingCredits"
              type="digit"
              placeholder="例如：20"
              class="flex-1 bg-transparent text-sm outline-none h-full"
            />
          </view>
        </view>

        <!-- 计算结果 -->
        <view v-if="reverseCalcResult" class="bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg p-4 mb-4">
          <view class="text-center">
            <text class="text-gray-600 text-xs block mb-1">所需平均分</text>
            <text class="text-3xl font-bold text-blue-600 block">{{ reverseCalcResult.requiredScore }}</text>
            <text class="text-gray-500 text-xs mt-2 block">各科平均需要达到此分数以上</text>
          </view>
        </view>

        <!-- 按钮 -->
        <view class="flex gap-2 pt-2">
          <view
            @tap="closeReverseCalcModal"
            class="flex-1 bg-gray-100 text-gray-600 text-center py-3 rounded-lg active:bg-gray-200 transition-colors"
          >
            <text class="text-sm">关闭</text>
          </view>
          <view
            @tap="calculateReverse"
            :class="[
              'flex-1 text-center py-3 rounded-lg transition-colors',
              canReverseCalc ? 'bg-blue-500 text-white active:bg-blue-600' : 'bg-gray-100 text-gray-400 opacity-50'
            ]"
          >
            <text class="text-sm">计算</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 保研均分查询弹窗 -->
    <view v-if="showGraduateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @tap="closeGraduateModal">
      <view class="bg-white rounded-xl p-6 w-full max-w-sm mx-4" @tap.stop>
        <view class="text-gray-800 font-medium text-lg mb-3">保研均分查询</view>

        <!-- 说明文本 -->
        <view class="bg-blue-50 rounded-lg p-3 mb-3">
          <text class="text-blue-700 text-xs leading-relaxed">
            2026届保研各专业绩点平均及加分平均数据
          </text>
        </view>

        <!-- 表头 -->
        <view class="grid grid-cols-[2fr,1fr,1fr] gap-2 pb-2 border-b border-gray-200 mb-1">
          <text class="text-gray-600 text-xs font-medium">专业</text>
          <text class="text-gray-600 text-xs font-medium text-center">平均绩点</text>
          <text class="text-gray-600 text-xs font-medium text-center">平均附加</text>
        </view>

        <!-- 数据列表 -->
        <scroll-view :scroll-y="true" class="-mx-2 px-2 mb-3" style="max-height: 300px;">
          <view
            v-for="(major, index) in graduateMajorData"
            :key="index"
            class="grid grid-cols-[2fr,1fr,1fr] gap-2 py-2 border-b border-gray-100"
          >
            <text class="text-gray-800 text-xs leading-tight">{{ major.name }}</text>
            <text class="text-blue-600 text-xs font-medium text-center">{{ major.gpa }}</text>
            <text class="text-gray-500 text-xs text-center">{{ major.bonus }}</text>
          </view>
        </scroll-view>

        <!-- 按钮 -->
        <view>
          <view
            @tap="closeGraduateModal"
            class="w-full bg-gray-100 text-gray-600 text-center py-3 rounded-lg active:bg-gray-200 transition-colors"
          >
            <text class="text-sm">关闭</text>
          </view>
        </view>
      </view>
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

// 添加弹窗相关
const showAddModal = ref(false)

// 反向计算弹窗相关
const showReverseCalcModal = ref(false)
const reverseCalc = ref({
  targetGPA: '',
  remainingCredits: ''
})
const reverseCalcResult = ref(null)

// 保研均分查询弹窗相关
const showGraduateModal = ref(false)

// 保研专业数据
const graduateMajorData = [
  { name: '财务管理', gpa: '90.13', bonus: '1.80' },
  { name: '日语', gpa: '89.93', bonus: '0.00' },
  { name: '国际经济与贸易', gpa: '89.73', bonus: '2.30' },
  { name: '会计学', gpa: '89.71', bonus: '1.96' },
  { name: '英语', gpa: '89.62', bonus: '0.14' },
  { name: '社会体育指导与管理', gpa: '89.52', bonus: '1.06' },
  { name: '信息与计算科学', gpa: '89.49', bonus: '0.24' },
  { name: '信息安全', gpa: '89.38', bonus: '1.92' },
  { name: '电气工程及其自动化', gpa: '89.28', bonus: '1.00' },
  { name: '汉语国际教育', gpa: '89.25', bonus: '0.00' },
  { name: '电子科学与技术（中外）', gpa: '89.23', bonus: '0.00' },
  { name: '行政管理', gpa: '88.92', bonus: '0.15' },
  { name: '地理信息科学', gpa: '88.90', bonus: '0.13' },
  { name: '电子信息工程', gpa: '88.75', bonus: '0.96' },
  { name: '虚拟现实技术', gpa: '88.73', bonus: '1.43' },
  { name: '计算机科学与技术', gpa: '88.71', bonus: '1.15' },
  { name: '人力资源管理', gpa: '88.70', bonus: '1.51' },
  { name: '工程管理', gpa: '88.69', bonus: '0.00' },
  { name: '金融学', gpa: '88.48', bonus: '0.00' },
  { name: '工商管理', gpa: '88.35', bonus: '0.10' },
  { name: '人工智能', gpa: '88.34', bonus: '1.10' },
  { name: '材料成型及控制工程', gpa: '88.20', bonus: '2.40' },
  { name: '工程造价', gpa: '87.85', bonus: '0.83' },
  { name: '应用化学', gpa: '87.54', bonus: '1.12' },
  { name: '软件工程(软件开发)', gpa: '87.52', bonus: '0.65' },
  { name: '产品设计', gpa: '87.39', bonus: '0.23' },
  { name: '给排水科学与工程', gpa: '87.33', bonus: '0.00' },
  { name: '应急管理', gpa: '87.23', bonus: '0.00' },
  { name: '测绘工程', gpa: '87.11', bonus: '0.91' },
  { name: '数字媒体艺术', gpa: '86.69', bonus: '0.14' },
  { name: '电子科学与技术', gpa: '86.62', bonus: '1.17' },
  { name: '软件工程(金融学)', gpa: '86.58', bonus: '1.38' },
  { name: '法学', gpa: '86.48', bonus: '0.09' },
  { name: '软件工程(智能制造工程)', gpa: '86.39', bonus: '0.53' },
  { name: '自动化', gpa: '86.24', bonus: '0.18' },
  { name: '生物工程', gpa: '86.13', bonus: '0.41' },
  { name: '土木工程', gpa: '86.10', bonus: '0.51' },
  { name: '金属材料工程', gpa: '86.10', bonus: '0.54' },
  { name: '建筑环境与能源应用工程', gpa: '85.95', bonus: '1.17' },
  { name: '建筑学', gpa: '85.95', bonus: '0.00' },
  { name: '新能源科学与工程', gpa: '85.92', bonus: '0.05' },
  { name: '电子信息科学与技术', gpa: '85.86', bonus: '0.21' },
  { name: '机械工程', gpa: '85.78', bonus: '1.20' },
  { name: '环境设计', gpa: '85.48', bonus: '0.39' },
  { name: '软件工程(土木工程)', gpa: '85.47', bonus: '0.00' },
  { name: '智能制造工程', gpa: '85.24', bonus: '0.70' },
  { name: '安全工程', gpa: '84.91', bonus: '0.00' },
  { name: '软件工程(会计学)', gpa: '84.81', bonus: '0.15' },
  { name: '采矿工程（中外）', gpa: '84.74', bonus: '0.25' },
  { name: '能源与动力工程', gpa: '84.65', bonus: '0.15' },
  { name: '材料科学与工程', gpa: '84.59', bonus: '0.15' },
  { name: '城乡规划', gpa: '84.59', bonus: '1.30' },
  { name: '车辆工程', gpa: '84.47', bonus: '1.00' },
  { name: '软件工程(物联网工程)', gpa: '84.41', bonus: '0.29' },
  { name: '化学工程与工艺', gpa: '84.34', bonus: '0.80' },
  { name: '机械电子工程', gpa: '84.33', bonus: '0.77' },
  { name: '机器人工程', gpa: '84.32', bonus: '1.30' },
  { name: '矿物加工工程', gpa: '84.22', bonus: '0.07' },
  { name: '冶金工程', gpa: '83.75', bonus: '0.35' },
  { name: '地质工程', gpa: '83.54', bonus: '0.09' },
  { name: '采矿工程', gpa: '82.91', bonus: '0.34' },
  { name: '环境工程', gpa: '82.75', bonus: '0.13' },
  { name: '矿业类', gpa: '82.01', bonus: '0.00' },
  { name: '智能科学与技术', gpa: '81.51', bonus: '0.00' }
]

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

// 是否可以进行反向计算
const canReverseCalc = computed(() => {
  return (
    reverseCalc.value.targetGPA &&
    reverseCalc.value.targetGPA > 0 &&
    reverseCalc.value.targetGPA <= 100 &&
    reverseCalc.value.remainingCredits &&
    reverseCalc.value.remainingCredits > 0
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

// 总学分（所有课程）
const totalCredits = computed(() => {
  return courses.value.reduce((sum, course) => {
    const credits = parseFloat(course.credits) || 0
    return sum + credits
  }, 0)
})

// 已选择的总学分
const totalSelectedCredits = computed(() => {
  return courses.value
    .filter(course => course.selected !== false)
    .reduce((sum, course) => {
      const credits = parseFloat(course.credits) || 0
      return sum + credits
    }, 0)
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

// 打开添加弹窗
const openAddModal = () => {
  showAddModal.value = true
}

// 关闭添加弹窗
const closeAddModal = () => {
  showAddModal.value = false
  // 清空输入
  currentCourse.value = {
    courseName: '',
    credits: '',
    score: ''
  }
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

  // 保存到本地存储
  saveToLocalStorage()

  // 关闭弹窗
  closeAddModal()
}

// 打开反向计算弹窗
const openReverseCalcModal = () => {
  showReverseCalcModal.value = true
  reverseCalcResult.value = null
}

// 关闭反向计算弹窗
const closeReverseCalcModal = () => {
  showReverseCalcModal.value = false
  reverseCalc.value = {
    targetGPA: '',
    remainingCredits: ''
  }
  reverseCalcResult.value = null
}

// 反向计算
const calculateReverse = () => {
  if (!canReverseCalc.value) {
    Taro.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  // 获取当前已选课程的数据
  const selectedCourses = courses.value.filter(course => course.selected !== false)
  
  let currentTotalCredits = 0
  let currentWeightedScore = 0
  
  selectedCourses.forEach(course => {
    const credits = parseFloat(course.credits) || 0
    const score = parseFloat(course.score) || 0
    
    if (credits > 0 && score >= 0 && score <= 100) {
      currentTotalCredits += credits
      currentWeightedScore += score * credits
    }
  })

  const targetScore = parseFloat(reverseCalc.value.targetGPA)
  const remainingCredits = parseFloat(reverseCalc.value.remainingCredits)
  const totalFutureCredits = currentTotalCredits + remainingCredits
  
  // 计算公式（百分制）：(当前加权分数 + 剩余学分 * 所需分数) / 总学分 = 目标分数
  // 所需分数 = (目标分数 * 总学分 - 当前加权分数) / 剩余学分
  const requiredScore = (targetScore * totalFutureCredits - currentWeightedScore) / remainingCredits
  
  if (requiredScore > 100) {
    Taro.showToast({
      title: '目标过高无法达到',
      icon: 'none',
      duration: 1500
    })
    return
  }
  
  if (requiredScore < 0) {
    Taro.showToast({
      title: '当前成绩已超过目标',
      icon: 'success',
      duration: 1500
    })
    reverseCalcResult.value = {
      requiredScore: '已达标',
      requiredGPA: '0'
    }
    return
  }
  
  reverseCalcResult.value = {
    requiredScore: Math.round(requiredScore),
    requiredGPA: requiredScore.toFixed(1)
  }
}

// 打开保研均分弹窗
const openGraduateModal = () => {
  showGraduateModal.value = true
}

// 关闭保研均分弹窗
const closeGraduateModal = () => {
  showGraduateModal.value = false
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

