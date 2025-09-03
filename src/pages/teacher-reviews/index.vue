<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <!-- 搜索栏 -->
    <view class="bg-white px-4 py-3 shadow-sm shrink-0">
      <view class="flex items-center bg-gray-100 rounded-lg px-3 py-2 h-10">
        <text class="i-lucide-search text-gray-400 w-4 h-4 mr-2"></text>
        <input
          v-model="searchKeyword"
          placeholder="搜索教师（全名）"
          class="flex-1 bg-transparent text-sm outline-none h-full"
          @input="onSearchInput"
          @confirm="handleSearch"
        />
        <view v-if="searchKeyword" @tap="clearSearch" class="ml-2 p-1">
          <text class="i-lucide-x text-gray-400 w-4 h-4"></text>
        </view>
      </view>
    </view>

    <!-- 搜索结果列表 -->
    <view v-if="!currentTeacher && searchKeyword && hasSearched" class="p-4">
      <!-- 搜索中状态 -->
      <view v-if="reviewsLoading" class="text-center py-12">
        <text class="text-gray-500 text-sm">搜索中...</text>
      </view>

      <!-- 有搜索结果 -->
      <view
        v-else-if="searchResult && searchResult.total > 0"
        class="space-y-3"
      >
        <view
          @tap="selectTeacher(searchResult.teacherName)"
          class="bg-white rounded-lg p-4 shadow-sm active:scale-95 transition-transform duration-200"
        >
          <view class="flex justify-between items-start">
            <view class="flex-1">
              <text class="text-lg font-medium text-gray-800">{{
                searchResult.teacherName
              }}</text>
              <view class="flex items-center mt-1">
                <text class="text-sm text-gray-500 mr-4"
                  >{{ searchResult.total }} 条评价</text
                >
                <view class="flex items-center">
                  <text
                    class="i-lucide-thumbs-up w-3 h-3 text-green-500 mr-1"
                  ></text>
                  <text class="text-sm text-green-600"
                    >{{ searchResult.recommendRate }}% 推荐</text
                  >
                </view>
              </view>
            </view>
            <text class="i-lucide-chevron-right text-gray-400 w-5 h-5"></text>
          </view>
        </view>
      </view>

      <!-- 无搜索结果 -->
      <view
        v-else
        class="flex flex-col items-center justify-center text-center py-12"
      >
        <text
          class="i-lucide-search-x w-12 h-12 text-gray-300 mb-4 block mx-auto"
        ></text>
        <text class="text-gray-500 mb-2"
          >未找到教师"{{ searchKeyword }}"的相关评价</text
        >
        <text class="text-sm text-gray-400 mb-4">请检查教师姓名是否正确</text>
        <view
          @tap="showAddReviewModal"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg inline-block"
        >
          为该教师写评价
        </view>
      </view>
    </view>

    <!-- 默认状态 -->
    <view v-if="!currentTeacher && !searchKeyword" class="p-4">
      <view class="flex flex-col items-center justify-center py-12">
        <text
          class="i-lucide-search w-12 h-12 text-gray-300 mb-4 block mx-auto"
        ></text>
        <text class="text-gray-500 mb-4">请搜索教师姓名查看评价</text>
        <view
          @tap="showAddReviewModal"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg inline-block"
        >
          写个评价
        </view>
      </view>
    </view>

    <!-- 教师评价详情 -->
    <view v-if="currentTeacher" class="flex-1 flex flex-col min-h-0">
      <!-- 教师信息头部 -->
      <view class="bg-white p-4 border-b border-gray-100 shrink-0">
        <view class="flex justify-between items-center mb-2">
          <text class="text-lg font-semibold text-gray-800 max-w-[50%] truncate">{{
            currentTeacher
          }}</text>
          <view
            @tap="showAddReviewModal"
            class="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
          >
            <text class="i-lucide-plus w-3 h-3 mr-1"></text>
            写评价
          </view>
        </view>

        <!-- 统计信息 -->
        <view class="flex space-x-6 text-sm text-gray-600">
          <view class="flex items-center">
            <text class="i-lucide-message-circle w-4 h-4 mr-1"></text>
            <text>{{ teacherReviewsTotal }} 条评价</text>
          </view>
          <view class="flex items-center">
            <text class="i-lucide-thumbs-up w-4 h-4 mr-1 text-green-500"></text>
            <text>{{ recommendRate }}% 推荐</text>
          </view>
        </view>
      </view>
      <view class="flex-1 h-[1px]">
        <!-- 评价列表 -->
        <scroll-view
          :scroll-y="true"
          class="h-full"
          @scrolltolower="loadMoreReviews"
          :threshold="100"
        >
          <view class="p-4 space-y-4">
            <view
              v-for="review in filteredReviews"
              :key="review.id"
              class="bg-white rounded-lg p-4 shadow-sm"
            >
              <!-- 评价头部 -->
              <view class="flex justify-between items-start mb-3">
                <view class="flex items-center">
                  <view>
                    <view class="flex items-center">
                      <text class="text-sm text-gray-800 mr-2 max-w-[70%] truncate">{{
                        review.course_name
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
                    <text class="text-xs text-gray-500">{{
                      formatDate(review.created_at)
                    }}</text>
                  </view>
                </view>
              </view>

              <!-- 评价内容 -->
              <text class="text-gray-700">{{
                review.content
              }}</text>

              <!-- 校区信息 -->
              <view v-if="review.campus" class="mt-2 flex items-center">
                <text
                  class="i-lucide-map-pin w-3 h-3 text-gray-400 mr-1"
                ></text>
                <text class="text-xs text-gray-500">{{ review.campus }}</text>
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
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 新增评价弹窗 -->
    <view
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
      @tap="hideAddReviewModal"
    >
      <view
        @tap.stop=""
        class="bg-white rounded-t-2xl w-full max-h-4/5 flex flex-col"
      >
        <!-- 弹窗头部 -->
        <view
          class="flex justify-between items-center px-4 py-2 border-b border-gray-100"
        >
          <text class="text-lg font-semibold">写评价</text>
          <view @tap="hideAddReviewModal" class="p-1">
            <text class="i-lucide-x w-5 h-5 text-gray-400"></text>
          </view>
        </view>

        <!-- 弹窗内容 -->
        <scroll-view scroll-y>
          <view class="p-4 space-y-2">
            <!-- 教师姓名 -->
            <view class="flex flex-col gap-2">
              <text class="text-sm font-medium text-gray-700">教师姓名</text>
              <input
                v-model="newReview.teacher_name"
                placeholder="请输入教师姓名"
                class="border-solid border-[1px] border-gray-400 rounded-lg p-2"
              />
            </view>

            <!-- 课程名称 -->
            <view class="flex flex-col gap-2">
              <text class="text-sm font-medium text-gray-700">课程名称</text>
              <input
                v-model="newReview.course_name"
                placeholder="请输入课程名称"
                class="border-solid border-[1px] border-gray-400 rounded-lg p-2"
              />
            </view>

            <!-- 校区 -->
            <view class="flex flex-col gap-2">
              <text class="text-sm font-medium text-gray-700">所属校区</text>
              <picker
                :value="campusIndex"
                :range="campusOptions"
                @change="onCampusChange"
              >
                <view
                  class="flex items-center justify-between border-solid border-[1px] border-gray-400 rounded-lg p-2"
                >
                  <text
                    :class="
                      newReview.campus ? 'text-gray-900' : 'text-gray-400'
                    "
                  >
                    {{ newReview.campus || "请选择校区" }}
                  </text>
                  <text
                    class="i-lucide-chevron-down w-4 h-4 text-gray-400"
                  ></text>
                </view>
              </picker>
            </view>

            <!-- 评价态度 -->
            <view class="flex flex-col gap-2">
              <text class="text-sm font-medium text-gray-700">评价</text>
              <view class="flex gap-2">
                <view
                  v-for="attitude in attitudeOptions"
                  :key="attitude.value"
                  @tap="selectAttitude(attitude.value)"
                  :class="[
                    'flex-1 rounded-md p-2 text-center',
                    newReview.attitude === attitude.value
                      ? attitude.value === REVIEW_ATTITUDES.RECOMMEND
                        ? 'bg-green-500 text-white border-green-500'
                        : attitude.value === REVIEW_ATTITUDES.NEUTRAL
                        ? 'bg-blue-500 text-white border-blue-500'
                        : attitude.value === REVIEW_ATTITUDES.AVOID
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200',
                  ]"
                >
                  {{ attitude.label }}
                </view>
              </view>
            </view>

            <!-- 评价内容 -->
            <view class="flex flex-col gap-2">
              <text class="text-sm font-medium text-gray-700">内容</text>
              <textarea
                v-model="newReview.content"
                placeholder="请描述您对这位教师的上课体验，包括教学风格、课程难度、考试情况等"
                class="border-solid border-[1px] border-gray-400 rounded-lg p-2 box-border w-full"
                maxlength="500"
              />
              <text class="text-xs text-gray-400 mt-1"
                >{{ newReview.content.length }}/500</text
              >
            </view>
          </view>
        </scroll-view>

        <!-- 弹窗底部 -->
        <view class="p-4 border-t border-gray-100 flex-shrink-0">
          <view class="flex space-x-3">
            <view
              @tap="hideAddReviewModal"
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-lg text-center font-medium"
            >
              取消
            </view>
            <view
              @tap="submitReview"
              :class="[
                'flex-1 py-3 px-4 rounded-lg text-center text-white font-medium',
                canSubmit ? 'bg-blue-500' : 'bg-gray-300',
              ]"
            >
              {{ submitting ? "提交中..." : "提交评价" }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import Taro from "@tarojs/taro";
import { useReviewsStore } from "../../stores/reviews";
import { useAuthStore } from "../../stores/auth";
import { REVIEW_ATTITUDES } from "../../utils/constants";

// Store
const reviewsStore = useReviewsStore();
const authStore = useAuthStore();

// 响应式数据
const searchKeyword = ref("");
const currentTeacher = ref("");
const selectedAttitude = ref(null);
const refreshing = ref(false);
const showAddModal = ref(false);
const submitting = ref(false);
const campusIndex = ref(0);
const searchTimer = ref(null);
const hasSearched = ref(false);
const searchResult = ref(null);

// 新评价数据
const newReview = ref({
  teacher_name: "",
  course_name: "",
  campus: "",
  content: "",
  attitude: null,
});

// 校区选项
const campusOptions = [
  "三江东园",
  "三江西园",
  "红旗校区",
  "南昌校区",
  "鹰潭校区",
];

// 评价态度选项
const attitudeOptions = [
  { label: "推荐", value: REVIEW_ATTITUDES.RECOMMEND },
  { label: "中立", value: REVIEW_ATTITUDES.NEUTRAL },
  { label: "避雷", value: REVIEW_ATTITUDES.AVOID },
];

// 筛选选项
const attitudeFilters = [
  { label: "全部", value: null },
  { label: "推荐", value: REVIEW_ATTITUDES.RECOMMEND },
  { label: "中立", value: REVIEW_ATTITUDES.NEUTRAL },
  { label: "避雷", value: REVIEW_ATTITUDES.AVOID },
];

// 计算属性
const teacherReviews = computed(() => reviewsStore.teacherReviews);
const teacherReviewsTotal = computed(() => reviewsStore.teacherReviewsTotal);
const reviewsLoading = computed(() => reviewsStore.teacherReviewsLoading);

const filteredReviews = computed(() => {
  if (selectedAttitude.value === null) {
    return teacherReviews.value;
  }
  return teacherReviews.value.filter(
    (review) => review.attitude === selectedAttitude.value
  );
});

const hasMoreReviews = computed(() => {
  return teacherReviews.value.length < teacherReviewsTotal.value;
});

const recommendRate = computed(() => {
  if (teacherReviews.value.length === 0) return 0;
  const recommendCount = teacherReviews.value.filter(
    (review) => review.attitude === REVIEW_ATTITUDES.RECOMMEND
  ).length;
  return Math.round((recommendCount / teacherReviews.value.length) * 100);
});

const canSubmit = computed(() => {
  return (
    newReview.value.teacher_name.trim() &&
    newReview.value.course_name.trim() &&
    newReview.value.content.trim() &&
    newReview.value.attitude !== null &&
    !submitting.value
  );
});

// 方法
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
  // 清空搜索状态
  hasSearched.value = false;
  searchResult.value = null;

  // 清空当前教师，回到搜索状态
  if (currentTeacher.value) {
    currentTeacher.value = "";
    reviewsStore.clearTeacherReviews();
  }
};

const handleSearch = async () => {
  if (searchKeyword.value.trim()) {
    hasSearched.value = true;
    searchResult.value = null;

    try {
      // 搜索教师评价，但不直接进入详情页
      const teacherName = searchKeyword.value.trim();
      const result = await reviewsStore.fetchTeacherReviews(teacherName);

      // 计算推荐率
      const reviews = result.data || [];
      const recommendCount = reviews.filter(
        (review) => review.attitude === 1
      ).length; // 1为推荐
      const recommendRate =
        reviews.length > 0
          ? Math.round((recommendCount / reviews.length) * 100)
          : 0;

      // 保存搜索结果，但不切换到教师详情
      searchResult.value = {
        teacherName: teacherName,
        total: result.total || 0,
        recommendRate: recommendRate,
      };

      // 清空当前教师状态，保持在搜索结果页面
      currentTeacher.value = "";
      reviewsStore.clearTeacherReviews();
    } catch (error) {
      console.error("搜索教师评价失败:", error);
      searchResult.value = {
        teacherName: searchKeyword.value.trim(),
        total: 0,
        recommendRate: 0,
      };
    }
  }
};

const clearSearch = () => {
  searchKeyword.value = "";
  currentTeacher.value = "";
  hasSearched.value = false;
  searchResult.value = null;
  reviewsStore.clearTeacherReviews();
};

const selectTeacher = async (teacherName) => {
  try {
    currentTeacher.value = teacherName;
    await reviewsStore.fetchTeacherReviews(teacherName);
  } catch (error) {
    console.error("获取教师评价失败:", error);
    Taro.showToast({
      title: "获取评价失败",
      icon: "none",
    });
  }
};

const goBack = () => {
  currentTeacher.value = "";
  selectedAttitude.value = null;
  reviewsStore.clearTeacherReviews();
};

const toggleAttitudeFilter = (attitude) => {
  selectedAttitude.value =
    selectedAttitude.value === attitude ? null : attitude;
};

const loadMoreReviews = async () => {
  if (!hasMoreReviews.value || reviewsLoading.value) return;

  try {
    const page = Math.floor(teacherReviews.value.length / 10) + 1;
    await reviewsStore.fetchTeacherReviews(currentTeacher.value, page);
  } catch (error) {
    console.error("加载更多评价失败:", error);
  }
};

const refreshReviews = async () => {
  if (!currentTeacher.value) return;

  refreshing.value = true;
  try {
    await reviewsStore.fetchTeacherReviews(currentTeacher.value);
  } catch (error) {
    console.error("刷新评价失败:", error);
  } finally {
    refreshing.value = false;
  }
};

const showAddReviewModal = () => {
  if (!authStore.requireAuth()) return;

  // 如果当前查看某个教师，自动填充教师姓名
  if (currentTeacher.value) {
    newReview.value.teacher_name = currentTeacher.value;
  }

  showAddModal.value = true;
};

const hideAddReviewModal = () => {
  showAddModal.value = false;
  resetNewReview();
};

const resetNewReview = () => {
  newReview.value = {
    teacher_name: "",
    course_name: "",
    campus: "",
    content: "",
    attitude: null,
  };
  campusIndex.value = 0;
};

const onCampusChange = (e) => {
  campusIndex.value = e.detail.value;
  newReview.value.campus = campusOptions[e.detail.value];
};

const selectAttitude = (attitude) => {
  newReview.value.attitude = attitude;
};

const submitReview = async () => {
  if (!canSubmit.value) return;

  submitting.value = true;
  try {
    await reviewsStore.createTeacherReview(newReview.value);

    Taro.showToast({
      title: "已提交审核",
      icon: "success",
    });

    hideAddReviewModal();
  } catch (error) {
    Taro.showToast({
      title: error.message || "提交失败",
      icon: "none",
    });
  } finally {
    submitting.value = false;
  }
};

onUnmounted(() => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value);
  }
});
</script>
