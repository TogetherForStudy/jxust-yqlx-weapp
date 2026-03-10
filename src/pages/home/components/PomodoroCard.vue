<template>
  <view class="px-4">
    <view class="flex justify-between items-center mb-2">
      <text class="text-gray-800 font-medium">番茄钟</text>
      <view
        class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center"
        @tap="openRankingModal"
      >
        <text class="i-lucide-trophy w-3.5 h-3.5 text-amber-500"></text>
      </view>
    </view>

    <view class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <view class="p-4">
        <view class="flex gap-2 mb-4">
          <view
            v-for="preset in modePresets"
            :key="preset.key"
            class="flex-1 rounded-xl border px-2 py-2 text-center transition-colors"
            :class="[
              mode === preset.key ? preset.activeClass : preset.inactiveClass,
              isRunning && mode !== preset.key ? 'opacity-50' : ''
            ]"
            @tap="switchMode(preset.key)"
          >
            <text class="block text-sm font-semibold">{{ preset.label }}</text>
            <text class="block text-xs opacity-80 mt-1">{{ preset.shortLabel }}</text>
          </view>
        </view>

        <view
          class="rounded-2xl p-4 bg-gradient-to-br text-slate-800 shadow-sm border"
          :class="currentPreset.panelClass"
        >
          <view class="flex items-start justify-between gap-3">
            <view class="min-w-0 flex-1">
              <text class="text-xs text-slate-500">{{ helperText }}</text>
              <text class="block text-[40px] leading-none font-black tracking-[2px] mt-2">{{ formattedTime }}</text>
            </view>
            <view
              class="px-2.5 py-1 rounded-full text-xs font-medium border bg-white bg-opacity-80"
              :class="currentPreset.badgeClass"
            >
              {{ isRunning ? '进行中' : '待开始' }}
            </view>
          </view>

          <view class="mt-4">
            <view class="h-2 rounded-full overflow-hidden" :class="currentPreset.trackClass">
              <view
                class="h-full rounded-full transition-all duration-300"
                :class="currentPreset.progressClass"
                :style="{ width: `${progressPercent}%` }"
              ></view>
            </view>
            <view class="flex items-center justify-between mt-2 text-xs text-slate-500">
              <text>{{ progressText }}</text>
              <text>{{ currentPreset.shortLabel }}</text>
            </view>
          </view>

          <view class="grid grid-cols-2 gap-3 mt-4">
            <view
              class="rounded-xl py-3 text-center text-sm font-semibold text-white active:opacity-90"
              :class="currentPreset.primaryButtonClass"
              @tap="toggleTimer"
            >
              <view class="flex items-center justify-center leading-none">
                <text
                  :class="isRunning ? 'i-lucide-pause' : 'i-lucide-play'"
                  class="w-4 h-4 mr-1.5 leading-none flex-shrink-0"
                ></text>
                <text class="leading-none">{{ isRunning ? '暂停' : '开始' }}</text>
              </view>
            </view>
            <view
              class="rounded-xl py-3 text-center text-sm font-semibold border bg-white bg-opacity-75 active:bg-white"
              :class="currentPreset.secondaryButtonClass"
              @tap="confirmResetTimer"
            >
              <view class="flex items-center justify-center leading-none">
                <text class="i-lucide-rotate-ccw w-4 h-4 mr-1.5 leading-none flex-shrink-0"></text>
                <text class="leading-none">重置</text>
              </view>
            </view>
          </view>
        </view>

      </view>
    </view>

    <view
      v-if="showRankingModal"
      class="fixed inset-0 z-50 flex items-center justify-center px-5"
      :catch-move="true"
      @touchmove.stop.prevent="handleRankingModalTouchMove"
    >
      <view class="absolute inset-0 bg-black bg-opacity-40" @tap="showRankingModal = false"></view>
      <view
        class="relative bg-white rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden shadow-2xl"
        :catch-move="true"
        @tap.stop=""
        @touchmove.stop="handleRankingModalTouchMove"
      >
        <view class="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
          <text class="text-base font-semibold text-gray-800">专注排行榜</text>
          <view class="w-7 h-7 flex items-center justify-center" @tap="showRankingModal = false">
            <text class="i-lucide-x w-5 h-5 text-gray-400"></text>
          </view>
        </view>

        <view
          v-if="authStore.isLoggedIn"
          class="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-center"
        >
          <text class="text-sm text-gray-500">我的累计完成</text>
          <text class="text-sm font-semibold text-gray-800 ml-2">{{ completedCount }} 次</text>
        </view>

        <view v-if="!authStore.isLoggedIn" class="flex flex-col items-center justify-center py-10 px-6">
          <view class="i-lucide-timer-reset text-2xl text-gray-400 mb-3"></view>
          <text class="text-base text-gray-700">登录后查看排行榜与同步进度</text>
          <text class="text-sm text-gray-500 mt-1">当前仍可使用本地番茄钟</text>
        </view>

        <view v-else-if="isLoadingRanking && ranking.length === 0" class="flex items-center justify-center py-10">
          <text class="text-sm text-gray-500">加载中...</text>
        </view>

        <view v-else-if="ranking.length === 0" class="flex flex-col items-center justify-center py-10 px-6">
          <view class="i-lucide-award text-2xl text-gray-400 mb-3"></view>
          <text class="text-base text-gray-700">还没有排行数据</text>
          <text class="text-sm text-gray-500 mt-1">完成一个番茄后会自动同步</text>
        </view>

        <scroll-view v-else scroll-y class="max-h-[52vh]" style="max-height: 52vh;">
          <view class="px-4 py-2 border-b border-gray-100 bg-gray-50 grid grid-cols-[44px_1fr_84px] gap-3 text-xs text-gray-500 font-medium">
            <text></text>
            <text>昵称</text>
            <text class="text-right whitespace-nowrap">专注次数</text>
          </view>
          <view class="divide-y divide-gray-100">
            <view
              v-for="(item, index) in ranking"
              :key="`${item.nickname || 'rank'}-${index}`"
              class="px-4 py-2 grid grid-cols-[44px_1fr_84px] gap-3 items-center"
              :class="getRankingRowClass(index)"
            >
              <view class="flex items-center">
                <view
                  class="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0"
                  :class="getRankBadgeClass(index)"
                >
                  {{ index + 1 }}
                </view>
              </view>
              <view class="min-w-0">
                <text class="block text-sm font-medium text-gray-800 truncate">番茄{{ item.nickname }}</text>
              </view>
              <text class="text-sm font-semibold text-gray-700 text-right tabular-nums">{{ item.pomodoro_count }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Taro from '@tarojs/taro'
import { pomodoroAPI } from '../../../api'
import { useAuthStore } from '../../../stores/auth'

defineOptions({
  name: 'PomodoroCard'
})

const STORAGE_KEY = 'home-pomodoro-state-v1'
const DEFAULT_MODE = 'focus'
const FOCUS_SESSIONS_PER_LONG_BREAK = 4

const modePresets = [
  {
    key: 'focus',
    label: '专注',
    shortLabel: '25 分钟',
    duration: 25 * 60,
    helper: '完成后转入短休',
    panelClass: 'from-rose-50 via-red-50 to-orange-50 border-red-100',
    activeClass: 'bg-red-400 border-red-400 text-white',
    inactiveClass: 'bg-white border-gray-200 text-gray-500',
    badgeClass: 'text-red-500 border-red-200',
    trackClass: 'bg-white bg-opacity-70',
    progressClass: 'bg-red-400',
    primaryButtonClass: 'bg-red-400',
    secondaryButtonClass: 'border-red-200 text-red-700'
  },
  {
    key: 'shortBreak',
    label: '短休',
    shortLabel: '5 分钟',
    duration: 5 * 60,
    helper: '快速放松一下，再回来继续推进',
    panelClass: 'from-emerald-100 via-teal-50 to-lime-50 border-emerald-200',
    activeClass: 'bg-emerald-500 border-emerald-500 text-white',
    inactiveClass: 'bg-white border-gray-200 text-gray-500',
    badgeClass: 'text-emerald-700 border-emerald-200',
    trackClass: 'bg-white bg-opacity-70',
    progressClass: 'bg-emerald-500',
    primaryButtonClass: 'bg-emerald-500',
    secondaryButtonClass: 'border-emerald-200 text-emerald-700'
  },
  {
    key: 'longBreak',
    label: '长休',
    shortLabel: '15 分钟',
    duration: 15 * 60,
    helper: '做一轮深度恢复，下一轮继续开工',
    panelClass: 'from-sky-100 via-cyan-50 to-indigo-50 border-sky-200',
    activeClass: 'bg-sky-500 border-sky-500 text-white',
    inactiveClass: 'bg-white border-gray-200 text-gray-500',
    badgeClass: 'text-sky-700 border-sky-200',
    trackClass: 'bg-white bg-opacity-70',
    progressClass: 'bg-sky-500',
    primaryButtonClass: 'bg-sky-500',
    secondaryButtonClass: 'border-sky-200 text-sky-700'
  }
]

const modePresetMap = modePresets.reduce((accumulator, preset) => {
  accumulator[preset.key] = preset
  return accumulator
}, {})

const authStore = useAuthStore()

const mode = ref(DEFAULT_MODE)
const remainingSeconds = ref(modePresetMap[DEFAULT_MODE].duration)
const isRunning = ref(false)
const endTimestamp = ref(null)
const timer = ref(null)
const completionInFlight = ref(false)
const completedFocusSessions = ref(0)
const cycleDate = ref('')

const completedCount = ref(0)
const ranking = ref([])
const isLoadingCount = ref(false)
const isLoadingRanking = ref(false)
const showRankingModal = ref(false)

const currentPreset = computed(() => modePresetMap[mode.value] || modePresetMap[DEFAULT_MODE])
const formattedTime = computed(() => formatSeconds(remainingSeconds.value))
const helperText = computed(() => {
  if (mode.value !== 'focus') {
    return currentPreset.value.helper
  }

  const effectiveCompletedFocusSessions = cycleDate.value === getTodayKey()
    ? completedFocusSessions.value
    : 0
  const willEnterLongBreak = (effectiveCompletedFocusSessions + 1) % FOCUS_SESSIONS_PER_LONG_BREAK === 0

  return willEnterLongBreak ? '完成后转入长休' : '完成后转入短休'
})
const progressPercent = computed(() => {
  const total = currentPreset.value.duration
  if (total <= 0) return 0

  const percent = ((total - remainingSeconds.value) / total) * 100
  return Math.min(100, Math.max(0, Number(percent.toFixed(1))))
})
const progressText = computed(() => {
  if (remainingSeconds.value === currentPreset.value.duration) {
    return '准备开始'
  }

  const elapsedMinutes = Math.floor((currentPreset.value.duration - remainingSeconds.value) / 60)
  return `已进行 ${elapsedMinutes} 分钟`
})

const getTodayKey = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const ensureDailyCycleState = () => {
  const todayKey = getTodayKey()

  if (cycleDate.value !== todayKey) {
    completedFocusSessions.value = 0
    cycleDate.value = todayKey
  }
}

const formatSeconds = (seconds) => {
  const normalized = Math.max(0, Number(seconds) || 0)
  const minutes = Math.floor(normalized / 60)
  const remain = normalized % 60
  return `${String(minutes).padStart(2, '0')}:${String(remain).padStart(2, '0')}`
}

const normalizePomodoroCount = (payload) => {
  const count = Number(payload?.pomodoro_count)
  return Number.isFinite(count) ? count : 0
}

const normalizePomodoroRanking = (payload) => {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload
    .map((item, index) => {
      const count = Number(item?.pomodoro_count)

      return {
        nickname: String(item?.nickname ?? `${index + 1}`),
        pomodoro_count: Number.isFinite(count) ? count : 0
      }
    })
    .sort((left, right) => right.pomodoro_count - left.pomodoro_count)
}

const persistState = () => {
  try {
    Taro.setStorageSync(STORAGE_KEY, {
      mode: mode.value,
      remainingSeconds: remainingSeconds.value,
      isRunning: isRunning.value,
      endTimestamp: endTimestamp.value,
      completedFocusSessions: completedFocusSessions.value,
      cycleDate: cycleDate.value || getTodayKey()
    })
  } catch (error) {
    console.error('保存番茄钟状态失败:', error)
  }
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const syncRemainingFromTimestamp = () => {
  if (!isRunning.value || !endTimestamp.value) {
    return remainingSeconds.value
  }

  const nextRemaining = Math.max(0, Math.ceil((endTimestamp.value - Date.now()) / 1000))
  remainingSeconds.value = nextRemaining
  return nextRemaining
}

const startTimer = () => {
  stopTimer()
  timer.value = setInterval(() => {
    const nextRemaining = syncRemainingFromTimestamp()
    if (nextRemaining <= 0) {
      void handleSessionCompletion()
    } else {
      persistState()
    }
  }, 1000)
}

const restoreState = () => {
  try {
    const savedState = Taro.getStorageSync(STORAGE_KEY)
    if (!savedState || typeof savedState !== 'object') {
      resetTimer()
      return
    }

    const nextMode = modePresetMap[savedState.mode] ? savedState.mode : DEFAULT_MODE
    mode.value = nextMode

    const presetDuration = modePresetMap[nextMode].duration
    const storedRemaining = Number(savedState.remainingSeconds)
    remainingSeconds.value = Number.isFinite(storedRemaining)
      ? Math.min(presetDuration, Math.max(0, storedRemaining))
      : presetDuration
    const storedCompletedFocusSessions = Number(savedState.completedFocusSessions)
    completedFocusSessions.value = Number.isFinite(storedCompletedFocusSessions)
      ? Math.max(0, storedCompletedFocusSessions)
      : 0
    cycleDate.value = typeof savedState.cycleDate === 'string' && savedState.cycleDate
      ? savedState.cycleDate
      : getTodayKey()
    ensureDailyCycleState()

    isRunning.value = Boolean(savedState.isRunning)
    const storedEndTimestamp = Number(savedState.endTimestamp)
    endTimestamp.value = Number.isFinite(storedEndTimestamp) ? storedEndTimestamp : null

    if (isRunning.value && endTimestamp.value) {
      const nextRemaining = syncRemainingFromTimestamp()
      if (nextRemaining <= 0) {
        void handleSessionCompletion()
      } else {
        startTimer()
      }
    } else {
      isRunning.value = false
      endTimestamp.value = null
    }

    persistState()
  } catch (error) {
    console.error('恢复番茄钟状态失败:', error)
    resetTimer()
  }
}

const loadCountData = async () => {
  if (!authStore.isLoggedIn || isLoadingCount.value) {
    return
  }

  isLoadingCount.value = true

  try {
    const countData = await pomodoroAPI.getCount()
    completedCount.value = normalizePomodoroCount(countData)
  } catch (error) {
    console.error('加载专注次数失败:', error)
  } finally {
    isLoadingCount.value = false
  }
}

const loadRankingData = async () => {
  if (!authStore.isLoggedIn || isLoadingRanking.value) {
    return
  }

  isLoadingRanking.value = true

  try {
    const rankingData = await pomodoroAPI.getRanking()
    ranking.value = normalizePomodoroRanking(rankingData)
  } catch (error) {
    console.error('加载排行榜失败:', error)
  } finally {
    isLoadingRanking.value = false
  }
}

const openRankingModal = async () => {
  showRankingModal.value = true
  await Promise.all([
    loadCountData(),
    loadRankingData()
  ])
}

const handleRankingModalTouchMove = () => {}

const switchMode = async (nextMode) => {
  if (!modePresetMap[nextMode] || mode.value === nextMode) {
    return
  }

  if (isRunning.value) {
    Taro.showToast({
      title: '请先暂停当前计时',
      icon: 'none'
    })
    return
  }

  const hasProgress = remainingSeconds.value !== currentPreset.value.duration
  if (hasProgress) {
    const result = await Taro.showModal({
      title: '切换状态',
      content: '切换后会清除当前计时，确定继续吗？',
      confirmText: '切换',
      confirmColor: '#ef4444'
    })

    if (!result.confirm) {
      return
    }
  }

  stopTimer()
  mode.value = nextMode
  isRunning.value = false
  endTimestamp.value = null
  remainingSeconds.value = modePresetMap[nextMode].duration
  persistState()
}

const toggleTimer = () => {
  if (isRunning.value) {
    stopTimer()
    syncRemainingFromTimestamp()
    isRunning.value = false
    endTimestamp.value = null
    persistState()
    return
  }

  if (remainingSeconds.value <= 0) {
    remainingSeconds.value = currentPreset.value.duration
  }

  isRunning.value = true
  endTimestamp.value = Date.now() + remainingSeconds.value * 1000
  persistState()
  startTimer()
}

const resetTimer = () => {
  stopTimer()
  isRunning.value = false
  endTimestamp.value = null
  remainingSeconds.value = currentPreset.value.duration
  persistState()
}

const confirmResetTimer = async () => {
  const result = await Taro.showModal({
    title: '重置番茄钟',
    content: '确定要重置当前计时吗？',
    confirmText: '重置',
    confirmColor: '#ef4444'
  })

  if (!result.confirm) {
    return
  }

  resetTimer()
}

const handleSessionCompletion = async () => {
  if (completionInFlight.value) {
    return
  }

  completionInFlight.value = true
  stopTimer()

  const completedMode = mode.value
  let nextMode = 'focus'

  isRunning.value = false
  endTimestamp.value = null
  remainingSeconds.value = 0
  persistState()

  try {
    try {
      Taro.vibrateShort()
    } catch (error) {
      console.error('触发振动提醒失败:', error)
    }

    if (completedMode === 'focus' && authStore.isLoggedIn) {
      await pomodoroAPI.increment()
      if (showRankingModal.value) {
        await Promise.all([
          loadCountData(),
          loadRankingData()
        ])
      }
    }

    if (completedMode === 'focus') {
      ensureDailyCycleState()
      completedFocusSessions.value += 1
      nextMode = completedFocusSessions.value % FOCUS_SESSIONS_PER_LONG_BREAK === 0
        ? 'longBreak'
        : 'shortBreak'
    } else {
      ensureDailyCycleState()
      nextMode = 'focus'
      if (completedMode === 'longBreak') {
        completedFocusSessions.value = 0
      }
    }

    mode.value = nextMode
    remainingSeconds.value = modePresetMap[nextMode].duration
    persistState()

    Taro.showToast({
      title: completedMode === 'focus'
        ? (nextMode === 'longBreak' ? '进入长休' : '专注完成')
        : '休息结束',
      icon: 'success'
    })
  } catch (error) {
    console.error('处理番茄钟完成事件失败:', error)
    mode.value = nextMode
    remainingSeconds.value = modePresetMap[nextMode].duration
    persistState()
  } finally {
    completionInFlight.value = false
  }
}

const getRankBadgeClass = (index) => {
  if (index === 0) return 'bg-yellow-100 text-yellow-700'
  if (index === 1) return 'bg-blue-100 text-blue-700'
  if (index === 2) return 'bg-orange-100 text-orange-600'
  return 'bg-gray-100 text-gray-500'
}

const getRankingRowClass = (index) => {
  if (index === 0) return 'bg-amber-50'
  if (index === 1) return 'bg-blue-50'
  if (index === 2) return 'bg-orange-50'
  return 'bg-white'
}

watch(
  () => authStore.isLoggedIn,
  (isLoggedIn) => {
    if (!isLoggedIn) {
      completedCount.value = 0
      ranking.value = []
    }
  },
  { immediate: true }
)

Taro.useDidShow(() => {
  restoreState()
})

Taro.useDidHide(() => {
  stopTimer()
  if (isRunning.value) {
    syncRemainingFromTimestamp()
  }
  persistState()
})

onBeforeUnmount(() => {
  stopTimer()
  if (isRunning.value) {
    syncRemainingFromTimestamp()
  }
  persistState()
})
</script>
