<template>
  <scroll-view class="h-screen bg-slate-50" :scroll-y="true">
    <view class="px-4 pt-3 pb-8">
      <view class="overflow-hidden rounded-2xl bg-white shadow-sm">
        <scroll-view
          scroll-x
          class="w-full px-2"
          enhanced
          :show-scrollbar="false"
        >
          <view class="inline-flex min-w-max whitespace-nowrap">
            <view
              v-for="tab in tabs"
              :key="tab.key"
              @tap="activeTab = tab.key"
              :class="[
                'mr-2 min-w-[72px] flex-shrink-0 border-b-2 px-3 py-3 text-center transition-colors duration-200 last:mr-0',
                activeTab === tab.key ? 'border-orange-500 text-orange-600 font-semibold' : 'border-transparent text-slate-500'
              ]"
            >
              {{ tab.label }}
            </view>
          </view>
        </scroll-view>
      </view>

      <view v-if="pageLoading" class="mt-4 rounded-2xl bg-white py-14 text-center shadow-sm">
        <view class="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-orange-400 border-t-transparent animate-spin"></view>
        <text class="text-slate-500">正在加载竞赛数据...</text>
      </view>

      <view v-else class="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <view class="border-b border-slate-200 pb-3">
          <view class="flex items-start justify-between gap-3">
            <view>
              <text class="text-base font-semibold text-slate-900">竞赛目录</text>
            </view>
            <text class="flex-shrink-0 text-orange-600">{{ competitionCount }} 项</text>
          </view>
          <text v-if="competitionSource" class="mt-2 block leading-5 text-slate-400">
            数据来源：{{ competitionSource }}
          </text>
        </view>

        <view v-if="pageError" class="py-8 text-center text-rose-500">
          {{ pageError }}
        </view>

        <view v-else-if="activeTab === ALL_TAB_KEY && allCompetitionItems.length > 0">
          <view
            v-for="(item, itemIndex) in allCompetitionItems"
            :key="`all-${item.id}`"
            class="flex items-center gap-3 py-3"
            :class="itemIndex > 0 ? 'border-t border-slate-100' : ''"
          >
            <view class="min-w-0 flex-1">
              <text class="block leading-6 text-slate-800" :user-select="true">{{ item.name }}</text>
            </view>
            <view
              @tap.stop="copyCompetitionLink(item)"
              :class="[
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200',
                item.url ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'
              ]"
            >
              <text class="i-lucide-external-link h-4 w-4" :user-select="true"></text>
            </view>
          </view>
        </view>

        <view v-else-if="displaySections.length === 0" class="py-10 text-center text-slate-400">
          暂无竞赛数据
        </view>

        <view v-else>
          <view
            v-for="(section, sectionIndex) in displaySections"
            :key="section.category"
            :class="sectionIndex > 0 ? 'border-t border-slate-200' : ''"
          >
            <view class="flex items-center justify-between py-3" :class="activeTab === ALL_TAB_KEY ? 'border-b border-slate-100' : ''">
              <text class="font-semibold text-slate-800">{{ section.category }}</text>
              <text class="text-slate-400">{{ section.items.length }} 项</text>
            </view>

            <view v-if="section.items.length === 0" class="pb-3 text-slate-400">
              暂无内容
            </view>

            <view v-else class="pb-1">
              <view
                v-for="(item, itemIndex) in section.items"
                :key="item.id"
                class="flex items-center gap-3 py-3"
                :class="itemIndex > 0 ? 'border-t border-slate-100' : ''"
              >
                <view class="min-w-0 flex-1">
                  <text class="block leading-6 text-slate-800" :user-select="true">{{ item.name }}</text>
                </view>
                <view
                  @tap.stop="copyCompetitionLink(item)"
                  :class="[
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200',
                    item.url ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'
                  ]"
                >
                  <text class="i-lucide-external-link h-4 w-4" :user-select="true"></text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'
import { configAPI } from '../../api/index'

const ALL_TAB_KEY = 'all'

const pageLoading = ref(true)
const pageError = ref('')
const activeTab = ref(ALL_TAB_KEY)
const competitionSource = ref('')
const competitionGroups = ref([])

const showToast = (title) => {
  Taro.showToast({
    title,
    icon: 'none',
    duration: 2000,
  })
}

const parseConfigValue = (payload, fallback) => {
  if (payload === null || payload === undefined || payload === '') {
    return fallback
  }

  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload)
    } catch (error) {
      console.warn('parse competition config error', error)
      return fallback
    }
  }

  return payload
}

const normalizeCompetitionGroups = (groups) => {
  if (!Array.isArray(groups)) {
    return []
  }

  return groups
    .map((group, groupIndex) => ({
      category: group?.category || `分类 ${groupIndex + 1}`,
      items: Array.isArray(group?.items)
        ? group.items
            .filter((item) => item?.name)
            .map((item, itemIndex) => ({
              id: item?.id ?? `${groupIndex + 1}-${itemIndex + 1}`,
              name: item.name,
              url: typeof item?.url === 'string' ? item.url.trim() : '',
            }))
        : [],
    }))
    .filter((group) => group.category)
}

const tabs = computed(() => [
  { key: ALL_TAB_KEY, label: '全部' },
  ...competitionGroups.value.map((group) => ({
    key: group.category,
    label: group.category,
  })),
])

const competitionCount = computed(() => competitionGroups.value.reduce(
  (sum, group) => sum + group.items.length,
  0,
))

const allCompetitionItems = computed(() => competitionGroups.value
  .flatMap((group) => group.items)
  .slice()
  .sort((left, right) => {
    const leftId = Number(left?.id)
    const rightId = Number(right?.id)

    if (Number.isFinite(leftId) && Number.isFinite(rightId) && leftId !== rightId) {
      return leftId - rightId
    }

    if (Number.isFinite(leftId) && !Number.isFinite(rightId)) {
      return -1
    }

    if (!Number.isFinite(leftId) && Number.isFinite(rightId)) {
      return 1
    }

    return String(left?.name || '').localeCompare(String(right?.name || ''), 'zh-CN')
  }))

const displaySections = computed(() => {
  if (activeTab.value === ALL_TAB_KEY) {
    return []
  }

  const currentGroup = competitionGroups.value.find((group) => group.category === activeTab.value)
  return currentGroup ? [currentGroup] : []
})

const copyCompetitionLink = async (item) => {
  if (!item?.url) {
    showToast('暂无链接')
    return
  }

  try {
    await Taro.setClipboardData({ data: item.url })
    Taro.showToast({
      title: '链接已复制，请到浏览器打开',
      icon: 'none',
      duration: 2200,
    })
  } catch (error) {
    console.error('copy competition url error', error)
    showToast('复制失败')
  }
}

const loadCompetitionData = async () => {
  pageLoading.value = true
  pageError.value = ''

  try {
    const response = await configAPI.getConfig('competitionList')
    const parsed = parseConfigValue(response?.value ?? response, null)

    if (!parsed || !Array.isArray(parsed?.data)) {
      throw new Error('competitionList config is invalid')
    }

    competitionSource.value = parsed?.from || ''
    competitionGroups.value = normalizeCompetitionGroups(parsed.data)

    if (!tabs.value.some((tab) => tab.key === activeTab.value)) {
      activeTab.value = ALL_TAB_KEY
    }
  } catch (error) {
    console.error('loadCompetitionData error', error)
    competitionSource.value = ''
    competitionGroups.value = []
    pageError.value = '竞赛配置加载失败，请稍后重试'
    showToast('竞赛数据加载失败')
  } finally {
    pageLoading.value = false
  }
}

onMounted(async () => {
  await loadCompetitionData()
})

Taro.useShareAppMessage(() => ({
  title: '江理一起来竞赛',
  path: '/pages/competition/index',
}))

Taro.useShareTimeline(() => ({
  title: '江理一起来竞赛',
  path: '/pages/competition/index',
}))
</script>

<style scoped></style>
