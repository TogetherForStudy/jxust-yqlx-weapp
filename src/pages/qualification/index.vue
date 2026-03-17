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
              'flex-1 border-b-2 px-1 py-3 text-center text-sm transition-colors duration-200',
              activeTab === tab.key ? 'border-orange-500 text-orange-600 font-semibold' : 'border-transparent text-slate-500'
            ]"
          >
            {{ tab.label }}
          </view>
        </view>
      </view>

      <view v-if="pageLoading" class="mt-4 rounded-2xl bg-white py-14 text-center shadow-sm">
        <view class="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-orange-400 border-t-transparent animate-spin"></view>
        <text class="text-sm text-slate-500">正在加载考级考证数据...</text>
      </view>

      <view v-else class="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <view class="border-b border-slate-200 pb-3">
          <view class="flex items-start justify-between gap-3">
            <view>
              <text class="text-base font-semibold text-slate-900">{{ activeTitle }}</text>
              <text v-if="activeDescription" class="mt-1 block text-xs leading-5 text-slate-500">{{ activeDescription }}</text>
            </view>
            <text class="flex-shrink-0 text-xs text-orange-600">{{ activeCount }} 项</text>
          </view>
        </view>

        <view v-if="activeError" class="py-8 text-center text-sm text-rose-500">
          {{ activeError }}
        </view>

        <view v-else-if="activeTab === TEST_TAB && testList.length === 0" class="py-10 text-center text-sm text-slate-400">
          暂无考级考试数据
        </view>

        <view v-else-if="activeTab === QUALIFICATION_TAB && qualificationList.length === 0" class="py-10 text-center text-sm text-slate-400">
          暂无职业资格数据
        </view>

        <template v-else-if="activeTab === TEST_TAB">
          <view
            v-for="(item, index) in testList"
            :key="item.id"
            class="py-4"
            :class="index > 0 ? 'border-t border-slate-100' : ''"
          >
            <view class="flex items-start justify-between gap-3">
              <text class="block min-w-0 flex-1 text-sm font-semibold leading-6 text-slate-800">{{ item.name }}</text>
            </view>

            <text
              v-if="item.displayDate"
              class="mt-1 block text-xs font-medium leading-5 text-orange-600"
            >
              {{ item.displayDate }}
            </text>
            <text class="mt-2 block text-sm leading-6 text-slate-600">{{ item.intro || '暂无介绍' }}</text>
          </view>
        </template>

        <template v-else>
          <view
            v-for="(item, index) in qualificationList"
            :key="item.id"
            class="py-4"
            :class="index > 0 ? 'border-t border-slate-100' : ''"
          >
            <view class="min-w-0">
              <text class="block text-sm font-semibold leading-6 text-slate-800">{{ item.name }}</text>
              <text class="mt-1 block text-xs leading-5 text-slate-400">{{ item.displayDate || '时间待更新' }}</text>
            </view>

            <view v-if="item.children.length > 0" class="mt-3 rounded-xl bg-slate-50 px-3 py-2.5">
              <view
                v-for="(child, childIndex) in item.children"
                :key="`${item.id}-${child.name}-${childIndex}`"
                class="py-2"
                :class="childIndex > 0 ? 'border-t border-slate-200' : ''"
              >
                <view class="flex items-start justify-between gap-3">
                  <text class="min-w-0 flex-1 text-xs font-medium leading-5 text-slate-700">{{ child.name }}</text>
                  <text class="flex-shrink-0 text-xs leading-5 text-slate-400">{{ child.displayDate || '时间待更新' }}</text>
                </view>
              </view>
            </view>

            <view class="mt-3 flex justify-end">
              <text class="text-xs text-sky-600">{{ item.category || '职业资格' }}</text>
            </view>
          </view>
        </template>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'
import { configAPI } from '../../api/index'

const TEST_TAB = 'tests'
const QUALIFICATION_TAB = 'qualifications'

const topTabs = [
  { key: TEST_TAB, label: '考级考试' },
  { key: QUALIFICATION_TAB, label: '职业资格' },
]

const activeTab = ref(TEST_TAB)
const pageLoading = ref(true)
const sectionErrors = ref({
  tests: '',
  qualifications: '',
})
const testList = ref([])
const qualificationMeta = ref({
  title: '',
  year: '',
  updatedAt: '',
})
const qualificationList = ref([])

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
      console.warn('parse qualification config error', error)
      return fallback
    }
  }

  return payload
}

const normalizeText = (value) => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizeTestList = (payload) => {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload
    .map((item, index) => ({
      id: item?.id ?? index + 1,
      name: normalizeText(item?.name) || `考试 ${index + 1}`,
      displayDate: normalizeText(item?.displayDate),
      intro: normalizeText(item?.intro),
    }))
    .filter((item) => item.name)
}

const normalizeQualificationChildren = (children) => {
  if (!Array.isArray(children)) {
    return []
  }

  return children
    .map((child) => ({
      name: normalizeText(child?.name),
      displayDate: normalizeText(child?.displayDate),
    }))
    .filter((child) => child.name)
}

const resolveQualificationDisplayDate = (item) => {
  if (item.displayDate) {
    return item.displayDate
  }

  if (item.children.length > 0) {
    const childDates = item.children
      .map((child) => child.displayDate)
      .filter(Boolean)

    if (childDates.length > 0) {
      return childDates.join(' / ')
    }
  }

  return ''
}

const normalizeQualificationPayload = (payload) => {
  const source = Array.isArray(payload) ? { items: payload } : (payload || {})
  const items = Array.isArray(source.items)
    ? source.items
    : Array.isArray(source.data)
      ? source.data
      : []

  return {
    meta: {
      title: normalizeText(source?.meta?.title),
      year: source?.meta?.year ?? '',
      updatedAt: normalizeText(source?.meta?.updatedAt),
    },
    items: items
      .map((item, index) => {
        const normalized = {
          id: item?.id ?? index + 1,
          name: normalizeText(item?.name) || `职业资格 ${index + 1}`,
          category: normalizeText(item?.category),
          displayDate: normalizeText(item?.displayDate),
          children: normalizeQualificationChildren(item?.children),
        }

        normalized.displayDate = resolveQualificationDisplayDate(normalized)
        return normalized
      })
      .filter((item) => item.name),
  }
}

const testCount = computed(() => testList.value.length)
const qualificationCount = computed(() => qualificationList.value.length)

const activeTitle = computed(() => {
  return activeTab.value === TEST_TAB ? '常见考级考试' : '专业技术与职业资格'
})

const activeDescription = computed(() => {
  return activeTab.value === TEST_TAB
    ? '大学生常见考级项目'
    : qualificationMeta.value.title
})

const activeCount = computed(() => {
  return activeTab.value === TEST_TAB ? testCount.value : qualificationCount.value
})

const activeError = computed(() => {
  return activeTab.value === TEST_TAB ? sectionErrors.value.tests : sectionErrors.value.qualifications
})

const loadPageData = async () => {
  pageLoading.value = true
  sectionErrors.value = {
    tests: '',
    qualifications: '',
  }

  try {
    const [testResult, qualificationResult] = await Promise.allSettled([
      configAPI.getConfig('testList'),
      configAPI.getConfig('qualificationList'),
    ])

    let hasSuccess = false
    let hasFailure = false

    if (testResult.status === 'fulfilled') {
      const parsed = parseConfigValue(testResult.value?.value ?? testResult.value, [])
      testList.value = normalizeTestList(parsed)
      hasSuccess = true
    } else {
      console.error('load testList error', testResult.reason)
      testList.value = []
      sectionErrors.value.tests = '考级考试数据加载失败，请稍后重试'
      hasFailure = true
    }

    if (qualificationResult.status === 'fulfilled') {
      const parsed = parseConfigValue(qualificationResult.value?.value ?? qualificationResult.value, {})
      const normalized = normalizeQualificationPayload(parsed)
      qualificationMeta.value = normalized.meta
      qualificationList.value = normalized.items
      hasSuccess = true
    } else {
      console.error('load qualificationList error', qualificationResult.reason)
      qualificationMeta.value = {
        title: '',
        year: '',
        updatedAt: '',
      }
      qualificationList.value = []
      sectionErrors.value.qualifications = '职业资格数据加载失败，请稍后重试'
      hasFailure = true
    }

    if (!hasSuccess) {
      showToast('考级考证数据加载失败')
    } else if (hasFailure) {
      showToast('部分数据加载失败')
    }
  } finally {
    pageLoading.value = false
  }
}

onMounted(async () => {
  await loadPageData()
})

Taro.useShareAppMessage(() => ({
  title: '江理一起来学考级考证',
  path: '/pages/qualification/index',
}))

Taro.useShareTimeline(() => ({
  title: '江理一起来学考级考证',
  path: '/pages/qualification/index',
}))
</script>

<style scoped></style>
