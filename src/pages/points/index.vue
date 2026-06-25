<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <page-meta
    :page-style="themeStore.pageStyle"
    :background-color="themeStore.nativeTheme.pageBg"
    :background-text-style="themeStore.nativeTheme.backgroundTextStyle"
  />
  <view class="h-screen bg-page flex flex-col text-fg" :class="[themeStore.rootClass]">
    <!-- 积分概览卡片 -->
    <view class="px-4 pt-4 pb-2 shrink-0">
      <view class="bg-surface rounded-2xl shadow-sm p-5">
        <view class="flex items-center justify-between">
          <!-- 左侧：积分和排名 -->
          <view class="flex-1 min-w-0">
            <view class="flex items-center gap-1.5 mb-2">
              <text class="i-lucide-coins w-4 h-4 text-brand"></text>
              <text class="text-fg-muted text-sm">当前积分</text>
            </view>
            <view class="flex items-baseline gap-3">
              <text class="text-fg text-4xl font-bold tabular-nums">{{ pointsStats.points ?? 0 }}</text>
              <view v-if="pointsStats.rank" class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-soft">
                <text class="text-brand text-xs">排名</text>
                <text class="text-brand text-sm font-semibold">#{{ pointsStats.rank }}</text>
              </view>
            </view>
          </view>
          <!-- 右侧：操作按钮 -->
          <view class="flex flex-col gap-2 shrink-0">
            <view
              class="px-4 py-1.5 border border-line rounded-full active:bg-surface-muted transition-colors flex items-center gap-1"
              @tap="showSourceStatsModal"
            >
              <text class="i-lucide-chart-pie w-3.5 h-3.5 text-fg-muted"></text>
              <text class="text-fg text-sm">统计</text>
            </view>
            <view
              class="px-4 py-1.5 bg-brand rounded-full active:opacity-90 transition-opacity flex items-center gap-1"
              @tap="handleRedeem"
            >
              <text class="i-lucide-gift w-3.5 h-3.5 text-white"></text>
              <text class="text-white text-sm">兑换</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 积分流水 -->
    <view class="px-4 mb-4 flex-1 h-[1px] flex flex-col">
      <view class="bg-surface rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <!-- 标题栏 -->
        <view class="px-4 py-3 border-b border-line flex items-center justify-between shrink-0">
          <text class="text-fg font-medium">积分流水</text>
          <view class="flex space-x-2">
            <view
              class="px-3 py-1 rounded-full text-xs"
              :class="typeFilter === null ? 'bg-brand text-white' : 'bg-surface-muted text-fg-muted'"
              @tap="setTypeFilter(null)"
            >
              全部
            </view>
            <view
              class="px-3 py-1 rounded-full text-xs"
              :class="typeFilter === 1 ? 'bg-success text-white' : 'bg-surface-muted text-fg-muted'"
              @tap="setTypeFilter(1)"
            >
              获得
            </view>
            <view
              class="px-3 py-1 rounded-full text-xs"
              :class="typeFilter === 2 ? 'bg-danger text-white' : 'bg-surface-muted text-fg-muted'"
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
              <text class="text-fg-muted text-sm">加载中...</text>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-else-if="transactions.length === 0" class="py-8">
            <view class="flex flex-col items-center justify-center">
              <text class="i-lucide-coins text-fg-subtle text-4xl mb-2"></text>
              <text class="text-fg-muted text-sm">暂无积分记录</text>
            </view>
          </view>

          <!-- 流水列表 -->
          <view v-else>
            <view
              v-for="transaction in transactions"
              :key="transaction.id"
              class="px-4 py-3 border-b border-line flex items-center justify-between gap-4"
            >
              <view class="flex-1">
                <text class="text-fg text-sm block">{{ transaction.description }}</text>
                <text class="text-fg-subtle text-xs">{{ formatDate(transaction.created_at) }}</text>
              </view>
              <view>
                <text
                  class="font-medium"
                  :class="transaction.type === 1 ? 'text-success' : 'text-danger'"
                >
                  {{ String(transaction.points).startsWith('-') ? '' : transaction.type === 1 ? '+' : '-' }}{{ transaction.points }}
                </text>
              </view>
            </view>

            <!-- 加载更多指示器 -->
            <view class="text-center py-4">
              <text v-if="isLoading" class="text-fg-muted text-sm">加载中...</text>
              <text v-else-if="!hasMore" class="text-fg-subtle text-sm">已加载全部</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 积分来源统计弹窗 -->
    <view
      v-if="showSourceStats"
      class="fixed inset-0 bg-overlay flex items-center justify-center z-50"
      @tap="showSourceStats = false"
    >
      <view @tap.stop="" class="bg-surface rounded-2xl mx-4 w-full max-w-md max-h-[80vh] flex flex-col">
        <view class="px-4 py-2 shrink-0 border-b border-line">
          <view class="flex items-center justify-between">
            <text class="text-lg font-semibold text-fg">积分来源统计</text>
            <view @tap="showSourceStats = false" class="p-1">
              <text class="i-lucide-x text-fg-subtle"></text>
            </view>
          </view>
        </view>

        <scroll-view :scroll-y="true" class="flex-1">
          <view class="p-4">
            <view v-if="!pointsStats.source_stats || Object.keys(pointsStats.source_stats).length === 0" class="py-8 text-center">
              <text class="text-fg-subtle text-sm">暂无统计数据</text>
            </view>
            <view v-else>
              <!-- 获得积分部分 -->
              <view class="mb-4">
                <text class="text-base font-semibold text-fg block mb-3">获得积分</text>
                <view class="space-y-2">
                  <view
                    v-for="(stats, source) in earnedSources"
                    :key="source"
                    class="bg-success-soft rounded-lg p-3 border border-success"
                  >
                    <view class="flex items-center justify-between gap-4">
                      <text class="text-sm font-medium text-fg">{{ getSourceName(source) }}</text>
                      <text class="text-sm font-semibold text-success">+{{ stats.earned || 0 }}</text>
                    </view>
                  </view>
                  <view v-if="Object.keys(earnedSources).length === 0" class="py-4 text-center">
                    <text class="text-fg-subtle text-sm">暂无获得记录</text>
                  </view>
                </view>
              </view>

              <!-- 消耗积分部分 -->
              <view>
                <text class="text-base font-semibold text-fg block mb-3">消耗积分</text>
                <view class="space-y-2">
                  <view
                    v-for="(stats, source) in spentSources"
                    :key="source"
                    class="bg-danger-soft rounded-lg p-3 border border-danger"
                  >
                    <view class="flex items-center justify-between">
                      <text class="text-sm font-medium text-fg">{{ getSourceName(source) }}</text>
                      <text class="text-sm font-semibold text-danger">-{{ Math.abs(stats.spent || 0) }}</text>
                    </view>
                  </view>
                  <view v-if="Object.keys(spentSources).length === 0" class="py-4 text-center">
                    <text class="text-fg-subtle text-sm">暂无消耗记录</text>
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
import { useThemePage } from '../../composables/useThemePage'
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { pointsAPI } from '../../api/index'
import { useAuthStore } from '../../stores/auth'
import { formatDateTime } from '../../utils/time'

const themeStore = useThemePage()

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
    'admin_grant': '系统发放'
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
