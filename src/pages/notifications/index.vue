<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <!-- 头部筛选栏 -->
    <view class="bg-white px-4 py-3 border-b border-gray-100">
      <view class="flex items-center justify-between">
        <!-- 分类筛选 -->
        <view class="flex items-center space-x-2 flex-1 w-[1px]">
          <scroll-view :scroll-x="true" class="w-full">
            <view class="flex space-x-2 pb-1 pr-4">
              <view class="px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors" :class="selectedCategories.length === 0
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
                " @tap="clearCategoryFilter">
                全部
              </view>
              <view v-for="category in categories" :key="category.id"
                class="px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors" :class="selectedCategories.includes(category.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
                  " @tap="toggleCategory(category.id)">
                {{ category.name }}
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 搜索图标 -->
        <view class="ml-3">
          <text class="i-lucide-search text-gray-500 w-5 h-5" @tap="showSearchBar = !showSearchBar"></text>
        </view>
      </view>

      <!-- 搜索栏 -->
      <view v-if="showSearchBar" class="mt-3">
        <view class="relative">
          <input v-model="searchKeyword" placeholder="搜索信息标题..."
            class="w-full px-3 h-10 pr-8 bg-gray-50 rounded-lg text-sm box-border" @input="onSearchInput" />
          <text class="absolute right-2 top-1/2 transform -translate-y-1/2 i-lucide-x text-gray-400 w-4 h-4"
            @tap="clearSearch"></text>
        </view>
      </view>
    </view>

    <!-- 管理员功能区 -->
    <view v-if="isAdmin || isOperator" class="mx-4 mt-4">
      <view class="grid grid-cols-4 gap-2">
        <!-- 创建通知 -->
        <view class="bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg p-1 active:scale-95 transition-transform"
          @tap="goToCreateNotification">
          <view class="flex items-center justify-center">
            <text class="i-lucide-plus text-white w-5 h-5 mr-2"></text>
            <text class="text-white font-medium text-sm">创建</text>
          </view>
        </view>

        <!-- 管理通知 -->
        <view
          class="bg-gradient-to-br from-purple-300 to-purple-400 rounded-lg p-1 active:scale-95 transition-transform"
          @tap="goToManageNotifications">
          <view class="flex items-center justify-center">
            <text class="i-lucide-settings text-white w-5 h-5 mr-2"></text>
            <text class="text-white font-medium text-sm">管理</text>
          </view>
        </view>

        <!-- 审核投稿 -->
        <view v-if="isAdmin || isOperator"
          class="relative bg-gradient-to-br from-green-300 to-green-400 rounded-lg p-1 active:scale-95 transition-transform"
          @tap="goToReviewContributions">
          <view class="flex items-center justify-center">
            <text class="i-lucide-check-circle text-white w-5 h-5 mr-2"></text>
            <text class="text-white font-medium text-sm">审核</text>
          </view>
          <view v-if="pendingContributionsCount > 0" class="absolute -top-1 -right-1">
            <view class="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ pendingContributionsCount }}
            </view>
          </view>
        </view>

        <!-- 分类管理 -->
        <view v-if="isAdmin"
          class="bg-gradient-to-br from-orange-300 to-orange-400 rounded-lg p-1 active:scale-95 transition-transform"
          @tap="goToManageCategories">
          <view class="flex items-center justify-center">
            <text class="i-lucide-tag text-white w-5 h-5 mr-2"></text>
            <text class="text-white font-medium text-sm">分类</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 通知列表 -->
    <view class="p-4 flex-1 h-[1px]">
      <!-- 加载状态 -->
      <view v-if="notificationStore.isLoading && notifications.length === 0">
        <view class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <view class="flex items-center justify-center">
            <text class="text-gray-500 text-sm">加载中...</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="notifications.length === 0">
        <view class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <view class="flex flex-col items-center justify-center">
            <text class="i-lucide-bell-off text-gray-300 text-4xl mb-2"></text>
            <text class="text-gray-500 text-sm">暂无信息</text>
          </view>
        </view>
      </view>

      <!-- 通知卡片列表 -->
      <scroll-view v-else :scroll-y="true" class="h-full" @scrolltolower="loadMore" :lower-threshold="100">
        <!-- 用户投稿区 -->
        <view v-if="authStore.isLoggedIn && authStore.userInfo.role === 1" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <view class="flex justify-between items-center mb-3">
            <text class="text-gray-800 font-medium">贡献信息差</text>
            <text class="text-blue-500 text-sm" @tap="goToMyContributions">
              查看全部
            </text>
          </view>

          <view class="flex space-x-3">
            <!-- 投稿统计 -->
            <view class="flex-1 bg-gray-50 rounded-lg p-1">
              <view class="text-center">
                <text class="text-lg font-bold text-gray-800">{{
                  contributionStats.total_count
                  }}</text>
                <text class="text-xs text-gray-500 block">总投稿数</text>
              </view>
            </view>

            <view class="flex-1 bg-gray-50 rounded-lg p-1">
              <view class="text-center">
                <text class="text-lg font-bold text-green-600">{{
                  contributionStats.approved_count
                  }}</text>
                <text class="text-xs text-gray-500 block">已采纳</text>
              </view>
            </view>

            <!-- 创建投稿 -->
            <view
              class="flex-1 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg p-1 active:scale-95 transition-transform flex items-center justify-center"
              @tap="goToCreateContribution">
              <view class="flex items-center justify-center">
                <text class="i-lucide-edit text-white w-5 h-5 mr-2"></text>
                <text class="text-white font-medium text-sm">投稿</text>
              </view>
            </view>
          </view>
        </view>

        <view class="space-y-3">
          <view v-for="notification in notifications" :key="notification.id"
            class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-98 transition-transform"
            @tap="goToNotificationDetail(notification)">
            <!-- 通知头部 -->
            <view class="flex justify-between items-start mb-2">
              <view class="flex-1 pr-2">
                <view class="flex items-center">
                  <!-- 置顶标识 -->
                  <view v-if="notification.is_pinned" class="flex items-center justify-center w-5 h-5 bg-white rounded-full mr-2 shrink-0">
                    <text class="i-lucide-pin text-red-500 w-3.5 h-3.5"></text>
                  </view>
                  <text class="text-gray-800 font-medium text-base leading-tight">
                    {{ notification.title }}
                  </text>
                  <!-- 日程图标 -->
                  <text v-if="hasScheduleData(notification)"
                    class="i-lucide-calendar text-blue-500 mx-2 shrink-0 text-sm"></text>
                </view>
              </view>
            </view>
            <!-- 通知底部信息 -->
            <view class="flex justify-between items-center">
              <view class="flex items-center space-x-3">
                <!-- 分类标签 -->
                <view v-if="
                  notification.categories &&
                  notification.categories.length > 0
                " class="flex space-x-1">
                  <view v-for="category in notification.categories.slice(0, 2)" :key="category.id"
                    class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                    {{ category.name }}
                  </view>
                </view>
              </view>

              <view class="flex items-center space-x-3">
                <!-- 浏览量 -->
                <view class="flex items-center">
                  <text class="i-lucide-eye text-gray-400 w-3 h-3 mr-1"></text>
                  <text class="text-gray-500 text-xs">{{
                    notification.view_count || 0
                  }}</text>
                </view>

                <!-- 发布时间 -->
                <text class="text-gray-400 text-xs">
                  {{
                    formatDate(
                      notification.published_at || notification.created_at
                    )
                  }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多指示器 -->
        <view v-if="notificationStore.isLoading || notificationStore.hasMore" class="text-center py-4">
          <text v-if="notificationStore.isLoading" class="text-gray-500 text-sm">加载中...</text>
          <text v-else-if="!notificationStore.hasMore && notifications.length > 0"
            class="text-gray-400 text-sm">已加载全部</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Taro, { useDidShow } from "@tarojs/taro";
import { useNotificationStore } from "../../stores/notifications";
import { useAuthStore } from "../../stores/auth";
import { formatDateTime } from "../../utils/time";

const notificationStore = useNotificationStore();
const authStore = useAuthStore();

// 响应式数据
const showSearchBar = ref(false);
const searchKeyword = ref("");
const selectedCategories = ref([]);
const searchTimer = ref(null);
const isFirstLoad = ref(true); // 标志位，用于控制首次加载

// 计算属性
const notifications = computed(() => notificationStore.notifications);
const categories = computed(() => notificationStore.categories);
const contributionStats = computed(() => notificationStore.contributionStats);
const isAdmin = computed(() => authStore.isAdmin);
const isOperator = computed(() => authStore.userInfo?.role === 3); // 假设运营角色为3
const pendingContributionsCount = computed(() => {
  return notificationStore.contributions.filter((item) => item.status === 1)
    .length;
});

// 页面初始化
onMounted(async () => {
  await initPage();
  isFirstLoad.value = false; // 标记首次加载完成
});

// 页面显示时刷新数据
useDidShow(async () => {
  // 只在非首次加载时刷新数据，避免与 onMounted 冲突
  if (!isFirstLoad.value) {
    await refreshPageData();
  }
});

// 初始化页面数据
const initPage = async () => {
  try {
    // 获取通知分类
    await notificationStore.fetchCategories();

    // 获取通知列表
    await notificationStore.fetchNotifications({ page: 1 });

    // 如果用户已登录，获取投稿统计
    if (authStore.isLoggedIn) {
      await notificationStore.fetchContributionStats();
    }

    // 如果是管理员，获取待审核投稿数量
    if (isAdmin.value) {
      await notificationStore.fetchContributions({
        status: 1,
        page: 1,
        size: 100,
      });
    }
  } catch (error) {
    console.error("初始化页面失败:", error);
    Taro.showToast({
      title: "加载失败",
      icon: "error",
    });
  }
};

// 刷新页面数据（用于页面显示时自动刷新）
const refreshPageData = async () => {
  try {
    // 应用当前的筛选条件重新获取通知列表
    const filters = {
      categories: selectedCategories.value,
      keyword: searchKeyword.value.trim(),
    };

    // 设置筛选条件并获取通知列表
    notificationStore.setFilters(filters);
    await notificationStore.fetchNotifications({ page: 1 });

    // 如果用户已登录，刷新投稿统计
    if (authStore.isLoggedIn) {
      await notificationStore.fetchContributionStats();
    }

    // 如果是管理员，刷新待审核投稿数量
    if (isAdmin.value) {
      await notificationStore.fetchContributions({
        status: 1,
        page: 1,
        size: 100,
      });
    }
  } catch (error) {
    console.error("刷新页面数据失败:", error);
    // 静默失败，不显示错误提示，避免影响用户体验
  }
};

// 分类筛选
const toggleCategory = (categoryId) => {
  const index = selectedCategories.value.indexOf(categoryId);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  } else {
    selectedCategories.value.push(categoryId);
  }

  applyFilters();
};

const clearCategoryFilter = () => {
  selectedCategories.value = [];
  applyFilters();
};

// 搜索
const onSearchInput = () => {
  clearTimeout(searchTimer.value);
  searchTimer.value = setTimeout(() => {
    applyFilters();
  }, 500);
};

const clearSearch = () => {
  searchKeyword.value = "";
  showSearchBar.value = false;
  applyFilters();
};

// 应用筛选条件
const applyFilters = async () => {
  const filters = {
    categories: selectedCategories.value,
    keyword: searchKeyword.value.trim(),
  };

  notificationStore.setFilters(filters);
  await notificationStore.fetchNotifications({ page: 1 });
};

// 加载更多
const loadMore = async () => {
  if (notificationStore.isLoading || !notificationStore.hasMore) return;

  await notificationStore.fetchNotifications({
    page: notificationStore.notificationCurrentPage + 1,
  });
};

// 页面跳转
const goToNotificationDetail = (notification) => {
  // 准备预加载数据（只包含基础信息，减少URL长度）
  const preloadData = {
    id: notification.id,
    title: notification.title,
    content: notification.content || "",
    categories: notification.categories || [],
    view_count: notification.view_count || 0,
    created_at: notification.created_at,
    published_at: notification.published_at,
    publisher: notification.publisher,
    schedule: notification.schedule,
  };

  // 将预加载数据编码到URL中
  const encodedData = encodeURIComponent(JSON.stringify(preloadData));

  Taro.navigateTo({
    url: `/pages/notifications/detail/index?id=${notification.id}&preloadData=${encodedData}`,
  });
};

const goToCreateNotification = () => {
  if (!authStore.requireAuth()) return;

  Taro.navigateTo({
    url: "/pages/notifications/create/index",
  });
};

const goToManageNotifications = () => {
  if (!authStore.requireAuth()) return;

  Taro.navigateTo({
    url: "/pages/notifications/manage/index",
  });
};

const goToReviewContributions = () => {
  if (!authStore.requireAuth()) return;

  Taro.navigateTo({
    url: "/pages/contributions/review/index",
  });
};

const goToManageCategories = () => {
  if (!authStore.requireAuth()) return;

  Taro.navigateTo({
    url: "/pages/notifications/categories/index",
  });
};

const goToCreateContribution = () => {
  if (!authStore.requireAuth()) return;

  Taro.navigateTo({
    url: "/pages/contributions/create/index",
  });
};

const goToMyContributions = () => {
  if (!authStore.requireAuth()) return;

  Taro.navigateTo({
    url: "/pages/contributions/mine/index",
  });
};

// 工具函数
const getStatusClass = (status) => {
  switch (status) {
    case 1:
      return "bg-gray-100 text-gray-600"; // 草稿
    case 2:
      return "bg-yellow-100 text-yellow-700"; // 待审核
    case 3:
      return "bg-green-100 text-green-700"; // 已发布
    case 4:
      return "bg-red-100 text-red-700"; // 已删除
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 1:
      return "草稿";
    case 2:
      return "待审核";
    case 3:
      return "已发布";
    case 4:
      return "已删除";
    default:
      return "未知";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 0 ? "刚刚" : `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  } else if (days === 1) {
    return "昨天";
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return formatDateTime(date, "yyyy-MM-dd HH:mm");
  }
};

// 监听筛选条件变化
watch(
  [selectedCategories, searchKeyword],
  () => {
    // 这里可以添加防抖逻辑
  },
  { deep: true }
);

// 判断通知是否有日程数据
const hasScheduleData = (notification) => {
  return (
    notification.schedule?.time_slots &&
    Array.isArray(notification.schedule.time_slots) &&
    notification.schedule.time_slots.length > 0
  );
};

Taro.useShareAppMessage((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学信息海洋',
      path: '/pages/notifications/index',
    }
  })

Taro.useShareTimeline((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学信息海洋',
      path: '/pages/notifications/index',
    }
  })
</script>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.active\:scale-98:active {
  transform: scale(0.98);
}

.active\:scale-95:active {
  transform: scale(0.95);
}
</style>
