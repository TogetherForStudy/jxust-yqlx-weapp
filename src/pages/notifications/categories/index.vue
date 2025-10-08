<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 分类列表 -->
    <view class="p-4">
      <!-- 加载状态 -->
      <view v-if="notificationStore.isLoading && categories.length === 0">
        <view class="bg-white rounded-xl shadow-sm border border-gray-100">
          <view class="flex items-center justify-center">
            <text class="text-gray-500 text-sm">加载中...</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="categories.length === 0">
        <view class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <view class="flex flex-col items-center justify-center">
            <text class="i-lucide-folder-x text-gray-300 text-4xl mb-2"></text>
            <text class="text-gray-500 text-sm mb-4">还没有分类</text>
            <view
              class="px-4 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
              @tap="showCreateModal"
            >
              <text class="text-sm">创建分类</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 分类卡片列表 -->
      <view v-else class="space-y-3">
        <view
          v-for="category in sortedCategories"
          :key="category.id"
          class="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <!-- 分类头部 -->
          <view class="flex flex-col justify-between items-start">
              <view class="flex items-center mb-1">
                <text class="text-gray-800 font-medium text-lg mr-2">
                  {{ category.name }}
                </text>
                <!-- 状态标识 -->
                <view
                  class="px-2 py-1 rounded-full text-xs"
                  :class="category.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'"
                >
                  {{ category.is_active ? '启用' : '禁用' }}
                </view>
              </view>
              <view class="flex items-center space-x-3 text-sm text-gray-500">
                <view class="flex items-center">
                  <text class="i-lucide-arrow-up-down w-3 h-3 mr-1"></text>
                  <text>排序: {{ category.sort }}</text>
                </view>
              </view>
          </view>

          <!-- 操作按钮 -->
          <view class="flex justify-end space-x-2">
            <!-- 编辑 -->
            <view
              class="px-3 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
              @tap="editCategory(category)"
            >
              <text class="i-lucide-edit w-4 h-4"></text>
            </view>

            <!-- 删除 -->
            <view
              class="px-3 py-2 bg-red-500 text-white rounded-lg active:bg-red-600 transition-colors"
              @tap="deleteCategory(category.id)"
            >
              <text class="i-lucide-trash w-4 h-4"></text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建/编辑分类弹窗 -->
    <view
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
      @tap="showModal = false"
    >
      <view
        class="bg-white rounded-t-2xl w-full max-h-[70vh] overflow-y-auto"
        @tap.stop
      >
        <view class="px-4 py-2 border-b border-gray-100">
          <view class="flex justify-between items-center">
            <text class="font-medium text-gray-800">
              {{ isEditing ? '编辑分类' : '创建分类' }}
            </text>
            <text
              class="i-lucide-x text-gray-500 w-6 h-6"
              @tap="closeModal"
            ></text>
          </view>
        </view>

        <view class="p-4">
          <!-- 分类名称 -->
          <view>
            <text class="text-sm font-medium text-gray-700 mb-2 block">
              分类名称 <text class="text-red-500">*</text>
            </text>
            <input
              v-model="categoryForm.name"
              placeholder="请输入分类名称（最多20字）"
              class="border-solid border-[1px] border-gray-400 rounded-lg p-2"
              :maxlength="20"
            />
            <view class="flex justify-between items-center mt-1">
              <text v-if="errors.name" class="text-red-500 text-xs">{{ errors.name }}</text>
              <text class="text-gray-400 text-xs ml-auto">{{ categoryForm.name.length }}/20</text>
            </view>
          </view>

          <!-- 排序值 -->
          <view>
            <text class="text-sm font-medium text-gray-700 mb-2 block">排序值</text>
            <input
              v-model.number="categoryForm.sort"
              type="number"
              placeholder="请输入排序值（数字越小越靠前）"
              class="border-solid border-[1px] border-gray-400 rounded-lg p-2"
              :min="0"
              :max="9999"
            />
            <text class="text-gray-500 text-xs mt-1 block">排序值越小，在列表中显示越靠前</text>
          </view>

          <!-- 启用状态 -->
          <view>
            <text class="text-sm font-medium text-gray-700 mb-2 block">状态设置</text>
            <view class="grid grid-cols-2 gap-2">
              <view
                class="flex items-center p-3 border border-gray-200 rounded-lg"
                :class="categoryForm.is_active ? 'border-green-500 bg-green-50' : ''"
                @tap="categoryForm.is_active = true"
              >
                <view
                  class="w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center transition-colors"
                  :class="categoryForm.is_active
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'"
                >
                  <view
                    v-if="categoryForm.is_active"
                    class="w-2 h-2 bg-white rounded-full"
                  ></view>
                </view>
                <view>
                  <text class="text-gray-700 block">启用</text>
                  <text class="text-gray-500 text-xs">分类将在前端显示</text>
                </view>
              </view>

              <view
                class="flex items-center p-3 border border-gray-200 rounded-lg"
                :class="!categoryForm.is_active ? 'border-gray-500 bg-gray-50' : ''"
                @tap="categoryForm.is_active = false"
              >
                <view
                  class="w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center transition-colors"
                  :class="!categoryForm.is_active
                    ? 'bg-gray-500 border-gray-500'
                    : 'border-gray-300'"
                >
                  <view
                    v-if="!categoryForm.is_active"
                    class="w-2 h-2 bg-white rounded-full"
                  ></view>
                </view>
                <view>
                  <text class="text-gray-700 block">禁用</text>
                  <text class="text-gray-500 text-xs">分类将不在前端显示</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="flex space-x-3 pt-4">
            <view
              class="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg active:bg-gray-200 transition-colors"
              @tap="closeModal"
            >
              <text class="text-center text-sm block">取消</text>
            </view>
            <view
              class="flex-1 py-3 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors"
              :class="{ 'opacity-50': isSubmitting }"
              @tap="submitCategory"
            >
              <text class="text-center text-sm block">
                {{ isSubmitting ? '提交中...' : (isEditing ? '保存修改' : '创建分类') }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建分类悬浮按钮 -->
    <view
      class="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-10"
      @tap="showCreateModal"
    >
      <text class="i-lucide-plus text-white w-6 h-6"></text>
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

// 响应式数据
const showModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const currentCategory = ref(null)
const errors = ref({})

const categoryForm = ref({
  name: '',
  sort: 0,
  is_active: true
})

// 计算属性
const categories = computed(() => notificationStore.categories)
const isAdmin = computed(() => authStore.isAdmin)

const activeCategories = computed(() => {
  return categories.value.filter(c => c.is_active)
})

const inactiveCategories = computed(() => {
  return categories.value.filter(c => !c.is_active)
})

const sortedCategories = computed(() => {
  return [...categories.value].sort((a, b) => a.sort - b.sort)
})

// 页面生命周期
onMounted(async () => {
  // 检查权限
  if (!authStore.requireAuth()) {
    return
  }

  if (!isAdmin.value) {
    Taro.showToast({
      title: '权限不足',
      icon: 'none'
    })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
    return
  }

  await initPage()
})

// 初始化页面数据
const initPage = async () => {
  try {
    await notificationStore.fetchCategories()
  } catch (error) {
    console.error('初始化页面失败:', error)
    Taro.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

// 刷新数据
const refreshData = async () => {
  try {
    await notificationStore.fetchCategories()
    Taro.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('刷新数据失败:', error)
    Taro.showToast({
      title: '刷新失败',
      icon: 'none'
    })
  }
}

// 显示创建弹窗
const showCreateModal = () => {
  isEditing.value = false
  currentCategory.value = null
  categoryForm.value = {
    name: '',
    sort: Math.max(...categories.value.map(c => c.sort), 0) + 1,
    is_active: true
  }
  errors.value = {}
  showModal.value = true
}

// 编辑分类
const editCategory = (category) => {
  isEditing.value = true
  currentCategory.value = category
  categoryForm.value = {
    name: category.name,
    sort: category.sort,
    is_active: category.is_active
  }
  errors.value = {}
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  currentCategory.value = null
  errors.value = {}
}

// 表单验证
const validateForm = () => {
  const newErrors = {}

  if (!categoryForm.value.name.trim()) {
    newErrors.name = '请输入分类名称'
  } else if (categoryForm.value.name.length > 20) {
    newErrors.name = '分类名称不能超过20字'
  } else {
    // 检查名称是否重复
    const existing = categories.value.find(c =>
      c.name === categoryForm.value.name.trim() &&
      (!isEditing.value || c.id !== currentCategory.value.id)
    )
    if (existing) {
      newErrors.name = '分类名称已存在'
    }
  }

  if (categoryForm.value.sort < 0 || categoryForm.value.sort > 9999) {
    newErrors.sort = '排序值应在0-9999之间'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// 提交分类
const submitCategory = async () => {
  if (isSubmitting.value) return

  if (!validateForm()) {
    Taro.showToast({
      title: '请检查表单信息',
      icon: 'none'
    })
    return
  }

  isSubmitting.value = true

  try {
    const data = {
      name: categoryForm.value.name.trim(),
      sort: categoryForm.value.sort,
      is_active: categoryForm.value.is_active
    }

    if (isEditing.value) {
      // 更新分类
      await notificationStore.updateCategory(currentCategory.value.id, data)
      Taro.showToast({
        title: '修改成功',
        icon: 'success'
      })
    } else {
      // 创建分类
      await notificationStore.createCategory(data)
      Taro.showToast({
        title: '创建成功',
        icon: 'success'
      })
    }

    closeModal()
    await refreshData()

  } catch (error) {
    console.error('提交分类失败:', error)
    Taro.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    })
  } finally {
    isSubmitting.value = false
  }
}

// 切换分类状态
const toggleCategoryStatus = async (category) => {
  try {
    const data = {
      name: category.name,
      sort: category.sort,
      is_active: !category.is_active
    }

    await notificationStore.updateCategory(category.id, data)

    Taro.showToast({
      title: data.is_active ? '已启用' : '已禁用',
      icon: 'success'
    })

    await refreshData()
  } catch (error) {
    console.error('切换状态失败:', error)
    Taro.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

// 删除分类
const deleteCategory = async (id) => {
  const result = await Taro.showModal({
    title: '确认删除',
    content: '确定要删除这个分类吗？此操作不可恢复。\n\n注意：删除前请确保没有信息使用该分类。'
  })

  if (result.confirm) {
    try {
      // 注意：API中没有删除分类的接口，这里需要根据实际API调整
      // await notificationStore.deleteCategory(id)

      Taro.showToast({
        title: '删除功能暂未开放',
        icon: 'none'
      })

      // Taro.showToast({
      //   title: '删除成功',
      //   icon: 'success'
      // })

      // await refreshData()
    } catch (error) {
      console.error('删除分类失败:', error)
      Taro.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
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
