<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <!-- 积分概览卡片 -->
    <view class="bg-gradient-to-br from-blue-500 to-indigo-600 pt-6 pb-6 px-6 flex-shrink-0">
      <view class="flex items-center justify-between">
        <!-- 左侧：积分和排名 -->
        <view class="flex-1">
          <text class="text-white/80 text-sm block mb-1">当前积分</text>
          <view class="flex items-baseline space-x-3 mb-2">
            <text class="text-white text-3xl font-bold">{{ pointsStats.points ?? 0 }}</text>
            <view v-if="pointsStats.rank" class="flex items-center space-x-1">
              <text class="text-white/80 text-xs">排名</text>
              <text class="text-white text-base font-semibold">#{{ pointsStats.rank }}</text>
            </view>
          </view>
        </view>
        <!-- 右侧：统计按钮 -->
        <view class="flex items-center space-x-2">
          <view
            class="px-4 py-2 bg-white/20 rounded-full active:bg-white/30"
            @tap="showSourceStatsModal"
          >
            <text class="text-white text-sm">统计</text>
          </view>
          <view
            class="px-4 py-2 bg-white/20 rounded-full active:bg-white/30"
            @tap="handleRedeem"
          >
            <text class="text-white text-sm">兑换</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 积分流水 -->
    <view class="px-4 -mt-4 mb-4 flex-1 h-[1px] flex flex-col">
      <view class="bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <!-- 标题栏 -->
        <view class="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <text class="text-gray-800 font-medium">积分流水</text>
          <view class="flex space-x-2">
            <view
              class="px-3 py-1 rounded-full text-xs"
              :class="typeFilter === null ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'"
              @tap="setTypeFilter(null)"
            >
              全部
            </view>
            <view
              class="px-3 py-1 rounded-full text-xs"
              :class="typeFilter === 1 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'"
              @tap="setTypeFilter(1)"
            >
              获得
            </view>
            <view
              class="px-3 py-1 rounded-full text-xs"
              :class="typeFilter === 2 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'"
              @tap="setTypeFilter(2)"
            >
              消费
            </view>
          </view>
        </view>

        <!-- 流水列表 -->
        <scroll-view
          :scroll-y="true"
          class="flex-1 h-[0px]"
          @scrolltolower="loadMore"
          :lower-threshold="100"
        >
          <!-- 加载状态 -->
          <view v-if="isLoading && transactions.length === 0" class="py-8">
            <view class="flex items-center justify-center">
              <text class="text-gray-500 text-sm">加载中...</text>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-else-if="transactions.length === 0" class="py-8">
            <view class="flex flex-col items-center justify-center">
              <text class="i-lucide-coins text-gray-300 text-4xl mb-2"></text>
              <text class="text-gray-500 text-sm">暂无积分记录</text>
            </view>
          </view>

          <!-- 流水列表 -->
          <view v-else>
            <view
              v-for="transaction in transactions"
              :key="transaction.id"
              class="px-4 py-3 border-b border-gray-50 flex items-center justify-between gap-4"
            >
              <view class="flex-1">
                <text class="text-gray-800 text-sm block">{{ transaction.description }}</text>
                <text class="text-gray-400 text-xs">{{ formatDate(transaction.created_at) }}</text>
              </view>
              <view>
                <text
                  class="font-medium"
                  :class="transaction.type === 1 ? 'text-green-500' : 'text-red-500'"
                >
                  {{ String(transaction.points).startsWith('-') ? '' : transaction.type === 1 ? '+' : '-' }}{{ transaction.points }}
                </text>
              </view>
            </view>

            <!-- 加载更多指示器 -->
            <view class="text-center py-4">
              <text v-if="isLoading" class="text-gray-500 text-sm">加载中...</text>
              <text v-else-if="!hasMore" class="text-gray-400 text-sm">已加载全部</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 积分来源统计弹窗 -->
    <view
      v-if="showSourceStats"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @tap="showSourceStats = false"
    >
      <view @tap.stop="" class="bg-white rounded-2xl mx-4 w-full max-w-md max-h-[80vh] flex flex-col">
        <view class="px-4 py-2 flex-shrink-0 border-b border-gray-100">
          <view class="flex items-center justify-between">
            <text class="text-lg font-semibold text-gray-800">积分来源统计</text>
            <view @tap="showSourceStats = false" class="p-1">
              <text class="i-lucide-x text-gray-400"></text>
            </view>
          </view>
        </view>

        <scroll-view :scroll-y="true" class="flex-1">
          <view class="p-4">
            <view v-if="!pointsStats.source_stats || Object.keys(pointsStats.source_stats).length === 0" class="py-8 text-center">
              <text class="text-gray-400 text-sm">暂无统计数据</text>
            </view>
            <view v-else>
              <!-- 获得积分部分 -->
              <view class="mb-4">
                <text class="text-base font-semibold text-gray-800 block mb-3">获得积分</text>
                <view class="space-y-2">
                  <view
                    v-for="(stats, source) in earnedSources"
                    :key="source"
                    class="bg-green-50 rounded-lg p-3 border border-green-200"
                  >
                    <view class="flex items-center justify-between gap-4">
                      <text class="text-sm font-medium text-gray-800">{{ getSourceName(source) }}</text>
                      <text class="text-sm font-semibold text-green-600">+{{ stats.earned || 0 }}</text>
                    </view>
                  </view>
                  <view v-if="Object.keys(earnedSources).length === 0" class="py-4 text-center">
                    <text class="text-gray-400 text-sm">暂无获得记录</text>
                  </view>
                </view>
              </view>

              <!-- 消耗积分部分 -->
              <view>
                <text class="text-base font-semibold text-gray-800 block mb-3">消耗积分</text>
                <view class="space-y-2">
                  <view
                    v-for="(stats, source) in spentSources"
                    :key="source"
                    class="bg-red-50 rounded-lg p-3 border border-red-200"
                  >
                    <view class="flex items-center justify-between">
                      <text class="text-sm font-medium text-gray-800">{{ getSourceName(source) }}</text>
                      <text class="text-sm font-semibold text-red-600">-{{ Math.abs(stats.spent || 0) }}</text>
                    </view>
                  </view>
                  <view v-if="Object.keys(spentSources).length === 0" class="py-4 text-center">
                    <text class="text-gray-400 text-sm">暂无消耗记录</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { pointsAPI } from '../../api/index'
import { useAuthStore } from '../../stores/auth'
import { formatDateTime } from '../../utils/time'

const authStore = useAuthStore()

// 响应式数据
const pointsStats = ref({
  points: 0,
  rank: null,
  source_stats: {}
})
const transactions = ref([])
const isLoading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const typeFilter = ref(null)
const showSourceStats = ref(false)

// 计算属性：获得积分的来源
const earnedSources = computed(() => {
  const stats = pointsStats.value.source_stats || {}
  const earned = {}
  Object.keys(stats).forEach(source => {
    if (stats[source].earned && stats[source].earned > 0) {
      earned[source] = stats[source]
    }
  })
  return earned
})

// 计算属性：消耗积分的来源
const spentSources = computed(() => {
  const stats = pointsStats.value.source_stats || {}
  const spent = {}
  Object.keys(stats).forEach(source => {
    if (stats[source].spent && stats[source].spent < 0) {
      spent[source] = stats[source]
    }
  })
  return spent
})

// 页面生命周期
onMounted(async () => {
  if (!authStore.requireAuth()) {
    return
  }
  await initPage()
})

// 初始化页面数据
const initPage = async () => {
  isLoading.value = true
  try {
    // 并行获取积分统计和交易记录
    const [statsRes] = await Promise.all([
      pointsAPI.getStats(),
      fetchTransactions(1)
    ])
    pointsStats.value = statsRes
  } catch (error) {
    console.error('初始化页面失败:', error)
    Taro.showToast({
      title: '加载失败',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// 获取交易记录
const fetchTransactions = async (page) => {
  const params = { page, size: 20 }
  if (typeFilter.value !== null) {
    params.type = typeFilter.value
  }

  const res = await pointsAPI.getTransactions(params)

  if (page === 1) {
    transactions.value = res.data || []
  } else {
    transactions.value = [...transactions.value, ...(res.data || [])]
  }

  currentPage.value = page
  hasMore.value = transactions.value.length < res.total
}

// 筛选类型
const setTypeFilter = async (type) => {
  if (typeFilter.value === type) return

  typeFilter.value = type
  isLoading.value = true
  try {
    await fetchTransactions(1)
  } catch (error) {
    console.error('筛选失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 加载更多
const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  try {
    await fetchTransactions(currentPage.value + 1)
  } catch (error) {
    console.error('加载更多失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return formatDateTime(new Date(dateString), 'yyyy-MM-dd HH:mm')
}

// 显示来源统计弹窗
const showSourceStatsModal = () => {
  showSourceStats.value = true
}

// 获取来源名称
const getSourceName = (source) => {
  const sourceNames = {
    'daily_login': '每日登录',
    'review': '发布评价',
    'contribution': '投稿信息',
    'redeem': '兑换奖品',
    'admin_grant': '管理员赋予'
  }
  return sourceNames[source] || source
}

// 处理兑换点击
const handleRedeem = () => {
  Taro.showToast({
    title: '敬请期待',
    icon: 'none',
    duration: 2000
  })
}
</script>

<style scoped>
</style>
