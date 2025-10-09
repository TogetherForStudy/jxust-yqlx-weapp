<template>
  <view class="min-h-screen bg-gray-50">
    <view class="p-4">
      <!-- 创建通知表单 -->
      <view class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <view class="mb-2">
          <text class="text-lg font-medium text-gray-800">{{ isEditing ? '编辑信息' : '创建信息' }}</text>
          <text class="text-sm text-gray-500 block mt-1">
            {{ isEditing ? '修改信息内容' : '发布重要信息，让更多同学看到' }}
          </text>
        </view>

        <view class="">
          <!-- 通知标题 -->
          <view>
            <text class="text-sm font-medium text-gray-700 mb-2 block">
              信息标题 <text class="text-red-500">*</text>
            </text>
            <input
              v-model="form.title"
              placeholder="请输入信息标题（最多50字）"
              class="border-solid border-[1px] border-gray-400 rounded-lg p-2"
              :maxlength="50"
            />
            <view class="flex justify-between items-center mt-1">
              <text v-if="errors.title" class="text-red-500 text-xs">{{ errors.title }}</text>
              <text class="text-gray-400 text-xs ml-auto">{{ form.title.length }}/50</text>
            </view>
          </view>

          <!-- 通知内容 -->
          <view>
            <text class="text-sm font-medium text-gray-700 mb-2 block">
              信息内容 <text class="text-red-500">*</text>
            </text>
            <textarea
              v-model="form.content"
              placeholder="请详细描述信息内容，支持换行和简单格式..."
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
        <!-- 发布/创建通知 -->
        <view
          class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 active:scale-95 transition-transform"
          :class="{ 'opacity-50': isSubmitting }"
          @tap="submitNotification"
        >
          <view class="flex items-center justify-center">
            <text class="i-lucide-send text-white w-5 h-5 mr-2"></text>
            <text class="text-white font-medium">
              {{ isSubmitting ? '提交中...' : getSubmitButtonText() }}
            </text>
          </view>
        </view>

        <!-- 预览 -->
        <view
          class="bg-gray-100 rounded-xl p-4 active:scale-95 transition-transform"
          @tap="previewNotification"
        >
          <view class="flex items-center justify-center">
            <text class="i-lucide-eye text-gray-600 w-5 h-5 mr-2"></text>
            <text class="text-gray-600 font-medium">预览效果</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 预览弹窗 -->
    <view
      v-if="showPreview"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @tap="showPreview = false"
    >
      <view
        class="bg-white rounded-2xl w-full max-h-[80vh] overflow-y-auto"
        @tap.stop
      >
        <!-- 预览头部 -->
        <view class="p-4 border-b border-gray-100">
          <view class="flex justify-between items-center">
            <text class="text-lg font-medium text-gray-800">信息预览</text>
            <text
              class="i-lucide-x text-gray-500 w-6 h-6"
              @tap="showPreview = false"
            ></text>
          </view>
        </view>

        <!-- 预览内容 -->
        <view class="p-6">
          <!-- 标题 -->
          <text class="text-xl font-bold text-gray-800 leading-tight block mb-3">
            {{ form.title || '信息标题预览' }}
          </text>

          <!-- 元信息 -->
          <view class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
            <view class="flex items-center">
              <text class="i-lucide-user w-4 h-4 mr-1"></text>
              <text>{{ authStore.userInfo?.nickname || '发布者' }}</text>
            </view>
            <view class="flex items-center">
              <text class="i-lucide-calendar w-4 h-4 mr-1"></text>
              <text>{{ getCurrentDateTime() }}</text>
            </view>
          </view>

          <!-- 分类标签 -->
          <view v-if="selectedCategories.length > 0" class="flex flex-wrap gap-2 mb-4">
            <view
              v-for="categoryId in selectedCategories"
              :key="categoryId"
              class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
            >
              {{ getCategoryName(categoryId) }}
            </view>
          </view>

          <!-- 分割线 -->
          <view class="border-t border-gray-100 my-4"></view>

          <!-- 内容 -->
          <view class="text-gray-700 leading-relaxed text-base">
            <text class="whitespace-pre-wrap">{{ form.content || '信息内容预览...' }}</text>
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
const showPreview = ref(false)

// 编辑相关状态
const isEditing = ref(false)
const notificationId = ref('')
const originalNotification = ref(null)

// 计算属性
const categories = computed(() => notificationStore.categories)
const isAdmin = computed(() => authStore.isAdmin)
const isOperator = computed(() => authStore.userInfo?.role === 3)

// 页面生命周期
onMounted(async () => {
  // 检查权限
  if (!authStore.requireAuth()) {
    return
  }

  if (!isAdmin.value && !isOperator.value) {
    Taro.showToast({
      title: '权限不足',
      icon: 'error'
    })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
    return
  }

  // 检查是否是编辑模式
  const instance = Taro.getCurrentInstance()
  const id = instance.router?.params?.id
  if (id) {
    isEditing.value = true
    notificationId.value = id
  }

  await initPage()
})

// 初始化页面
const initPage = async () => {
  try {
    // 获取分类列表
    await notificationStore.fetchCategories()

    // 如果是编辑模式，加载通知详情
    if (isEditing.value && notificationId.value) {
      await loadNotificationForEdit()
    }
  } catch (error) {
    console.error('初始化页面失败:', error)
    Taro.showToast({
      title: '加载失败',
      icon: 'error'
    })
  }
}

// 加载要编辑的通知
const loadNotificationForEdit = async () => {
  try {
    // 管理员和运营使用admin接口，否则使用普通接口
    if (isAdmin.value || isOperator.value) {
      await notificationStore.fetchAdminNotificationDetail(notificationId.value)
      originalNotification.value = notificationStore.adminNotificationDetail
    } else {
      await notificationStore.fetchNotificationDetail(notificationId.value)
      originalNotification.value = notificationStore.notificationDetail
    }

    if (!originalNotification.value) {
      throw new Error('信息不存在')
    }

    // 填充表单数据
    form.value.title = originalNotification.value.title || ''
    form.value.content = originalNotification.value.content || ''
    selectedCategories.value = originalNotification.value.categories?.map(c => c.id) || []

  } catch (error) {
    console.error('加载信息详情失败:', error)
    Taro.showToast({
      title: error.message || '加载失败',
      icon: 'error'
    })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
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
    newErrors.title = '请输入信息标题'
  } else if (form.value.title.length > 50) {
    newErrors.title = '标题不能超过50字'
  }

  if (!form.value.content.trim()) {
    newErrors.content = '请输入信息内容'
  } else if (form.value.content.length > 1000) {
    newErrors.content = '内容不能超过1000字'
  }

  if (selectedCategories.value.length === 0) {
    newErrors.categories = '请至少选择一个分类'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// 提交通知
const submitNotification = async () => {
  if (isSubmitting.value) return

  if (!validateForm()) {
    Taro.showToast({
      title: '请检查表单',
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

    let result
    if (isEditing.value) {
      // 编辑模式 - 更新通知
      result = await notificationStore.updateNotification(notificationId.value, data)
      Taro.showToast({
        title: '修改成功',
        icon: 'success'
      })
    } else {
      // 创建模式 - 新建通知，所有用户都需提交审核
      result = await notificationStore.createNotification(data)
      Taro.showToast({
        title: '等待审核',
        icon: 'success'
      })
    }

    // 延迟跳转
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)

  } catch (error) {
    console.error(isEditing.value ? '更新信息失败:' : '提交通息失败:', error)
    Taro.showToast({
      title: error.message || (isEditing.value ? '更新失败' : '提交失败'),
      icon: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

// 预览通知
const previewNotification = () => {
  if (!form.value.title.trim() && !form.value.content.trim()) {
    Taro.showToast({
      title: '请填写信息内容',
      icon: 'error'
    })
    return
  }

  showPreview.value = true
}

// 工具函数
const getSubmitButtonText = () => {
  if (isEditing.value) {
    // 编辑模式
    return '保存修改'
  } else {
    // 创建新通知，所有用户都需要提交审核
    return '提交审核'
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未知分类'
}

const getCurrentDateTime = () => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style>
.whitespace-pre-wrap {
  white-space: pre-wrap;
}

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
