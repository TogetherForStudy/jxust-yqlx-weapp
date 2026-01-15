<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <!-- 头部 -->
    <view class="bg-white px-4 shadow-sm shrink-0">
      <view class="flex justify-between items-center">
        <text class="text-lg font-semibold text-gray-800">积分管理</text>
        <view class="flex items-center space-x-2">
          <view @tap="refreshData" class="p-2">
            <text class="i-lucide-refresh-cw w-5 h-5 text-gray-600"></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮区域 -->
    <view class="bg-white border-b border-gray-100 shrink-0">
      <view class="grid grid-cols-3 divide-x divide-gray-100">
        <view
          class="px-4 py-3 text-base flex flex-col items-center justify-center active:bg-gray-50"
          @tap="showGrantPointsModal"
        >
          <text class="i-lucide-coins mb-1"></text>
          <text class="text-xs text-gray-800 text-center">赋予积分</text>
        </view>
        <view
          class="px-4 py-3 text-base flex flex-col items-center justify-center active:bg-gray-50"
          @tap="showSearchUserModal"
        >
          <text class="i-lucide-search mb-1"></text>
          <text class="text-xs text-gray-800 text-center">查询用户</text>
        </view>
        <view
          class="px-4 py-3 text-base flex flex-col items-center justify-center active:bg-gray-50"
          @tap="clearUser"
        >
          <text class="i-lucide-x mb-1"></text>
          <text class="text-xs text-gray-800 text-center">清除查询</text>
        </view>
      </view>
    </view>

    <!-- 用户信息显示 -->
    <view v-if="selectedUserId" class="bg-white border-b border-gray-100 shrink-0 px-4 py-3">
      <view class="flex items-center justify-between">
        <view class="flex items-center space-x-2">
          <text class="text-sm text-gray-600">当前查询用户ID:</text>
          <text class="text-base font-semibold text-gray-800">{{ selectedUserId }}</text>
        </view>
        <view v-if="userInfo" class="flex items-center space-x-2">
          <text class="text-sm text-gray-600">{{ userInfo.nickname || '未知用户' }}</text>
        </view>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="bg-white border-b border-gray-100 shrink-0">
      <view class="flex">
        <view
          v-for="tab in tabs"
          :key="tab.value"
          @tap="activeTab = tab.value"
          :class="[
            'flex-1 py-3 text-center border-b-2 transition-colors',
            activeTab === tab.value
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600',
          ]"
        >
          <text class="text-sm font-medium">{{ tab.label }}</text>
        </view>
      </view>
    </view>

    <view class="flex-1 h-[1px]">
      <scroll-view :scroll-y="true" class="h-full">
        <view class="p-4">
          <!-- 积分流水 -->
          <view v-if="activeTab === 'transactions'" class="bg-white rounded-lg shadow-sm overflow-hidden">
            <view v-if="loading" class="px-4 py-8 text-center">
              <view class="inline-flex items-center space-x-2">
                <view class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></view>
                <text class="text-gray-500 text-sm">加载中...</text>
              </view>
            </view>
            <view v-else-if="transactions.length === 0" class="px-4 py-8 text-center">
              <text class="text-gray-400 text-sm">暂无交易记录</text>
            </view>
            <view v-else class="divide-y divide-gray-100">
              <view
                v-for="transaction in transactions"
                :key="transaction.id"
                class="px-4 py-3"
              >
                <view class="flex justify-between items-start">
                  <view class="flex-1">
                    <view class="flex items-center mb-1">
                      <text class="text-base font-medium text-gray-800 mr-2">{{ transaction.description }}</text>
                      <view
                        :class="[
                          'px-2 py-0.5 rounded text-xs',
                          transaction.type === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
                        ]"
                      >
                        {{ transaction.type === 1 ? '获得' : '消耗' }}
                      </view>
                    </view>
                    <text class="text-sm text-gray-600 block mb-1">
                      来源: {{ getSourceName(transaction.source) }}
                    </text>
                    <text class="text-xs text-gray-400">
                      {{ formatDate(transaction.created_at) }}
                    </text>
                  </view>
                  <view>
                    <text
                      :class="[
                        'text-base font-semibold',
                        transaction.type === 1 ? 'text-green-500' : 'text-red-500',
                      ]"
                    >
                      {{ transaction.type === 1 ? '+' : '-' }}{{ Math.abs(transaction.points) }}
                    </text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 统计信息 -->
          <view v-if="activeTab === 'stats'" class="bg-white rounded-lg shadow-sm overflow-hidden">
            <view v-if="loading" class="px-4 py-8 text-center">
              <view class="inline-flex items-center space-x-2">
                <view class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></view>
                <text class="text-gray-500 text-sm">加载中...</text>
              </view>
            </view>
            <view v-else-if="!statsData" class="px-4 py-8 text-center">
              <text class="text-gray-400 text-sm">请先选择用户</text>
            </view>
            <view v-else class="p-4">
              <!-- 总积分和排名 -->
              <view class="mb-4 pb-4 border-b border-gray-100">
                <view class="flex items-center justify-between mb-2">
                  <text class="text-sm text-gray-600">当前积分</text>
                  <text class="text-2xl font-bold text-gray-800">{{ statsData.points || 0 }}</text>
                </view>
                <view v-if="statsData.rank" class="flex items-center justify-between">
                  <text class="text-sm text-gray-600">积分排名</text>
                  <text class="text-lg font-semibold text-blue-600">#{{ statsData.rank }}</text>
                </view>
              </view>

              <!-- 来源统计 -->
              <view v-if="statsData.source_stats && Object.keys(statsData.source_stats).length > 0">
                <text class="text-base font-semibold text-gray-800 block mb-3">来源统计</text>
                <view class="space-y-2">
                  <view
                    v-for="(stats, source) in statsData.source_stats"
                    :key="source"
                    class="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <view class="flex items-center justify-between mb-2">
                      <text class="text-sm font-medium text-gray-800">{{ getSourceName(source) }}</text>
                    </view>
                    <view class="flex items-center justify-between">
                      <text class="text-xs text-gray-500">获得</text>
                      <text class="text-sm font-semibold text-green-600">+{{ stats.earned || 0 }}</text>
                    </view>
                    <view v-if="stats.spent && stats.spent < 0" class="flex items-center justify-between mt-1">
                      <text class="text-xs text-gray-500">消耗</text>
                      <text class="text-sm font-semibold text-red-600">{{ stats.spent }}</text>
                    </view>
                  </view>
                </view>
              </view>
              <view v-else class="py-4 text-center">
                <text class="text-gray-400 text-sm">暂无统计数据</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 赋予积分弹窗 -->
    <view
      v-if="showGrantPointsForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @tap="hideGrantPointsModal"
    >
      <view @tap.stop="" class="bg-white rounded-2xl mx-4 w-full max-w-md">
        <view class="p-6">
          <text class="text-lg font-semibold text-gray-800 block mb-4">
            赋予积分
          </text>

          <view class="space-y-4">
            <!-- 用户ID输入 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-1">
                用户ID *
              </text>
              <input
                v-model="grantPointsForm.userId"
                placeholder="请输入用户ID"
                type="number"
                class="border-solid border-[1px] border-gray-300 rounded-lg p-2"
              />
            </view>

            <!-- 积分数量输入 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-1">
                积分数量 *
              </text>
              <input
                v-model="grantPointsForm.points"
                placeholder="正数增加，负数扣除"
                class="border-solid border-[1px] border-gray-300 rounded-lg p-2"
              />
              <text class="text-xs text-gray-500 mt-1 block">
                输入正数表示增加积分，负数表示扣除积分
              </text>
            </view>

            <!-- 操作描述输入 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-1">
                操作描述 *
              </text>
              <textarea
                v-model="grantPointsForm.description"
                placeholder="请输入操作描述"
                class="border-solid border-[1px] border-gray-300 rounded-lg p-2 min-h-[80px]"
              />
            </view>
          </view>

          <view class="flex space-x-3 mt-6">
            <view
              @tap="hideGrantPointsModal"
              class="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-center"
            >
              取消
            </view>
            <view
              @tap="confirmGrantPoints"
              :class="[
                'flex-1 py-2 px-4 rounded-lg text-center text-white',
                canGrantPoints ? 'bg-blue-500' : 'bg-gray-300',
              ]"
            >
              {{ granting ? "处理中..." : "确认" }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 查询用户弹窗 -->
    <view
      v-if="showSearchUserForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @tap="hideSearchUserModal"
    >
      <view @tap.stop="" class="bg-white rounded-2xl mx-4 w-full max-w-md">
        <view class="p-6">
          <text class="text-lg font-semibold text-gray-800 block mb-4">
            查询用户
          </text>

          <view class="space-y-4">
            <!-- 用户ID输入 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-1">
                用户ID *
              </text>
              <input
                v-model="searchUserForm.userId"
                placeholder="请输入用户ID"
                type="number"
                class="border-solid border-[1px] border-gray-300 rounded-lg p-2"
              />
            </view>
          </view>

          <view class="flex space-x-3 mt-6">
            <view
              @tap="hideSearchUserModal"
              class="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-center"
            >
              取消
            </view>
            <view
              @tap="confirmSearchUser"
              :class="[
                'flex-1 py-2 px-4 rounded-lg text-center text-white',
                canSearchUser ? 'bg-blue-500' : 'bg-gray-300',
              ]"
            >
              查询
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import Taro from "@tarojs/taro";
import { useAuthStore } from "../../../stores/auth";
import { pointsAPI } from "../../../api/index";
import { formatDateTime } from "../../../utils/time";

// Store
const authStore = useAuthStore();

// Tab 配置
const tabs = [
  { label: '积分流水', value: 'transactions' },
  { label: '统计信息', value: 'stats' },
];

// 响应式数据
const activeTab = ref('transactions');
const transactions = ref([]);
const statsData = ref(null);
const loading = ref(false);
const granting = ref(false);
const selectedUserId = ref(null);
const userInfo = ref(null);

// 弹窗状态
const showGrantPointsForm = ref(false);
const showSearchUserForm = ref(false);
const grantPointsForm = ref({
  userId: "",
  points: "",
  description: "",
});
const searchUserForm = ref({
  userId: "",
});

// 计算属性
const canGrantPoints = computed(() => {
  const userId = String(grantPointsForm.value.userId || "").trim();
  const points = String(grantPointsForm.value.points || "").trim();
  const description = String(grantPointsForm.value.description || "").trim();
  return (
    userId !== "" &&
    points !== "" &&
    description !== "" &&
    !granting.value
  );
});

const canSearchUser = computed(() => {
  const userId = String(searchUserForm.value.userId || "").trim();
  return (
    userId !== "" &&
    !loading.value
  );
});

// 监听选中的用户ID变化，自动加载数据
watch(selectedUserId, async (newUserId) => {
  if (newUserId) {
    await loadUserData();
  } else {
    transactions.value = [];
    statsData.value = null;
    userInfo.value = null;
  }
});

// 监听Tab切换，加载对应数据
watch(activeTab, async (newTab) => {
  if (selectedUserId.value) {
    await loadUserData();
  }
});

// API调用方法
const loadUserData = async () => {
  if (!selectedUserId.value) return;

  loading.value = true;
  try {
    if (activeTab.value === 'transactions') {
      await fetchTransactions();
    } else if (activeTab.value === 'stats') {
      await fetchStats();
    }
  } catch (error) {
    console.error("加载数据失败:", error);
    Taro.showToast({
      title: error.message || "加载数据失败",
      icon: "error",
    });
  } finally {
    loading.value = false;
  }
};

const fetchTransactions = async () => {
  try {
    const params = {
      page: 1,
      size: 100,
      user_id: parseInt(selectedUserId.value),
    };
    const response = await pointsAPI.getTransactions(params);
    transactions.value = response.data || [];

    // 从交易记录中获取用户信息（如果有）
    if (transactions.value.length > 0 && transactions.value[0].user) {
      userInfo.value = transactions.value[0].user;
    }
  } catch (error) {
    console.error("获取交易记录失败:", error);
    throw error;
  }
};

const fetchStats = async () => {
  try {
    // 传递user_id参数以获取指定用户的统计信息
    const params = {
      user_id: parseInt(selectedUserId.value),
    };
    const response = await pointsAPI.getStats(params);
    statsData.value = response;
  } catch (error) {
    console.error("获取统计信息失败:", error);
    throw error;
  }
};

const refreshData = async () => {
  if (!selectedUserId.value) {
    Taro.showToast({
      title: "请先选择用户",
      icon: "none",
    });
    return;
  }
  await loadUserData();
  Taro.showToast({
    title: "刷新成功",
    icon: "success",
  });
};

// 赋予积分相关方法
const showGrantPointsModal = () => {
  grantPointsForm.value = {
    userId: selectedUserId.value || "",
    points: "",
    description: "",
  };
  showGrantPointsForm.value = true;
};

const hideGrantPointsModal = () => {
  showGrantPointsForm.value = false;
  grantPointsForm.value = {
    userId: "",
    points: "",
    description: "",
  };
};

const confirmGrantPoints = async () => {
  if (!canGrantPoints.value) return;

  granting.value = true;
  try {
    const userIdStr = String(grantPointsForm.value.userId || "").trim();
    const pointsStr = String(grantPointsForm.value.points || "").trim();
    const description = String(grantPointsForm.value.description || "").trim();

    const userId = parseInt(userIdStr);
    const points = parseInt(pointsStr);

    if (isNaN(userId)) {
      Taro.showToast({
        title: "请输入有效的用户ID",
        icon: "none",
      });
      return;
    }

    if (isNaN(points)) {
      Taro.showToast({
        title: "请输入有效的积分数量",
        icon: "none",
      });
      return;
    }

    await pointsAPI.grantPoints({
      user_id: userId,
      points: points,
      description: description,
    });

    Taro.showToast({
      title: "操作成功",
      icon: "success",
    });

    hideGrantPointsModal();

    // 如果操作的是当前查询的用户，刷新数据
    if (userId === parseInt(selectedUserId.value)) {
      await loadUserData();
    }
  } catch (error) {
    Taro.showToast({
      title: error.message || "操作失败",
      icon: "error",
    });
  } finally {
    granting.value = false;
  }
};

// 查询用户相关方法
const showSearchUserModal = () => {
  searchUserForm.value = {
    userId: selectedUserId.value || "",
  };
  showSearchUserForm.value = true;
};

const hideSearchUserModal = () => {
  showSearchUserForm.value = false;
  searchUserForm.value = {
    userId: "",
  };
};

const confirmSearchUser = async () => {
  if (!canSearchUser.value) return;

  const userIdStr = String(searchUserForm.value.userId || "").trim();
  const userId = parseInt(userIdStr);
  if (isNaN(userId)) {
    Taro.showToast({
      title: "请输入有效的用户ID",
      icon: "none",
    });
    return;
  }

  selectedUserId.value = userId;
  hideSearchUserModal();

  // 自动加载数据
  await loadUserData();
};

// 清除查询
const clearUser = () => {
  selectedUserId.value = null;
  transactions.value = [];
  statsData.value = null;
  userInfo.value = null;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  return formatDateTime(new Date(dateString), 'yyyy-MM-dd HH:mm');
};

// 获取来源名称
const getSourceName = (source) => {
  const sourceNames = {
    'daily_login': '每日登录',
    'review': '发布评价',
    'contribution': '投稿信息',
    'redeem': '兑换奖品',
    'admin_grant': '管理员赋予'
  };
  return sourceNames[source] || source;
};

// 生命周期
onMounted(async () => {
  // 检查管理员权限
  if (!authStore.isAdmin) {
    Taro.showToast({
      title: "权限不足",
      icon: "error",
    });
    Taro.navigateBack();
    return;
  }
});
</script>

<style scoped>
</style>

