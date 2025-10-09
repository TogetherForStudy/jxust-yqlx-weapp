<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 加载状态 -->
    <view v-if="loading" class="flex items-center justify-center pt-20">
      <text class="text-gray-500 text-sm">加载中...</text>
    </view>

    <!-- 群聊卡片列表 -->
    <view v-else-if="groupChatList.length > 0" class="p-4 space-y-4">
      <view
        v-for="(card, cardIndex) in groupChatList"
        :key="cardIndex"
        class="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <!-- 卡片头部 -->
        <view class="px-4 py-3 border-b border-gray-100">
          <text class="text-lg font-semibold text-gray-800">{{ card.card }}</text>
          <text class="text-sm text-gray-600 mt-1 block">{{ card.desc }}</text>
        </view>

        <!-- 群组列表 -->
        <view class="divide-y divide-gray-100">
          <view
            v-for="(group, groupIndex) in card.list"
            :key="groupIndex"
            class="px-4 py-3 flex items-center justify-between"
          >
            <!-- 群组信息 -->
            <view class="flex-1 min-w-0">
              <text class="text-base text-gray-800 font-medium">{{ group.name }}</text>
              <text class="text-sm text-gray-500 mt-1 block">群号: {{ group.id }}</text>
            </view>

            <!-- 复制按钮或申请加入按钮 -->
            <view
              v-if="group.name === '江理一起来学0群'"
              @tap="applyToJoinGroup(group.name)"
              class="ml-4 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium active:bg-green-100 transition-colors"
            >
              申请加入
            </view>
            <view
              v-else
              @tap="copyGroupId(group.id, group.name)"
              class="ml-4 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium active:bg-blue-100 transition-colors"
            >
              复制群号
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="flex items-center justify-center pt-20">
      <view class="text-center">
        <text class="block mx-auto mb-4 i-lucide-message-circle w-12 h-12 text-gray-300"></text>
        <text class="text-gray-500 mb-2 block">暂无群聊推荐</text>
        <text class="text-sm text-gray-400">请联系管理员添加群聊配置</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Taro from "@tarojs/taro";
import { configAPI } from "../../api/index";

// 响应式数据
const groupChatList = ref([]);
const loading = ref(true);

// 获取群聊配置数据
const loadGroupChatConfig = async () => {
  try {
    loading.value = true;
    const result = await configAPI.getConfig('GROUPCHAT');

    if (result && result.value) {
      // 解析JSON配置
      const parsedConfig = typeof result.value === 'string'
        ? JSON.parse(result.value)
        : result.value;

      groupChatList.value = Array.isArray(parsedConfig) ? parsedConfig : [];
    } else {
      groupChatList.value = [];
    }
  } catch (error) {
    console.error("获取群聊配置失败:", error);
    groupChatList.value = [];
    Taro.showToast({
      title: "加载失败",
      icon: "error",
    });
  } finally {
    loading.value = false;
  }
};

// 复制群号功能
const copyGroupId = async (groupId, groupName) => {
  try {
    await Taro.setClipboardData({
      data: groupId,
    });

    Taro.showToast({
      title: `${groupName} 群号已复制`,
      icon: "success",
      duration: 2000
    });
  } catch (error) {
    console.error("复制失败:", error);
    Taro.showToast({
      title: "复制失败",
      icon: "error",
    });
  }
};

// 申请加入群聊功能
const applyToJoinGroup = async (groupName) => {
  Taro.navigateTo({ url: '/pages/webview/index?url=https://mp.weixin.qq.com/s/fF_auQJmFd_2yg8uTNGrkA'})
};

// 页面生命周期
onMounted(() => {
  loadGroupChatConfig();
});
</script>
