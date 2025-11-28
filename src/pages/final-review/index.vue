<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="min-h-screen bg-gray-50">
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

      <view v-else-if="projects.length === 0" class="text-center text-gray-400 pt-12">
        暂无可用项目，稍后再试
      </view>

      <view v-else class="space-y-3">
        <view
          v-for="project in projects"
          :key="project.id"
          class="bg-white rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform duration-150"
          @tap="openProject(project)"
        >
          <view class="flex justify-between">
            <view>
              <text class="text-base font-semibold text-gray-900">
                {{ project.name || project.title }}
              </text>
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
import { ref, onMounted } from "vue";
import Taro from "@tarojs/taro";
import { questionsAPI } from "../../api";

const loading = ref(false);
const projects = ref([]);

const normalizeProjects = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.projects)) return raw.projects;
  if (Array.isArray(raw.items)) return raw.items;
  return [];
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

onMounted(fetchProjects);

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

