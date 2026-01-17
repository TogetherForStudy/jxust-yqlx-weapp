<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <!-- 头部 -->
    <view class="bg-white px-4 shadow-sm shrink-0">
      <view class="flex justify-between items-center">
        <text class="text-lg font-semibold text-gray-800">配置管理</text>
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
          v-for="filter in typeFilters"
          :key="filter.value"
          @tap="selectTypeFilter(filter.value)"
          :class="[
            'px-3 py-1 rounded-md text-sm border transition-colors duration-200',
            selectedType === filter.value
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
          placeholder="搜索配置键名或描述"
          class="flex-1 bg-transparent text-sm outline-none"
          @input="onSearchInput"
        />
        <view v-if="searchKeyword" @tap="clearSearch" class="ml-2 p-1">
          <text class="i-lucide-x text-gray-400 w-4 h-4"></text>
        </view>
      </view>
    </view>

    <view class="flex-1 h-[1px]">
      <!-- 配置列表 -->
      <scroll-view
        :scroll-y="true"
        class="h-full"
        :lower-threshold="100"
        @scrolltolower="onScrollToLower"
      >
        <view class="bg-white">
          <view
            v-for="config in filteredConfigs"
            :key="config.key"
            class="border-b border-gray-100 px-4 py-3 flex items-center hover:bg-gray-50 transition-colors"
          >
            <!-- 左侧：类型图标 -->
            <view class="flex-shrink-0 mr-3">
              <view
                :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  getTypeBgClass(config.value_type),
                ]"
              >
                <text
                  :class="[
                    'w-4 h-4',
                    getTypeIconClass(config.value_type),
                    getTypeTextClass(config.value_type),
                  ]"
                ></text>
              </view>
            </view>

            <!-- 中间：配置信息 -->
            <view class="flex-1 min-w-0 mr-3">
              <view class="flex items-center mb-0.5">
                <text class="text-sm font-semibold text-gray-800 truncate mr-2">
                  {{ config.key }}
                </text>
                <view
                  :class="[
                    'px-1.5 py-0.5 rounded text-xs flex-shrink-0',
                    getTypeClass(config.value_type),
                  ]"
                >
                  {{ config.value_type }}
                </view>
              </view>
              <text v-if="config.description" class="text-xs text-gray-500 line-clamp-1">
                {{ config.description }}
              </text>
              <text v-else class="text-xs text-gray-400 italic">无描述</text>
            </view>

            <!-- 右侧：操作按钮 -->
            <view class="flex items-center space-x-1 flex-shrink-0">
              <view
                @tap.stop="copyConfigValue(config)"
                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <text class="i-lucide-copy w-4 h-4 text-gray-600"></text>
              </view>
              <view
                @tap.stop="showEditModal(config)"
                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors"
              >
                <text class="i-lucide-edit w-4 h-4 text-blue-600"></text>
              </view>
              <view
                @tap.stop="showDeleteConfirm(config)"
                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
              >
                <text class="i-lucide-trash-2 w-4 h-4 text-red-600"></text>
              </view>
            </view>
          </view>

          <!-- 首次加载状态 -->
          <view v-if="loading && currentPage === 1" class="text-center py-12">
            <view class="inline-flex items-center space-x-2">
              <view class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></view>
              <text class="text-gray-500 text-sm">加载中...</text>
            </view>
          </view>

          <!-- 加载更多状态 -->
          <view v-if="isLoadingMore" class="text-center py-4 bg-white border-t border-gray-100">
            <view class="inline-flex items-center space-x-2">
              <view class="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></view>
              <text class="text-gray-400 text-sm">加载更多中...</text>
            </view>
          </view>

          <!-- 底部加载提示 -->
          <view v-if="hasMore && !loading && !isLoadingMore && filteredConfigs.length > 0" class="text-center py-4 bg-white border-t border-gray-100">
            <text class="text-gray-400 text-sm">滚动加载更多</text>
          </view>

          <!-- 没有更多数据提示 -->
          <view v-if="!hasMore && !loading && !isLoadingMore && filteredConfigs.length > 0" class="text-center py-4 bg-white border-t border-gray-100">
            <text class="text-gray-400 text-sm">没有更多数据</text>
          </view>

          <!-- 空状态 -->
          <view
            v-if="!loading && filteredConfigs.length === 0"
            class="text-center py-16 bg-white"
          >
            <text
              class="i-lucide-settings w-12 h-12 text-gray-300 mb-4 block mx-auto"
            ></text>
            <text class="text-gray-500 block mb-2">暂无配置数据</text>
            <view @tap="showCreateModal" class="mt-4">
              <text class="text-blue-500 text-sm">点击添加第一个配置</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 创建/编辑配置弹窗 -->
    <view
      v-if="showForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @tap="hideFormModal"
    >
      <view @tap.stop="" class="bg-white rounded-2xl mx-4 w-full max-w-md">
        <view class="p-6">
          <text class="text-lg font-semibold text-gray-800 block mb-4">
            {{ isEditing ? "编辑配置" : "添加配置" }}
          </text>

          <view class="space-y-4 max-h-96 overflow-y-auto">
            <!-- 键名输入 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-1">
                键名 *
              </text>
              <input
                v-model="configForm.key"
                placeholder="请输入配置键名"
                :disabled="isEditing"
                :class="[
                  'border-solid border-[1px] border-gray-400 rounded-lg p-2',
                  isEditing ? 'bg-gray-100 text-gray-500' : ''
                ]"
                maxlength="50"
              />
              <text v-if="isEditing" class="text-xs text-gray-400 mt-1">
                键名不可修改
              </text>
            </view>

            <!-- 类型选择 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-2">
                值类型 *
              </text>
              <view class="grid grid-cols-2 gap-2">
                <view
                  v-for="type in valueTypes"
                  :key="type.value"
                  @tap="configForm.value_type = type.value"
                  :class="[
                    'py-2 px-3 rounded-lg text-center text-sm border-solid',
                    configForm.value_type === type.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-50 text-gray-600 border-gray-200',
                  ]"
                >
                  {{ type.label }}
                </view>
              </view>
            </view>

            <!-- 值输入 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-1">
                配置值 *
              </text>
              <textarea
                v-if="configForm.value_type === 'json'"
                v-model="configForm.value"
                placeholder="请输入配置值"
                maxlength="-1"
                class="box-border border-solid border-[1px] border-gray-300 rounded-lg h-20 resize-none w-full p-2"
              />
              <input
                v-else
                v-model="configForm.value"
                placeholder="请输入配置值"
                class="border-solid border-[1px] border-gray-300 rounded-lg p-2"
              />
              <text class="text-xs text-gray-400 mt-1">
                {{ getValueHint(configForm.value_type) }}
              </text>
            </view>

            <!-- 描述输入 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-1">
                描述
              </text>
              <textarea
                v-model="configForm.description"
                placeholder="请输入配置描述"
                class="box-border border-solid border-[1px] border-gray-300 rounded-lg h-16 resize-none w-full p-2"
                maxlength="200"
              />
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
          <text class="text-lg font-semibold text-gray-800 block mb-4">
            删除配置
          </text>
          <text class="text-gray-600 mb-4">
            确定要删除配置 "{{ currentConfig?.key }}" 吗？此操作不可撤销。
          </text>

          <view class="flex space-x-3">
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
import { configAPI } from "../../../api/index";

// Store
const authStore = useAuthStore();

// 响应式数据
const configs = ref([]);
const loading = ref(false);
const searchKeyword = ref("");
const selectedType = ref(null);

// 弹窗状态
const showForm = ref(false);
const showDelete = ref(false);
const currentConfig = ref(null);
const isEditing = ref(false);

// 操作状态
const saving = ref(false);
const deleting = ref(false);

// 表单数据
const configForm = ref({
  key: "",
  value: "",
  value_type: "string",
  description: "",
});

// 值类型选项
const valueTypes = [
  { label: "字符串", value: "string" },
  { label: "数字", value: "number" },
  { label: "布尔值", value: "boolean" },
  { label: "JSON", value: "json" },
];

// 类型筛选选项
const typeFilters = computed(() => [
  { label: "全部", value: null },
  ...valueTypes,
]);

// 计算属性 - 由于搜索在服务端完成，这里只做类型筛选
const filteredConfigs = computed(() => {
  let result = configs.value;

  // 类型筛选
  if (selectedType.value) {
    result = result.filter((config) => config.value_type === selectedType.value);
  }

  return result;
});

const canSave = computed(() => {
  const keyStr = String(configForm.value.key || '').trim();
  const valueStr = String(configForm.value.value || '').trim();
  return (
    keyStr.length > 0 &&
    valueStr.length > 0 &&
    !saving.value
  );
});

// API调用方法
const searchConfigs = async (q = '', page = 1, size = 50) => {
  const response = await configAPI.searchConfig({
    query: q,
    page,
    size
  });
  return response;
};

const createConfig = async (data) => {
  const response = await configAPI.createConfig(data);
  return response;
};

const updateConfig = async (key, data) => {
  const response = await configAPI.updateConfig(key, data);
  return response;
};

const deleteConfig = async (key) => {
  const response = await configAPI.deleteConfig(key);
  return response;
};

// 新增分页相关响应式数据
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const hasMore = ref(false);

const fetchAllConfigs = async (page = 1, keyword = '') => {
  loading.value = true;
  try {
    const response = await searchConfigs(keyword, page, pageSize.value);

    if (response && response.data) {
      if (page === 1) {
        configs.value = response.data;
      } else {
        // 如果是加载更多，则追加数据
        configs.value = [...configs.value, ...response.data];
      }

      total.value = response.total || 0;
      currentPage.value = page;
      hasMore.value = configs.value.length < total.value;
    } else {
      if (page === 1) {
        configs.value = [];
      }
      total.value = 0;
      hasMore.value = false;
    }
  } catch (error) {
    console.error("获取配置失败:", error);
    Taro.showToast({
      title: error.message || "获取数据失败",
      icon: "error",
    });
  } finally {
    loading.value = false;
  }
};

// 工具方法
const getTypeClass = (type) => {
  const classMap = {
    string: "bg-blue-100 text-blue-600",
    number: "bg-green-100 text-green-600",
    boolean: "bg-yellow-100 text-yellow-600",
    json: "bg-purple-100 text-purple-600",
  };
  return classMap[type] || "bg-gray-100 text-gray-600";
};

const getTypeBgClass = (type) => {
  const classMap = {
    string: "bg-blue-50",
    number: "bg-green-50",
    boolean: "bg-yellow-50",
    json: "bg-purple-50",
  };
  return classMap[type] || "bg-gray-50";
};

const getTypeTextClass = (type) => {
  const classMap = {
    string: "text-blue-600",
    number: "text-green-600",
    boolean: "text-yellow-600",
    json: "text-purple-600",
  };
  return classMap[type] || "text-gray-600";
};

const getTypeIconClass = (type) => {
  const iconMap = {
    string: "i-lucide-text",
    number: "i-lucide-hash",
    boolean: "i-lucide-toggle-left",
    json: "i-lucide-braces",
  };
  return iconMap[type] || "i-lucide-circle";
};


const formatConfigValue = (value, type) => {
  if (type === "json") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return value;
};

const getInputType = (valueType) => {
  switch (valueType) {
    case "number":
      return "number";
    case "boolean":
      return "text";
    default:
      return "text";
  }
};

const getValueHint = (type) => {
  const hints = {
    string: "输入字符串值",
    number: "输入数字值",
    boolean: "输入 true 或 false",
    json: "输入有效的JSON格式",
  };
  return hints[type] || "";
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
  await fetchAllConfigs(1, searchKeyword.value.trim());
};

const clearSearch = () => {
  searchKeyword.value = "";
  performSearch();
};

const selectTypeFilter = (type) => {
  selectedType.value = selectedType.value === type ? null : type;
};

const refreshData = async () => {
  currentPage.value = 1;
  isLoadingMore.value = false;
  await fetchAllConfigs(1, searchKeyword.value.trim());
  Taro.showToast({
    title: "刷新成功",
    icon: "success",
  });
};

const loadMore = async () => {
  if (hasMore.value && !loading.value && !isLoadingMore.value) {
    isLoadingMore.value = true;
    try {
      await fetchAllConfigs(currentPage.value + 1, searchKeyword.value.trim());
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
  configForm.value = {
    key: "",
    value: "",
    value_type: "string",
    description: "",
  };
  showForm.value = true;
};

const showEditModal = (config) => {
  isEditing.value = true;
  currentConfig.value = config;
  configForm.value = {
    key: config.key,
    value: config.value,
    value_type: config.value_type,
    description: config.description || "",
  };
  showForm.value = true;
};

const hideFormModal = () => {
  showForm.value = false;
  currentConfig.value = null;
  configForm.value = {
    key: "",
    value: "",
    value_type: "string",
    description: "",
  };
};

const confirmSave = async () => {
  if (!canSave.value) return;

  // 验证数据格式
  if (!validateConfigValue(configForm.value.value, configForm.value.value_type)) {
    return;
  }

  saving.value = true;
  try {
    const data = {
      value: String(configForm.value.value || '').trim(),
      value_type: configForm.value.value_type,
      description: String(configForm.value.description || '').trim(),
    };

    if (isEditing.value && currentConfig.value) {
      await updateConfig(currentConfig.value.key, data);
    } else {
      const createData = {
        key: String(configForm.value.key || '').trim(),
        ...data,
      };
      await createConfig(createData);
    }

    // 操作成功后刷新数据
    await refreshData();

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

const validateConfigValue = (value, type) => {
  switch (type) {
    case "number":
      if (isNaN(Number(value))) {
        Taro.showToast({
          title: "请输入有效的数字",
          icon: "none",
        });
        return false;
      }
      break;
    case "boolean":
      if (value !== "true" && value !== "false") {
        Taro.showToast({
          title: "布尔值只能是 true 或 false",
          icon: "none",
        });
        return false;
      }
      break;
    case "json":
      try {
        JSON.parse(value);
      } catch {
        Taro.showToast({
          title: "请输入有效的JSON格式",
          icon: "none",
        });
        return false;
      }
      break;
  }
  return true;
};

// 其他操作方法
const copyConfigValue = async (config) => {
  try {
    await Taro.setClipboardData({
      data: config.value,
    });
    Taro.showToast({
      title: "已复制到剪贴板",
      icon: "success",
    });
  } catch (error) {
    Taro.showToast({
      title: "复制失败",
      icon: "error",
    });
  }
};

// 删除相关方法
const showDeleteConfirm = (config) => {
  currentConfig.value = config;
  showDelete.value = true;
};

const hideDeleteConfirm = () => {
  showDelete.value = false;
  currentConfig.value = null;
};

const confirmDelete = async () => {
  if (!currentConfig.value || deleting.value) return;

  deleting.value = true;
  try {
    await deleteConfig(currentConfig.value.key);

    // 删除成功后刷新数据
    await refreshData();

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

  await fetchAllConfigs(1, '');
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

