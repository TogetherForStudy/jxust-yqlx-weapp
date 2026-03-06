<template>
  <!-- 学习清单卡片 -->
  <view class="px-4">
    <view class="flex justify-between items-center mb-2">
      <text class="text-gray-800 font-medium">学习清单</text>
      <!-- 非空状态时显示在右上角 -->
      <view v-if="authStore.isLoggedIn && (stats.total_count > 0)" @tap="showAddModal = true"
        class="bg-green-500 text-white px-2 py-1 rounded-lg text-xs">
        <text class="i-lucide-plus w-3 h-3 mr-1"></text>
        添加
      </view>
    </view>

    <!-- 学习任务内容 -->
    <view class="bg-white rounded-xl shadow-sm border border-gray-100">
      <!-- 加载状态 -->
      <view v-if="isLoading" class="flex items-center justify-center py-8">
        <text class="text-gray-500 text-sm">加载中...</text>
      </view>

      <!-- 未登录状态 -->
      <view v-else-if="!authStore.isLoggedIn" class="flex flex-col items-center justify-center py-8">
        <view class="i-lucide-clipboard-list text-2xl text-gray-400 mb-2"></view>
        <text class="text-gray-500 text-sm">化繁为简 · 分而治之</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="stats.total_count === 0"
        class="flex flex-col items-center justify-center py-8">
        <view class="i-lucide-clipboard text-2xl text-gray-400 mb-2"></view>
        <text class="text-gray-500 text-sm mb-4">化繁为简 · 分而治之</text>
        <!-- 空状态时显示在提示下方 -->
        <view v-if="authStore.isLoggedIn" @tap="showAddModal = true"
          class="bg-green-500 text-white px-2 py-1 rounded-lg text-sm flex items-center">
          <text class="i-lucide-plus w-4 h-4 mr-1"></text>
          添加任务
        </view>
      </view>

      <!-- 学习任务列表 -->
      <view v-else class="p-3">
        <!-- Tab 切换（按钮组样式） -->
        <view class="flex gap-0 mb-3 p-1 bg-gray-100 rounded-lg">
          <view 
            @tap="switchToCompletedTab" 
            class="flex-1 text-center py-1 text-sm font-medium rounded-md transition-all"
            :class="activeTab === 'completed' 
              ? 'bg-white text-green-600 shadow-sm' 
              : 'text-gray-600'"
          >
            已完成({{ stats.completed_count }})
          </view>
          <view 
            @tap="switchToPendingTab" 
            class="flex-1 text-center py-1 text-sm font-medium rounded-md transition-all"
            :class="activeTab === 'pending' 
              ? 'bg-white text-green-600 shadow-sm' 
              : 'text-gray-600'"
          >
            待完成({{ stats.pending_count }})
          </view>
          
        </view>

          <!-- 待完成任务列表 -->
          <scroll-view 
            v-show="activeTab === 'pending'" 
            :scroll-y="true" 
          class="max-h-72" 
            @scrolltolower="loadMorePendingTasks" 
            :lower-threshold="100"
          >
            <view v-if="pendingTasks.length === 0" class="flex flex-col items-center justify-center py-8">
              <view class="i-lucide-clipboard text-2xl text-gray-400 mb-2"></view>
              <text class="text-gray-500 text-sm">劳逸结合 · 爱自己</text>
            </view>
            
            <view v-else class="space-y-2">
              <view v-for="task in pendingTasks" :key="`pending-${task.id}`"
                class="relative p-3 border rounded-lg" :class="getTaskBorderClass(task)"
                @tap="showEditTaskModal(task)">
                <!-- 任务内容 -->
                <view class="flex items-start gap-3">
                  <!-- 优先级指示器 -->
                  <view class="w-1 h-4 rounded-full flex-shrink-0 mt-0.5" :class="getPriorityColorClass(task.priority)">
                  </view>

                  <view class="flex-1 min-w-0">
                    <!-- 任务标题和右上角操作区 -->
                    <view class="flex items-start justify-between gap-2">
                      <text class="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                        {{ task.title }}
                      </text>

                      <!-- 右上角操作区 -->
                      <view class="flex items-center gap-2 flex-shrink-0">
                        <!-- 天数提醒 -->
                        <view v-if="getDaysLeftBadge(task.due_date, task.status)"
                          class="px-1.5 py-0.5 rounded text-xs font-medium" :class="getDaysLeftBadgeClass(task.due_date, task.status)
                            ">
                          {{ getDaysLeftBadge(task.due_date, task.status) }}
                        </view>

                        <!-- 完成按钮 -->
                        <view @tap.stop="toggleTaskStatus(task.id)"
                          class="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center active:bg-gray-100">
                          <text v-if="task.status === 2" class="i-lucide-check w-3 h-3 text-green-500"></text>
                        </view>
                      </view>
                    </view>

                    <!-- 任务描述 -->
                    <text v-if="task.description" class="text-xs text-gray-600 line-clamp-1 mt-1">
                      {{ task.description }}
                    </text>
                  </view>
                </view>
              </view>
            </view>

            <!-- 加载更多指示器 -->
            <view v-if="pendingTasks.length > 0" class="text-center py-2">
              <text v-if="isLoadingMorePending" class="text-gray-500 text-sm">加载中...</text>
              <text v-else-if="!hasMorePendingData" class="text-gray-400 text-xs">已加载全部</text>
            </view>
          </scroll-view>

          <!-- 已完成任务列表 -->
          <scroll-view 
            v-show="activeTab === 'completed'" 
            :scroll-y="true" 
          class="max-h-72" 
            @scrolltolower="loadMoreCompletedTasks" 
            :lower-threshold="100"
          >
            <view v-if="completedTasks.length === 0" class="flex flex-col items-center justify-center py-8">
              <view class="i-lucide-check-circle text-2xl text-gray-400 mb-2"></view>
              <text class="text-gray-500 text-sm">还没有完成的任务</text>
            </view>
            
            <view v-else class="space-y-2">
              <view v-for="task in completedTasks" :key="`completed-${task.id}`"
                class="relative p-3 border border-green-200 rounded-lg bg-green-50" @tap="showEditTaskModal(task)">
                <!-- 任务内容 -->
                <view class="flex items-start gap-3">
                  <!-- 完成指示器 -->
                  <view class="w-1 h-4 rounded-full bg-green-400 flex-shrink-0 mt-0.5"></view>

                  <view class="flex-1 min-w-0">
                    <!-- 任务标题和右上角操作区 -->
                    <view class="flex items-start justify-between gap-2">
                      <text class="text-sm font-medium text-gray-700 line-clamp-2 flex-1">
                        {{ task.title }}
                      </text>

                      <!-- 完成按钮 -->
                      <view @tap.stop="toggleTaskStatus(task.id)"
                        class="flex-shrink-0 w-5 h-5 border-2 border-green-400 rounded-full flex items-center justify-center bg-green-400 active:bg-green-500">
                        <text class="i-lucide-check w-3 h-3 text-white"></text>
                      </view>
                    </view>

                    <!-- 完成时间 -->
                    <view class="flex items-center gap-1 mt-1">
                      <text class="i-lucide-check-circle w-3 h-3 text-green-500"></text>
                      <text class="text-xs text-green-600">
                        {{
                          formatCompletedTime(
                            task.completed_at || task.updated_at
                          )
                        }}
                      </text>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <!-- 加载更多指示器 -->
            <view v-if="completedTasks.length > 0" class="text-center py-2">
              <text v-if="isLoadingMoreCompleted" class="text-gray-500 text-sm">加载中...</text>
              <text v-else-if="!hasMoreCompletedData" class="text-gray-400 text-xs">已加载全部</text>
            </view>
          </scroll-view>
        </view>
      </view>

    <!-- 添加学习任务弹窗 -->
    <view v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
      @tap="hideAddModal">
      <view @tap.stop="" class="bg-white rounded-t-2xl w-full h-4/5 flex flex-col">
        <!-- 弹窗头部 -->
        <view class="flex justify-between items-center px-4 py-2 border-b border-gray-100">
          <text class="text-lg font-semibold">添加学习任务</text>
          <view @tap="hideAddModal" class="p-1">
            <text class="i-lucide-x w-5 h-5 text-gray-400"></text>
          </view>
        </view>

        <!-- 弹窗内容 -->
        <view class="flex-1 h-[1px]">
          <scroll-view :scroll-y="true" class="h-full">
            <view class="p-4 space-y-4">
              <!-- 标题 -->
              <view class="flex flex-col gap-2">
                <text class="text-sm font-medium text-gray-700">任务标题 *</text>
                <input v-model="newTask.title" placeholder="请输入学习任务标题"
                  class="border-solid border-[1px] border-gray-400 rounded-lg p-2" />
              </view>

              <!-- 描述 -->
              <view class="flex flex-col gap-2">
                <text class="text-sm font-medium text-gray-700">任务描述（可选）</text>
                <textarea v-model="newTask.description" placeholder="添加一些描述信息"
                  class="border-solid border-[1px] border-gray-400 rounded-lg p-2 box-border w-full" maxlength="500" />
                <text class="text-xs text-gray-400">{{ newTask.description.length }}/500</text>
              </view>

              <!-- 截止日期 -->
              <view class="flex flex-col gap-2">
                <text class="text-sm font-medium text-gray-700">截止时间</text>
                <view class="grid grid-cols-2 gap-2">
                  <picker mode="date" :value="newTask.due_date" @change="onDateChange">
                    <view class="flex items-center justify-between border border-gray-300 rounded-lg p-3">
                      <text :class="newTask.due_date ? 'text-gray-900' : 'text-gray-400'
                        ">
                        {{ newTask.due_date || "日期" }}
                      </text>
                      <text class="i-lucide-calendar w-4 h-4 text-gray-400"></text>
                    </view>
                  </picker>
                  <picker mode="time" :value="newTask.due_time" @change="onTimeChange">
                    <view class="flex items-center justify-between border border-gray-300 rounded-lg p-3">
                      <text :class="newTask.due_time ? 'text-gray-900' : 'text-gray-400'
                        ">
                        {{ newTask.due_time || "时间" }}
                      </text>
                      <text class="i-lucide-clock w-4 h-4 text-gray-400"></text>
                    </view>
                  </picker>
                </view>
              </view>

              <!-- 优先级 -->
              <view class="flex flex-col gap-2">
                <text class="text-sm font-medium text-gray-700">优先级</text>
                <view class="flex gap-2">
                  <view v-for="priority in priorityOptions" :key="priority.value"
                    @tap="newTask.priority = priority.value"
                    class="flex-1 p-3 rounded-lg border text-center text-sm font-medium" :class="newTask.priority === priority.value
                        ? priority.activeClass
                        : 'border-gray-200 text-gray-600 bg-white'
                      ">
                    <text class="block">{{ priority.icon }}</text>
                    <text class="block mt-1">{{ priority.label }}</text>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        <!-- 弹窗底部 -->
        <view class="p-4 border-t border-gray-100 flex space-x-3">
          <view @tap="hideAddModal"
            class="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-lg text-center font-medium">
            取消
          </view>
          <view @tap="submitTask" :class="[
            'flex-1 py-3 px-4 rounded-lg text-center text-white font-medium',
            canSubmit ? 'bg-green-500' : 'bg-gray-300',
          ]">
            {{ submitting ? "添加中..." : "添加" }}
          </view>
        </view>
      </view>
    </view>

    <!-- 编辑学习任务弹窗 -->
    <view v-if="showEditModal && currentTask"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50" @tap="hideEditModal">
      <view @tap.stop="" class="bg-white rounded-t-2xl w-full h-4/5 flex flex-col">
        <!-- 弹窗头部 -->
        <view class="flex justify-between items-center px-4 py-2 border-b border-gray-100">
          <text class="text-lg font-semibold">编辑学习任务</text>
          <view class="flex space-x-2">
            <view @tap="deleteTask" class="p-1">
              <text class="i-lucide-trash-2 w-5 h-5 text-red-400"></text>
            </view>
            <view @tap="hideEditModal" class="p-1">
              <text class="i-lucide-x w-5 h-5 text-gray-400"></text>
            </view>
          </view>
        </view>

        <!-- 弹窗内容 -->
        <view class="flex-1 h-[1px]">
          <scroll-view :scroll-y="true" class="h-full">
            <view class="p-4 space-y-4">
              <!-- 标题 -->
              <view class="flex flex-col gap-2">
                <text class="text-sm font-medium text-gray-700">任务标题 *</text>
                <input v-model="editTask.title" placeholder="请输入学习任务标题"
                  class="border-solid border-[1px] border-gray-400 rounded-lg p-2" />
              </view>

              <!-- 描述 -->
              <view class="flex flex-col gap-2">
                <text class="text-sm font-medium text-gray-700">任务描述（可选）</text>
                <textarea v-model="editTask.description" placeholder="添加一些描述信息"
                  class="border-solid border-[1px] border-gray-400 rounded-lg p-2 box-border w-full" maxlength="500" />
                <text class="text-xs text-gray-400">{{ editTask.description.length }}/500</text>
              </view>

              <!-- 截止日期 -->
              <view class="flex flex-col gap-2">
                <text class="text-sm font-medium text-gray-700">截止日期</text>
                <view class="grid grid-cols-2 gap-2">
                  <picker mode="date" :value="editTask.due_date" @change="onEditDateChange">
                    <view class="flex items-center justify-between border border-gray-300 rounded-lg p-3">
                      <text :class="editTask.due_date ? 'text-gray-900' : 'text-gray-400'
                        ">
                        {{ editTask.due_date || "日期" }}
                      </text>
                      <text class="i-lucide-calendar w-4 h-4 text-gray-400"></text>
                    </view>
                  </picker>
                  <picker mode="time" :value="editTask.due_time" @change="onEditTimeChange">
                    <view class="flex items-center justify-between border border-gray-300 rounded-lg p-3">
                      <text :class="editTask.due_time ? 'text-gray-900' : 'text-gray-400'
                        ">
                        {{ editTask.due_time || "时间" }}
                      </text>
                      <text class="i-lucide-clock w-4 h-4 text-gray-400"></text>
                    </view>
                  </picker>
                </view>
              </view>

              <!-- 优先级 -->
              <view class="flex flex-col gap-2">
                <text class="text-sm font-medium text-gray-700">优先级</text>
                <view class="flex gap-2">
                  <view v-for="priority in priorityOptions" :key="priority.value"
                    @tap="editTask.priority = priority.value"
                    class="flex-1 p-3 rounded-lg border text-center text-sm font-medium" :class="editTask.priority === priority.value
                        ? priority.activeClass
                        : 'border-gray-200 text-gray-600 bg-white'
                      ">
                    <text class="block">{{ priority.icon }}</text>
                    <text class="block mt-1">{{ priority.label }}</text>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 弹窗底部 -->
        <view class="p-4 border-t border-gray-100 flex space-x-3">
          <view @tap="hideEditModal"
            class="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-lg text-center font-medium">
            取消
          </view>
          <view @tap="updateTask" :class="[
            'flex-1 py-3 px-4 rounded-lg text-center text-white font-medium',
            canEditSubmit ? 'bg-green-500' : 'bg-gray-300',
          ]">
            {{ submitting ? "更新中..." : "更新" }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import Taro from "@tarojs/taro";
import { useAuthStore } from "../../../stores/auth";
import { useStudyTaskStore } from "../../../stores/study-tasks";
import { formatDateTime } from "../../../utils/time";

// 定义组件名称
defineOptions({
  name: "StudyTaskCard",
});

const authStore = useAuthStore();
const studyTaskStore = useStudyTaskStore();

// 响应式数据
const showAddModal = ref(false);
const showEditModal = ref(false);
const activeTab = ref('pending'); // 当前激活的tab: 'pending' 或 'completed'
const submitting = ref(false);
const currentTask = ref(null);

// 待完成任务分页相关
const pendingCurrentPage = ref(1);
const pendingPageSize = ref(10);
const isLoadingMorePending = ref(false);
const hasMorePendingData = ref(true);

// 已完成任务分页相关
const completedCurrentPage = ref(1);
const completedPageSize = ref(10);
const isLoadingMoreCompleted = ref(false);
const hasMoreCompletedData = ref(true);

// 新增任务数据
const newTask = ref({
  title: "",
  description: "",
  due_date: "",
  due_time: "", // 临时存储时间部分，用于picker绑定
  priority: 2, // 默认中优先级
});

// 编辑任务数据
const editTask = ref({
  title: "",
  description: "",
  due_date: "",
  due_time: "", // 临时存储时间部分，用于picker绑定
  priority: 2,
  status: 1,
});

// 优先级选项
const priorityOptions = [
  {
    value: 1,
    label: "高",
    icon: "🔴",
    activeClass: "border-red-400 bg-red-50 text-red-600",
  },
  {
    value: 2,
    label: "中",
    icon: "🟡",
    activeClass: "border-yellow-400 bg-yellow-50 text-yellow-600",
  },
  {
    value: 3,
    label: "低",
    icon: "🟢",
    activeClass: "border-green-400 bg-green-50 text-green-600",
  },
];

// 计算属性
const isLoading = computed(() => studyTaskStore.isLoading);
const pendingTasks = computed(() => studyTaskStore.sortedPendingTasks);
const completedTasks = computed(() => studyTaskStore.completedTasksList);
const stats = computed(() => studyTaskStore.stats);

const canSubmit = computed(() => {
  return newTask.value.title.trim() && !submitting.value;
});

const canEditSubmit = computed(() => {
  return editTask.value.title.trim() && !submitting.value;
});

// 处理后端返回的日期格式：2025-09-28T00:00:00+08:00
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr);
};

// 工具方法

const formatCompletedTime = (dateStr) => {
  // 如果没有完成时间，返回默认文本
  if (!dateStr) return "刚刚完成";

  const date = new Date(dateStr);
  // 检查日期是否有效
  if (isNaN(date.getTime())) return "刚刚完成";

  const today = new Date();
  const diffTime = today - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 防止负数天数的情况
  if (diffDays < 0) return "刚刚完成";
  if (diffDays === 0) return "今天完成";
  if (diffDays === 1) return "昨天完成";
  if (diffDays <= 7) return `${diffDays}天前完成`;
  return formatDateTime(date, 'yyyy-MM-dd HH:mm');
};

const getPriorityColorClass = (priority) => {
  const map = {
    1: "bg-red-400",
    2: "bg-yellow-400",
    3: "bg-green-400",
  };
  return map[priority] || "bg-yellow-400";
};

const getTaskBorderClass = (task) => {
  const daysLeft = studyTaskStore.calculateDaysLeft(task.due_date);

  if (task.status === 2) return "border-green-200";
  if (daysLeft < 0) return "border-red-200"; // 过期
  if (daysLeft === 0) return "border-orange-300"; // 今天
  if (daysLeft <= 3) return "border-amber-200"; // 紧急
  return "border-gray-200";
};

const getDaysLeftBadge = (dueDate, status) => {
  if (status === 2) return null;

  // 如果没有截止日期，不显示任何提醒
  if (!dueDate) return null;

  const now = new Date();
  const target = parseDate(dueDate);
  if (!target || isNaN(target.getTime())) return null;

  // 检查是否有具体时间（不是00:00）
  const hasTime = target.getHours() !== 0 || target.getMinutes() !== 0;

  if (hasTime) {
    // 有具体时间的情况，精确到小时
    if (target < now) return "已过期";

    const diffTime = target - now;
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours <= 24) {
      if (diffHours <= 1) return "1小时内";
      if (diffHours <= 6) return `${diffHours}小时`;
      return "今天";
    }

    if (diffDays <= 3) return `${diffDays}天`;
    return null;
  }

  // 没有具体时间的情况，按天计算
  const daysLeft = studyTaskStore.calculateDaysLeft(dueDate);
  if (daysLeft < 0) return "已过期";
  if (daysLeft === 0) return "今天";
  if (daysLeft <= 3) return `${daysLeft}天`;
  return null;
};

const getDaysLeftBadgeClass = (dueDate, status) => {
  if (status === 2) return "";

  // 如果没有截止日期，返回空字符串
  if (!dueDate) return "";

  const now = new Date();
  const target = parseDate(dueDate);
  if (!target || isNaN(target.getTime())) return "";

  // 检查是否有具体时间（不是00:00）
  const hasTime = target.getHours() !== 0 || target.getMinutes() !== 0;

  if (hasTime) {
    // 有具体时间的情况，精确到小时
    if (target < now) return "bg-red-100 text-red-600";

    const diffTime = target - now;
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours <= 1) return "bg-red-100 text-red-600"; // 1小时内，红色
    if (diffHours <= 6) return "bg-orange-100 text-orange-600"; // 6小时内，橙色
    if (diffHours <= 24) return "bg-amber-100 text-amber-600"; // 今天，琥珀色

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return "bg-amber-100 text-amber-600";
    return "bg-blue-100 text-blue-600";
  }

  // 没有具体时间的情况，按天计算
  const daysLeft = studyTaskStore.calculateDaysLeft(dueDate);
  if (daysLeft < 0) return "bg-red-100 text-red-600";
  if (daysLeft === 0) return "bg-orange-100 text-orange-600";
  if (daysLeft <= 3) return "bg-amber-100 text-amber-600";
  return "bg-blue-100 text-blue-600";
};

// 显示编辑弹窗
const showEditTaskModal = (task) => {
  if (!authStore.requireAuth()) return;

  currentTask.value = task;

  // 分离日期和时间
  const { dateStr, timeStr } = separateDateAndTime(task.due_date);

  editTask.value = {
    title: task.title,
    description: task.description || "",
    due_date: dateStr,
    due_time: timeStr,
    priority: task.priority,
    status: task.status,
  };
  showEditModal.value = true;
};



// 分离日期和时间
const separateDateAndTime = (dateTimeStr) => {
  if (!dateTimeStr) return { dateStr: "", timeStr: "" };

  const date = parseDate(dateTimeStr);
  if (!date || isNaN(date.getTime())) return { dateStr: "", timeStr: "" };

  // 格式化为picker需要的日期格式
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  // 检查是否有具体时间（不是00:00）
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  const timeStr = hasTime
    ? `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`
    : "";

  return { dateStr, timeStr };
};

// 合并日期和时间
const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr) return "";

  if (timeStr) {
    return `${dateStr} ${timeStr}`;
  } else {
    return `${dateStr} 00:00`;
  }
};

// 隐藏添加弹窗
const hideAddModal = () => {
  showAddModal.value = false;
  resetNewTask();
};

// 隐藏编辑弹窗
const hideEditModal = () => {
  showEditModal.value = false;
  currentTask.value = null;
  resetEditTask();
};

// 重置新增表单
const resetNewTask = () => {
  newTask.value = {
    title: "",
    description: "",
    due_date: "",
    due_time: "",
    priority: 2,
  };
};

// 重置编辑表单
const resetEditTask = () => {
  editTask.value = {
    title: "",
    description: "",
    due_date: "",
    due_time: "",
    priority: 2,
    status: 1,
  };
};

// 日期选择处理
const onDateChange = (e) => {
  newTask.value.due_date = e.detail.value;
};

// 时间选择处理
const onTimeChange = (e) => {
  newTask.value.due_time = e.detail.value;
};

// 编辑日期选择处理
const onEditDateChange = (e) => {
  editTask.value.due_date = e.detail.value;
};

// 编辑时间选择处理
const onEditTimeChange = (e) => {
  editTask.value.due_time = e.detail.value;
};

// 提交新增任务
const submitTask = async () => {
  if (!canSubmit.value) return;

  submitting.value = true;
  try {
    // 准备提交数据
    const taskData = {
      title: newTask.value.title,
      description: newTask.value.description,
      priority: newTask.value.priority,
    };

    // 合并日期和时间到due_date字段
    if (newTask.value.due_date) {
      taskData.due_date = combineDateAndTime(
        newTask.value.due_date,
        newTask.value.due_time
      );
    }

    await studyTaskStore.createStudyTask(taskData);

    Taro.showToast({
      title: "添加成功",
      icon: "success",
    });

    hideAddModal();
  } catch (error) {
    Taro.showToast({
      title: error.message || "添加失败",
      icon: "error",
    });
  } finally {
    submitting.value = false;
  }
};

// 更新任务
const updateTask = async () => {
  if (!canEditSubmit.value || !currentTask.value) return;

  submitting.value = true;
  try {
    // 准备更新数据
    const taskData = {
      title: editTask.value.title,
      description: editTask.value.description,
      priority: editTask.value.priority,
      status: editTask.value.status,
    };

    // 合并日期和时间到due_date字段
    if (editTask.value.due_date) {
      taskData.due_date = combineDateAndTime(
        editTask.value.due_date,
        editTask.value.due_time
      );
    }

    await studyTaskStore.updateStudyTask(currentTask.value.id, taskData);

    Taro.showToast({
      title: "更新成功",
      icon: "success",
    });

    hideEditModal();
  } catch (error) {
    Taro.showToast({
      title: error.message || "更新失败",
      icon: "error",
    });
  } finally {
    submitting.value = false;
  }
};

// 删除任务
const deleteTask = async () => {
  if (!currentTask.value) return;

  const res = await Taro.showModal({
    title: "删除任务",
    content: "确定要删除这个学习任务吗？",
    confirmText: "删除",
    confirmColor: "#ef4444",
  });

  if (res.confirm) {
    try {
      await studyTaskStore.deleteStudyTask(currentTask.value.id);

      Taro.showToast({
        title: "删除成功",
        icon: "success",
      });

      hideEditModal();
    } catch (error) {
      Taro.showToast({
        title: error.message || "删除失败",
        icon: "error",
      });
    }
  }
};

// 切换任务完成状态
const toggleTaskStatus = async (taskId) => {
  try {
    const task =
      pendingTasks.value.find((t) => t.id === taskId) ||
      completedTasks.value.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 1 ? 2 : 1;
    const updateData = {
      status: newStatus,
    };

    // 如果是标记为完成，设置完成时间
    if (newStatus === 2) {
      updateData.completed_at = new Date().toISOString();
    }

    await studyTaskStore.updateStudyTask(taskId, updateData);

    Taro.showToast({
      title: "状态更新成功",
      icon: "success",
      duration: 1000,
    });
  } catch (error) {
    Taro.showToast({
      title: error.message || "更新失败",
      icon: "error",
    });
  }
};

// 加载数据
const loadData = async (reset = true) => {
  // 未登录时不发起请求
  if (!authStore.isLoggedIn) {
    return
  }

  if (!isLoading.value) {
    try {
      if (reset) {
        pendingCurrentPage.value = 1;
        completedCurrentPage.value = 1;
        hasMorePendingData.value = true;
        hasMoreCompletedData.value = true;
      }

      // 并行请求：待完成任务、已完成任务、统计数据
      const [pendingResponse, completedResponse] = await Promise.all([
        studyTaskStore.fetchStudyTasks({
          page: pendingCurrentPage.value,
          size: pendingPageSize.value,
          status: 1,
        }),
        studyTaskStore.fetchCompletedStudyTasks({
          page: completedCurrentPage.value,
          size: completedPageSize.value,
          status: 2,
        }),
        studyTaskStore.fetchStudyTaskStats(),
      ]);

      // 判断待完成任务是否还有更多数据
      if (pendingResponse && pendingResponse.data) {
        const returnedCount = pendingResponse.data.length;
        const currentPendingCount = pendingTasks.value.length;
        hasMorePendingData.value = returnedCount === pendingPageSize.value &&
                           currentPendingCount < stats.value.pending_count;
      } else {
        hasMorePendingData.value = false;
      }

      // 判断已完成任务是否还有更多数据
      if (completedResponse && completedResponse.data) {
        const returnedCount = completedResponse.data.length;
        const currentCompletedCount = completedTasks.value.length;
        hasMoreCompletedData.value = returnedCount === completedPageSize.value &&
                           currentCompletedCount < stats.value.completed_count;
      } else {
        hasMoreCompletedData.value = false;
      }
    } catch (error) {
      console.error("获取学习任务列表失败:", error);
      hasMorePendingData.value = false;
      hasMoreCompletedData.value = false;
    }
  }
};

// 加载更多待完成任务
const loadMorePendingTasks = async () => {
  if (isLoadingMorePending.value || !authStore.isLoggedIn || !hasMorePendingData.value) {
    return;
  }

  isLoadingMorePending.value = true;
  try {
    pendingCurrentPage.value++;
    // 只请求未完成的任务（status=1）
    const response = await studyTaskStore.fetchStudyTasks({
      page: pendingCurrentPage.value,
      size: pendingPageSize.value,
      status: 1, // 只获取待完成的任务
      append: true, // 标记为追加数据，不替换现有数据
    });

    // 判断是否还有更多数据
    if (response && response.data) {
      const returnedCount = response.data.length;
      const currentPendingCount = pendingTasks.value.length;
      hasMorePendingData.value = returnedCount === pendingPageSize.value &&
                         currentPendingCount < stats.value.pending_count;
    } else {
      hasMorePendingData.value = false;
    }
  } catch (error) {
    console.error("加载更多待完成任务失败:", error);
    pendingCurrentPage.value--; // 回退页码
    hasMorePendingData.value = false;
  } finally {
    isLoadingMorePending.value = false;
  }
};

// 加载更多已完成任务
const loadMoreCompletedTasks = async () => {
  if (isLoadingMoreCompleted.value || !authStore.isLoggedIn || !hasMoreCompletedData.value) {
    return;
  }

  isLoadingMoreCompleted.value = true;
  try {
    completedCurrentPage.value++;
    const response = await studyTaskStore.fetchCompletedStudyTasks({
      status: 2,
      page: completedCurrentPage.value,
      size: completedPageSize.value,
      append: true, // 标记为追加数据
    });

    // 判断是否还有更多已完成任务
    if (response && response.data) {
      const returnedCount = response.data.length;
      const currentCompletedCount = completedTasks.value.length;
      hasMoreCompletedData.value = returnedCount === completedPageSize.value &&
                                     currentCompletedCount < stats.value.completed_count;
    } else {
      hasMoreCompletedData.value = false;
    }
  } catch (error) {
    console.error("加载更多已完成任务失败:", error);
    completedCurrentPage.value--;
    hasMoreCompletedData.value = false;
  } finally {
    isLoadingMoreCompleted.value = false;
  }
};

// 切换到待完成Tab
const switchToPendingTab = async () => {
  // 如果当前已经是待完成tab，不需要切换
  if (activeTab.value === 'pending') return;

  // 先加载数据（如果需要的话）
  if (pendingTasks.value.length === 0 && stats.value.pending_count > 0 && !isLoading.value) {
    try {
      await loadData(true);
    } catch (error) {
      console.error("加载待完成任务失败:", error);
    }
  }

  // 数据准备好后再切换视图
  activeTab.value = 'pending';
};

// 切换到已完成Tab
const switchToCompletedTab = async () => {
  if (activeTab.value === 'completed') return;

  // 数据已在 loadData 中预加载，仅在数据为空且确实有数据时补充请求
  if (completedTasks.value.length === 0 && stats.value.completed_count > 0) {
    try {
      completedCurrentPage.value = 1;
      hasMoreCompletedData.value = true;
      await studyTaskStore.fetchCompletedStudyTasks({
        status: 2,
        page: completedCurrentPage.value,
        size: completedPageSize.value,
      });
    } catch (error) {
      console.error("加载已完成任务失败:", error);
    }
  }

  activeTab.value = 'completed';
};

// 页面显示时刷新数据
Taro.useDidShow(() => {
  if (
    authStore.isLoggedIn &&
    studyTaskStore.pendingTasks.length === 0 &&
    studyTaskStore.isFetchData == false
  ) {
    loadData();
  }
});
</script>
