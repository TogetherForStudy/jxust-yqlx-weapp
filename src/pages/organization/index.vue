<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <view class="bg-white px-4 py-3 shadow-sm shrink-0">
      <view class="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 h-10">
        <text class="i-lucide-search text-gray-400 w-4 h-4"></text>
        <input
          v-model="draftFilters.query"
          placeholder="搜索组织名称"
          class="flex-1 bg-transparent outline-none h-full"
          confirm-type="search"
          @confirm="applyFilters"
        />
        <view v-if="draftFilters.query" @tap="clearKeyword" class="flex h-full items-center px-1">
          <text class="i-lucide-x text-gray-400 w-4 h-4"></text>
        </view>
        <view class="flex h-full items-center px-1" @tap="applyFilters">
          <text class="text-blue-500 leading-none">搜索</text>
        </view>
      </view>
    </view>

    <view class="flex-1 flex flex-col min-h-0">
      <view v-if="pageLoading" class="flex-1 flex items-center justify-center">
        <text class="text-gray-500">加载中...</text>
      </view>

      <view v-else-if="pageError" class="flex-1 p-4">
        <view class="bg-white rounded-lg p-6 text-center shadow-sm">
          <text class="block text-rose-500">{{ pageError }}</text>
          <view class="mt-4 inline-flex rounded-full bg-rose-50 px-4 py-2" @tap="reloadPage">
            <text class="text-rose-500">重新加载</text>
          </view>
        </view>
      </view>

      <scroll-view
        v-else
        :scroll-y="true"
        class="flex-1 h-[1px]"
        enhanced
        :lower-threshold="120"
        @scrolltolower="loadMore"
      >
        <view class="p-4 space-y-3">
          <view class="grid grid-cols-3 gap-2">
            <picker :value="typeIndex" :range="typeOptions" @change="onTypeChange">
              <view class="bg-white rounded-lg px-3 py-2 shadow-sm">
                <text class="block text-gray-400">类型</text>
                <text class="mt-1 block truncate text-gray-700">{{ draftFilters.organization_type || '无' }}</text>
              </view>
            </picker>

            <picker :value="affiliationIndex" :range="affiliationOptions" @change="onAffiliationChange">
              <view class="bg-white rounded-lg px-3 py-2 shadow-sm">
                <text class="block text-gray-400">所属</text>
                <text class="mt-1 block truncate text-gray-700">{{ draftFilters.affiliation || '无' }}</text>
              </view>
            </picker>

            <picker :value="campusIndex" :range="campusOptions" @change="onCampusChange">
              <view class="bg-white rounded-lg px-3 py-2 shadow-sm">
                <text class="block text-gray-400">校区</text>
                <text class="mt-1 block truncate text-gray-700">{{ draftFilters.campus || '无' }}</text>
              </view>
            </picker>
          </view>

          <view class="flex items-center justify-between text-gray-500">
            <text>{{ listHint }}</text>
            <view class="flex items-center gap-2">
              <view v-if="hasActiveFilters" class="px-2 py-1 rounded-full bg-orange-50 text-orange-600">
                <text class="text-xs">已筛选</text>
              </view>
              <text>{{ totalLabel }}</text>
            </view>
          </view>

          <view v-if="organizations.length === 0" class="bg-white rounded-lg p-8 text-center shadow-sm">
            <text class="i-lucide-users-round text-gray-300 w-10 h-10 block mx-auto mb-3"></text>
            <text class="text-gray-500">暂无符合条件的组织</text>
          </view>

          <template v-else>
            <view
              v-for="item in organizations"
              :key="item.id"
              class="bg-white rounded-lg px-4 py-3 shadow-sm"
              @tap="goToOrganizationDetail(item)"
            >
              <view class="flex justify-between items-start gap-3">
                <view class="min-w-0 flex-1">
                  <text class="block text-gray-800 font-medium leading-6">{{ item.name }}</text>
                </view>
                <view
                  :class="[
                    'px-2 rounded-full leading-6 shrink-0 text-sm',
                    item.organization_type ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                  ]"
                >
                  {{ item.organization_type || '未分类' }}
                </view>
              </view>

              <view class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-gray-600">
                <view class="flex items-center min-w-0">
                  <text class="i-lucide-building w-3 h-3 text-gray-400 mr-1 shrink-0"></text>
                  <text class="truncate text-sm">{{ item.affiliation || '未知所属' }}</text>
                </view>
                <view class="flex items-center min-w-0 justify-start">
                  <text class="i-lucide-map-pinned w-3 h-3 text-gray-400 mr-1 shrink-0"></text>
                  <text class="truncate text-sm">{{ item.campus || '未知校区' }}</text>
                </view>
              </view>

              <view v-if="item.introduction" class="mt-2">
                <text class="text-gray-500 leading-5">{{ getOrganizationDescription(item) }}</text>
              </view>
            </view>
          </template>

          <view v-if="loadingMore" class="text-center py-4">
            <text class="text-gray-500">加载更多...</text>
          </view>

          <view v-else-if="!hasMore" class="text-center py-2">
            <view class="flex flex-col items-center gap-1 text-sm">
              <text class="text-gray-400">已加载全部</text>
              <text class="text-gray-400">如需录入请联系客服</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'
import { organizationAPI } from '../../api'

const PAGE_SIZE = 10
const typeOptions = ['无', '部门', '社团', '工作室', '学生组织']
const affiliationOptions = [
  '无',
  '江西理工大学',
  '体育与艺术学院',
  '外国语学院',
  '法学院',
  '建筑与设计学院',
  '安全工程学院',
  '商学院',
  '经济管理学院',
  '理学院',
  '软件工程学院',
  '信息工程学院',
  '能源与机械工程学院',
  '机电工程学院',
  '电气工程与自动化学院',
  '土木与测绘工程学院',
  '矿业工程学院',
  '先进铜产业学院',
  '化学化工学院',
  '冶金工程学院',
  '材料科学与工程学院',
  '稀土学院',
]
const campusOptions = ['无', '三江东园', '三江西园', '红旗校区', '南昌校区']

const pageLoading = ref(true)
const loadingMore = ref(false)
const pageError = ref('')
const organizations = ref([])
const currentPage = ref(1)
const totalCount = ref(0)
const activeFilters = ref({
  query: '',
  organization_type: '',
  affiliation: '',
  campus: '',
})
const draftFilters = ref({
  query: '',
  organization_type: '',
  affiliation: '',
  campus: '',
})

const totalLabel = computed(() => `${totalCount.value || organizations.value.length} 个`)

const hasMore = computed(() => organizations.value.length < totalCount.value)

const typeIndex = computed(() => getOptionIndex(typeOptions, draftFilters.value.organization_type))
const affiliationIndex = computed(() => getOptionIndex(affiliationOptions, draftFilters.value.affiliation))
const campusIndex = computed(() => getOptionIndex(campusOptions, draftFilters.value.campus))

const hasActiveFilters = computed(() => Boolean(
  activeFilters.value.query ||
  activeFilters.value.organization_type ||
  activeFilters.value.affiliation ||
  activeFilters.value.campus
))

const listHint = computed(() => {
  if (activeFilters.value.query) {
    return `搜索：${activeFilters.value.query}`
  }

  if (hasActiveFilters.value) {
    return '筛选结果'
  }

  return '组织列表'
})

const showToast = (title) => {
  Taro.showToast({
    title,
    icon: 'none',
    duration: 2000,
  })
}

const normalizeOrganization = (item) => ({
  id: item?.id ?? '',
  name: item?.name || '未命名组织',
  organization_type: item?.organization_type || '',
  affiliation: item?.affiliation || '',
  campus: item?.campus || '',
  introduction: item?.introduction || '',
  contact: item?.contact || '',
  created_at: item?.created_at || '',
  updated_at: item?.updated_at || '',
})

const getOptionIndex = (options, value) => {
  const selectedValue = value || '无'
  const index = options.indexOf(selectedValue)

  return index >= 0 ? index : 0
}

const normalizePickerValue = (value) => (value === '无' ? '' : value)

const buildQueryParams = (page) => {
  const filters = activeFilters.value

  return {
    page,
    page_size: PAGE_SIZE,
    query: filters.query.trim(),
    organization_type: filters.organization_type.trim(),
    affiliation: filters.affiliation.trim(),
    campus: filters.campus.trim(),
  }
}

const fetchOrganizations = async ({ page = 1, append = false } = {}) => {
  if (append) {
    loadingMore.value = true
  } else {
    pageLoading.value = true
  }

  if (!append) {
    pageError.value = ''
  }

  try {
    const result = await organizationAPI.getOrganizations(buildQueryParams(page))
    const items = Array.isArray(result?.data)
      ? result.data.map(normalizeOrganization)
      : []

    organizations.value = append
      ? [...organizations.value, ...items]
      : items
    currentPage.value = Number(result?.page) || page
    totalCount.value = Number(result?.total) || organizations.value.length
  } catch (error) {
    console.error('fetch organizations error', error)

    if (!append) {
      organizations.value = []
      totalCount.value = 0
      pageError.value = '组织列表加载失败，请稍后重试'
    }

    showToast('组织数据加载失败')
  } finally {
    pageLoading.value = false
    loadingMore.value = false
  }
}

const applyFilters = async () => {
  activeFilters.value = {
    query: draftFilters.value.query.trim(),
    organization_type: draftFilters.value.organization_type.trim(),
    affiliation: draftFilters.value.affiliation.trim(),
    campus: draftFilters.value.campus.trim(),
  }

  await fetchOrganizations({ page: 1 })
}

const resetFilters = async () => {
  draftFilters.value = {
    query: '',
    organization_type: '',
    affiliation: '',
    campus: '',
  }
  activeFilters.value = {
    query: '',
    organization_type: '',
    affiliation: '',
    campus: '',
  }

  await fetchOrganizations({ page: 1 })
}

const clearKeyword = async () => {
  draftFilters.value.query = ''

  if (!activeFilters.value.query) {
    return
  }

  activeFilters.value = {
    ...activeFilters.value,
    query: '',
  }

  await fetchOrganizations({ page: 1 })
}

const onTypeChange = async (event) => {
  const value = typeOptions[Number(event.detail.value)] || '无'
  draftFilters.value.organization_type = normalizePickerValue(value)
  await applyFilters()
}

const onAffiliationChange = async (event) => {
  const value = affiliationOptions[Number(event.detail.value)] || '无'
  draftFilters.value.affiliation = normalizePickerValue(value)
  await applyFilters()
}

const onCampusChange = async (event) => {
  const value = campusOptions[Number(event.detail.value)] || '无'
  draftFilters.value.campus = normalizePickerValue(value)
  await applyFilters()
}

const reloadPage = async () => {
  await fetchOrganizations({ page: 1 })
}

const loadMore = async () => {
  if (pageLoading.value || loadingMore.value || !hasMore.value) {
    return
  }

  await fetchOrganizations({
    page: currentPage.value + 1,
    append: true,
  })
}

const getOrganizationDescription = (item) => {
  if (!item?.introduction) {
    return '暂无组织介绍'
  }

  return item.introduction.length > 72
    ? `${item.introduction.slice(0, 72)}...`
    : item.introduction
}

const goToOrganizationDetail = (item) => {
  if (!item?.id) {
    showToast('组织信息异常')
    return
  }

  Taro.navigateTo({
    url: `/pages/organization/detail/index?id=${item.id}`,
  })
}

onMounted(async () => {
  await fetchOrganizations({ page: 1 })
})

Taro.useShareAppMessage(() => ({
  title: '江理一起来学组织目录',
  path: '/pages/organization/index',
}))

Taro.useShareTimeline(() => ({
  title: '江理一起来学组织目录',
  path: '/pages/organization/index',
}))
</script>

<style scoped></style>
