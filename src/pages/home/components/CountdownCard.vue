<template>
  <!-- 倒数日卡片 -->
  <view class="px-4">
    <view class="flex justify-between items-center mb-2">
      <text class="text-gray-800 font-medium">倒数日</text>
      <view
        v-if="authStore.isLoggedIn"
        @tap="showAddModal = true"
        class="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs"
      >
        <text class="i-lucide-plus w-3 h-3 mr-1"></text>
        添加
      </view>
    </view>

    <!-- 倒数日内容 -->
    <view class="bg-white rounded-xl shadow-sm border border-gray-100">
      <!-- 加载状态 -->
      <view v-if="isLoading" class="flex items-center justify-center py-8">
        <text class="text-gray-500 text-sm">加载中...</text>
      </view>

      <!-- 未登录状态 -->
      <view v-else-if="!authStore.isLoggedIn" class="flex flex-col items-center justify-center py-8">
        <view class="i-lucide-clock text-2xl text-gray-400 mb-2"></view>
        <text class="text-gray-500 text-sm">登录使用倒数日</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="countdowns.length === 0" class="flex flex-col items-center justify-center py-8">
        <view class="i-lucide-calendar text-2xl text-gray-400 mb-2"></view>
        <text class="text-gray-700 font-medium">暂无倒数日</text>
        <text class="text-gray-500 text-sm">纪念 · 期待</text>
      </view>

      <!-- 倒数日网格布局 -->
      <view v-else class="p-3">
        <!-- 倒数日卡片网格 -->
        <view class="grid grid-cols-4 gap-2">
          <view
            v-for="countdown in displayCountdowns"
            :key="countdown.id"
            class="relative overflow-hidden rounded-2xl aspect-square"
            :class="getCardBackgroundClass(countdown.daysLeft)"
            @tap="showEditCountdownModal(countdown)"
          >
            <!-- 渐变遮罩 -->
            <view class="absolute inset-0" :class="getGradientClass(countdown.daysLeft)"></view>

            <!-- 卡片内容 -->
            <view class="relative h-full flex flex-col items-center justify-center p-2 text-white">
              <!-- 天数数字 -->
                <text class="text-xl font-black">
                  {{ Math.abs(countdown.daysLeft) }}
                </text>

              <!-- 单位文字 -->
                <text class="text-xs font-medium opacity-90">
                  {{ getDaysUnit(countdown.daysLeft) }}
                </text>

              <!-- 标题 -->
              <text class="text-xs font-semibold text-center opacity-95 line-clamp-2 px-1">
                {{ countdown.title }}
              </text>

              <!-- 状态指示器 -->
              <view
                v-if="countdown.daysLeft === 0"
                class="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full animate-pulse"
              ></view>
            </view>

            <!-- 卡片装饰元素 -->
            <view class="absolute -top-2 -right-2 w-8 h-8 bg-white opacity-10 rounded-full"></view>
            <view class="absolute -bottom-1 -left-1 w-4 h-4 bg-white opacity-10 rounded-full"></view>
          </view>
        </view>

        <!-- 查看更多按钮 -->
        <view v-if="countdowns.length > 8" class="text-center mt-4">
          <view
            @tap="showAllCountdowns = !showAllCountdowns"
            class="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium active:bg-gray-200 transition-colors"
          >
            <text class="mr-1">{{ showAllCountdowns ? '收起' : `查看全部 ${countdowns.length} 个` }}</text>
            <text :class="showAllCountdowns ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-4 h-4"></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加倒数日弹窗 -->
    <view
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
      @tap="hideAddModal"
    >
      <view
        @tap.stop=""
        class="bg-white rounded-t-2xl w-full max-h-4/5 flex flex-col"
      >
        <!-- 弹窗头部 -->
        <view class="flex justify-between items-center px-4 py-2 border-b border-gray-100">
          <text class="text-lg font-semibold">添加倒数日</text>
          <view @tap="hideAddModal" class="p-1">
            <text class="i-lucide-x w-5 h-5 text-gray-400"></text>
          </view>
        </view>

        <!-- 弹窗内容 -->
        <scroll-view scroll-y class="flex-1">
          <view class="p-4 space-y-4">
            <!-- 标题 -->
            <view class="flex flex-col gap-2">
              <text class="text-sm font-medium text-gray-700">标题</text>
              <input
                v-model="newCountdown.title"
                placeholder="请输入倒数日标题"
                class="border-solid border-[1px] border-gray-400 rounded-lg p-2"
              />
            </view>

            <!-- 描述 -->
            <view class="flex flex-col gap-2">
              <text class="text-sm font-medium text-gray-700">描述（可选）</text>
              <textarea
                v-model="newCountdown.description"
                placeholder="添加一些描述信息"
                class="border-solid border-[1px] border-gray-400 rounded-lg p-2 box-border w-full"
                maxlength="200"
              />
              <text class="text-xs text-gray-400">{{ newCountdown.description.length }}/200</text>
            </view>

            <!-- 目标日期 -->
            <view class="flex flex-col gap-2">
              <text class="text-sm font-medium text-gray-700">目标日期</text>
              <picker
                mode="date"
                :value="newCountdown.target_date"
                @change="onDateChange"
              >
                <view class="flex items-center justify-between border border-gray-300 rounded-lg p-3">
                  <text :class="newCountdown.target_date ? 'text-gray-900' : 'text-gray-400'">
                    {{ newCountdown.target_date || '请选择日期' }}
                  </text>
                  <text class="i-lucide-calendar w-4 h-4 text-gray-400"></text>
                </view>
              </picker>
            </view>
          </view>
        </scroll-view>

        <!-- 弹窗底部 -->
        <view class="p-4 border-t border-gray-100 flex space-x-3">
          <view
            @tap="hideAddModal"
            class="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-lg text-center font-medium"
          >
            取消
          </view>
          <view
            @tap="submitCountdown"
            :class="[
              'flex-1 py-3 px-4 rounded-lg text-center text-white font-medium',
              canSubmit ? 'bg-blue-500' : 'bg-gray-300',
            ]"
          >
            {{ submitting ? '提交中...' : '添加' }}
          </view>
        </view>
      </view>
    </view>

    <!-- 编辑倒数日弹窗 -->
    <view
      v-if="showEditModal && currentCountdown"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
      @tap="hideEditModal"
    >
      <view
        @tap.stop=""
        class="bg-white rounded-t-2xl w-full max-h-4/5 flex flex-col"
      >
        <!-- 弹窗头部 -->
        <view class="flex justify-between items-center px-4 py-2 border-b border-gray-100">
          <text class="text-lg font-semibold">编辑倒数日</text>
          <view class="flex space-x-2">
            <view @tap="deleteCountdown" class="p-1">
              <text class="i-lucide-trash-2 w-5 h-5 text-red-400"></text>
            </view>
            <view @tap="hideEditModal" class="p-1">
              <text class="i-lucide-x w-5 h-5 text-gray-400"></text>
            </view>
          </view>
        </view>

        <!-- 弹窗内容 -->
        <scroll-view scroll-y class="flex-1">
          <view class="p-4 space-y-4">
            <!-- 标题 -->
            <view class="flex flex-col gap-2">
              <text class="text-sm font-medium text-gray-700">标题</text>
              <input
                v-model="editCountdown.title"
                placeholder="请输入倒数日标题"
                class="border-solid border-[1px] border-gray-400 rounded-lg p-2"
              />
            </view>

            <!-- 描述 -->
            <view class="flex flex-col gap-2">
              <text class="text-sm font-medium text-gray-700">描述（可选）</text>
              <textarea
                v-model="editCountdown.description"
                placeholder="添加一些描述信息"
                class="border-solid border-[1px] border-gray-400 rounded-lg p-2 box-border w-full"
                maxlength="200"
              />
              <text class="text-xs text-gray-400">{{ editCountdown.description.length }}/200</text>
            </view>

            <!-- 目标日期 -->
            <view class="flex flex-col gap-2">
              <text class="text-sm font-medium text-gray-700">目标日期</text>
              <picker
                mode="date"
                :value="editCountdown.target_date"
                @change="onEditDateChange"
              >
                <view class="flex items-center justify-between border border-gray-300 rounded-lg p-3">
                  <text :class="editCountdown.target_date ? 'text-gray-900' : 'text-gray-400'">
                    {{ editCountdown.target_date || '请选择日期' }}
                  </text>
                  <text class="i-lucide-calendar w-4 h-4 text-gray-400"></text>
                </view>
              </picker>
            </view>
          </view>
        </scroll-view>

        <!-- 弹窗底部 -->
        <view class="p-4 border-t border-gray-100 flex space-x-3">
          <view
            @tap="hideEditModal"
            class="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-lg text-center font-medium"
          >
            取消
          </view>
          <view
            @tap="updateCountdown"
            :class="[
              'flex-1 py-3 px-4 rounded-lg text-center text-white font-medium',
              canEditSubmit ? 'bg-blue-500' : 'bg-gray-300',
            ]"
          >
            {{ submitting ? '更新中...' : '更新' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useAuthStore } from '../../../stores/auth'
import { useCountdownStore } from '../../../stores/countdown'

// 定义组件名称
defineOptions({
  name: 'CountdownCard'
})

const authStore = useAuthStore()
const countdownStore = useCountdownStore()

// 响应式数据
const showAddModal = ref(false)
const showEditModal = ref(false)
const showAllCountdowns = ref(false)
const submitting = ref(false)
const currentCountdown = ref(null)

// 新增倒数日数据
const newCountdown = ref({
  title: '',
  description: '',
  target_date: ''
})

// 编辑倒数日数据
const editCountdown = ref({
  title: '',
  description: '',
  target_date: ''
})

// 计算属性
const isLoading = computed(() => countdownStore.isLoading)
const countdowns = computed(() => {
  return countdownStore.countdowns
    .map(countdown => ({
      ...countdown,
      daysLeft: calculateDaysLeft(countdown.target_date)
    }))
    .sort((a, b) => {
      // 如果都是未过期的倒数日，按剩余天数从近到远排序
      if (a.daysLeft >= 0 && b.daysLeft >= 0) {
        return a.daysLeft - b.daysLeft
      }
      // 如果都是纪念日，按时间从近到远排序（最近过期的在前）
      if (a.daysLeft < 0 && b.daysLeft < 0) {
        return b.daysLeft - a.daysLeft
      }
      // 未过期的倒数日排在纪念日前面
      if (a.daysLeft >= 0 && b.daysLeft < 0) {
        return -1
      }
      if (a.daysLeft < 0 && b.daysLeft >= 0) {
        return 1
      }
      return 0
    })
})

const displayCountdowns = computed(() => {
  if (showAllCountdowns.value) {
    return countdowns.value
  }
  return countdowns.value.slice(0, 8)
})

const canSubmit = computed(() => {
  return newCountdown.value.title.trim() &&
         newCountdown.value.target_date &&
         !submitting.value
})

const canEditSubmit = computed(() => {
  return editCountdown.value.title.trim() &&
         editCountdown.value.target_date &&
         !submitting.value
})

// 计算剩余天数
const calculateDaysLeft = (targetDate) => {
  const target = new Date(targetDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffTime = target - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// 格式化目标日期
const formatTargetDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取卡片背景类
const getCardBackgroundClass = (daysLeft) => {
  return 'bg-gradient-to-br shadow-lg active:scale-95 transition-transform duration-200'
}

// 获取渐变背景类
const getGradientClass = (daysLeft) => {
  if (daysLeft < 0) {
    return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600' // 纪念日 - 金黄色渐变
  } else if (daysLeft === 0) {
    return 'bg-gradient-to-br from-red-400 via-red-500 to-red-600' // 今天 - 红色渐变
  } else if (daysLeft <= 3) {
    return 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600' // 3天内 - 橙色渐变
  } else if (daysLeft <= 7) {
    return 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600' // 一周内 - 琥珀色渐变
  } else if (daysLeft <= 30) {
    return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600' // 一月内 - 蓝色渐变
  } else {
    return 'bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600' // 更久远 - 靛蓝色渐变
  }
}

// 获取天数单位文字
const getDaysUnit = (daysLeft) => {
  if (daysLeft === 0) return '今天'
  if (daysLeft === 1) return '明天'
  if (daysLeft === -1) return '昨天'
  if (daysLeft > 0) return '天后'
  return '纪念日'
}

// 显示编辑弹窗
const showEditCountdownModal = (countdown) => {
  if (!authStore.requireAuth()) return

  currentCountdown.value = countdown
  editCountdown.value = {
    title: countdown.title,
    description: countdown.description || '',
    target_date: formatTargetDate(countdown.target_date)
  }
  showEditModal.value = true
}

// 隐藏添加弹窗
const hideAddModal = () => {
  showAddModal.value = false
  resetNewCountdown()
}

// 隐藏编辑弹窗
const hideEditModal = () => {
  showEditModal.value = false
  currentCountdown.value = null
  resetEditCountdown()
}

// 重置新增表单
const resetNewCountdown = () => {
  newCountdown.value = {
    title: '',
    description: '',
    target_date: ''
  }
}

// 重置编辑表单
const resetEditCountdown = () => {
  editCountdown.value = {
    title: '',
    description: '',
    target_date: ''
  }
}

// 日期选择处理
const onDateChange = (e) => {
  newCountdown.value.target_date = e.detail.value
}

// 编辑日期选择处理
const onEditDateChange = (e) => {
  editCountdown.value.target_date = e.detail.value
}

// 提交新增倒数日
const submitCountdown = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  try {
    await countdownStore.createCountdown(newCountdown.value)

    Taro.showToast({
      title: '添加成功',
      icon: 'success'
    })

    hideAddModal()
  } catch (error) {
    Taro.showToast({
      title: error.message || '添加失败',
      icon: 'error'
    })
  } finally {
    submitting.value = false
  }
}

// 更新倒数日
const updateCountdown = async () => {
  if (!canEditSubmit.value || !currentCountdown.value) return

  submitting.value = true
  try {
    await countdownStore.updateCountdown(currentCountdown.value.id, editCountdown.value)

    Taro.showToast({
      title: '更新成功',
      icon: 'success'
    })

    hideEditModal()
  } catch (error) {
    Taro.showToast({
      title: error.message || '更新失败',
      icon: 'error'
    })
  } finally {
    submitting.value = false
  }
}

// 删除倒数日
const deleteCountdown = async () => {
  if (!currentCountdown.value) return

  const res = await Taro.showModal({
    title: '删除倒数日',
    content: '确定要删除这个倒数日吗？',
    confirmText: '删除',
    confirmColor: '#ef4444'
  })

  if (res.confirm) {
    try {
      await countdownStore.deleteCountdown(currentCountdown.value.id)

      Taro.showToast({
        title: '删除成功',
        icon: 'success'
      })

      hideEditModal()
    } catch (error) {
      Taro.showToast({
        title: error.message || '删除失败',
        icon: 'error'
      })
    }
  }
}

// 加载数据
const loadData = async () => {
  // 未登录时不发起请求
  if (!authStore.isLoggedIn) {
    return
  }

  if (!isLoading.value) {
    try {
      await countdownStore.fetchCountdowns()
    } catch (error) {
      console.error('获取倒数日列表失败:', error)
    }
  }
}

// 页面显示时刷新数据
Taro.useDidShow(() => {
  if (countdownStore.countdowns.length === 0 && countdownStore.isFetchData == false) {
    loadData()
  }
})
</script>
