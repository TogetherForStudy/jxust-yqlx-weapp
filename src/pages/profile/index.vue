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
      <view class="px-4 pt-4" :class="authStore.isLoggedIn ? 'pb-5' : 'pb-1'">
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
      <view class="bg-surface rounded-xl p-4 shadow-sm mb-4">
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
      <view v-if="authStore.isLoggedIn" class="bg-surface rounded-xl shadow-sm mb-4 overflow-hidden">
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
      <view class="bg-surface rounded-xl shadow-sm mb-4 overflow-hidden">
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
          class="px-4 py-3 text-base flex items-center justify-between active:bg-page"
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

    <!-- 用户等级弹窗 -->
    <view v-if="loginDaysModal" class="fixed inset-0 bg-overlay flex items-center justify-center z-50 px-6" @tap.self="loginDaysModal = false">
      <view class="bg-surface rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
        <!-- 顶部角色徽章区 -->
        <view class="flex flex-col items-center px-6 pt-6 pb-5">
          <view class="w-16 h-16 rounded-full flex items-center justify-center mb-3" :class="roleBadge.softClass">
            <text class="w-8 h-8" :class="[roleBadge.icon, roleBadge.iconClass]"></text>
          </view>
          <text class="text-lg font-semibold text-fg">{{ roleBadge.text }}</text>
          <text class="text-xs text-fg-muted mt-1 text-center leading-relaxed">{{ roleBadge.desc }}</text>
        </view>

        <!-- 登录进度区 -->
        <view class="px-6 pb-2">
          <view class="bg-page rounded-xl p-4">
            <view class="flex items-center justify-between mb-2">
              <text class="text-sm font-medium text-fg">活跃登录进度</text>
              <text class="text-sm font-semibold" :class="loginDaysData.loginDays >= 25 ? 'text-success' : 'text-brand'">
                {{ Math.min(loginDaysData.loginDays, 25) }}/25 天
              </text>
            </view>
            <view class="w-full bg-line rounded-full h-2 overflow-hidden">
              <view
                class="h-2 rounded-full transition-all duration-300"
                :class="loginDaysData.loginDays >= 25 ? 'bg-success' : 'bg-brand'"
                :style="{ width: Math.min(100, (loginDaysData.loginDays / 25) * 100) + '%' }"
              />
            </view>
            <view class="flex items-center gap-1.5 mt-2.5">
              <text class="w-3.5 h-3.5 shrink-0" :class="progressHint.icon + ' ' + progressHint.iconClass"></text>
              <text class="text-xs text-fg-muted leading-relaxed">{{ progressHint.text }}</text>
            </view>
          </view>
        </view>

        <!-- 等级体系说明 -->
        <view class="px-6 pt-3 pb-1">
          <text class="text-xs text-fg-subtle">等级标签</text>
          <view class="flex flex-wrap gap-1.5 mt-2">
            <text
              v-for="level in levelList"
              :key="level.key"
              class="px-2 py-0.5 rounded-full text-xs"
              :class="level.isCurrent ? level.class + ' font-medium' : 'bg-surface-muted text-fg-subtle'"
            >
              {{ level.text }}
            </text>
          </view>
        </view>

        <!-- 确认按钮 -->
        <view class="px-6 pt-4 pb-6">
          <view
            @tap="loginDaysModal = false"
            class="w-full text-center py-2.5 bg-brand text-white rounded-lg font-medium active:opacity-90 transition-opacity"
          >
            知道了
          </view>
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
  admin: { text: '管理员', class: 'bg-danger-soft text-danger', softClass: 'bg-danger-soft', iconClass: 'text-danger', icon: 'i-lucide-shield-check', desc: '平台管理员，拥有最高权限' },
  operator: { text: '运营', class: 'bg-purple-100 text-purple-600', softClass: 'bg-purple-100', iconClass: 'text-purple-600', icon: 'i-lucide-settings-2', desc: '负责平台内容与活动运营' },
  user_verified: { text: '认证用户', class: 'bg-success-soft text-success', softClass: 'bg-success-soft', iconClass: 'text-success', icon: 'i-lucide-badge-check', desc: '已完成身份认证的可信用户' },
  user_active: { text: '活跃用户', class: 'bg-brand-soft text-brand', softClass: 'bg-brand-soft', iconClass: 'text-brand', icon: 'i-lucide-flame', desc: '保持活跃登录的常驻用户' },
  user_basic: { text: '基本用户', class: 'bg-surface-muted text-fg-muted', softClass: 'bg-surface-muted', iconClass: 'text-fg-muted', icon: 'i-lucide-user', desc: '继续保持登录即可升级为活跃用户' }
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

// 当前角色对应的徽章信息（图标、配色、描述）
const currentRoleKey = computed(() => {
  const roleTags = userInfo.value?.role_tags || [];
  for (const tag of roleTagPriority) {
    if (roleTags.includes(tag)) return tag;
  }
  return 'user_basic';
});

const roleBadge = computed(() => roleTagMap[currentRoleKey.value]);

// 登录进度激励文案
const progressHint = computed(() => {
  const days = loginDaysData.value.loginDays;
  const past = loginDaysData.value.pastDays;
  if (days >= 25) {
    return {
      text: `已在过去 ${past} 天内登录满 25 天，达成活跃用户`,
      icon: 'i-lucide-check-circle-2',
      iconClass: 'text-success'
    };
  }
  return {
    text: `过去 ${past} 天内再登录 ${25 - days} 天即可成为活跃用户`,
    icon: 'i-lucide-target',
    iconClass: 'text-brand'
  };
});

// 等级标签列表（高亮当前等级）
const levelList = computed(() => {
  return roleTagPriority.map(key => ({
    key,
    text: roleTagMap[key].text,
    class: roleTagMap[key].class,
    isCurrent: key === currentRoleKey.value
  }));
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
