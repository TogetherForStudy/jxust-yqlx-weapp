<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 用户信息头部 -->
    <view class="bg-gradient-to-br from-blue-500 to-indigo-600 pt-8 pb-8">
      <view v-if="!authStore.isLoggedIn" class="text-center px-4">
        <text class="text-white text-lg font-medium block mb-1">未登录</text>
      </view>

      <view v-else class="text-center px-4">
        <text class="text-white text-lg font-medium block mb-1">
          {{ userInfo?.nickname || "微信用户" }}
        </text>
      </view>
    </view>

    <!-- 个人信息卡片 -->
    <view v-if="authStore.isLoggedIn" class="px-4 -mt-6">
      <view class="bg-white rounded-xl p-4 shadow-sm mb-6">
        <view class="space-y-3">
          <view class="flex justify-between items-center">
            <text class="text-gray-600">班级</text>
            <text class="text-gray-800">{{ userInfo?.class_id || "无" }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="p-4">
      <!-- 我的功能 -->
      <view class="bg-white rounded-xl mb-4 overflow-hidden">
        <view
          class="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
        >
          <button class="flex items-center space-x-3 w-full h-full leading-normal text-base text-ms p-0 after:border-none bg-white hover:bg-gray-50" open-type="contact">
            <text class="i-lucide-phone"></text>
            <text class="text-gray-800">联系客服</text>
          </button>
          <text class="i-lucide-chevron-right text-gray-400"></text>
        </view>

        <view
          class="px-4 py-3 border-b border-gray-100 text-base flex items-center justify-between active:bg-gray-50"
          @tap="goToTermsOfService"
        >
          <view class="flex items-center space-x-3">
            <text class="i-lucide-file-text"></text>
            <text class="text-gray-800">使用条款</text>
          </view>
          <text class="i-lucide-chevron-right text-gray-400"></text>
        </view>
      </view>

      <!-- 管理员功能 -->
      <view
        v-if="authStore.isAdmin"
        class="bg-white rounded-xl mb-4 overflow-hidden"
      >
        <view
          class="px-4 py-3 border-b border-gray-100 text-base flex items-center justify-between active:bg-gray-50"
          @tap="goToReviewManagement"
        >
          <view class="flex items-center space-x-3">
            <text class="i-lucide-star"></text>
            <text class="text-gray-800">评价管理</text>
          </view>
          <text class="i-lucide-chevron-right text-gray-400"></text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view
        v-if="authStore.isLoggedIn"
        @tap="handleLogout"
        class="w-full mx-auto text-center bg-gray-100 text-base text-red-500 border border-gray-100 rounded-md p-2"
      >
        退出登录
      </view>

      <view
        v-else
        @tap="goToLogin"
        class="w-full mx-auto text-center bg-gray-100 text-base text-blue-500 border border-gray-100 rounded-md p-2"
      >
        登录
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="absolute bottom-0 left-0 right-0 p-4">
      <view class="flex flex-col gap-1 justify-center items-center">
        <text class="text-xs text-gray-400"> 江理一起来学开源项目 </text>
        <text class="text-xs text-gray-400">
          TogetherForStudy/jxust-yqlx-weapp
        </text>
        <text class="text-xs text-gray-400">
          TogetherForStudy/jxust-yqlx-server
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import Taro from "@tarojs/taro";

const authStore = useAuthStore();

// 计算属性
const userInfo = computed(() => authStore.userInfo);

// 方法
const goToLogin = () => {
  Taro.navigateTo({ url: "/pages/login/index" });
};

const goToReviewManagement = () => {
  Taro.navigateTo({ url: "/pages/admin/teacher-reviews/index" });
};

const handleLogout = () => {
  Taro.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        authStore.logout();
      }
    },
  });
};

const goToTermsOfService = () => {
  Taro.navigateTo({ url: "/pages/terms-of-service/index" });
};

// 页面生命周期
onMounted(() => {
  // 页面初始化时不需要自动打开编辑资料弹窗
});
</script>

<style scoped>

</style>
