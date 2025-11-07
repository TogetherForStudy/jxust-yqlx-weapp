<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <scroll-view class="h-screen bg-gray-50"
  :scroll-y="true"
  >
    <!-- 地址列表 -->
    <view class="p-4 space-y-4">
      <view
        v-for="(campus, index) in campusList"
        :key="index"
        class="bg-white rounded-lg shadow-sm"
      >
        <!-- 校区名称 -->
        <view class="bg-blue-50 px-4 py-3 border-b border-gray-100">
          <view class="flex items-center">
            <text class="i-lucide-map-pin w-4 h-4 text-blue-500 mr-2"></text>
            <text class="text-base font-medium text-gray-800">{{ campus.name }}</text>
          </view>
        </view>

        <!-- 地址信息 -->
        <view class="p-4 space-y-3">
          <!-- 详细地址 -->
          <view class="space-y-2">
            <view class="flex items-center justify-between">
              <text class="text-sm text-gray-500">详细地址</text>
              <view
                @tap="copyText(campus.address, '地址')"
                class="flex items-center px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <text class="i-lucide-copy w-3 h-3 text-gray-500 mr-1"></text>
                <text class="text-xs text-gray-600">复制</text>
              </view>
            </view>
            <text class="text-gray-800 leading-relaxed">{{ campus.address }}</text>
          </view>

          <!-- 邮编 -->
          <view class="space-y-2">
            <view class="flex items-center justify-between">
              <text class="text-sm text-gray-500">邮编</text>
              <view
                @tap="copyText(campus.zipCode, '邮编')"
                class="flex items-center px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <text class="i-lucide-copy w-3 h-3 text-gray-500 mr-1"></text>
                <text class="text-xs text-gray-600">复制</text>
              </view>
            </view>
            <text class="text-gray-800 font-mono text-lg">{{ campus.zipCode }}</text>
          </view>
        </view>
      </view>
    </view>

  </scroll-view>
</template>

<script setup>
import { ref } from "vue";
import Taro from "@tarojs/taro";

// 校区地址数据
const campusList = ref([
  {
    name: "三江东园",
    address: "江西省赣州市客家大道1958号江西理工大学三江校区(东园)",
    zipCode: "341000"
  },
  {
    name: "三江西园",
    address: "江西省赣州市南康区唐江镇唐凤大道南侧江西理工大学三江校区(西园)",
    zipCode: "341000"
  },
  {
    name: "红旗校区",
    address: "江西省赣州市红旗大道86号江西理工大学红旗校区",
    zipCode: "341000"
  },
  {
    name: "南昌校区",
    address: "江西省南昌市昌北开发区双港东大街1180号江西理工大学南昌校区",
    zipCode: "330013"
  }
]);

// 复制文本功能
const copyText = (text, type) => {
  Taro.setClipboardData({
    data: text,
    success: () => {
      Taro.showToast({
        title: `${type}已复制`,
        icon: "success",
        duration: 2000
      });
    },
    fail: () => {
      Taro.showToast({
        title: "复制失败",
        icon: "error",
        duration: 2000
      });
    }
  });
};

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
