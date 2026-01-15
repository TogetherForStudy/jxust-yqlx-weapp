<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 分类筛选标签 -->
    <view v-if="categories.length > 0" class="bg-white px-4 py-3 border-b border-gray-100">
      <view class="flex flex-wrap items-center gap-2">
        <view
          :class="[
            'px-4 py-1.5 rounded-full text-sm',
            selectedCategory === 'all'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700'
          ]"
          @tap="selectCategory('all')"
        >
          全部
        </view>
        <view
          v-for="category in categories"
          :key="category"
          :class="[
            'px-4 py-1.5 rounded-full text-sm',
            selectedCategory === category
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-700'
          ]"
          @tap="selectCategory(category)"
        >
          {{ category }}
        </view>
      </view>
    </view>

    <view class="p-4 space-y-4">
      <view v-if="loading" class="space-y-3">
        <view
          v-for="skeleton in 3"
          :key="`skeleton-${skeleton}`"
          class="bg-white rounded-2xl p-4 shadow-sm animate-pulse"
        >
          <view class="h-4 bg-gray-200 rounded w-1/2 mb-3"></view>
          <view class="h-3 bg-gray-100 rounded w-full mb-2"></view>
          <view class="h-3 bg-gray-100 rounded w-5/6"></view>
        </view>
      </view>

      <view v-else-if="filteredProjects.length === 0" class="text-center text-gray-400 pt-12">
        暂无可用项目，稍后再试
      </view>

      <view v-else class="space-y-3">
        <view
          v-for="project in filteredProjects"
          :key="project.id"
          class="bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform duration-150"
          @tap="openProject(project)"
        >
          <view class="flex justify-between gap-4">
            <view>
              <text class="text-base font-semibold text-gray-900">
                {{ project.name || project.title }}
              </text>
              <view
                v-if="project.user_count != null && project.usage_count != null"
                class="mt-1 text-xs text-gray-500"
              >
                {{ project.user_count }} 人已刷 {{ project.usage_count }} 题
              </view>
            </view>
            <view class="text-right">
              <view class="text-xs text-gray-400">题量</view>
              <text class="text-lg font-semibold text-indigo-500">
                {{ project.question_count || project.total || '--' }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Taro from "@tarojs/taro";
import { questionsAPI, configAPI } from "../../api";

const loading = ref(false);
const projects = ref([]);
const categories = ref([]);
const selectedCategory = ref('all');

// 根据前缀匹配项目分类
const matchProjectCategory = (projectName) => {
  if (!projectName) return null;

  // 遍历分类，找到匹配的前缀
  for (const category of categories.value) {
    if (projectName.startsWith(category)) {
      return category;
    }
  }
  return null;
};

// 过滤后的项目列表
const filteredProjects = computed(() => {
  if (selectedCategory.value === 'all') {
    return projects.value;
  }
  return projects.value.filter(project => {
    const projectName = project.name || project.title || '';
    return matchProjectCategory(projectName) === selectedCategory.value;
  });
});

const normalizeProjects = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.projects)) return raw.projects;
  if (Array.isArray(raw.items)) return raw.items;
  return [];
};

// 获取分类配置
const fetchCategories = async () => {
  try {
    const res = await configAPI.getConfig('QMFX_PIX');
    // 解析JSON数组格式的分类配置，格式如：["大学英语（一）", "大学英语（三）", "信息技术与人工智能概论"]
    let categoryData = null;

    if (Array.isArray(res)) {
      // 如果直接返回数组
      categoryData = res;
    } else if (typeof res === 'string') {
      // 如果是JSON字符串，解析它
      categoryData = JSON.parse(res);
    } else if (res && typeof res === 'object') {
      // 如果返回的是对象，尝试从value字段获取
      categoryData = res.value || res.data || res;
      if (typeof categoryData === 'string') {
        categoryData = JSON.parse(categoryData);
      }
    }

    if (Array.isArray(categoryData)) {
      categories.value = categoryData;
    } else {
      console.warn('QMFX_PIX配置格式不正确，应为JSON数组');
      categories.value = [];
    }
  } catch (error) {
    console.error("Failed to load categories", error);
    categories.value = [];
  }
};

const fetchProjects = async () => {
  loading.value = true;
  try {
    const res = await questionsAPI.getProjects();
    projects.value = normalizeProjects(res);
  } catch (error) {
    console.error("Failed to load projects", error);
    projects.value = [];
  } finally {
    loading.value = false;
  }
};

const selectCategory = (category) => {
  selectedCategory.value = category;
};

const openProject = (project) => {
  const params = new URLSearchParams({
    id: project.id,
    name: project.name || project.title || "期末复习项目",
    desc: project.description || "",
  });
  Taro.navigateTo({
    url: `/pages/final-review/detail/index?${params.toString()}`,
  });
};

onMounted(async () => {
  await fetchCategories();
  await fetchProjects();
});

Taro.useShareAppMessage((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学期末复习',
      path: '/pages/final-review/index',
    }
  })

Taro.useShareTimeline((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学期末复习',
      path: '/pages/final-review/index',
    }
  })
</script>

<style scoped></style>

