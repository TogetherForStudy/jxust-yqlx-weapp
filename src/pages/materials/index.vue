<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <!-- 搜索框 -->
    <view class="bg-white p-4 z-10 shadow-sm">
      <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
        <text class="i-lucide-search text-gray-400 w-4 h-4 mr-2"></text>
        <input
          v-model="searchKeywords"
          class="flex-1 bg-transparent text-sm outline-none h-full"
          placeholder="搜索资料..."
          confirm-type="search"
          @focus="handleSearchFocus"
          @blur="handleSearchBlur"
          @confirm="handleSearch"
        />
        <!-- 搜索/返回按钮 -->
        <view
          v-if="searchKeywords === '' && searchFocused"
          class="text-blue-500 text-sm"
          @tap="exitSearchMode"
        >
          关闭
        </view>
        <view
          v-else-if="searchKeywords !== ''"
          class="text-blue-500 text-sm"
          @tap="handleSearch"
        >
          搜索
        </view>
      </view>
    </view>

    <!-- 搜索页面（历史搜索 + 热搜 + 热榜一起显示） -->
    <scroll-view
      v-if="searchFocused"
      :scroll-y="true"
      class="flex-1 bg-gray-50"
    >

      <!-- 历史搜索 -->
      <view class="bg-white p-4 mb-2">
        <view class="flex items-center justify-between mb-3">
          <text class="text-gray-800 font-medium">搜索记录</text>
          <text
            v-if="searchHistory.length"
            class="text-xs text-gray-400 active:text-gray-600"
            @tap="clearSearchHistory"
          >
            清空
          </text>
        </view>

        <view v-if="searchHistory.length" class="flex flex-wrap gap-2">
          <view
            v-for="(keyword, index) in searchHistory"
            :key="index"
            class="flex items-center text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full active:bg-gray-200"
            @tap="quickSearch(keyword)"
          >
            <text class="i-lucide-clock w-3 h-3 mr-1.5 text-gray-400"></text>
            <text>{{ keyword }}</text>
          </view>
        </view>

        <view v-else class="text-center">
          <text class="text-gray-400 text-sm">暂无搜索历史</text>
        </view>
      </view>

      <!-- 热搜词 -->
      <view v-if="hotWords.length && authStore.isAdmin" class="bg-white p-4 mb-2">
        <view class="flex items-center justify-between mb-3">
          <text class="text-gray-800 font-medium">一起来学热搜</text>
          <text class="text-xs text-gray-400">热门搜索</text>
        </view>
        <view class="flex flex-wrap gap-2">
          <text
            v-for="word in hotWords"
            :key="word.keywords"
            class="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full active:bg-gray-200"
            @tap="quickSearch(word.keywords)"
          >
            {{ word.keywords }}
          </text>
        </view>
      </view>

      <!-- 资料热榜（带Tab切换） -->
      <view v-if="hotRankMaterials.length" class="bg-white mb-2">
        <!-- Tab切换 -->
        <view class="flex">
          <view
            :class="
              hotRankType === 0
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500'
            "
            class="flex-1 text-center py-3 font-medium text-sm"
            @tap="switchHotRankType(0)"
          >
            总榜
          </view>
          <view
            :class="
              hotRankType === 7
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500'
            "
            class="flex-1 text-center py-3 font-medium text-sm"
            @tap="switchHotRankType(7)"
          >
            近七天
          </view>
        </view>

        <!-- 榜单列表 -->
        <view
          v-for="(item, index) in hotRankMaterials"
          :key="item.md5"
          class="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
          @tap="enterMaterial(item)"
        >
          <view class="flex items-start">
            <view
              :class="[
                'w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0',
                index < 3 ? 'bg-red-500 text-white rounded' : 'text-gray-400',
              ]"
            >
              {{ index + 1 }}
            </view>
            <view class="flex-1 min-w-0">
              <text class="text-gray-800 font-medium text-sm break-all">{{
                item.file_name
              }}</text>
              <view class="flex items-center mt-1 text-xs text-gray-400">
                <text class="i-lucide-trending-up w-3 h-3 mr-1"></text>
                <text>热度 {{ hotRankType === 0 ? item.total_hotness : item.period_hotness || 0 }}</text>
                <text class="mx-2">·</text>
                <text>{{ item.download_count || 0 }} 下载</text>
              </view>
              <view v-if="item.tags" class="flex flex-wrap gap-1 mt-1">
                <text
                  v-for="tag in item.tags.split(',').slice(0, 3)"
                  :key="tag"
                  class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                >
                  {{ tag.trim() }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 面包屑 -->
    <view v-if="!isSearchMode && !searchFocused" class="bg-white px-4 py-3">
      <scroll-view
        ref="breadcrumbScrollView"
        :scroll-x="true"
        :scroll-left="breadcrumbScrollLeft"
        :show-scrollbar="false"
        class="flex items-center space-x-2 text-sm"
      >
        <view class="flex items-center space-x-2 whitespace-nowrap">
          <text class="text-blue-500 flex-shrink-0" @tap="navigateToRoot">
            江理一起来学
          </text>
          <template v-for="(item, index) in breadcrumb" :key="item.id">
            <text class="text-gray-400 flex-shrink-0">/</text>
            <text
              :class="
                index === breadcrumb.length - 1
                  ? 'text-gray-800 font-medium'
                  : 'text-blue-500'
              "
              class="flex-shrink-0"
              @tap="navigateToBreadcrumb(index)"
            >
              {{ item.name }}
            </text>
          </template>
        </view>
      </scroll-view>
    </view>

    <!-- 搜索结果提示 -->
    <view
      v-if="isSearchMode && !searchFocused"
      class="bg-white px-4 py-3"
    >
      <text class="text-sm text-gray-600">
        搜索 "{{ currentSearchKeywords }}" 的结果 (共 {{ searchTotal }} 条)
      </text>
      <text class="text-blue-500 text-sm ml-4" @tap="clearSearch"
        >清除搜索</text
      >
    </view>

    <!-- 加载状态 -->
    <view v-if="loading && !searchFocused" class="flex justify-center items-center py-20">
      <text class="text-gray-400">加载中...</text>
    </view>

    <!-- 内容区域 -->
    <scroll-view
      v-else-if="!searchFocused"
      :scroll-y="true"
      class="flex-1 h-[1px]"
      @scrolltolower="loadMore"
      :threshold="100"
    >
      <!-- 分类列表 -->
      <view
        v-for="category in categories"
        :key="category.id"
        class="bg-white p-4 active:bg-gray-50"
        @tap="enterCategory(category)"
      >
        <view class="flex items-center justify-between gap-3">
          <view class="flex items-center gap-3 flex-1 min-w-0">
            <view
              class="w-6 h-6 bg-gradient-to-br from-orange-300 to-orange-400 rounded flex items-center justify-center flex-shrink-0"
            >
              <text class="i-lucide-folder text-white w-4 h-4"></text>
            </view>
            <view class="flex-1 min-w-0">
              <text class="text-gray-800 font-medium line-clamp-2 break-all">{{ category.name }}</text>
            </view>
          </view>
          <text class="i-lucide-chevron-right text-gray-400 w-5 h-5 flex-shrink-0"></text>
        </view>
      </view>

      <!-- 文件列表 -->
      <view
        v-for="material in materials"
        :key="material.md5"
        class="bg-white p-4 active:bg-gray-50"
        @tap="enterMaterial(material)"
      >
        <view class="flex items-start space-x-3">
          <view
            class="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center flex-shrink-0"
          >
            <text class="i-lucide-file-text text-white w-4 h-4"></text>
          </view>
          <view class="flex-1 min-w-0">
            <view class="flex items-start justify-between">
              <text class="text-gray-800 font-medium break-all">
                {{ material.file_name }}
              </text>
            </view>
            <view v-if="material.tags" class="flex flex-wrap gap-1 mt-2">
              <text
                v-for="tag in material.tags.split(',')"
                :key="tag"
                class="text-xs px-2 py-0.5 bg-orange-500 text-white rounded"
              >
                {{ tag.trim() }}
              </text>
            </view>
            <view
              class="flex items-center space-x-3 mt-2 text-xs text-gray-400"
            >
              <text>{{ formatFileSize(material.file_size) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view
        v-if="!categories.length && !materials.length"
        class="text-center py-20"
      >
        <text
          class="i-lucide-inbox text-gray-300 w-16 h-16 block mx-auto mb-2"
        ></text>
        <text class="text-gray-400 text-sm">暂无内容</text>
      </view>

      <!-- 加载更多 -->
      <view
        v-if="loadingMore"
        class="text-center py-4"
      >
        <text class="text-gray-500 text-sm">加载更多...</text>
      </view>

      <!-- 没有更多数据 -->
      <view
        v-else-if="!hasMore && materials.length > 0"
        class="text-center py-4"
      >
        <text class="text-gray-400 text-sm">没有更多数据了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import Taro from "@tarojs/taro";
import { materialAPI } from "../../api";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();

// 搜索相关
const searchKeywords = ref("");
const currentSearchKeywords = ref("");
const isSearchMode = ref(false);
const searchFocused = ref(false);
const searchHistory = ref([]);
const hotWords = ref([]);

// 本地存储的 key
const SEARCH_HISTORY_KEY = 'material_search_history';

// TOP热门资料
const topMaterials = ref([]);
const hotRankMaterials = ref([]);
const hotRankType = ref(0); // 0=总榜, 7=近七天
const scrollTop = ref(0);
let scrollInterval = null;

// 面包屑导航
const breadcrumb = ref([]);
const currentCategoryId = ref(1); // 默认从分类ID为1开始
const breadcrumbScrollView = ref(null);
const breadcrumbScrollLeft = ref(0);

// 数据
const categories = ref([]);
const materials = ref([]);
const loading = ref(false);
const loadingMore = ref(false); // 加载更多的状态

// 分页
const currentPage = ref(1);
const pageSize = ref(20);
const searchTotal = ref(0);
const hasMore = ref(false);

// 初始化
onMounted(() => {
  if (!authStore.requireAuth()) return;

  loadSearchHistory();
  loadHotWords();
  loadTopMaterials();
  loadData();
  startScroll();
});

onUnmounted(() => {
  stopScroll();
});

// 加载热词
const loadHotWords = async () => {
  const res = await materialAPI.getHotWords({ limit: 20 });
  hotWords.value = res || [];
};

// 加载TOP热门资料
const loadTopMaterials = async () => {
  const res = await materialAPI.getTopMaterials({ limit: 10 });
  topMaterials.value = res || [];
};

// 加载热榜资料
const loadHotRankMaterials = async (type = 0) => {
  const res = await materialAPI.getTopMaterials({ limit: 50, type });
  hotRankMaterials.value = res || [];
};

// 切换热榜类型
const switchHotRankType = (type) => {
  hotRankType.value = type;
  loadHotRankMaterials(type);
};

// 开始滚动动画
const startScroll = () => {
  if (scrollInterval) return;
  scrollInterval = setInterval(() => {
    scrollTop.value -= 32; // 每次滚动一个项目的高度（32px = h-8）
    // 当滚动到第一组的末尾时，重置为0实现无缝循环
    if (Math.abs(scrollTop.value) >= topMaterials.value.length * 32) {
      scrollTop.value = 0;
    }
  }, 3000); // 每3秒滚动一次
};

// 停止滚动
const stopScroll = () => {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
};

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = Taro.getStorageSync(SEARCH_HISTORY_KEY);
    if (history && Array.isArray(history)) {
      searchHistory.value = history;
    }
  } catch (e) {
    console.error('加载搜索历史失败:', e);
  }
};

// 保存搜索历史
const saveSearchHistory = (keyword) => {
  try {
    // 去重并限制数量（最多保存10条）
    const newHistory = [
      keyword,
      ...searchHistory.value.filter(item => item !== keyword)
    ].slice(0, 10);

    searchHistory.value = newHistory;
    Taro.setStorageSync(SEARCH_HISTORY_KEY, newHistory);
  } catch (e) {
    console.error('保存搜索历史失败:', e);
  }
};

// 清空搜索历史
const clearSearchHistory = () => {
  Taro.showModal({
    title: '提示',
    content: '确定要清空搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        searchHistory.value = [];
        try {
          Taro.removeStorageSync(SEARCH_HISTORY_KEY);
        } catch (e) {
          console.error('清空搜索历史失败:', e);
        }
      }
    }
  });
};

// 搜索框获得焦点 - 进入搜索发现页面
const handleSearchFocus = () => {
  searchFocused.value = true;
  // 加载搜索页面数据
  if (!hotRankMaterials.value.length) {
    loadHotRankMaterials(hotRankType.value);
  }
};

// 搜索框失去焦点 - 不做任何处理，让用户通过"返回资料"按钮主动退出
const handleSearchBlur = () => {
  // 不自动关闭搜索页面，避免点击热榜等内容时因失焦导致界面消失
};

// 退出搜索模式 - 返回资料界面
const exitSearchMode = () => {
  searchFocused.value = false;
  // 如果搜索框没有内容，清空输入
  if (!searchKeywords.value.trim()) {
    searchKeywords.value = "";
  }
};

// 加载数据
const loadData = async () => {
  // 首次加载用 loading，加载更多用 loadingMore
  if (currentPage.value > 1) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }

  // 加载分类
  const categoryRes = await materialAPI.getCategories({
    parent_id: currentCategoryId.value,
  });
  if (currentPage.value > 1) {
    categories.value = [...categories.value, ...categoryRes || []];
  } else {
    categories.value = categoryRes || [];
  }
  // 加载资料
  const materialRes = await materialAPI.getMaterials({
    category_id: currentCategoryId.value,
    page: currentPage.value,
    page_size: pageSize.value,
    sort_by: "hotness",
  });
  if (currentPage.value > 1) {
    materials.value = [...materials.value, ...materialRes.data || []];
  } else {
    materials.value = materialRes.data || [];
  }
  hasMore.value = materialRes.total > currentPage.value * pageSize.value;

  loading.value = false;
  loadingMore.value = false;
};

// 搜索
const handleSearch = async () => {
  if (!searchKeywords.value.trim()) {
    Taro.showToast({
      title: "请输入搜索关键词",
      icon: "none",
    });
    return;
  }

  searchFocused.value = false;

  // 判断是否是新的搜索（关键词变化）
  const isNewSearch = currentSearchKeywords.value !== searchKeywords.value;

  if (isNewSearch) {
    // 新的搜索，保存到历史记录
    saveSearchHistory(searchKeywords.value);

    // 重置页码
    isSearchMode.value = true;
    currentSearchKeywords.value = searchKeywords.value;
    currentPage.value = 1;
    categories.value = [];
    loading.value = true;
  } else {
    // 同一个搜索的加载更多
    loadingMore.value = true;
  }

  const res = await materialAPI.searchMaterials({
    keywords: searchKeywords.value,
    page: currentPage.value,
    page_size: pageSize.value,
  });
  if (currentPage.value > 1) {
    materials.value = [...materials.value, ...res.materials || []];
  } else {
    materials.value = res.materials || [];
  }
  searchTotal.value = res.total || 0;
  hasMore.value = res.total > currentPage.value * pageSize.value;

  loading.value = false;
  loadingMore.value = false;
};

// 快速搜索
const quickSearch = (keywords) => {
  searchKeywords.value = keywords;
  searchFocused.value = false;
  handleSearch();
};

// 清除搜索
const clearSearch = () => {
  isSearchMode.value = false;
  searchFocused.value = false;
  searchKeywords.value = "";
  currentSearchKeywords.value = "";
  currentPage.value = 1;
  loadData();
};

// 滚动面包屑到最右侧
const scrollBreadcrumbToRight = async () => {
  await nextTick();
  // 设置一个很大的值来滚动到最右侧
  breadcrumbScrollLeft.value = 99999;
};

// 进入分类
const enterCategory = (category) => {
  breadcrumb.value.push({
    id: category.id,
    name: category.name,
  });
  currentCategoryId.value = category.id;
  currentPage.value = 1;
  loadData();
  scrollBreadcrumbToRight();
};

// 返回根目录
const navigateToRoot = () => {
  breadcrumb.value = [];
  currentCategoryId.value = 1;
  currentPage.value = 1;
  breadcrumbScrollLeft.value = 0;
  loadData();
};

// 面包屑导航
const navigateToBreadcrumb = (index) => {
  if (index === breadcrumb.value.length - 1) return;

  const targetCategory = breadcrumb.value[index];
  breadcrumb.value = breadcrumb.value.slice(0, index + 1);
  currentCategoryId.value = targetCategory.id;
  currentPage.value = 1;
  loadData();
  scrollBreadcrumbToRight();
};

// 进入资料详情
const enterMaterial = (material) => {
  Taro.navigateTo({
    url: `/pages/materials/detail/index?md5=${material.md5}`,
  });
};

// 加载更多
const loadMore = () => {
  // 防止重复触发：如果正在加载或没有更多数据，则不执行
  if (!hasMore.value || loading.value || loadingMore.value) {
    return;
  }

  currentPage.value++;
  if (isSearchMode.value) {
    handleSearch();
  } else {
    loadData();
  }
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return Math.floor(diff / 60000) + "分钟前";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "小时前";
  if (diff < 604800000) return Math.floor(diff / 86400000) + "天前";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

Taro.useShareAppMessage((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学资料库',
      path: '/pages/materials/index',
    }
  })

Taro.useShareTimeline((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学资料库',
      path: '/pages/materials/index',
    }
  })
</script>
