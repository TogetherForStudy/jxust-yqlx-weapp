<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部栏 -->
    <view v-if="authStore.isLoggedIn" class="flex items-center justify-between px-4 py-1 bg-white border-b border-gray-100">
      <view class="flex items-center gap-1.5 flex-1 min-w-0" @tap="showWordDetail">
        <text class="i-lucide-book w-4 h-4 text-blue-500 flex-shrink-0"></text>
        <view v-if="dailyWord" class="flex-1 min-w-0 overflow-hidden">
          <text class="text-sm text-gray-800 font-medium line-clamp-1">
            {{ dailyWord.word }} 
            <text class="text-gray-600">{{ dailyWord.trans?.[0]?.cn || '暂无翻译' }}</text>
          </text>
        </view>
        <text v-else class="text-sm text-gray-400">加载中...</text>
      </view>
      <view @tap="showSettingsModal" class="i-lucide-settings w-4.5 h-4.5 text-gray-500"></view>
    </view>

    <!-- 卡片区域 -->
    <view class="flex flex-col space-y-4 py-4">
      <component 
        v-for="card in orderedCards" 
        :key="card.name" 
        :is="card.component" 
      />
    </view>

    <!-- 每日一词详情弹窗 -->
    <view v-if="isWordDetailVisible" class="fixed inset-0 z-50 flex items-center justify-center" @tap.self="hideWordDetail">
      <view class="absolute inset-0 bg-black opacity-50"></view>
      <view class="relative bg-white rounded-xl w-11/12 max-w-md max-h-[80vh] overflow-y-auto p-5 shadow-xl">
        <view class="flex items-center justify-between mb-4">
          <view class="flex items-center gap-2">
            <text class="i-lucide-book w-5 h-5 text-blue-500"></text>
            <text class="text-lg font-semibold text-gray-800">{{ dailyWord.word }}</text>
          </view>
          <text @tap="hideWordDetail" class="i-lucide-x w-5 h-5 text-gray-400"></text>
        </view>
        
        <view v-if="dailyWord" class="space-y-4">
          <!-- 单词 -->
          <view class="border-b border-gray-100 pb-3">
            <view v-if="dailyWord.phonetic_uk" class="mt-1 flex items-center gap-2">
              <text class="text-sm text-gray-500">英 /{{ dailyWord.phonetic_uk }}/</text>
              <text v-if="dailyWord.phonetic_us" class="text-sm text-gray-500">美 /{{ dailyWord.phonetic_us }}/</text>
            </view>
          </view>
          
          <!-- 翻译 -->
          <view v-if="dailyWord.trans && dailyWord.trans.length > 0" class="space-y-2">
            <text class="text-sm font-semibold text-gray-700">释义</text>
            <view v-for="(item, index) in dailyWord.trans" :key="index" class="text-sm">
              <text v-if="item.pos" class="text-blue-600 font-medium">{{ item.pos }} </text>
              <text class="text-gray-700">{{ item.cn }}</text>
            </view>
          </view>
          
          <!-- 例句 -->
          <view v-if="dailyWord.sentences && dailyWord.sentences.length > 0" class="space-y-2">
            <text class="text-sm font-semibold text-gray-700">例句</text>
            <view v-for="(item, index) in dailyWord.sentences" :key="index" class="space-y-1">
              <text class="text-sm text-gray-800 block">{{ item.c }}</text>
              <text class="text-sm text-gray-500 block">{{ item.cn }}</text>
            </view>
          </view>
          
          <!-- 短语 -->
          <view v-if="dailyWord.phrases && dailyWord.phrases.length > 0" class="space-y-2">
            <text class="text-sm font-semibold text-gray-700">常用短语</text>
            <view v-for="(item, index) in dailyWord.phrases" :key="index" class="space-y-1">
              <text class="text-sm text-gray-800 block">{{ item.c }}</text>
              <text class="text-sm text-gray-500 block">{{ item.cn }}</text>
            </view>
          </view>
          
          <!-- 同义词 -->
          <view v-if="dailyWord.synos && dailyWord.synos.length > 0" class="space-y-2">
            <text class="text-sm font-semibold text-gray-700">同义词</text>
            <view v-for="(item, index) in dailyWord.synos" :key="index" class="space-y-1">
              <text v-if="item.pos" class="text-sm text-blue-600 font-medium block">{{ item.pos }}</text>
              <text class="text-sm text-gray-700 block">{{ item.cn }}</text>
              <text v-if="item.ws" class="text-sm text-gray-500 block">{{ item.ws.join(', ') }}</text>
            </view>
          </view>
          
          <!-- 相关词 -->
          <view v-if="dailyWord.rel_words && dailyWord.rel_words.rels && dailyWord.rel_words.rels.length > 0" class="space-y-2">
            <text class="text-sm font-semibold text-gray-700">相关词</text>
            <view class="text-sm text-gray-600 mb-1">词根: {{ dailyWord.rel_words.root }}</view>
            <view v-for="(rel, index) in dailyWord.rel_words.rels" :key="index" class="space-y-1">
              <text v-if="rel.pos" class="text-sm text-blue-600 font-medium block">{{ rel.pos }}</text>
              <view v-if="rel.words" class="space-y-1">
                <view v-for="(word, wIndex) in rel.words" :key="wIndex" class="pl-2">
                  <text class="text-sm text-gray-800">{{ word.c }}</text>
                  <text class="text-sm text-gray-500"> - {{ word.cn }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view v-else class="text-center py-8 text-gray-400">
          加载中...
        </view>
      </view>
    </view>

    <!-- 设置弹窗 -->
    <view v-if="isSettingsVisible" class="fixed inset-0 z-50 flex items-center justify-center" @tap.self="hideSettingsModal">
      <view class="absolute inset-0 bg-black opacity-50"></view>
      <view class="relative bg-white rounded-xl w-11/12 max-w-md p-5 shadow-xl">
        <view class="flex items-center justify-between mb-3">
          <view class="flex items-center gap-2">
            <text class="i-lucide-grip-vertical w-4 h-4 text-gray-400"></text>
            <text class="text-base font-medium text-gray-800">卡片顺序</text>
          </view>
          <text @tap="hideSettingsModal" class="i-lucide-x w-5 h-5 text-gray-400"></text>
        </view>
        
        <view class="text-xs text-gray-400 mb-4">点击箭头调整顺序</view>
        
        <!-- 卡片列表 -->
        <view class="space-y-2">
          <view
            v-for="(card, index) in sortableCards"
            :key="card.name"
            class="bg-gray-50 rounded-lg px-3 py-1 flex items-center justify-between border border-gray-100"
          >
            <view class="flex items-center gap-2.5">
              <text :class="card.iconClass + ' w-4 h-4'"></text>
              <text class="text-gray-700">{{ card.label }}</text>
            </view>
            
            <view class="flex items-center gap-1">
              <view 
                @tap="moveUp(index)" 
                class="p-1.5 rounded hover:bg-gray-200 transition-colors"
                :class="{ 'opacity-30': index === 0 }"
              >
                <text class="i-lucide-chevron-up w-4 h-4 text-gray-500"></text>
              </view>
              <view 
                @tap="moveDown(index)" 
                class="p-1.5 rounded hover:bg-gray-200 transition-colors"
                :class="{ 'opacity-30': index === sortableCards.length - 1 }"
              >
                <text class="i-lucide-chevron-down w-4 h-4 text-gray-500"></text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="flex gap-2.5 mt-5">
          <view 
            @tap="resetOrder" 
            class="flex-1 py-2.5 bg-gray-100 rounded-lg text-center text-sm text-gray-600 font-medium"
          >
            恢复默认
          </view>
          <view 
            @tap="saveOrder" 
            class="flex-1 py-2.5 bg-blue-500 rounded-lg text-center text-sm text-white font-medium"
          >
            保存
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import TodayCourse from './components/TodayCourse.vue'
import CountdownCard from './components/CountdownCard.vue'
import StudyTaskCard from './components/StudyTaskCard.vue'
import NotificationCard from './components/NotificationCard.vue'
import { useAuthStore } from '../../stores/auth'
import { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { dictionaryAPI } from '../../api'

const authStore = useAuthStore()

const updateManager = Taro.getUpdateManager()

// 每日一词
const dailyWord = ref(null)
const isWordDetailVisible = ref(false)

// 用户昵称
const displayName = computed(() => {
  return authStore.userInfo?.nickname || authStore.userInfo?.name || '同学'
})

// 默认卡片配置
const defaultCards = [
  { name: 'TodayCourse', label: '今日课程', iconClass: 'i-lucide-book-open text-blue-500', component: TodayCourse },
  { name: 'NotificationCard', label: '通知公告', iconClass: 'i-lucide-bell text-orange-500', component: NotificationCard },
  { name: 'StudyTaskCard', label: '学习任务', iconClass: 'i-lucide-clipboard-check text-green-500', component: StudyTaskCard },
  { name: 'CountdownCard', label: '倒数日', iconClass: 'i-lucide-timer text-purple-500', component: CountdownCard }
]

// 当前卡片顺序
const cardOrder = ref([])
const isSettingsVisible = ref(false)
const sortableCards = ref([])

// 按顺序排列的卡片
const orderedCards = computed(() => {
  return cardOrder.value.map(name => 
    defaultCards.find(card => card.name === name)
  ).filter(Boolean)
})

// 初始化卡片顺序
const initCardOrder = () => {
  try {
    const savedOrder = Taro.getStorageSync('homeCardOrder')
    if (savedOrder && Array.isArray(savedOrder) && savedOrder.length === defaultCards.length) {
      cardOrder.value = savedOrder
    } else {
      cardOrder.value = defaultCards.map(card => card.name)
    }
  } catch (error) {
    console.error('加载卡片顺序失败:', error)
    cardOrder.value = defaultCards.map(card => card.name)
  }
}

// 初始化可排序卡片
const initSortableCards = () => {
  sortableCards.value = cardOrder.value.map((name) => {
    return defaultCards.find(c => c.name === name)
  })
}

// 显示设置弹窗
const showSettingsModal = () => {
  initSortableCards()
  isSettingsVisible.value = true
}

// 隐藏设置弹窗
const hideSettingsModal = () => {
  isSettingsVisible.value = false
}

// 向上移动
const moveUp = (index) => {
  if (index === 0) return
  
  const temp = [...sortableCards.value]
  // 交换位置
  ;[temp[index - 1], temp[index]] = [temp[index], temp[index - 1]]
  sortableCards.value = temp
}

// 向下移动
const moveDown = (index) => {
  if (index === sortableCards.value.length - 1) return
  
  const temp = [...sortableCards.value]
  // 交换位置
  ;[temp[index], temp[index + 1]] = [temp[index + 1], temp[index]]
  sortableCards.value = temp
}

// 保存顺序
const saveOrder = () => {
  try {
    const newOrder = sortableCards.value.map(card => card.name)
    cardOrder.value = newOrder
    Taro.setStorageSync('homeCardOrder', newOrder)
    Taro.showToast({
      title: '保存成功',
      icon: 'success'
    })
    hideSettingsModal()
  } catch (error) {
    console.error('保存卡片顺序失败:', error)
    Taro.showToast({
      title: '保存失败',
      icon: 'error'
    })
  }
}

// 恢复默认顺序
const resetOrder = () => {
  sortableCards.value = [...defaultCards]
  Taro.showToast({
    title: '已恢复默认顺序',
    icon: 'success'
  })
}

// 获取每日一词
const fetchDailyWord = async () => {
  try {
    dailyWord.value = await dictionaryAPI.getRandomWord()
  } catch (error) {
    console.error('获取每日一词失败:', error)
  }
}

// 显示单词详情
const showWordDetail = () => {
  if (dailyWord.value) {
    isWordDetailVisible.value = true
  }
}

// 隐藏单词详情
const hideWordDetail = () => {
  isWordDetailVisible.value = false
}

onMounted(() => {
  initCardOrder()
  fetchDailyWord()
})

updateManager.onUpdateReady(function () {
  wx.showModal({
    title: '更新提示',
    content: '重新启动小程序以使用新版本',
    success: function (res) {
      if (res.confirm) {
        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        updateManager.applyUpdate()
      }
    }
  })
})

useShareAppMessage((res) => {
  if (res.from === 'button') {
  }
  return {
    title: '江理一起来学小程序',
    path: '/pages/home/index',
  }
})

useShareTimeline((res) => {
  if (res.from === 'button') {
  }
  return {
    title: '江理一起来学小程序',
    path: '/pages/home/index',
  }
})
</script>

