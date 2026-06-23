<template>
  <scroll-view class="h-screen bg-slate-50" :scroll-y="true">
    <view class="px-4 pt-3 pb-8">
      <view class="rounded-2xl bg-white px-2 shadow-sm">
        <view class="flex">
          <view
            v-for="tab in topTabs"
            :key="tab.key"
            @tap="activeTab = tab.key"
            :class="[
              'flex-1 border-b-2 px-1 py-3 text-center transition-colors duration-200',
              activeTab === tab.key ? 'border-orange-500 font-semibold text-orange-600' : 'border-transparent text-slate-500'
            ]"
          >
            {{ tab.label }}
          </view>
        </view>
      </view>

      <view v-if="pageLoading" class="mt-4 rounded-2xl bg-white py-14 text-center shadow-sm">
        <view class="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-orange-400 border-t-transparent animate-spin"></view>
        <text class="text-slate-500">正在加载交换生数据...</text>
      </view>

      <view v-else class="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <view class="border-b border-slate-200 pb-3">
          <view class="flex items-start justify-between gap-3">
            <view>
              <text class="font-semibold text-slate-900" :user-select="true">遴选本科生赴国内高校交流培养的通知</text>
            </view>
          </view>
          <view class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-sm">
            <text :user-select="true">面向：大二下</text>
            <text :user-select="true">发布日期：{{ currentPublishDate || '待发布' }}</text>
          </view>
        </view>

        <view v-if="loadError" class="py-10 text-center text-rose-500">
          {{ loadError }}
        </view>

        <view v-else-if="currentSections.length === 0" class="py-10 text-center text-slate-400">
          暂无交换生数据
        </view>

        <view v-else>
          <view
            v-for="(section, index) in currentSections"
            :key="`${activeTab}-${section.title}-${index}`"
            class="py-4"
            :class="index > 0 ? 'border-t border-slate-100' : ''"
          >
            <view class="flex items-start justify-between gap-3">
              <text class="font-semibold leading-6 text-slate-800" :user-select="true">{{ section.title || `说明 ${index + 1}` }}</text>
            </view>

            <text v-if="section.description" class="mt-2 block leading-6 text-slate-600" :user-select="true">
              {{ section.description }}
            </text>

            <view v-if="section.items.length > 0" class="mt-3">
              <view
                v-for="(item, itemIndex) in section.items"
                :key="`${section.title}-item-${itemIndex}`"
                class="flex items-start gap-2 py-2"
                :class="itemIndex > 0 ? 'border-t border-slate-100' : ''"
              >
                <view class="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400"></view>
                <text class="min-w-0 flex-1 leading-6 text-slate-700" :user-select="true">{{ item }}</text>
              </view>
            </view>

            <view v-if="section.schools.length > 0" class="mt-3 border-t border-slate-100">
              <view
                v-for="(school, schoolIndex) in section.schools"
                :key="`${section.title}-school-${school.name}-${schoolIndex}`"
                class="py-3"
                :class="schoolIndex > 0 ? 'border-t border-slate-100' : ''"
              >
                <view class="flex items-start justify-between gap-3">
                  <text class="min-w-0 flex-1 font-semibold leading-6 text-slate-800" :user-select="true">{{ school.name || `学校 ${schoolIndex + 1}` }}</text>
                  <text v-if="school.quotaLabel" class="flex-shrink-0 text-orange-600" :user-select="true">{{ school.quotaLabel }}</text>
                </view>
                <text v-if="school.remarks" class="mt-1 block leading-6 text-slate-600" :user-select="true">{{ school.remarks }}</text>
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
import { configAPI } from '../../api'

const LAST_YEAR_TAB = 'lastYear'
const THIS_YEAR_TAB = 'thisYear'

const topTabs = [
  { key: LAST_YEAR_TAB, label: '去年' },
  { key: THIS_YEAR_TAB, label: '今年' },
]

const activeTab = ref(THIS_YEAR_TAB)
const pageLoading = ref(true)
const loadError = ref('')
const exchangeNotice = ref(createEmptyExchangeNotice())

function createEmptyExchangeNotice() {
  return {
    lastYear: {
      publishDate: '',
      data: [],
    },
    thisYear: {
      publishDate: '',
      data: [],
    },
  }
}

function parseConfigValue(payload, fallback) {
  if (payload === null || payload === undefined || payload === '') {
    return fallback
  }

  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload)
    } catch (error) {
      console.warn('parse exchangeNotice error', error)
      return fallback
    }
  }

  return payload
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeItems(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item) => normalizeText(item))
    .filter(Boolean)
}

function normalizeSchools(schools) {
  if (!Array.isArray(schools)) {
    return []
  }

  return schools
    .map((school) => {
      const normalizedQuota = school?.quota
      const hasQuota = normalizedQuota !== null && normalizedQuota !== undefined && normalizedQuota !== ''

      return {
        name: normalizeText(school?.name),
        remarks: normalizeText(school?.remarks),
        quotaLabel: hasQuota ? `${normalizedQuota} 人` : '',
      }
    })
    .filter((school) => school.name)
}

function normalizeSection(section, index) {
  return {
    title: normalizeText(section?.title) || `说明 ${index + 1}`,
    description: normalizeText(section?.description),
    items: normalizeItems(section?.items),
    schools: normalizeSchools(section?.schools),
  }
}

function normalizeYearBlock(block) {
  return {
    publishDate: normalizeText(block?.publishDate),
    data: Array.isArray(block?.data) ? block.data.map(normalizeSection) : [],
  }
}

function normalizeExchangeNotice(payload) {
  const source = payload || {}

  return {
    lastYear: normalizeYearBlock(source.lastYear),
    thisYear: normalizeYearBlock(source.thisYear),
  }
}

function resolveDefaultTab(data) {
  if (data.thisYear.data.length > 0) {
    return THIS_YEAR_TAB
  }

  if (data.lastYear.data.length > 0) {
    return LAST_YEAR_TAB
  }

  return THIS_YEAR_TAB
}

const currentBlock = computed(() => {
  return activeTab.value === LAST_YEAR_TAB ? exchangeNotice.value.lastYear : exchangeNotice.value.thisYear
})

const currentSections = computed(() => currentBlock.value.data)
const currentSectionCount = computed(() => currentSections.value.length)
const currentPublishDate = computed(() => currentBlock.value.publishDate)
const currentTabLabel = computed(() => {
  const tab = topTabs.find((item) => item.key === activeTab.value)
  return tab?.label || '今年'
})

async function loadExchangeNotice() {
  pageLoading.value = true
  loadError.value = ''

  try {
    const response = await configAPI.getConfig('exchangeNotice')
    const parsed = parseConfigValue(response?.value ?? response, createEmptyExchangeNotice())
    const normalized = normalizeExchangeNotice(parsed)

    exchangeNotice.value = normalized
    activeTab.value = resolveDefaultTab(normalized)
  } catch (error) {
    console.error('load exchangeNotice error', error)
    exchangeNotice.value = createEmptyExchangeNotice()
    loadError.value = '交换生数据加载失败，请稍后重试'
    Taro.showToast({
      title: '交换生数据加载失败',
      icon: 'none',
      duration: 2000,
    })
  } finally {
    pageLoading.value = false
  }
}

onMounted(async () => {
  await loadExchangeNotice()
})

Taro.useShareAppMessage(() => ({
  title: '江理一起来学交换生',
  path: '/pages/exchange/index',
}))

Taro.useShareTimeline(() => ({
  title: '江理一起来学交换生',
  path: '/pages/exchange/index',
}))
</script>

<style scoped></style>
