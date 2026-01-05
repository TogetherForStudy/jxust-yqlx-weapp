<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 用户信息头部 -->
    <view class="bg-gradient-to-br from-blue-500 to-indigo-600 pt-8 pb-8">
      <view v-if="!authStore.isLoggedIn" class="text-center px-4">
        <text class="text-white text-lg font-medium block mb-1">未登录</text>
      </view>

      <view v-else class="text-center px-4">
        <text class="text-white text-lg font-medium block mb-1">
          {{ userInfo?.nickname || "江理一起来学" }}
        </text>
      </view>
    </view>

    <!-- 个人信息卡片 -->
    <view v-if="authStore.isLoggedIn" class="px-4 -mt-6">
      <view class="bg-white rounded-xl p-4 shadow-sm mb-4">
        <view class="space-y-3">
          <view class="flex justify-between items-center">
              <text class="text-gray-600">账号</text>
            <view class="flex items-center">
              <text class="px-2 py-0.5 rounded-full text-xs" :class="roleTagClass">{{ roleTagText }}</text>
              <text class="pl-2 text-gray-800" :selectable="true">{{ userInfo?.id || "无" }}</text>
            </view>
          </view>
          <view class="flex justify-between items-center">
            <text class="text-gray-600">班级</text>
            <text class="text-gray-800" :selectable="true">{{ userInfo?.class_id || "无" }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="px-4" :class="authStore.isLoggedIn ? '' : 'mt-4'">
      <!-- 我的积分 -->
      <view v-if="authStore.isLoggedIn" class="bg-white rounded-xl mb-4 overflow-hidden">
        <view
          class="px-4 py-3 text-base flex items-center justify-between active:bg-gray-50"
          @tap="goToMyPoints"
        >
          <view class="flex items-center space-x-3">
            <text class="i-lucide-coins"></text>
            <text class="text-gray-800">我的积分</text>
          </view>
          <view class="flex items-center space-x-2">
            <text class="text-gray-600">{{ userPoints }}</text>
            <text class="i-lucide-chevron-right text-gray-400"></text>
          </view>
        </view>
      </view>

      <!-- 我的功能 -->
      <view class="bg-white rounded-xl mb-4 overflow-hidden">
        <view
          class="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
        >
          <button class="flex items-center space-x-3 w-full h-full leading-normal text-base text-ms p-0 after:border-none bg-white hover:bg-gray-50" open-type="contact">
            <text class="i-lucide-user"></text>
            <text class="text-gray-800">客服反馈</text>
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
        <view class="grid grid-cols-4 divide-x divide-gray-100">
          <view
            class="px-4 py-3 text-base flex flex-col items-center justify-center active:bg-gray-50"
            @tap="goToReviewManagement"
          >
            <text class="i-lucide-star mb-1"></text>
            <text class="text-xs text-gray-800 text-center">评价管理</text>
          </view>

          <view
            class="px-4 py-3 text-base flex flex-col items-center justify-center active:bg-gray-50"
            @tap="goToHeroManagement"
          >
            <text class="i-lucide-trophy mb-1"></text>
            <text class="text-xs text-gray-800 text-center">英雄管理</text>
          </view>

          <view
            class="px-4 py-3 text-base flex flex-col items-center justify-center active:bg-gray-50"
            @tap="goToConfigManagement"
          >
            <text class="i-lucide-settings mb-1"></text>
            <text class="text-xs text-gray-800 text-center">配置管理</text>
          </view>

          <view
            class="px-4 py-3 text-base flex flex-col items-center justify-center active:bg-gray-50"
            @tap="goToRbacManagement"
          >
            <text class="i-lucide-shield mb-1"></text>
            <text class="text-xs text-gray-800 text-center">权限管理</text>
          </view>
        </view>
        <view class="grid grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
          <view
            class="px-4 py-3 text-base flex flex-col items-center justify-center active:bg-gray-50"
            @tap="goToResetBindCount"
          >
            <text class="i-lucide-refresh-ccw mb-1"></text>
            <text class="text-xs text-gray-800 text-center">重置绑定</text>
          </view>

          <view
            class="px-4 py-3 text-base flex flex-col items-center justify-center active:bg-gray-50"
            @tap="goToPointsManagement"
          >
            <text class="i-lucide-coins mb-1"></text>
            <text class="text-xs text-gray-800 text-center">积分管理</text>
          </view>
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
import { courseTableAPI, pointsAPI } from "../../api/index";

const authStore = useAuthStore();
const userPoints = ref(0);

// 计算属性
const userInfo = computed(() => authStore.userInfo);

// 角色标签映射：优先级 admin > operator > user_verified > user_active > user_basic
const roleTagMap = {
  admin: { text: '管理员', class: 'bg-red-100 text-red-600' },
  operator: { text: '运营', class: 'bg-purple-100 text-purple-600' },
  user_verified: { text: '认证用户', class: 'bg-green-100 text-green-600' },
  user_active: { text: '活跃用户', class: 'bg-blue-100 text-blue-600' },
  user_basic: { text: '基本用户', class: 'bg-gray-100 text-gray-600' }
};

const roleTagPriority = ['admin', 'operator', 'user_verified', 'user_active', 'user_basic'];

const roleTagText = computed(() => {
  const roleTags = userInfo.value?.role_tags || [];
  for (const tag of roleTagPriority) {
    if (roleTags.includes(tag)) {
      console.log(roleTagMap[tag].text);
      return roleTagMap[tag].text;
    }
  }
  return '基本用户';
});

const roleTagClass = computed(() => {
  const roleTags = userInfo.value?.role_tags || [];
  for (const tag of roleTagPriority) {
    if (roleTags.includes(tag)) {
      return roleTagMap[tag].class;
    }
  }
  return roleTagMap.user_basic.class;
});

// 方法
const goToLogin = () => {
  Taro.navigateTo({ url: "/pages/login/index" });
};

const goToMyPoints = () => {
  Taro.navigateTo({ url: "/pages/points/index" });
};

const goToReviewManagement = () => {
  Taro.navigateTo({ url: "/pages/admin/teacher-reviews/index" });
};

const goToHeroManagement = () => {
  Taro.navigateTo({ url: "/pages/admin/heroes/index" });
};

const goToConfigManagement = () => {
  Taro.navigateTo({ url: "/pages/admin/config/index" });
};

const goToRbacManagement = () => {
  Taro.navigateTo({ url: "/pages/admin/rbac/index" });
};

const goToPointsManagement = () => {
  Taro.navigateTo({ url: "/pages/admin/points/index" });
};

const goToResetBindCount = () => {
  Taro.showModal({
    title: "重置绑定",
    editable: true,
    placeholderText: "用户ID",
    success: (res) => {
      if (res.confirm && res.content && res.content.trim() !== "") {
        const userId = res.content.trim();
        // 延迟执行，避免与modal关闭冲突
        setTimeout(async () => {
          // 显示加载中
          Taro.showLoading({
            title: "处理中...",
            mask: true
          });

          try {
            await courseTableAPI.resetBindCount(userId);
            Taro.hideLoading();
            // 使用modal显示结果，避免toast冲突
            Taro.showModal({
              title: "操作成功",
              content: "重置绑定成功！",
              showCancel: false,
              confirmText: "确定"
            });
          } catch (error) {
            Taro.hideLoading();
            // 使用modal显示错误，避免toast冲突
            Taro.showModal({
              title: "操作失败",
              content: error.message || "重置绑定失败，请重试",
              showCancel: false,
              confirmText: "确定"
            });
          }
        }, 300);
      }
    },
  });
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


// 获取用户积分
const fetchUserPoints = async () => {
  if (!authStore.isLoggedIn) return;
  try {
    const res = await pointsAPI.getPoints();
    userPoints.value = res.points || 0;
  } catch (error) {
    console.error("获取积分失败:", error);
  }
};

// 页面生命周期
onMounted(async () => {
  // 页面初始化时不需要自动打开编辑资料弹窗
  if (authStore.isLoggedIn) {
    await fetchUserPoints();
  }
});

Taro.useShareAppMessage((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学小程序',
      path: '/pages/home/index',
    }
  })

Taro.useShareTimeline((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学小程序',
      path: '/pages/home/index',
    }
  })
</script>

<style scoped>

</style>
