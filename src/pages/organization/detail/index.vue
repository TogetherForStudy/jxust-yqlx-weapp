<template>
  <view class="min-h-screen bg-gray-50 p-4">
    <view v-if="isLoading" class="bg-white rounded-lg py-16 text-center shadow-sm">
      <text class="text-gray-500">加载中...</text>
    </view>

    <view v-else-if="pageError" class="bg-white rounded-lg p-6 text-center shadow-sm">
      <text class="block text-rose-500">{{ pageError }}</text>
      <view class="mt-4 flex justify-center gap-3">
        <view class="rounded-full bg-rose-50 px-4 py-2" @tap="fetchOrganizationDetail">
          <text class="text-rose-500">重新加载</text>
        </view>
        <view class="rounded-full bg-gray-100 px-4 py-2" @tap="goBack">
          <text class="text-gray-600">返回</text>
        </view>
      </view>
    </view>

    <view v-else-if="organization" class="bg-white rounded-lg p-4 shadow-sm">
      <view class="flex items-center justify-between gap-3">
        <view class="min-w-0 flex-1">
          <text class="block text-lg font-semibold text-gray-800 leading-7">{{ organization.name }}</text>
        </view>
        <view class="flex shrink-0 flex-col items-center gap-2">
          <view class="flex items-center rounded-full bg-orange-100 px-3 py-1 leading-6 shrink-0">
            <text class="text-orange-600 text-sm">{{ organization.organization_type || '组织' }}</text>
          </view>
        </view>
      </view>

      <view class="mt-4 border-t border-gray-100 pt-3 space-y-3">
        <view class="flex justify-between items-start gap-4">
          <text class="text-gray-400 w-16 shrink-0">所属单位</text>
          <text class="flex-1 text-gray-700 text-right">{{ organization.affiliation || '未填写' }}</text>
        </view>

        <view class="flex justify-between items-start gap-4">
          <text class="text-gray-400 w-16 shrink-0">所属校区</text>
          <text class="flex-1 text-gray-700 text-right">{{ organization.campus || '未填写' }}</text>
        </view>

        <view class="flex justify-between items-start gap-4">
          <text class="text-gray-400 w-16 shrink-0">联系方式</text>
          <view class="flex flex-1 items-start justify-end gap-2">
            <text class="text-gray-700 text-right break-all">{{ organization.contact || '未填写' }}</text>
            <text
              v-if="organization.contact"
              class="shrink-0 text-orange-500"
              @tap="copyContact"
            >
              复制
            </text>
          </view>
        </view>

        <view class="border-t border-gray-100 pt-3">
          <text class="text-gray-400">组织介绍</text>
          <text class="mt-2 block whitespace-pre-wrap break-all leading-6 text-gray-700">
            {{ organization.introduction || '该组织暂未补充介绍。' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'
import { organizationAPI } from '../../../api'

const organizationId = ref('')
const organization = ref(null)
const isLoading = ref(true)
const pageError = ref('')

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

const fetchOrganizationDetail = async () => {
  if (!organizationId.value) {
    pageError.value = '组织参数缺失'
    isLoading.value = false
    return
  }

  isLoading.value = true
  pageError.value = ''

  try {
    const result = await organizationAPI.getOrganizationDetail(organizationId.value)
    organization.value = normalizeOrganization(result)
  } catch (error) {
    console.error('fetch organization detail error', error)
    organization.value = null
    pageError.value = '组织详情加载失败，请稍后重试'
    showToast('组织详情加载失败')
  } finally {
    isLoading.value = false
  }
}

const formatDateTime = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const copyContact = async () => {
  if (!organization.value?.contact) {
    showToast('暂无联系方式')
    return
  }

  try {
    await Taro.setClipboardData({ data: organization.value.contact })
    showToast('联系方式已复制')
  } catch (error) {
    console.error('copy contact error', error)
    showToast('复制失败')
  }
}

const goBack = () => {
  Taro.navigateBack()
}

onMounted(() => {
  const instance = Taro.getCurrentInstance()
  const params = instance.router?.params || {}
  organizationId.value = params.id || ''
  fetchOrganizationDetail()
})

Taro.useShareAppMessage(() => ({
  title: organization.value?.name || '江理一起来学组织详情',
  path: `/pages/organization/detail/index?id=${organizationId.value}`,
}))

Taro.useShareTimeline(() => ({
  title: organization.value?.name || '江理一起来学组织详情',
  path: `/pages/organization/detail/index?id=${organizationId.value}`,
}))
</script>

<style scoped></style>
