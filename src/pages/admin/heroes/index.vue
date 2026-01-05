<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <!-- 头部 -->
    <view class="bg-white px-4 shadow-sm shrink-0">
      <view class="flex justify-between items-center">
        <text class="text-lg font-semibold text-gray-800">英雄榜管理</text>
        <view class="flex items-center space-x-2">
          <view @tap="showCreateModal" class="p-2">
            <text class="i-lucide-plus w-5 h-5 text-blue-600"></text>
          </view>
          <view @tap="refreshData" class="p-2">
            <text class="i-lucide-refresh-cw w-5 h-5 text-gray-600"></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="bg-white px-4 py-3 border-b border-gray-100 shrink-0">
      <view class="flex space-x-2">
        <view
          v-for="filter in statusFilters"
          :key="filter.value"
          @tap="selectStatusFilter(filter.value)"
          :class="[
            'px-3 py-1 rounded-md text-sm border transition-colors duration-200',
            selectedStatus === filter.value
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-gray-50 text-gray-600 border-gray-200',
          ]"
        >
          {{ filter.label }}
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="bg-white px-4 py-3 border-b border-gray-100 shrink-0">
      <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
        <text class="i-lucide-search text-gray-400 w-4 h-4 mr-2"></text>
        <input
          v-model="searchKeyword"
          placeholder="搜索英雄姓名"
          class="flex-1 bg-transparent text-sm outline-none"
          @input="onSearchInput"
        />
        <view v-if="searchKeyword" @tap="clearSearch" class="ml-2 p-1">
          <text class="i-lucide-x text-gray-400 w-4 h-4"></text>
        </view>
      </view>
    </view>

    <view class="flex-1 h-[1px]">
      <!-- 英雄榜列表 -->
      <scroll-view
        :scroll-y="true"
        class="h-full"
        :lower-threshold="100"
        @scrolltolower="onScrollToLower"
      >
        <view class="p-2 flex flex-wrap" style="gap: 8px;">
          <view
            v-for="hero in filteredHeroes"
            :key="hero.id"
            class="bg-white rounded-lg shadow-sm"
            style="width: calc(50% - 4px);"
          >
            <!-- 英雄信息 -->
            <view class="px-3 pt-3 pb-2">
              <view class="flex items-center justify-between mb-1">
                <text class="text-sm font-medium text-gray-800 flex-1 truncate">{{
                  hero.name
                }}</text>
                <view
                  :class="[
                    'px-1.5 py-0.5 rounded text-xs ml-1 shrink-0',
                    hero.is_show
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ hero.is_show ? "显示" : "隐藏" }}
                </view>
              </view>
              <view class="text-xs text-gray-500 mb-2">
                排序: {{ hero.sort }}
              </view>
            </view>

            <!-- 操作按钮图标 -->
            <view class="px-3 flex items-center justify-around border-t border-gray-100">
              <view
                @tap="showEditModal(hero)"
                class="p-1.5 rounded active:bg-blue-50"
              >
                <text class="i-lucide-edit w-4 h-4 text-blue-600"></text>
              </view>
              <view
                @tap="toggleHeroStatus(hero)"
                class="p-1.5 rounded active:bg-gray-50"
              >
                <text
                  :class="[
                    'w-4 h-4',
                    hero.is_show ? 'i-lucide-eye-off text-yellow-600' : 'i-lucide-eye text-green-600',
                  ]"
                ></text>
              </view>
              <view
                @tap="showDeleteConfirm(hero)"
                class="p-1.5 rounded active:bg-red-50"
              >
                <text class="i-lucide-trash-2 w-4 h-4 text-red-600"></text>
              </view>
            </view>
          </view>

          <!-- 首次加载状态 -->
          <view v-if="loading && currentPage === 1" class="w-full text-center py-8">
            <view class="inline-flex items-center space-x-2">
              <view class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></view>
              <text class="text-gray-500 text-sm">加载中...</text>
            </view>
          </view>

          <!-- 加载更多状态 -->
          <view v-if="isLoadingMore" class="w-full text-center py-4">
            <view class="inline-flex items-center space-x-2">
              <view class="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></view>
              <text class="text-gray-400 text-sm">加载更多中...</text>
            </view>
          </view>

          <!-- 底部加载提示 -->
          <view v-if="hasMore && !loading && !isLoadingMore && filteredHeroes.length > 0" class="w-full text-center py-4">
            <text class="text-gray-400 text-sm">滚动加载更多</text>
          </view>

          <!-- 没有更多数据提示 -->
          <view v-if="!hasMore && !loading && !isLoadingMore && filteredHeroes.length > 0" class="w-full text-center py-4">
            <text class="text-gray-400 text-sm">—— 没有更多数据了 ——</text>
          </view>

          <!-- 空状态 -->
          <view
            v-if="!loading && filteredHeroes.length === 0"
            class="text-center py-12"
          >
            <text
              class="i-lucide-trophy w-12 h-12 text-gray-300 mb-4 block mx-auto"
            ></text>
            <text class="text-gray-500">暂无英雄榜数据</text>
            <view @tap="showCreateModal" class="mt-4">
              <text class="text-blue-500 text-sm">点击添加第一个英雄</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 创建/编辑英雄弹窗 -->
    <view
      v-if="showForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @tap="hideFormModal"
    >
      <view @tap.stop="" class="bg-white rounded-2xl mx-4 w-full max-w-sm">
        <view class="p-6">
          <text class="text-lg font-semibold text-gray-800 block mb-4">
            {{ isEditing ? "编辑英雄" : "添加英雄" }}
          </text>

          <view class="space-y-4">
            <!-- 姓名输入 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-1">
                姓名 *
              </text>
              <input
                v-model="heroForm.name"
                placeholder="请输入英雄姓名"
                class="border-solid border-[1px] border-gray-300 rounded-lg p-2"
                maxlength="20"
              />
            </view>

            <!-- 排序输入 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-1">
                排序
              </text>
              <input
                v-model="heroForm.sort"
                type="number"
                placeholder="请输入排序值"
                class="border-solid border-[1px] border-gray-300 rounded-lg p-2"
              />
              <text class="text-xs text-gray-400 mt-1">数值越小排序越靠前</text>
            </view>

            <!-- 显示状态 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-2">
                显示状态
              </text>
              <view class="flex space-x-4">
                <view
                  @tap="heroForm.is_show = true"
                  :class="[
                    'flex-1 py-2 px-3 rounded-lg text-center text-sm border',
                    heroForm.is_show
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-gray-50 text-gray-600 border-gray-200',
                  ]"
                >
                  显示
                </view>
                <view
                  @tap="heroForm.is_show = false"
                  :class="[
                    'flex-1 py-2 px-3 rounded-lg text-center text-sm border',
                    !heroForm.is_show
                      ? 'bg-gray-500 text-white border-gray-500'
                      : 'bg-gray-50 text-gray-600 border-gray-200',
                  ]"
                >
                  隐藏
                </view>
              </view>
            </view>
          </view>

          <view class="flex space-x-3 mt-6">
            <view
              @tap="hideFormModal"
              class="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-center"
            >
              取消
            </view>
            <view
              @tap="confirmSave"
              :class="[
                'flex-1 py-2 px-4 rounded-lg text-center text-white',
                canSave ? 'bg-blue-500' : 'bg-gray-300',
              ]"
            >
              {{ saving ? "保存中..." : "保存" }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <view
      v-if="showDelete"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @tap="hideDeleteConfirm"
    >
      <view @tap.stop="" class="bg-white rounded-2xl mx-4 w-full max-w-sm">
        <view class="p-6">
          <text class="text-lg font-semibold text-gray-800 block">
            删除英雄
          </text>
          <text class="text-gray-600 mb-4">
            确定要删除英雄 "{{ currentHero?.name }}" 吗？
          </text>

          <view class="flex mt-4 gap-2">
            <view
              @tap="hideDeleteConfirm"
              class="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-center"
            >
              取消
            </view>
            <view
              @tap="confirmDelete"
              class="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg text-center"
            >
              {{ deleting ? "删除中..." : "确认删除" }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Taro from "@tarojs/taro";
import { useAuthStore } from "../../../stores/auth";
import { heroAPI } from "../../../api/index";

// Store
const authStore = useAuthStore();

// 响应式数据
const heroes = ref([]);
const loading = ref(false);
const selectedStatus = ref(null);
const searchKeyword = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const hasMore = ref(false);

// 弹窗状态
const showForm = ref(false);
const showDelete = ref(false);
const currentHero = ref(null);
const isEditing = ref(false);

// 操作状态
const saving = ref(false);
const deleting = ref(false);

// 表单数据
const heroForm = ref({
  name: "",
  sort: 0,
  is_show: true,
});

// 状态筛选选项
const statusFilters = computed(() => [
  { label: "全部", value: null },
  { label: "显示中", value: true },
  { label: "已隐藏", value: false },
]);

// 计算属性 - 由于筛选在后端完成，直接返回原数组
const filteredHeroes = computed(() => {
  return heroes.value;
});

const canSave = computed(() => {
  return heroForm.value.name.trim().length > 0 && !saving.value;
});

// API调用方法
const fetchHeroes = async (keyword = '', isShow = null, page = 1, size = 20) => {
  loading.value = true;
  try {
    const params = {
      page,
      size
    };
    if (keyword.trim()) {
      params.q = keyword.trim();
    }
    if (isShow !== null) {
      params.is_show = isShow;
    }

    const response = await heroAPI.searchHeroes(params);

    if (response && response.data) {
      if (page === 1) {
        heroes.value = response.data;
      } else {
        // 如果是加载更多，则追加数据
        heroes.value = [...heroes.value, ...response.data];
      }

      total.value = response.total || 0;
      currentPage.value = page;
      hasMore.value = heroes.value.length < total.value;
    } else {
      if (page === 1) {
        heroes.value = [];
      }
      total.value = 0;
      hasMore.value = false;
    }
  } catch (error) {
    console.error("获取英雄榜失败:", error);
    Taro.showToast({
      title: error.message || "获取数据失败",
      icon: "error",
    });
  } finally {
    loading.value = false;
  }
};

const createHero = async (data) => {
  const response = await heroAPI.createHero(data);
  return response;
};

const updateHero = async (id, data) => {
  const response = await heroAPI.updateHero(id, data);
  return response;
};

const deleteHero = async (id) => {
  const response = await heroAPI.deleteHero(id);
  return response;
};

// 方法
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
};

const selectStatusFilter = async (status) => {
  const newStatus = selectedStatus.value === status ? null : status;
  selectedStatus.value = newStatus;

  // 重新加载数据
  currentPage.value = 1;
  isLoadingMore.value = false;
  await fetchHeroes(searchKeyword.value.trim(), selectedStatus.value, 1);
};

const refreshData = async () => {
  currentPage.value = 1;
  isLoadingMore.value = false;
  await fetchHeroes(searchKeyword.value.trim(), selectedStatus.value, 1);
  Taro.showToast({
    title: "刷新成功",
    icon: "success",
  });
};

// 搜索和滚动相关方法
let searchTimer = null;
let loadMoreTimer = null;
const isLoadingMore = ref(false);

const onSearchInput = (e) => {
  searchKeyword.value = e.detail.value;
  // 防抖搜索
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    performSearch();
  }, 500);
};

const performSearch = async () => {
  currentPage.value = 1;
  isLoadingMore.value = false;
  await fetchHeroes(searchKeyword.value.trim(), selectedStatus.value, 1);
};

const clearSearch = () => {
  searchKeyword.value = "";
  performSearch();
};

const loadMore = async () => {
  if (hasMore.value && !loading.value && !isLoadingMore.value) {
    isLoadingMore.value = true;
    try {
      await fetchHeroes(searchKeyword.value.trim(), selectedStatus.value, currentPage.value + 1);
    } finally {
      isLoadingMore.value = false;
    }
  }
};

// 滚动到底部的处理
const onScrollToLower = () => {
  // 防抖处理，防止连续触发
  if (loadMoreTimer) {
    clearTimeout(loadMoreTimer);
  }

  loadMoreTimer = setTimeout(() => {
    loadMore();
  }, 300); // 300ms防抖延迟
};

// 表单相关方法
const showCreateModal = () => {
  isEditing.value = false;
  heroForm.value = {
    name: "",
    sort: heroes.value.length,
    is_show: true,
  };
  showForm.value = true;
};

const showEditModal = (hero) => {
  isEditing.value = true;
  currentHero.value = hero;
  heroForm.value = {
    name: hero.name,
    sort: hero.sort,
    is_show: hero.is_show,
  };
  showForm.value = true;
};

const hideFormModal = () => {
  showForm.value = false;
  currentHero.value = null;
  heroForm.value = {
    name: "",
    sort: 0,
    is_show: true,
  };
};

const confirmSave = async () => {
  if (!canSave.value) return;

  saving.value = true;
  try {
    const data = {
      name: heroForm.value.name.trim(),
      sort: parseInt(heroForm.value.sort) || 0,
      is_show: heroForm.value.is_show,
    };

    if (isEditing.value && currentHero.value) {
      await updateHero(currentHero.value.id, data);
      // 更新本地数据
      const index = heroes.value.findIndex(
        (h) => h.id === currentHero.value.id
      );
      if (index !== -1) {
        heroes.value[index] = { ...heroes.value[index], ...data };
      }
    } else {
      await createHero(data);
      // 重新获取数据
      await refreshData();
    }

    Taro.showToast({
      title: isEditing.value ? "更新成功" : "创建成功",
      icon: "success",
    });

    hideFormModal();
  } catch (error) {
    Taro.showToast({
      title: error.message || "保存失败",
      icon: "error",
    });
  } finally {
    saving.value = false;
  }
};

const toggleHeroStatus = async (hero) => {
  try {
    const data = {
      name: hero.name,
      sort: hero.sort,
      is_show: !hero.is_show,
    };

    await updateHero(hero.id, data);

    // 更新本地数据
    const index = heroes.value.findIndex((h) => h.id === hero.id);
    if (index !== -1) {
      heroes.value[index].is_show = !heroes.value[index].is_show;
    }

    Taro.showToast({
      title: data.is_show ? "已显示" : "已隐藏",
      icon: "success",
    });
  } catch (error) {
    Taro.showToast({
      title: error.message || "操作失败",
      icon: "error",
    });
  }
};

// 删除相关方法
const showDeleteConfirm = (hero) => {
  currentHero.value = hero;
  showDelete.value = true;
};

const hideDeleteConfirm = () => {
  showDelete.value = false;
  currentHero.value = null;
};

const confirmDelete = async () => {
  if (!currentHero.value || deleting.value) return;

  deleting.value = true;
  try {
    await deleteHero(currentHero.value.id);

    // 从本地数据中移除
    heroes.value = heroes.value.filter((h) => h.id !== currentHero.value.id);

    Taro.showToast({
      title: "删除成功",
      icon: "success",
    });

    hideDeleteConfirm();
  } catch (error) {
    Taro.showToast({
      title: error.message || "删除失败",
      icon: "error",
    });
  } finally {
    deleting.value = false;
  }
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

  await fetchHeroes('', null, 1);
});

// 组件卸载时清理计时器
onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  if (loadMoreTimer) {
    clearTimeout(loadMoreTimer);
    loadMoreTimer = null;
  }
});
</script>

