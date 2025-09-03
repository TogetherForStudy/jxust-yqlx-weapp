<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <!-- 头部 -->
    <view class="bg-white px-4 shadow-sm shrink-0">
      <view class="flex justify-between items-center">
        <text class="text-lg font-semibold text-gray-800">评价审核管理</text>
        <view @tap="refreshData" class="p-2">
          <text class="i-lucide-refresh-cw w-5 h-5 text-gray-600"></text>
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
          placeholder="搜索教师姓名或课程名称"
          class="flex-1 bg-transparent text-sm outline-none"
          @input="onSearchInput"
        />
        <view v-if="searchKeyword" @tap="clearSearch" class="ml-2 p-1">
          <text class="i-lucide-x text-gray-400 w-4 h-4"></text>
        </view>
      </view>
    </view>

    <view class="flex-1 h-[1px]">
      <!-- 评价列表 -->
      <scroll-view :scroll-y="true" class="h-full"
      @scrolltolower="loadMoreReviews"
      :threshold="100">
        <view class="p-4 space-y-4">
          <view
            v-for="review in filteredReviews"
            :key="review.id"
            class="bg-white rounded-lg shadow-sm"
          >
            <!-- 评价头部 -->
            <view class="px-4 pt-2 border-b border-gray-100">
              <view class="flex justify-between items-start mb-2">
                <view class="flex-1">
                  <view class="flex items-center mb-1">
                    <text class="text-gray-800 mr-2 max-w-[70%] truncate">{{
                      review.teacher_name
                    }}</text>
                    <view
                      :class="[
                        'px-2 py-0.5 rounded text-xs',
                        getStatusClass(review.status),
                      ]"
                    >
                      {{ getStatusText(review.status) }}
                    </view>
                  </view>
                  <view class="flex items-center text-sm text-gray-600">
                    <text class="mr-4 max-w-[50%] truncate">{{ review.course_name }}</text>
                    <text v-if="review.campus" class="mr-4">{{
                      review.campus
                    }}</text>
                    <view
                      :class="[
                        'px-2 py-0.5 rounded text-xs',
                        getAttitudeClass(review.attitude),
                      ]"
                    >
                      {{ getAttitudeText(review.attitude) }}
                    </view>
                  </view>
                </view>
                <text class="text-xs text-gray-400">{{
                  formatDate(review.created_at)
                }}</text>
              </view>
            </view>

            <!-- 评价内容 -->
            <view class="px-4 py-2">
              <text class="text-gray-700">{{
                review.content
              }}</text>

              <!-- 管理员备注 -->
              <view
                v-if="review.admin_note"
                class="bg-gray-50 p-3 rounded-lg mt-2"
              >
                <text class="text-sm text-gray-600 font-medium mb-1"
                  >管理员备注:</text
                >
                <text class="text-sm text-gray-700">{{
                  review.admin_note
                }}</text>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view
              v-if="review.status === REVIEW_STATUS.PENDING"
              class="px-4 py-2 border-t border-gray-100"
            >
              <view class="flex space-x-3">
                <view
                  @tap="showRejectModal(review)"
                  class="flex-1 py-2 px-4 bg-red-50 text-red-600 rounded-lg text-center text-sm"
                >
                  拒绝
                </view>
                <view
                  @tap="showApproveModal(review)"
                  class="flex-1 py-2 px-4 bg-green-50 text-green-600 rounded-lg text-center text-sm"
                >
                  通过
                </view>
                <view
                  @tap="showDeleteConfirm(review)"
                  class="py-2 px-4 bg-gray-50 text-gray-600 rounded-lg text-center text-sm"
                >
                  删除
                </view>
              </view>
            </view>

            <!-- 已审核状态的操作 -->
            <view v-else class="px-4 py-2 border-t border-gray-100">
              <view class="flex justify-end">
                <view
                  @tap="showDeleteConfirm(review)"
                  class="py-2 px-4 bg-gray-50 text-gray-600 rounded-lg text-center text-sm"
                >
                  删除
                </view>
              </view>
            </view>
          </view>

          <!-- 加载更多 -->
          <view v-if="reviewsLoading" class="text-center py-4">
            <text class="text-gray-500 text-sm">加载中...</text>
          </view>

          <!-- 没有更多 -->
          <view
            v-else-if="!hasMoreReviews && filteredReviews.length > 0"
            class="text-center py-4"
          >
            <text class="text-gray-400 text-sm">没有更多评价了</text>
          </view>

          <!-- 空状态 -->
          <view
            v-if="!reviewsLoading && filteredReviews.length === 0"
            class="text-center py-12"
          >
            <text
              class="i-lucide-inbox w-12 h-12 text-gray-300 mb-4 block mx-auto"
            ></text>
            <text class="text-gray-500">暂无评价数据</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 审核通过弹窗 -->
    <view
      v-if="showApprove"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @tap="hideApproveModal"
    >
      <view @tap.stop="" class="bg-white rounded-2xl mx-4 w-full max-w-sm">
        <view class="p-6">
          <text class="text-lg font-semibold text-gray-800 block mb-4"
            >审核通过</text
          >
          <view class="mb-4">
            <textarea
              v-model="approveNote"
              placeholder="请输入审核备注"
              class="w-full px-3 py-2 box-border border border-solid border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              maxlength="200"
            />
            <text class="text-xs text-gray-400"
              >{{ approveNote.length }}/200</text
            >
          </view>

          <view class="flex space-x-3">
            <view
              @tap="hideApproveModal"
              class="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-center"
            >
              取消
            </view>
            <view
              @tap="confirmApprove"
              class="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg text-center"
            >
              {{ approving ? "处理中..." : "确认通过" }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 审核拒绝弹窗 -->
    <view
      v-if="showReject"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @tap="hideRejectModal"
    >
      <view @tap.stop="" class="bg-white rounded-2xl mx-4 w-full max-w-sm">
        <view class="p-6">
          <text class="text-lg font-semibold text-gray-800 block mb-4"
            >审核拒绝</text
          >
          <view class="mb-4">
            <textarea
              v-model="rejectNote"
              placeholder="请输入拒绝原因"
              class="w-full px-3 py-2 box-border border border-solid border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              maxlength="200"
            />
            <text class="text-xs text-gray-400"
              >{{ rejectNote.length }}/200</text
            >
          </view>

          <view class="flex space-x-3">
            <view
              @tap="hideRejectModal"
              class="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-center"
            >
              取消
            </view>
            <view
              @tap="confirmReject"
              :class="[
                'flex-1 py-2 px-4 rounded-lg text-center text-white',
                rejectNote.trim() ? 'bg-red-500' : 'bg-gray-300',
              ]"
            >
              {{ rejecting ? "处理中..." : "确认拒绝" }}
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
          <text class="text-lg font-semibold text-gray-800 block mb-4"
            >删除评价</text
          >

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
import { useReviewsStore } from "../../../stores/reviews";
import { useAuthStore } from "../../../stores/auth";
import { REVIEW_STATUS, REVIEW_ATTITUDES } from "../../../utils/constants";

// Store
const reviewsStore = useReviewsStore();
const authStore = useAuthStore();

// 响应式数据
const searchKeyword = ref("");
const selectedStatus = ref(null);
const refreshing = ref(false);
const searchTimer = ref(null);

// 弹窗状态
const showApprove = ref(false);
const showReject = ref(false);
const showDelete = ref(false);
const currentReview = ref(null);

// 操作状态
const approving = ref(false);
const rejecting = ref(false);
const deleting = ref(false);

// 备注内容
const approveNote = ref("");
const rejectNote = ref("");

// 状态筛选选项
const statusFilters = computed(() => [
  { label: "全部", value: null, count: adminReviews.value.length },
  { label: "待审核", value: REVIEW_STATUS.PENDING, count: pendingCount.value },
  {
    label: "已通过",
    value: REVIEW_STATUS.APPROVED,
    count: approvedCount.value,
  },
  {
    label: "已拒绝",
    value: REVIEW_STATUS.REJECTED,
    count: rejectedCount.value,
  },
]);

// 计算属性
const adminReviews = computed(() => reviewsStore.adminReviews);
const adminReviewsTotal = computed(() => reviewsStore.adminReviewsTotal);
const reviewsLoading = computed(() => reviewsStore.adminReviewsLoading);

const filteredReviews = computed(() => {
  let reviews = adminReviews.value;

  // 状态筛选
  if (selectedStatus.value !== null) {
    reviews = reviews.filter(
      (review) => review.status === selectedStatus.value
    );
  }

  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase();
    reviews = reviews.filter(
      (review) =>
        review.teacher_name.toLowerCase().includes(keyword) ||
        review.course_name.toLowerCase().includes(keyword)
    );
  }

  return reviews;
});

const hasMoreReviews = computed(() => {
  return adminReviews.value.length < adminReviewsTotal.value;
});

const pendingCount = computed(() => {
  return adminReviews.value.filter(
    (review) => review.status === REVIEW_STATUS.PENDING
  ).length;
});

const approvedCount = computed(() => {
  return adminReviews.value.filter(
    (review) => review.status === REVIEW_STATUS.APPROVED
  ).length;
});

const rejectedCount = computed(() => {
  return adminReviews.value.filter(
    (review) => review.status === REVIEW_STATUS.REJECTED
  ).length;
});

// 常量已在导入中定义

// 方法
const getStatusText = (status) => reviewsStore.getStatusText(status);
const getStatusClass = (status) => reviewsStore.getStatusClass(status);
const getAttitudeText = (attitude) => reviewsStore.getAttitudeText(attitude);
const getAttitudeClass = (attitude) => reviewsStore.getAttitudeClass(attitude);

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

const onSearchInput = () => {
  // 防抖搜索
  if (searchTimer.value) {
    clearTimeout(searchTimer.value);
  }
  searchTimer.value = setTimeout(() => {
    // 搜索在filteredReviews计算属性中处理
  }, 300);
};

const clearSearch = () => {
  searchKeyword.value = "";
};

const selectStatusFilter = (status) => {
  selectedStatus.value = selectedStatus.value === status ? null : status;
};

const refreshData = async () => {
  try {
    await loadReviews();
    Taro.showToast({
      title: "刷新成功",
      icon: "success",
    });
  } catch (error) {
    Taro.showToast({
      title: "刷新失败",
      icon: "none",
    });
  }
};

const loadReviews = async () => {
  try {
    await reviewsStore.fetchAllReviews();
  } catch (error) {
    console.error("加载评价列表失败:", error);
    throw error;
  }
};

const loadMoreReviews = async () => {
  if (!hasMoreReviews.value || reviewsLoading.value) return;

  try {
    // 计算当前页码，这里使用实际的每页大小
    const currentPage = Math.floor(adminReviews.value.length / 10) + 1;
    console.log(
      "加载更多评价，当前页码:",
      currentPage,
      "当前数据量:",
      adminReviews.value.length
    );

    await reviewsStore.fetchAllReviews({}, currentPage, 10);
  } catch (error) {
    console.error("加载更多评价失败:", error);
    Taro.showToast({
      title: "加载失败",
      icon: "none",
    });
  }
};

const refreshReviews = async () => {
  refreshing.value = true;
  try {
    await loadReviews();
  } catch (error) {
    console.error("刷新评价失败:", error);
  } finally {
    refreshing.value = false;
  }
};

// 审核通过相关方法
const showApproveModal = (review) => {
  currentReview.value = review;
  approveNote.value = "";
  showApprove.value = true;
};

const hideApproveModal = () => {
  showApprove.value = false;
  currentReview.value = null;
  approveNote.value = "";
};

const confirmApprove = async () => {
  if (!currentReview.value || approving.value) return;

  approving.value = true;
  try {
    await reviewsStore.approveReview(currentReview.value.id, approveNote.value);

    Taro.showToast({
      title: "审核通过",
      icon: "success",
    });

    hideApproveModal();
  } catch (error) {
    Taro.showToast({
      title: error.message || "审核失败",
      icon: "none",
    });
  } finally {
    approving.value = false;
  }
};

// 审核拒绝相关方法
const showRejectModal = (review) => {
  currentReview.value = review;
  rejectNote.value = "";
  showReject.value = true;
};

const hideRejectModal = () => {
  showReject.value = false;
  currentReview.value = null;
  rejectNote.value = "";
};

const confirmReject = async () => {
  if (!currentReview.value || !rejectNote.value.trim() || rejecting.value)
    return;

  rejecting.value = true;
  try {
    await reviewsStore.rejectReview(currentReview.value.id, rejectNote.value);

    Taro.showToast({
      title: "已拒绝",
      icon: "success",
    });

    hideRejectModal();
  } catch (error) {
    Taro.showToast({
      title: error.message || "操作失败",
      icon: "none",
    });
  } finally {
    rejecting.value = false;
  }
};

// 删除相关方法
const showDeleteConfirm = (review) => {
  currentReview.value = review;
  showDelete.value = true;
};

const hideDeleteConfirm = () => {
  showDelete.value = false;
  currentReview.value = null;
};

const confirmDelete = async () => {
  if (!currentReview.value || deleting.value) return;

  deleting.value = true;
  try {
    await reviewsStore.deleteReview(currentReview.value.id);

    Taro.showToast({
      title: "删除成功",
      icon: "success",
    });

    hideDeleteConfirm();
  } catch (error) {
    Taro.showToast({
      title: error.message || "删除失败",
      icon: "none",
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
      icon: "none",
    });
    Taro.navigateBack();
    return;
  }

  await loadReviews();
});

onUnmounted(() => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value);
  }
});
</script>
