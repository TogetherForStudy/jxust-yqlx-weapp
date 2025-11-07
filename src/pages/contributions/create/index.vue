<template>
  <view class="min-h-screen bg-gray-50">
    <view class="p-4">
      <!-- 投稿表单 -->
      <view class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <view class="mb-2">
          <text class="text-lg font-medium text-gray-800">创建投稿</text>
          <text class="text-sm text-gray-500 block mt-1">相信信息的力量，让更多人知道</text>
        </view>

        <view class="">
          <!-- 投稿标题 -->
          <view>
            <text class="text-sm font-medium text-gray-700 mb-2 block">
              投稿标题 <text class="text-red-500">*</text>
            </text>
            <input
              v-model="form.title"
              placeholder="请输入投稿标题（最多50字）"
              class="border-solid border-[1px] border-gray-400 rounded-lg p-2"
              :maxlength="50"
            />
            <view class="flex justify-between items-center mt-1">
              <text v-if="errors.title" class="text-red-500 text-xs">{{ errors.title }}</text>
              <text class="text-gray-400 text-xs ml-auto">{{ form.title.length }}/50</text>
            </view>
          </view>

          <!-- 投稿内容 -->
          <view>
            <text class="text-sm font-medium text-gray-700 mb-2 block">
              投稿内容 <text class="text-red-500">*</text>
            </text>
            <textarea
              v-model="form.content"
              placeholder="信息的详细介绍"
              class="border-solid border-[1px] border-gray-400 rounded-lg p-2 box-border w-full"
              :maxlength="1000"
            />
            <view class="flex justify-between items-center mt-1">
              <text v-if="errors.content" class="text-red-500 text-xs">{{ errors.content }}</text>
              <text class="text-gray-400 text-xs ml-auto">{{ form.content.length }}/1000</text>
            </view>
          </view>

          <!-- 分类选择 -->
          <view>
            <text class="text-sm font-medium text-gray-700 mb-2 block">
              选择分类 <text class="text-red-500">*</text>
            </text>
            <view class="flex flex-wrap gap-2 mb-2">
              <view
                v-for="category in categories"
                :key="category.id"
                class="flex items-center p-1 rounded-lg active:bg-gray-50 transition-colors"
                @tap="toggleCategory(category.id)"
              >
                <view class="flex items-center">
                  <view
                    class="w-5 h-5 border-2 rounded mr-3 flex items-center justify-center transition-colors"
                    :class="selectedCategories.includes(category.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'"
                  >
                    <text
                      v-if="selectedCategories.includes(category.id)"
                      class="i-lucide-check text-white w-3 h-3"
                    ></text>
                  </view>
                  <text class="text-gray-700">{{ category.name }}</text>
                </view>
              </view>
            </view>
            <text v-if="errors.categories" class="text-red-500 text-xs mt-1 block">{{ errors.categories }}</text>
          </view>
        </view>
      </view>



      <!-- 操作按钮 -->
      <view class="space-y-3">
        <!-- 提交投稿 -->
        <view
          class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 active:scale-95 transition-transform"
          :class="{ 'opacity-50': isSubmitting }"
          @tap="submitContribution"
        >
          <view class="flex items-center justify-center">
            <text class="i-lucide-send text-white w-5 h-5 mr-2"></text>
            <text class="text-white font-medium">{{ isSubmitting ? '提交中...' : '提交投稿' }}</text>
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

const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// 表单数据
const form = ref({
  title: '',
  content: '',
})

const selectedCategories = ref([])
const isSubmitting = ref(false)
const errors = ref({})

// 计算属性
const categories = computed(() => notificationStore.categories)

// 页面生命周期
onMounted(async () => {
  // 检查登录状态
  if (!authStore.requireAuth()) {
    return
  }

  await initPage()
})

// 初始化页面
const initPage = async () => {
  try {
    // 获取分类列表
    await notificationStore.fetchCategories()

  } catch (error) {
    console.error('初始化页面失败:', error)
    Taro.showToast({
      title: '加载失败',
      icon: 'error'
    })
  }
}

// 分类选择
const toggleCategory = (categoryId) => {
  const index = selectedCategories.value.indexOf(categoryId)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(categoryId)
  }

  // 清除分类错误
  if (errors.value.categories) {
    delete errors.value.categories
  }
}

// 表单验证
const validateForm = () => {
  const newErrors = {}

  if (!form.value.title.trim()) {
    newErrors.title = '请输入投稿标题'
  } else if (form.value.title.length > 50) {
    newErrors.title = '标题不能超过50字'
  }

  if (!form.value.content.trim()) {
    newErrors.content = '请输入投稿内容'
  } else if (form.value.content.length > 1000) {
    newErrors.content = '内容不能超过1000字'
  }

  if (selectedCategories.value.length === 0) {
    newErrors.categories = '请至少选择一个分类'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// 提交投稿
const submitContribution = async () => {
  if (isSubmitting.value) return

  if (!validateForm()) {
    Taro.showToast({
      title: '请检查表单信息',
      icon: 'error'
    })
    return
  }

  isSubmitting.value = true

  try {
    const data = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      categories: selectedCategories.value
    }

    await notificationStore.createContribution(data)

    Taro.showToast({
      title: '投稿成功',
      icon: 'success'
    })

    // 延迟跳转
    setTimeout(() => {
      Taro.navigateBack()
    }, 1000)

  } catch (error) {
    console.error('提交投稿失败:', error)
    Taro.showToast({
      title: error.message || '提交失败',
      icon: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

</script>

<style>
.active\:scale-95:active {
  transform: scale(0.95);
}

.focus\:border-blue-500:focus {
  border-color: #3b82f6;
}

.focus\:ring-1:focus {
  box-shadow: 0 0 0 1px #3b82f6;
}
</style>
