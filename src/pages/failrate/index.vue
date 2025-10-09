<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <!-- 搜索栏 -->
    <view class="bg-white px-4 py-3 shadow-sm shrink-0">
      <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
        <text class="i-lucide-search text-gray-400 w-4 h-4 mr-2"></text>
        <input
          v-model="searchKeyword"
          placeholder="搜索课程名称"
          class="flex-1 bg-transparent text-sm outline-none h-full"
          @input="onSearchInput"
          @confirm="handleSearch"
        />
        <view v-if="searchKeyword" @tap="clearSearch" class="ml-2 p-1">
          <text class="i-lucide-x text-gray-400 w-4 h-4"></text>
        </view>
      </view>
    </view>

    <!-- 主内容区域 -->
    <view class="flex-1 flex flex-col min-h-0">
      <!-- 加载状态 -->
      <view v-if="loading" class="flex-1 flex items-center justify-center">
        <text class="text-gray-500 text-sm">加载中...</text>
      </view>

      <!-- 课程挂科率列表 -->
      <scroll-view
        v-else-if="failRateList.length > 0"
        :scroll-y="true"
        class="flex-1 h-[1px]"
        @scrolltolower="loadMore"
        :threshold="100"
      >
        <view class="p-4 space-y-3">
          <view v-if="searchKeyword == ''" class="text-sm text-gray-500">随机十条</view>
          <view v-else class="text-sm text-gray-500">搜索结果</view>
          <view
            v-for="item in failRateList"
            :key="item.id"
            class="bg-white rounded-lg px-4 py-2 shadow-sm"
          >
            <view class="flex justify-between items-center py-1">
              <!-- 课程名称 -->
              <text class="text-gray-800">{{
                item.course_name || '未知课程'
              }}</text>
            <!-- 挂科率 -->
                <view
                  :class="[
                    'px-2 rounded-full',
                    getFailRateClass(item.failrate)
                  ]"
                >
                  {{ formatFailRate(item.failrate) }}
                </view>
              </view>

            <!-- 开课单位和学期 -->
            <view class="flex justify-between items-center">
                <view class="flex items-center mb-1">
                  <text class="i-lucide-building w-3 h-3 text-gray-400 mr-1"></text>
                  <text class="text-sm text-gray-600">{{ item.department || '未知单位' }}</text>
                </view>
                <view v-if="item.semester" class="flex items-center">
                  <text class="i-lucide-calendar w-3 h-3 text-gray-400 mr-1"></text>
                  <text class="text-xs text-gray-500">{{ item.semester }}</text>
                </view>
            </view>
          </view>

          <!-- 加载更多 -->
          <view v-if="loadingMore" class="text-center py-4">
            <text class="text-gray-500 text-sm">加载更多...</text>
          </view>

          <!-- 没有更多数据 -->
          <view
            v-else-if="!hasMore && failRateList.length > 0 && searchKeyword"
            class="text-center py-4"
          >
            <text class="text-gray-400 text-sm">没有更多数据了</text>
          </view>
        </view>
      </scroll-view>

      <!-- 空状态 -->
      <view v-else class="flex-1 flex items-center justify-center">
        <view class="text-center">
          <text
            :class="[
              'block mx-auto mb-4',
              searchKeyword && hasSearched ? 'i-lucide-search-x w-12 h-12 text-gray-300' : 'i-lucide-bar-chart w-12 h-12 text-gray-300'
            ]"
          ></text>
          <text class="text-gray-500 mb-2 block">
            {{ searchKeyword && hasSearched ? `未找到包含"${searchKeyword}"的课程` : '回车搜索' }}
          </text>
          <text class="text-sm text-gray-400">
            {{ searchKeyword && hasSearched ? '请尝试其他关键词' : '点击输入法回车键搜索' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Taro from "@tarojs/taro";
import { failRateAPI } from "../../api/index";

// 响应式数据
const searchKeyword = ref("");
const failRateList = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const hasSearched = ref(false);

// 页面大小
const PAGE_SIZE = 10;

// 方法
const formatFailRate = (rate) => {
  if (rate === null || rate === undefined) return "未知";
  return `${rate}%`;
};

const getFailRateClass = (rate) => {
  if (rate === null || rate === undefined) return "bg-gray-100 text-gray-600";

  const percentage = rate;
  if (percentage <= 10) return "bg-green-100 text-green-600";
  if (percentage <= 20) return "bg-yellow-100 text-yellow-600";
  if (percentage <= 30) return "bg-orange-100 text-orange-600";
  return "bg-red-100 text-red-600";
};

const loadRandomData = async () => {
  loading.value = true;
  try {
    const result = await failRateAPI.getRandom();
    failRateList.value = result.list || [];
    hasMore.value = false; // 随机数据不支持分页
  } catch (error) {
    console.error("获取随机挂科率数据失败:", error);
    Taro.showToast({
      title: "加载失败",
      icon: "error",
    });
  } finally {
    loading.value = false;
  }
};

const searchFailRate = async (keyword, page = 1) => {
  if (page === 1) {
    loading.value = true;
    failRateList.value = [];
  } else {
    loadingMore.value = true;
  }

  try {
    const result = await failRateAPI.search({
      keyword,
      page,
      size: PAGE_SIZE,
    });

    const newData = result.list || [];
    if (page === 1) {
      failRateList.value = newData;
    } else {
      failRateList.value = [...failRateList.value, ...newData];
    }

    currentPage.value = page;
    hasMore.value = newData.length >= PAGE_SIZE;

  } catch (error) {
    console.error("搜索挂科率数据失败:", error);
    Taro.showToast({
      title: "搜索失败",
      icon: "error",
    });
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const onSearchInput = (e) => {
  searchKeyword.value = e.detail.value;
  failRateList.value = [];
  hasSearched.value = false;
};

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    hasSearched.value = true;
    currentPage.value = 1;
    searchFailRate(searchKeyword.value.trim());
  }
};

const clearSearch = () => {
  searchKeyword.value = "";
  hasSearched.value = false;
  currentPage.value = 1;
  hasMore.value = true;
  loadRandomData();
};

const loadMore = () => {
  if (!hasMore.value || loadingMore.value || !searchKeyword.value.trim()) return;

  const nextPage = currentPage.value + 1;
  searchFailRate(searchKeyword.value.trim(), nextPage);
};

// 页面生命周期
onMounted(() => {
  loadRandomData();
});
</script>
