<template>
  <view class="min-h-screen bg-gray-50 p-4">
    <!-- 搜索框 -->
    <view class="bg-white rounded-lg shadow-sm mb-4">
      <view class="flex items-center gap-2">
        <view class="flex-1">
          <input
            v-model="searchKeyword"
            placeholder="请输入班级名称进行搜索"
            class="w-full px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            @input="handleSearch"
          />
        </view>
        <view
          @tap="search"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          搜索
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-if="searchResults.length > 0" class="bg-white rounded-lg shadow-sm">
      <view class="p-4 border-b border-gray-100">
        <view class="text-sm font-medium text-gray-700">搜索结果</view>
      </view>

      <view class="divide-y divide-gray-100">
        <view
          v-for="classItem in searchResults"
          :key="classItem.class_id"
          class="p-4 flex items-center justify-between"
          @tap="selectClass(classItem)"
        >
          <view class="flex-1">
            <view class="font-medium text-gray-900">{{ classItem.class_id }}</view>
            <view v-if="classItem.semester" class="text-sm text-gray-500 mt-1">{{ classItem.semester }}</view>
          </view>
          <view class="text-blue-500 text-sm">选择</view>
        </view>
      </view>

      <!-- 分页控制 -->
      <view v-if="totalPages > 1" class="p-4 border-t border-gray-100 flex justify-center">
        <view class="flex items-center space-x-2">
          <view
            @tap="previousPage"
            :disabled="currentPage <= 1"
            class="px-3 py-1 text-sm bg-blue-400 text-white rounded"
            :class="{ 'opacity-50':currentPage <= 1 }"
          >
            上一页
          </view>
          <view class="text-sm text-gray-500 px-2">
            {{ currentPage }} / {{ totalPages }}
          </view>
          <view
            @tap="nextPage"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1 text-sm bg-blue-400 text-white rounded"
            :class="{ 'opacity-50':currentPage >= totalPages }"
          >
            下一页
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="hasSearched && searchResults.length === 0 && !isLoading" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <view class="i-lucide-search text-4xl mb-4"></view>
      <view class="text-gray-500">没有找到相关班级</view>
      <view class="text-sm text-gray-400 mt-2">请检查班级名称是否正确</view>
    </view>

    <!-- 搜索提示 -->
    <view v-if="!hasSearched && !isLoading" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <view class="text-gray-500">仅有 2 次绑定机会</view>
      <view class="text-gray-500">请输入班级名称进行搜索</view>
      <view class="text-sm text-gray-400 mt-2">如：25软件1班</view>
    </view>

    <!-- 确认绑定弹窗 -->
    <view v-if="selectedClass" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <view class="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
        <view class="text-lg font-semibold text-gray-900 mb-2 text-center">确认绑定班级</view>
        <view class="text-gray-600 mb-4 text-center">
          班级：{{ selectedClass.class_id }}
        </view>

        <view class="flex space-x-3">
          <view
            @tap="cancelSelect"
            class="flex-1 px-4 py-2 bg-gray-300 text-white rounded-lg font-medium text-center"
          >
            取消
          </view>
          <view
            @tap="confirmBind"
            :disabled="isBinding"
            class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-center"
          >
            {{ isBinding ? '绑定中...' : '确认绑定' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import { useScheduleStore } from '../../../stores/schedule'
import { useAuthStore } from '../../../stores/auth'

defineOptions({
  name: 'ScheduleBindPage'
})

const scheduleStore = useScheduleStore()
const authStore = useAuthStore()
// 搜索相关
const searchKeyword = ref('')
const searchResults = ref([])
const hasSearched = ref(false)
const isLoading = ref(false)

// 分页相关
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

// 选择班级相关
const selectedClass = ref(null)
const isBinding = ref(false)

// 防抖搜索
let searchTimer = null
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(() => {
    if (searchKeyword.value.trim()) {
      search()
    }
  }, 500)
}

// 搜索班级
const search = async () => {
  if (!searchKeyword.value.trim()) {
    Taro.showToast({
      title: '请输入班级名称',
      icon: 'error'
    })
    return
  }

  try {
    isLoading.value = true
    currentPage.value = 1

    const result = await scheduleStore.searchClass(searchKeyword.value.trim(), currentPage.value, pageSize)

    searchResults.value = result.classes || []
    totalPages.value = Math.ceil(result.total / pageSize)
    hasSearched.value = true

  } catch (error) {
    console.error('搜索班级失败:', error)
    Taro.showToast({
      title: '搜索失败',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// 上一页
const previousPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--
    await loadPage()
  }
}

// 下一页
const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    await loadPage()
  }
}

// 加载指定页
const loadPage = async () => {
  try {
    isLoading.value = true

    const result = await scheduleStore.searchClass(searchKeyword.value.trim(), currentPage.value, pageSize)

    searchResults.value = result.classes || []

  } catch (error) {
    console.error('加载页面失败:', error)
    Taro.showToast({
      title: '加载失败，请重试',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// 选择班级
const selectClass = (classItem) => {
  selectedClass.value = classItem
}

// 取消选择
const cancelSelect = () => {
  selectedClass.value = null
}

// 确认绑定
const confirmBind = async () => {
  if (!selectedClass.value) return

  try {
    isBinding.value = true

    await scheduleStore.updateClass(selectedClass.value.class_id)
    await authStore.updateUserInfo({ class_id: selectedClass.value.class_id })
    Taro.showToast({
      title: '绑定成功',
      icon: 'success'
    })

    // 延迟返回上一页
    setTimeout(() => {
      // 传递消息通知课表页刷新
      Taro.eventCenter.trigger('reloadSchedule')
      Taro.navigateBack()
    }, 1000)

  } catch (error) {
    console.error('绑定班级失败:', error)
    Taro.showToast({
      title: '请联系客服',
      icon: 'error'
    })
  } finally {
    isBinding.value = false
    selectedClass.value = null
  }
}
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>
