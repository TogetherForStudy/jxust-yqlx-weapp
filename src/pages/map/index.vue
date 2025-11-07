<template>
  <view class="min-h-screen bg-gray-50 p-4">

    <!-- 手风琴式校区列表 -->
    <view class="space-y-2">
      <view
        v-for="campus in campusList"
        :key="campus.key"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- 校区标题栏 -->
        <view
          @tap="toggleCampus(campus)"
          class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
        >
          <view class="flex items-center">
            <view>
              <text class="text-base font-medium text-gray-800 block">{{ campus.name }}</text>
            </view>
          </view>

          <!-- 展开/收起箭头 -->
          <view
            :class="[
              'transform transition-transform duration-300',
              campus.expanded ? 'rotate-180' : 'rotate-0'
            ]"
          >
            <text class="text-gray-400 i-lucide-chevron-down"></text>
          </view>
        </view>

        <!-- 可展开的内容区域 -->
        <view
          :class="[
            'transition-all duration-300 ease-in-out overflow-hidden',
            campus.expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          ]"
        >
          <view class="px-4 pb-4 border-t border-gray-100">

            <!-- 加载状态 -->
            <view v-if="campus.loading" class="flex items-center justify-center py-8">
              <view class="text-center">
                <view class="flex justify-center mb-2">
                  <view class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></view>
                </view>
                <text class="text-sm text-gray-600">正在加载{{ campus.name }}地图...</text>
              </view>
            </view>

            <!-- 错误状态 -->
            <view v-else-if="campus.error" class="py-6">
              <view class="text-center">
                <text class="text-red-500 text-sm mb-3 block">{{ campus.error }}</text>
                <button
                  @tap="reloadCampusMap(campus)"
                  class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors duration-200"
                >
                  重新加载
                </button>
              </view>
            </view>

            <!-- 地图展示 -->
            <view v-else-if="campus.imageUrl" class="py-4">
              <image
                :src="campus.imageUrl"
                mode="widthFix"
                class="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                @error="onImageError(campus)"
                @load="onImageLoad(campus)"
                @tap="previewImage(campus.imageUrl)"
              />
              <text class="text-xs text-gray-500 text-center mt-2 block">点击图片预览</text>
            </view>

            <!-- 无数据状态 -->
            <view v-else class="py-6 text-center">
              <text class="text-gray-500 text-sm">暂无地图数据</text>
            </view>

          </view>
        </view>
      </view>
    </view>
  <view class="text-xs text-gray-400 text-center mt-6 mb-2">
    地图来源：江西理工大学
  </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { configAPI } from '../../api/index.js'
import { getSignedImageUrl } from '../../utils/index.js'

// 定义组件名称
defineOptions({
  name: 'CampusMapPage'
})

// 校区列表配置 - 每个校区都有自己的状态
const campusList = ref([
  {
    key: 'IMAGE_SJDY',
    name: '三江东园',
    expanded: false,
    loading: false,
    error: '',
    imageUrl: ''
  },
  {
    key: 'IMAGE_SJXY',
    name: '三江西园',
    expanded: false,
    loading: false,
    error: '',
    imageUrl: ''
  },
  {
    key: 'IMAGE_HQXQ',
    name: '红旗校区',
    expanded: false,
    loading: false,
    error: '',
    imageUrl: ''
  },
  {
    key: 'IMAGE_NCXQ',
    name: '南昌校区',
    expanded: false,
    loading: false,
    error: '',
    imageUrl: ''
  }
])

// 切换校区展开/收起状态
const toggleCampus = (campus) => {
  // 如果已经展开，则收起
  if (campus.expanded) {
    campus.expanded = false
    return
  }

  // 收起其他已展开的校区（可选：如果想同时展开多个，去掉这部分）
  campusList.value.forEach(item => {
    if (item.key !== campus.key) {
      item.expanded = false
    }
  })

  // 展开当前校区
  campus.expanded = true

  // 如果还没有加载过图片，则开始加载
  if (!campus.imageUrl && !campus.loading) {
    loadCampusMap(campus)
  }
}

// 加载校区地图
const loadCampusMap = async (campus) => {
  try {
    campus.loading = true
    campus.error = ''

    // 1. 获取地图配置路径
    const response = await configAPI.getConfig(campus.key)

    if (!response || !response.value) {
      campus.error = `未获取到${campus.name}地图数据`
      return
    }

    // 2. 使用签名URL获取图片（支持缓存和token）
    const signedUrl = await getSignedImageUrl(response.value)
    campus.imageUrl = signedUrl
  } catch (err) {
    console.error(`获取${campus.name}地图失败:`, err)
    // 根据错误类型提供更具体的错误信息
    if (err.message?.includes('图片路径不能为空')) {
      campus.error = '地图配置无效'
    } else if (err.message?.includes('获取图片签名失败')) {
      campus.error = '地图访问授权失败，请稍后重试'
    } else {
      campus.error = '获取地图失败，请稍后重试'
    }
  } finally {
    campus.loading = false
  }
}

// 重新加载校区地图
const reloadCampusMap = (campus) => {
  campus.imageUrl = ''
  campus.error = ''
  loadCampusMap(campus)
}

// 图片加载成功
const onImageLoad = (campus) => {

}

// 图片加载失败
const onImageError = (campus, e) => {
  console.error(`${campus.name}地图显示失败:`, e)
  campus.error = '地图显示失败，请重试'
  campus.loading = false
}

// 预览图片
const previewImage = (imageUrl) => {
  if (!imageUrl) return

  Taro.previewImage({
    urls: [imageUrl],
    current: imageUrl
  }).catch(err => {
    console.error('预览地图失败:', err)
    Taro.showToast({
      title: '预览失败',
      icon: 'error',
      duration: 2000
    })
  })
}

Taro.useShareAppMessage((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学小程序',
      path: '/pages/discover/index',
    }
  })

  Taro.useShareTimeline((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学小程序',
      path: '/pages/discover/index',
    }
  })
</script>

