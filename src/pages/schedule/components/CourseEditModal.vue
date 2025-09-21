<template>
  <view class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @tap="handleOverlayClick">
    <view class="bg-white rounded-xl shadow-xl max-w-sm w-full max-h-[85vh] flex flex-col overflow-hidden" @tap.stop style="animation: modal-enter 0.3s ease-out;">
      <!-- 头部 -->
      <view class="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <view class="font-semibold text-gray-900">
          {{ isEditMode ? '编辑课程' : '添加课程' }}
        </view>
        <view @tap="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <view class="i-lucide-x-circle text-xl text-gray-500"></view>
        </view>
      </view>

      <!-- 内容 -->
      <view class="flex-1 p-4 overflow-y-auto">
        <view class="space-y-4">
          <!-- 时间显示（只读） -->
          <view class="flex flex-col">
            <view class="text-sm font-medium text-gray-500 mb-2">时间</view>
            <view class="text-base text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
              {{ timeInfo.dayName }} 第{{ timeInfo.period }}节 ({{ timeInfo.time }})
            </view>
          </view>

          <!-- 课程名称 -->
          <view class="flex flex-col">
            <view class="text-sm font-medium text-gray-500 mb-2">课程名称 *</view>
            <input
              v-model="formData.course"
              class="border-solid border-[1px] border-gray-300 rounded-lg px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
              placeholder="请输入课程名称"
              maxlength="50"
            />
          </view>

          <!-- 教室 -->
          <view class="flex flex-col">
            <view class="text-sm font-medium text-gray-500 mb-2">教室</view>
            <input
              v-model="formData.classroom"
              class="border-solid border-[1px] border-gray-300 rounded-lg px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
              placeholder="请输入教室"
              maxlength="30"
            />
          </view>

          <!-- 教师 -->
          <view class="flex flex-col">
            <view class="text-sm font-medium text-gray-500 mb-2">教师</view>
            <input
              v-model="formData.teacher"
              class="border-solid border-[1px] border-gray-300 rounded-lg px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
              placeholder="请输入教师姓名"
              maxlength="30"
            />
          </view>

          <!-- 上课周次 -->
          <view class="flex flex-col">
            <view class="text-sm font-medium text-gray-500 mb-2">上课周次 *</view>
            <input
              v-model="formData.week"
              class="border-solid border-[1px] rounded-lg px-3 py-2 text-base focus:outline-none transition-colors"
              :class="errors.week ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'"
              placeholder="例如：1-18周、1-8,10-18周"
              maxlength="50"
              @blur="validateWeek"
              @input="errors.week && validateWeek()"
            />
            <!-- 错误提示 -->
            <view v-if="errors.week" class="text-xs text-red-500 mt-1">
              {{ errors.week }}
            </view>
            <!-- 格式说明 -->
            <view v-else class="text-xs text-gray-400 mt-1">支持格式：1-18周、1-8,10-18周、1-18单周、2-18双周</view>
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="flex-shrink-0 px-4 pb-4 pt-2 border-t border-gray-100">
        <view class="flex gap-2">
          <view
            @tap="handleCancel"
            class="flex-1 bg-gray-100 text-gray-600 text-center py-3 rounded-lg active:bg-gray-200 transition-colors"
          >
            取消
          </view>
          <view
            @tap="handleSubmit"
            class="flex-1 bg-blue-100 text-blue-700 text-center py-3 rounded-lg active:bg-blue-200 transition-colors"
            :class="{ 'opacity-50': !canSubmit }"
          >
            {{ isEditMode ? '保存' : '添加' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScheduleStore } from '../../../stores/schedule'
import { useAuthStore } from '../../../stores/auth'

const props = defineProps({
  course: {
    type: Object,
    default: null
  },
  timeInfo: {
    type: Object,
    required: true
  },
  operationType: {
    type: String,
    default: 'add' // 'add', 'edit'
  },
  originalCourse: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])

const scheduleStore = useScheduleStore()
const authStore = useAuthStore()

// 是否编辑模式
const isEditMode = computed(() => props.operationType === 'edit')

// 表单数据（不包含班级，直接使用用户班级）
const formData = ref({
  course: '',
  classroom: '',
  teacher: '',
  week: ''
})

// 错误状态
const errors = ref({
  week: ''
})

// 周格式验证函数
const validateWeekFormat = (weekStr) => {
  if (!weekStr || !weekStr.trim()) {
    return '请输入上课周次'
  }

  const trimmed = weekStr.trim()

  // 支持的格式正则表达式
  const patterns = [
    /^(\d+)-(\d+)周$/,                           // 1-18周
    /^(\d+)-(\d+)[单双]周$/,                      // 1-18单周, 2-18双周
    /^(\d+)-(\d+),(\d+)-(\d+)周$/,              // 1-8,10-18周
    /^(\d+)-(\d+)[单双],(\d+)-(\d+)[单双]周$/,   // 1-8单,10-18双周
    /^(\d+)周$/,                                // 单独一周：5周
    /^(\d+)[单双]周$/,                           // 单独一周单双：5单周
    /^((\d+)-(\d+)([单双]?),?)+周$/              // 复杂组合格式
  ]

  // 简化验证：检查基本格式
  const basicPattern = /^[\d\-,单双周\s]+$/
  if (!basicPattern.test(trimmed)) {
    return '周次格式不正确，请参考示例格式'
  }

  // 检查是否包含"周"字
  if (!trimmed.includes('周')) {
    return '周次必须包含"周"字，如：1-18周'
  }

  // 检查是否包含数字
  const numbers = trimmed.match(/\d+/g)
  if (!numbers || numbers.length === 0) {
    return '周次必须包含数字，如：1-18周'
  }

  // 检查连字符格式
  if (trimmed.includes('-')) {
    // 先检查是否有孤立的连字符
    if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
      return '范围格式不完整，应为：起始周-结束周，如：1-18周'
    }

    // 检查是否有连续的连字符或其他异常情况
    if (trimmed.includes('--') || /\-[^\d]/.test(trimmed) || /[^\d]\-/.test(trimmed.replace(/[单双]/g, ''))) {
      return '范围格式不完整，应为：起始周-结束周，如：1-18周'
    }

    // 检查完整的范围格式
    const ranges = trimmed.match(/(\d+)-(\d+)/g)
    if (!ranges) {
      return '范围格式错误，应为：起始周-结束周，如：1-18周'
    }

    // 验证所有连字符都是完整的范围格式
    const dashCount = (trimmed.match(/-/g) || []).length
    const rangeMatches = ranges.join('').match(/-/g) || []
    if (dashCount !== rangeMatches.length) {
      return '范围格式不完整，应为：起始周-结束周，如：1-18周'
    }

    // 检查范围逻辑（起始周应小于结束周）
    for (const range of ranges) {
      const [start, end] = range.split('-').map(Number)
      if (start >= end) {
        return '起始周数应小于结束周数'
      }
    }
  }

  // 检查周数范围（1-20周是合理范围）
  for (const num of numbers) {
    const week = parseInt(num)
    if (week < 1 || week > 20) {
      return '周数应在1-20之间'
    }
  }

  return ''
}

// 验证周次格式
const validateWeek = () => {
  errors.value.week = validateWeekFormat(formData.value.week)
}

// 是否可以提交
const canSubmit = computed(() => {
  return formData.value.course.trim() &&
         formData.value.week.trim() &&
         !errors.value.week
})

// 初始化表单数据
const initFormData = () => {
  // 清理错误状态
  errors.value.week = ''

  if (isEditMode.value && props.course) {
    formData.value = {
      course: props.course.course || '',
      classroom: props.course.classroom || '',
      teacher: props.course.teacher || '',
      week: props.course.week || ''
    }
  } else {
    // 新增模式，设置默认值
    formData.value = {
      course: '',
      classroom: '',
      teacher: '',
      week: '1-18周'
    }
  }
}

// 处理遮罩点击
const handleOverlayClick = () => {
  emit('close')
}

// 处理取消
const handleCancel = () => {
  emit('close')
}

// 处理提交
const handleSubmit = () => {
  // 最终验证
  validateWeek()

  if (!canSubmit.value) return

  const courseData = {
    course: formData.value.course.trim(),
    classroom: formData.value.classroom.trim() || '',
    teacher: formData.value.teacher.trim() || '',
    class: authStore.userClass || '', // 自动使用用户班级
    week: formData.value.week.trim()
  }

  emit('submit', {
    courseData,
    operationType: props.operationType,
    originalCourse: props.originalCourse
  })
}

// 组件挂载时初始化表单
onMounted(() => {
  initFormData()
})
</script>

<style scoped>
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 输入框样式 */
input {
  -webkit-appearance: none;
  appearance: none;
}

input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
