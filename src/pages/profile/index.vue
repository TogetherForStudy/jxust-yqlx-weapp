<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <page-meta
    :page-style="themeStore.pageStyle"
    :background-color="themeStore.nativeTheme.pageBg"
    :background-text-style="themeStore.nativeTheme.backgroundTextStyle"
  />
  <view class="min-h-screen bg-page flex flex-col justify-between text-fg" :class="[themeStore.rootClass]">
    <!-- 主要内容区域 -->
    <view>
      <!-- 用户信息头部 -->
      <view class="px-4 pt-10 pb-5">
        <view class="flex items-center gap-3">
          <view class="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center shrink-0">
            <text class="i-lucide-user text-fg-subtle w-6 h-6"></text>
          </view>
          <view v-if="!authStore.isLoggedIn" class="min-w-0">
            <text class="text-fg text-xl font-semibold block truncate">未登录</text>
            <text class="text-fg-subtle text-sm">登录后查看更多</text>
          </view>
          <view v-else class="min-w-0">
            <text class="text-fg text-xl font-semibold block truncate">
              {{ userInfo?.nickname || "江理一起来学" }}
            </text>
          </view>
        </view>
      </view>

    <!-- 个人信息卡片 -->
    <view v-if="authStore.isLoggedIn" class="px-4">
      <view class="bg-surface rounded-xl p-4 shadow-sm mb-4 border border-line">
        <view class="space-y-3">
          <view class="flex justify-between items-center">
              <text class="text-fg-muted">账号</text>
            <view class="flex items-center">
              <text class="px-2 py-0.5 rounded-full text-xs" :class="roleTagClass" @tap="showLoginDaysProgress">{{ roleTagText }}</text>
              <text class="pl-2 text-fg" :user-select="true">{{ userInfo?.id || "无" }}</text>
            </view>
          </view>
          <view class="flex justify-between items-center">
            <text class="text-fg-muted">班级</text>
            <text class="text-fg" :user-select="true">{{ userInfo?.class_id || "无" }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="px-4" :class="authStore.isLoggedIn ? '' : 'mt-4'">
      <!-- 我的积分 -->
      <view v-if="authStore.isLoggedIn" class="bg-surface rounded-xl mb-4 overflow-hidden">
        <view
          class="px-4 py-3 text-base flex items-center justify-between active:bg-page"
          @tap="goToMyPoints"
        >
          <view class="flex items-center space-x-3">
            <text class="i-lucide-coins"></text>
            <text class="text-fg">我的积分</text>
          </view>
          <view class="flex items-center space-x-2">
            <text v-if="!pointsLoaded && pointsLoadFailed" class="i-lucide-triangle-alert text-fg-subtle"></text>
            <text v-else-if="!pointsLoaded" class="i-lucide-loader-circle text-fg-subtle animate-spin"></text>
            <text v-else class="text-fg-muted">{{ userPoints }}</text>
            <text class="i-lucide-chevron-right text-fg-subtle"></text>
          </view>
        </view>
      </view>

      <!-- 我的功能 -->
      <view class="bg-surface rounded-xl mb-4 overflow-hidden">
        <view
          class="px-4 py-3 border-b border-line flex items-center justify-between"
        >
          <button class="flex items-center space-x-3 w-full h-full leading-normal text-base text-ms p-0 after:border-none bg-surface hover:bg-page" open-type="contact">
            <text class="i-lucide-user"></text>
            <text class="text-fg">客服反馈</text>
          </button>
          <text class="i-lucide-chevron-right text-fg-subtle"></text>
        </view>

        <view
          class="px-4 py-3 border-b border-line text-base flex items-center justify-between active:bg-page"
          @tap="goToTermsOfService"
        >
          <view class="flex items-center space-x-3">
            <text class="i-lucide-file-text"></text>
            <text class="text-fg">使用条款</text>
          </view>
          <text class="i-lucide-chevron-right text-fg-subtle"></text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view
        v-if="authStore.isLoggedIn"
        @tap="handleLogout"
        class="w-full mx-auto text-center bg-surface-muted text-base text-danger border border-line rounded-md p-2"
      >
        退出登录
      </view>

      <view
        v-else
        @tap="goToLogin"
        class="w-full mx-auto text-center bg-surface-muted text-base text-brand border border-line rounded-md p-2"
      >
        登录
      </view>
    </view>
    </view>
    <!-- 主要内容区域结束 -->

    <!-- 底部开源项目信息 -->
    <view class="p-4 mt-4">
      <view class="flex flex-col gap-1 justify-center items-center">
        <text class="text-xs text-fg-subtle"> 江理一起来学开源项目 </text>
        <text class="text-xs text-fg-subtle">
          TogetherForStudy/jxust-yqlx-weapp
        </text>
        <text class="text-xs text-fg-subtle">
          TogetherForStudy/jxust-yqlx-server
        </text>
      </view>
    </view>

    <!-- 活跃用户进度弹窗 -->
    <view v-if="loginDaysModal" class="fixed inset-0 bg-overlay flex items-center justify-center z-50" @tap.self="loginDaysModal = false">
      <view class="bg-surface rounded-2xl p-6 mx-6 w-full max-w-sm">
        <view class="text-center mb-4">
          <text class="text-lg font-semibold text-fg">用户等级</text>
        </view>

        <!-- 进度条 -->
        <view class="mb-3">
          <view class="flex justify-between text-xs text-fg-muted mb-1">
            <text>登录天数</text>
            <text>{{ loginDaysData.loginDays }}/25</text>
          </view>
          <view class="w-full bg-line rounded-full h-2.5">
            <view
              class="h-2.5 rounded-full"
              :class="loginDaysData.loginDays >= 25 ? 'bg-success' : 'bg-brand'"
              :style="{ width: Math.min(100, (loginDaysData.loginDays / 25) * 100) + '%' }"
            />
          </view>
        </view>

        <!-- 说明信息 -->
        <view class="bg-page rounded-lg p-3 mb-4 space-y-1">
          <view class="flex justify-between text-sm">
            <text class="text-fg-muted">当前等级</text>
            <text class="text-sm">{{ roleTagText }}</text>
          </view>
          <view v-if="!isAtLeastActive" class="flex justify-between text-sm">
            <text class="text-fg-muted">下一等级</text>
            <text class="text-sm text-brand">{{ roleTagMap.user_active.text }}</text>
          </view>
          <view class="flex justify-between text-sm">
            <text class="text-fg-muted">达成条件</text>
            <text class="text-fg">过去 {{ loginDaysData.pastDays }} 天内登录 25 天</text>
          </view>
        </view>

        <!-- 确认按钮 -->
        <view
          @tap="loginDaysModal = false"
          class="w-full text-center py-2.5 bg-brand text-white rounded-lg font-medium"
        >
          知道了
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useThemePage } from '../../composables/useThemePage'
import { ref, computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import Taro from "@tarojs/taro";
import { courseTableAPI, pointsAPI, userAPI } from "../../api/index";

const themeStore = useThemePage()

const authStore = useAuthStore();
const userPoints = ref(0);
const pointsLoaded = ref(false);
const pointsLoadFailed = ref(false);
const loginDaysModal = ref(false);
const loginDaysData = ref({ loginDays: 0, pastDays: 100 });

// 计算属性
const userInfo = computed(() => authStore.userInfo);

// 角色标签映射：优先级 admin > operator > user_verified > user_active > user_basic
const roleTagMap = {
  admin: { text: '管理员', class: 'bg-danger-soft text-danger' },
  operator: { text: '运营', class: 'bg-purple-100 text-purple-600' },
  user_verified: { text: '认证用户', class: 'bg-success-soft text-success' },
  user_active: { text: '活跃用户', class: 'bg-brand-soft text-brand' },
  user_basic: { text: '基本用户', class: 'bg-surface-muted text-fg-muted' }
};

const roleTagPriority = ['admin', 'operator', 'user_verified', 'user_active', 'user_basic'];

const roleTagText = computed(() => {
  const roleTags = userInfo.value?.role_tags || [];
  for (const tag of roleTagPriority) {
    if (roleTags.includes(tag)) {
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

const isAtLeastActive = computed(() => {
  const roleTags = userInfo.value?.role_tags || [];
  return ['admin', 'operator', 'user_verified', 'user_active'].some(tag => roleTags.includes(tag));
});

// 方法
const goToLogin = () => {
  Taro.navigateTo({ url: "/pages/login/index" });
};

const goToMyPoints = () => {
  Taro.navigateTo({ url: "/pages/points/index" });
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

// 显示登录活跃度进度
const showLoginDaysProgress = async () => {
  try {
    const res = await userAPI.getLoginDays()

    loginDaysData.value = {
      loginDays: res.login_days || 0,
      pastDays: res.past_days || 100
    }
    loginDaysModal.value = true
  } catch (error) {

  }
};


// 获取用户积分
const fetchUserPoints = async () => {
  if (!authStore.isLoggedIn) {
    userPoints.value = 0;
    pointsLoaded.value = false;
    pointsLoadFailed.value = false;
    return;
  }
  try {
    const res = await pointsAPI.getPoints();
    userPoints.value = res.points || 0;
    pointsLoaded.value = true;
    pointsLoadFailed.value = false;
  } catch (error) {
    console.error("获取积分失败:", error);
    if (!pointsLoaded.value) {
      pointsLoadFailed.value = true;
    }
  }
};

// 每次页面显示时刷新积分（tab 页面切换不会触发 onMounted，需用 useDidShow）
Taro.useDidShow(() => {
  fetchUserPoints();
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
