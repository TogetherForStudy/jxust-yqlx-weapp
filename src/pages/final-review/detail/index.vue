<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="min-h-screen bg-gray-50">
    <view class="p-4 space-y-4 pb-16">
      <view class="bg-white rounded-2xl p-4 shadow-sm">
        <view class="flex items-center justify-between">
          <view>
            <view class="text-lg font-semibold text-gray-900">
              {{ projectInfo.name }}
            </view>
          </view>
          <view v-if="onlineCount !== null" class="flex items-center gap-1 text-xs text-gray-500">
            <text>{{ onlineCount }} 人一起在学</text>
          </view>
        </view>
        <view class="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {{ projectInfo.description || "暂无项目简介" }}
        </view>
      </view>

      <view class="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <template v-if="!mode">
          <view class="flex items-center justify-between">
            <view>
              <view class="text-base font-medium text-gray-900">复习设置</view>
              <view class="text-xs text-gray-400 mt-1">选择模式、题目来源和顺序</view>
            </view>
          </view>

          <view class="flex items-center justify-between mt-3">
            <view>
              <view class="text-xs text-gray-500">题目来源</view>
            </view>
            <view class="flex gap-2">
              <view
                class="px-3 py-1 text-xs rounded-full border"
                :class="!useWrongBook ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-gray-200 text-gray-500'"
                @tap="setSource(false)"
              >
                全部题
              </view>
              <view
                class="px-3 py-1 text-xs rounded-full border"
                :class="useWrongBook ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-gray-200 text-gray-500'"
                @tap="setSource(true)"
              >
                错题本
              </view>
            </view>
          </view>

          <view class="flex items-center justify-between mt-3">
            <view>
              <view class="text-xs text-gray-500">出题顺序</view>
            </view>
            <view class="flex gap-2">
              <view
                class="px-3 py-1 text-xs rounded-full border"
                :class="randomOrder ? 'border-gray-200 text-gray-500' : 'border-indigo-500 text-indigo-600 bg-indigo-50'"
                @tap="setRandom(false)"
              >
                顺序
              </view>
              <view
                class="px-3 py-1 text-xs rounded-full border"
                :class="randomOrder ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-gray-200 text-gray-500'"
                @tap="setRandom(true)"
              >
                乱序
              </view>
            </view>
          </view>
          <view class="grid grid-cols-2 gap-3">
            <view
              class="rounded-2xl border px-4 py-5 active:scale-[0.98] transition-all duration-150"
              :class="mode === 'study' ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50'"
              @tap="startSession('study')"
            >
              <view class="text-sm font-semibold text-gray-900">学习模式</view>
              <view class="text-xs text-gray-500 mt-1">
                直接展示答案，点击正确选项进入下一题
              </view>
            </view>
            <view
              class="rounded-2xl border px-4 py-5 active:scale-[0.98] transition-all duration-150"
              :class="mode === 'practice' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-gray-50'"
              @tap="startSession('practice')"
            >
              <view class="text-sm font-semibold text-gray-900">考试模式</view>
              <view class="text-xs text-gray-500 mt-1">
                不展示答案，需要作答后显示答案
              </view>
            </view>
          </view>

          <!-- 接续进度 -->
          <view v-if="savedProgressList.length > 0" class="mt-3 space-y-2">
            <view class="text-xs text-gray-500 mb-2">暂存记录</view>
            <view
              v-for="(progress, index) in savedProgressList"
              :key="index"
              class="rounded-2xl border px-4 py-3 active:scale-[0.98] transition-all duration-150"
              :class="getProgressCardClass(progress.type)"
            >
              <view class="flex items-center justify-between">
                <view class="flex-1" @tap="resumeProgress(progress)">
                  <view class="text-sm font-semibold" :class="getProgressTitleClass(progress.type)">
                    {{ getProgressTypeLabel(progress.type) }}
                  </view>
                  <view class="text-xs mt-1" :class="getProgressInfoClass(progress.type)">
                    {{ getProgressInfo(progress) }}
                  </view>
                </view>
                <view class="flex items-center gap-2">

                  <view
                    class="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    @tap.stop="deleteProgress(progress.type, progress.isOldVersion)"
                  >
                    <text class="i-lucide-trash-2 w-4 h-4"></text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </template>
        <template v-else>
          <view class="flex items-center justify-between">
            <view>
              <view class="text-base font-medium text-gray-900">当前练习</view>
              <view class="text-xs text-gray-500 mt-1">
                {{ modeLabel }} · {{ orderLabel }}
              </view>
            </view>
            <view
              class="px-3 py-2 text-xs rounded-full border border-gray-200 text-gray-600"
              @tap="handleBackToSelection"
            >
              返回
            </view>
          </view>
        </template>
      </view>

      <view
        v-if="mode && questionIds.length"
        class="bg-white rounded-2xl p-4 shadow-sm"
      >
        <view class="flex items-center justify-between text-sm text-gray-600">
          <text>题目进度</text>
          <text>{{ progressText }}</text>
        </view>
        <view class="w-full mt-3">
          <slider
            class="m-0"
            :min="1"
            :max="questionIds.length || 1"
            :value="(isSliding ? sliderIndex : currentIndex) + 1"
            block-size="16"
            track-size="8"
            activeColor="#6366F1"
            backgroundColor="#E5E7EB"
            @changing="handleSliderChanging"
            @change="handleSliderChange"
          />
        </view>
      </view>

      <view
        v-if="mode && !currentQuestion && (loadingList || loadingQuestion)"
        class="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-400"
      >
        正在加载题目...
      </view>

      <view
        v-if="mode && !loadingList && !loadingQuestion && !questionIds.length"
        class="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-400"
      >
        暂无题目，稍后再试
      </view>

      <view
        v-if="sessionFinished"
        class="bg-white rounded-2xl p-6 shadow-sm text-center"
      >
        <view class="text-lg font-semibold text-gray-900">本次复习已完成</view>
        <view class="text-sm text-gray-500 mt-2">
          可切换模式继续巩固知识
        </view>
        <view class="mt-4 flex gap-3">
          <view
            class="flex items-center justify-center flex-1 h-11 rounded-full border border-gray-200 text-gray-700"
            @tap="resetSession"
          >
            重新选择
          </view>
          <view
            class="flex items-center justify-center flex-1 h-11 rounded-full bg-indigo-500 text-white"
            @tap="startSession(mode)"
          >
            再刷一遍
          </view>
        </view>
      </view>

      <view
        v-if="currentQuestion"
        class="relative bg-white rounded-2xl p-5 shadow-sm"
      >
        <view
          v-if="loadingQuestion"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 text-gray-400 text-sm"
        >
          正在加载下一题...
        </view>
        <view
          class="space-y-4"
          :class="loadingQuestion ? 'pointer-events-none opacity-60' : ''"
        >
          <view class="flex items-center justify-between">
            <view class="px-3 py-1 rounded-full text-xs bg-indigo-50 text-indigo-600">
              {{ questionTypeText }}
            </view>
            <view class="text-xs text-gray-400">
              第 {{ currentIndex + 1 }} / {{ questionIds.length }} 题
            </view>
          </view>
          <view>
            <text class="text-gray-900 text-base" :user-select="true">
            {{ currentQuestion.title }}
          </text>
          </view>


          <view
            v-if="mode"
            class="flex justify-end items-center gap-2 pt-1"
          >
            <view
              v-if="mode === 'study'"
              class="px-3 py-1 rounded-full border text-xs"
              :class="showAnswer ? 'border-blue-200 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-600 bg-gray-50'"
              @tap="showAnswer = !showAnswer"
            >
              {{ showAnswer ? "隐藏答案" : "显示答案" }}
            </view>
            <view
              class="px-3 py-1 rounded-full border text-xs"
              :class="inWrongBook ? 'border-green-200 text-green-700 bg-green-50' : 'border-red-200 text-red-500 bg-red-50'"
              @tap="toggleWrongBook()"
            >
              {{ inWrongBook ? "移出错题本" : "加入错题本" }}
            </view>
          </view>

          <view
            v-if="currentQuestion.sub_questions && currentQuestion.sub_questions.length"
            class="space-y-4"
          >
          <!-- 父子题（多题展示） -->
            <view
              v-for="(sub, index) in currentQuestion.sub_questions"
              :key="sub.id"
            >
              <text class="text-gray-900 text-base" :user-select="true">
                {{ sub.title }}
              </text>
              <view class="mt-3 space-y-2">
                <view
                  v-for="option in getOptions(sub)"
                  :key="option.key"
                  class="p-3 rounded-xl border flex items-center justify-between"
                  :class="getOptionClass(sub, option.key, sub.id)"
                  @tap="handleOptionTap(option.key, sub, sub.id)"
                >
                  <view class="flex items-center gap-2">
                    <text class="text-[30rpx]">{{ option.label }}</text>
                  </view>
                </view>
              </view>
              <!-- 分割线：在非最后一个子题后显示 -->
              <view
                v-if="index < currentQuestion.sub_questions.length - 1"
                class="mt-4 h-[1px] bg-gray-200"
              ></view>
            </view>
          </view>

          <view
            v-else-if="currentQuestion.type === 2"
            class="space-y-3"
          >
            <textarea
              v-if="mode === 'practice'"
              class="box-border border-solid border-[1px] border-gray-300 rounded-lg h-20 resize-none w-full p-2"
              placeholder="请输入你的答案"
              :value="answerState.textAnswer"
              @input="onTextAnswerInput"
            />
          </view>

          <view
            v-else
            class="space-y-2"
          >
          <!-- 普通选择 -->
            <view
              v-for="option in getOptions(currentQuestion)"
              :key="option.key"
              class="p-3 rounded-2xl border flex items-center justify-between"
              :class="getOptionClass(currentQuestion, option.key)"
              @tap="handleOptionTap(option.key, currentQuestion)"
            >
              <view class="flex items-center gap-2">
                <text class="text-[30rpx]">{{ option.label }}</text>
              </view>
            </view>
          </view>

          <view
            v-if="currentQuestion.type === 2 && ((mode === 'study' && showAnswer) || (mode === 'practice' && hasSubmitted))"
          >
          <view class="text-indigo-600 mb-2 text-[30rpx]">参考答案</view>
          <text class="text-gray-900 whitespace-pre-wrap leading-relaxed text-[30rpx]" :user-select="true">{{ getCorrectText(currentQuestion) }}</text>
          </view>

          <view class="pt-2">
            <view
              v-if="mode === 'practice'"
              class="flex gap-3"
            >
              <view
                class="flex-1 flex items-center justify-center h-11 rounded-full text-sm font-medium border"
                :class="isFirstQuestion ? 'border-gray-100 text-gray-300 bg-gray-100' : 'border-gray-300 text-gray-700 bg-white'"
                @tap="!isFirstQuestion && goPrevQuestion()"
              >
                上一题
              </view>
              <view
                class="flex-1 flex items-center justify-center h-11 rounded-full text-sm font-medium"
                :class="hasSubmitted ? 'bg-green-500 text-white' : canSubmit ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-400'"
                :disabled="!canSubmit && !hasSubmitted"
                @tap="hasSubmitted ? goNextQuestion() : handleSubmit()"
              >
                {{ hasSubmitted ? "下一题" : "提交答案" }}
              </view>
            </view>
            <view
              v-else
              class="flex gap-3"
            >
              <view
                class="flex-1 flex items-center justify-center h-11 rounded-full text-sm font-medium border"
                :class="isFirstQuestion ? 'border-gray-100 text-gray-300 bg-gray-100' : 'border-gray-300 text-gray-700 bg-white'"
                @tap="!isFirstQuestion && goPrevQuestion()"
              >
                上一题
              </view>
              <view
                class="flex-1 flex items-center justify-center h-11 rounded-full bg-green-500 text-white text-sm font-medium"
                @tap="goNextQuestion"
              >
                下一题
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import Taro from "@tarojs/taro";
import { questionsAPI, statAPI } from "../../../api";

defineOptions({
  name: "FinalReviewDetail",
});

const router = Taro.useRouter();
const decodeParam = (value = "") => {
  try {
    // 先将 + 替换为空格，因为 decodeURIComponent 不会处理 +
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch (error) {
    return value;
  }
};

const projectId = Number(router.params?.id || 0);
const STORAGE_KEY_OLD = `finalReviewProgress:${projectId}`; // 旧版存储键（向前兼容）
const STORAGE_KEY_STUDY = `finalReviewProgress:${projectId}:study`;
const STORAGE_KEY_PRACTICE = `finalReviewProgress:${projectId}:practice`;
const STORAGE_KEY_WRONGBOOK = `finalReviewProgress:${projectId}:wrongbook`;
const WRONG_BOOK_KEY = `finalReviewWrongBook:${projectId}`;
const progressUpdateTrigger = ref(0); // 用于触发 computed 更新
const projectInfo = ref({
  id: projectId,
  name: decodeParam(router.params?.name) || "期末复习项目",
  description: decodeParam(router.params?.desc || ""),
});

const mode = ref(null); // 'study' | 'practice'
const randomOrder = ref(false);
const useWrongBook = ref(false); // false: 全部题, true: 错题本
const loadingList = ref(false);
const loadingQuestion = ref(false);
const questionIds = ref([]);
const currentIndex = ref(-1);
const sliderIndex = ref(0);
const isSliding = ref(false);
const currentQuestion = ref(null);
const sessionFinished = ref(false);
const hasSubmitted = ref(false);
const resultStatus = ref(null); // 'correct' | 'incorrect' | 'partial' | 'text'
const wrongBookIds = ref([]);
const showAnswer = ref(true); // 学习模式下控制答案显示/隐藏
const onlineCount = ref(null); // 在线人数
const onlineCountTimer = ref(null); // 在线人数轮询定时器ID

const answerState = reactive({
  optionKey: "",
  textAnswer: "",
  subAnswers: {},
});
const subJudgeState = reactive({});

const progressText = computed(() => {
  if (!questionIds.value.length) {
    return "0/0";
  }
  const baseIndex = isSliding.value
    ? sliderIndex.value
    : Math.max(currentIndex.value, 0);
  const display = Math.min(baseIndex + 1, questionIds.value.length);
  return `${display}/${questionIds.value.length}`;
});

const isFirstQuestion = computed(() => currentIndex.value <= 0);
const inWrongBook = computed(
  () =>
    !!currentQuestion.value &&
    wrongBookIds.value.includes(currentQuestion.value.id)
);

const progressPercent = computed(() => {
  if (!questionIds.value.length) return 0;
  if (sessionFinished.value) return 100;
  const current = Math.max(currentIndex.value, 0);
  const completed = current + (currentQuestion.value ? 1 : 0);
  return Math.min(100, (completed / questionIds.value.length) * 100);
});

const displayQuestionIndex = computed(() => {
  if (!questionIds.value.length) return 0;
  if (isSliding.value) {
    return sliderIndex.value + 1;
  }
  return currentIndex.value + 1;
});

const questionTypeText = computed(() => getQuestionTypeText(currentQuestion.value?.type));
const modeLabel = computed(() => {
  if (mode.value === "study") return "学习模式";
  if (mode.value === "practice") return "考试模式";
  return "待选择";
});
const orderLabel = computed(() => (randomOrder.value ? "乱序答题" : "顺序答题"));

const savedProgressList = computed(() => {
  // 触发更新
  progressUpdateTrigger.value;

  const list = [];
  try {
    // 学习模式进度
    const studyProgress = Taro.getStorageSync(STORAGE_KEY_STUDY);
    if (studyProgress && Number(studyProgress.projectId) === projectId && studyProgress.questionIds?.length) {
      list.push({ ...studyProgress, type: 'study' });
    }

    // 考试模式进度
    const practiceProgress = Taro.getStorageSync(STORAGE_KEY_PRACTICE);
    if (practiceProgress && Number(practiceProgress.projectId) === projectId && practiceProgress.questionIds?.length) {
      list.push({ ...practiceProgress, type: 'practice' });
    }

    // 错题本进度
    const wrongbookProgress = Taro.getStorageSync(STORAGE_KEY_WRONGBOOK);
    if (wrongbookProgress && Number(wrongbookProgress.projectId) === projectId && wrongbookProgress.questionIds?.length) {
      list.push({ ...wrongbookProgress, type: 'wrongbook' });
    }

    // 向前兼容：检查旧版存储
    const oldProgress = Taro.getStorageSync(STORAGE_KEY_OLD);
    if (oldProgress && Number(oldProgress.projectId) === projectId && oldProgress.questionIds?.length && oldProgress.mode) {
      // 根据旧版存储的内容判断类型
      let oldType = 'practice'; // 默认为考试模式
      if (oldProgress.useWrongBook) {
        oldType = 'wrongbook';
      } else if (oldProgress.mode === 'study') {
        oldType = 'study';
      } else if (oldProgress.mode === 'practice') {
        oldType = 'practice';
      }

      // 添加到列表，标记为旧版记录
      list.push({
        ...oldProgress,
        type: oldType,
        isOldVersion: true // 标记为旧版记录
      });
    }
  } catch (error) {
    console.error("load saved progress list failed", error);
  }

  // 按时间戳倒序排列
  return list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
});

const getProgressTypeLabel = (type) => {
  switch (type) {
    case 'study':
      return '学习模式';
    case 'practice':
      return '考试模式';
    case 'wrongbook':
      return '错题本';
    default:
      return '未知';
  }
};

const getProgressInfo = (progress) => {
  const orderText = progress.randomOrder ? "乱序" : "顺序";
  const current = Math.min((progress.currentIndex ?? 0) + 1, progress.questionIds?.length || 0);
  const total = progress.questionIds?.length || 0;

  // 根据类型显示不同的信息
  if (progress.type === 'wrongbook') {
    // 错题本类型：显示模式信息（如果有）
    const modeText = progress.mode === 'study' ? '学习模式' : progress.mode === 'practice' ? '考试模式' : '';
    if (modeText) {
      return `${orderText} · ${modeText} · 进度 ${current}/${total}`;
    }
    return `${orderText} · 进度 ${current}/${total}`;
  } else {
    // 学习模式和考试模式：显示题目来源
    const sourceText = progress.useWrongBook ? "错题本" : "全部题";
    return `${orderText} · ${sourceText} · 进度 ${current}/${total}`;
  }
};

const getProgressCardClass = (type) => {
  switch (type) {
    case 'study':
      return 'border-green-200 bg-green-50';
    case 'practice':
      return 'border-indigo-200 bg-indigo-50';
    case 'wrongbook':
      return 'border-orange-200 bg-orange-50';
    default:
      return 'border-gray-200 bg-gray-50';
  }
};

const getProgressTitleClass = (type) => {
  switch (type) {
    case 'study':
      return 'text-green-900';
    case 'practice':
      return 'text-indigo-900';
    case 'wrongbook':
      return 'text-orange-900';
    default:
      return 'text-gray-900';
  }
};

const getProgressInfoClass = (type) => {
  switch (type) {
    case 'study':
      return 'text-green-600';
    case 'practice':
      return 'text-indigo-600';
    case 'wrongbook':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

const getProgressButtonClass = (type) => {
  switch (type) {
    case 'study':
      return 'bg-green-500 text-white';
    case 'practice':
      return 'bg-indigo-500 text-white';
    case 'wrongbook':
      return 'bg-orange-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const canSubmit = computed(() => {
  if (mode.value !== "practice" || !currentQuestion.value || hasSubmitted.value) return false;
  if (currentQuestion.value.sub_questions?.length) {
    const total = currentQuestion.value.sub_questions.length;
    const answered = Object.keys(answerState.subAnswers).filter((key) => answerState.subAnswers[key]).length;
    return answered === total;
  }
  if (currentQuestion.value.type === 2) {
    return !!answerState.textAnswer.trim();
  }
  return !!answerState.optionKey;
});

const setRandom = (value) => {
  randomOrder.value = value;
};

// 检查错题本数据是否有更新
const checkWrongBookUpdate = () => {
  try {
    const savedProgress = Taro.getStorageSync(STORAGE_KEY_WRONGBOOK);
    if (!savedProgress || Number(savedProgress.projectId) !== projectId) {
      return false; // 没有保存的进度，不算更新
    }

    // 比较当前错题本ID列表和保存的进度中的错题本ID列表
    const savedQuestionIds = savedProgress.questionIds || [];
    const currentWrongBookIds = wrongBookIds.value || [];

    // 排序后比较，避免顺序不同导致的误判
    const savedSorted = [...savedQuestionIds].sort((a, b) => a - b);
    const currentSorted = [...currentWrongBookIds].sort((a, b) => a - b);

    // 如果长度不同或内容不同，说明有更新
    if (savedSorted.length !== currentSorted.length) {
      return true;
    }

    for (let i = 0; i < savedSorted.length; i++) {
      if (savedSorted[i] !== currentSorted[i]) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("check wrong book update failed", error);
    return false;
  }
};

const setSource = (value) => {
  useWrongBook.value = value;
};

const startSession = async (selectedMode) => {
  if (!projectId) {
    Taro.showToast({ title: "缺少项目ID", icon: "error" });
    return;
  }
  if (useWrongBook.value && !wrongBookIds.value.length) {
    Taro.showToast({ title: "错题本为空，请先做题", icon: "none" });
    return;
  }
  if (loadingList.value) return;

  // 检查是否有已存在的对应记录
  let storageKey;
  if (useWrongBook.value) {
    storageKey = STORAGE_KEY_WRONGBOOK;
  } else if (selectedMode === 'study') {
    storageKey = STORAGE_KEY_STUDY;
  } else {
    storageKey = STORAGE_KEY_PRACTICE;
  }

  try {
    const existingProgress = Taro.getStorageSync(storageKey);
    if (existingProgress && Number(existingProgress.projectId) === projectId && existingProgress.questionIds?.length) {
      // 如果是错题本，先提示是否覆盖
      if (useWrongBook.value) {
        const res = await Taro.showModal({
          title: "覆盖已存在的记录",
          content: "检测到已存在的错题本记录，是否覆盖并重新开始？",
          confirmText: "覆盖",
          cancelText: "取消",
          confirmColor: "#ef4444",
        });

        if (!res.confirm) {
          // 用户选择不覆盖，检测是否有变化
          const hasUpdate = checkWrongBookUpdate();
          if (hasUpdate) {
            // 有变化，提示用户
            await Taro.showModal({
              title: "错题本数据已更新",
              content: "错题本内容有变化，建议重新开始",
              confirmText: "知道了",
              showCancel: false,
              confirmColor: "#6366F1",
            });
          }
          // 用户取消，不开始
          return;
        }

        // 用户确认覆盖，清除记录
        clearProgress('wrongbook');
      } else {
        // 非错题本，提示是否覆盖
        const progressType = selectedMode === 'study' ? '学习模式' : '考试模式';
        const res = await Taro.showModal({
          title: "覆盖已存在的记录",
          content: `检测到已存在的${progressType}记录，是否覆盖并重新开始？`,
          confirmText: "覆盖",
          cancelText: "取消",
          confirmColor: "#ef4444",
        });

        if (!res.confirm) {
          // 用户取消，不开始
          return;
        }

        // 用户确认覆盖，清除对应记录
        clearProgress(selectedMode === 'study' ? 'study' : 'practice');
      }
    }
  } catch (error) {
    console.error("check existing progress failed", error);
  }

  // 不清除进度，保留所有类型的暂存记录
  // 用户可以通过返回选择界面来暂存当前进度
  mode.value = selectedMode;
  await loadQuestionIds();
};

const resetSessionState = () => {
  questionIds.value = [];
  currentIndex.value = -1;
  sliderIndex.value = 0;
  isSliding.value = false;
  currentQuestion.value = null;
  hasSubmitted.value = false;
  resultStatus.value = null;
  answerState.optionKey = "";
  answerState.textAnswer = "";
  answerState.subAnswers = {};
  Object.keys(subJudgeState).forEach((key) => delete subJudgeState[key]);
  sessionFinished.value = false;
};

const loadQuestionIds = async () => {
  resetSessionState();
  loadingList.value = true;
  try {
    let list = [];

    if (useWrongBook.value) {
      list = [...wrongBookIds.value];
      // 按需打乱顺序
      if (randomOrder.value) {
        list = list
          .map((id) => ({ id, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map((item) => item.id);
      }
    } else {
      const res = await questionsAPI.getQuestionIds({
        project_id: projectId,
        random: randomOrder.value,
      });
      list = extractQuestionIds(res);
    }

    questionIds.value = list;
    if (list.length) {
      await loadQuestionDetail(0);
    } else {
      sessionFinished.value = false;
    }
  } catch (error) {
    console.error("loadQuestionIds error", error);
    Taro.showToast({ title: "题目加载失败", icon: "none" });
  } finally {
    loadingList.value = false;
  }
};

const extractQuestionIds = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.question_ids)) return res.question_ids;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  if (res.Result && Array.isArray(res.Result.question_ids)) return res.Result.question_ids;
  return [];
};

const loadQuestionDetail = async (index) => {
  if (index < 0 || index >= questionIds.value.length) {
    currentQuestion.value = null;
    return;
  }
  loadingQuestion.value = true;
  hasSubmitted.value = false;
  resultStatus.value = null;
  answerState.optionKey = "";
  answerState.textAnswer = "";
  answerState.subAnswers = {};
  Object.keys(subJudgeState).forEach((key) => delete subJudgeState[key]);
  // 学习模式下切换题目时重置答案显示状态为显示
  if (mode.value === "study") {
    showAnswer.value = true;
  }
  try {
    const questionId = questionIds.value[index];
    const res = await questionsAPI.getQuestionDetail(questionId);
    currentIndex.value = index;
    sliderIndex.value = index;
    isSliding.value = false;
    currentQuestion.value = normalizeQuestion(res);
    saveProgress();
  } catch (error) {
    console.error("loadQuestionDetail error", error);
    Taro.showToast({ title: "题目加载失败", icon: "none" });
  } finally {
    loadingQuestion.value = false;
  }
};

const normalizeQuestion = (raw) => {
  if (!raw) return null;
  const question = {
    ...raw,
    options: raw.options || (raw.type === 3 ? ["正确", "错误"] : []),
  };
  if (Array.isArray(raw.sub_questions)) {
    question.sub_questions = raw.sub_questions.map((sub) => ({
      ...sub,
      options: sub.options || (sub.type === 3 ? ["正确", "错误"] : []),
    }));
  }
  return question;
};

const getOptions = (question) => {
  if (!question || !Array.isArray(question.options)) return [];
  return question.options.map((label, index) => ({
    key: String.fromCharCode(65 + index),
    label,
  }));
};

const getQuestionTypeText = (type) => {
  switch (Number(type)) {
    case 1:
      return "单选题";
    case 2:
      return "填空/简答题";
    case 3:
      return "判断题";
    default:
      return "题目";
  }
};

const getCorrectKey = (question) => {
  if (!question) return "";
  if (Number(question.type) === 3) {
    const answer = (question.answer || "").trim();
    if (!answer) return "";
    if (["正确", "True", "true"].includes(answer)) return "A";
    if (["错误", "False", "false"].includes(answer)) return "B";
  }
  return (question.answer || "").toString().trim().toUpperCase();
};

const getCorrectText = (question) => {
  if (!question) return "";
  if (question.type === 2) return question.answer || "";
  const key = getCorrectKey(question);
  const option = getOptions(question).find((item) => item.key === key);
  return option ? `${option.label}` : question.answer || "";
};

const handleOptionTap = (optionKey, question, subId = null) => {
  if (!question) return;
  const isPractice = mode.value === "practice";
  const hasSubQuestions = !!question.sub_questions?.length;
  const isEssay = Number(question.type) === 2;

  if (subId) {
    const judge = subJudgeState[subId];
    if (judge?.submitted) {
      return;
    }
  }

  if (isPractice && hasSubmitted.value) {
    if (!subId && !hasSubQuestions && !isEssay) {
      const correctKey = getCorrectKey(question);
      if (optionKey === correctKey) {
        goNextQuestion();
      }
    }
    return;
  }

  const previousSelection = subId
    ? answerState.subAnswers[subId]
    : answerState.optionKey;

  if (subId) {
    answerState.subAnswers = {
      ...answerState.subAnswers,
      [subId]: optionKey,
    };

    if (isPractice && !hasSubmitted.value) {
      if (previousSelection === optionKey) {
        const correctKey = getCorrectKey(question);
        subJudgeState[subId] = {
          submitted: true,
          result: optionKey === correctKey ? "correct" : "incorrect",
        };
        checkSubQuestionCompletion();
      } else {
        subJudgeState[subId] = {
          submitted: false,
          result: null,
        };
      }
    }
    return;
  }

  answerState.optionKey = optionKey;

  const isSameSelection = previousSelection === optionKey;

  if (
    mode.value === "practice" &&
    !subId &&
    !question.sub_questions?.length &&
    Number(question.type) !== 2 &&
    !hasSubmitted.value &&
    isSameSelection &&
    canSubmit.value
  ) {
    handleSubmit();
    return;
  }

  if (mode.value === "study") {
    const correctKey = getCorrectKey(question);
    if (optionKey === correctKey) {
      setTimeout(() => {
        goNextQuestion();
      }, 220);
    }
  }
};

const getOptionClass = (question, optionKey, subId = null) => {
  const status = getOptionStatus(question, optionKey, subId);
  const base = "border-gray-100 bg-white text-gray-800";
  const selected = "border-indigo-400 bg-indigo-50 text-indigo-700";
  const correct = "border-green-500 bg-green-50 text-green-700";
  const wrong = "border-red-400 bg-red-50 text-red-600";

  switch (status) {
    case "correct":
      return correct;
    case "wrong":
      return wrong;
    case "selected":
      return selected;
    default:
      return base;
  }
};

const getOptionStatus = (question, optionKey, subId = null) => {
  if (!question) return "base";
  const correctKey = getCorrectKey(question);
  const selectedKey = subId ? answerState.subAnswers[subId] : answerState.optionKey;

  if (subId) {
    const judge = subJudgeState[subId];
    if (judge?.submitted) {
      if (optionKey === correctKey) {
        return "correct";
      }
      if (optionKey === selectedKey) {
        return judge.result === "incorrect" ? "wrong" : "base";
      }
      return "base";
    }
  }

  if (mode.value === "study") {
    if (!showAnswer.value) {
      return optionKey === selectedKey ? "selected" : "base";
    }
    return optionKey === correctKey ? "correct" : "base";
  }

  if (!hasSubmitted.value) {
    return optionKey === selectedKey ? "selected" : "base";
  }

  if (optionKey === correctKey) {
    return "correct";
  }

  if (optionKey === selectedKey) {
    return "wrong";
  }

  return "base";
};

const handleSubmit = () => {
  if (!canSubmit.value || !currentQuestion.value) return;
  const question = currentQuestion.value;

  if (question.sub_questions?.length) {
    const total = question.sub_questions.length;
    let correctCount = 0;
    question.sub_questions.forEach((sub) => {
      const key = getCorrectKey(sub);
      if (answerState.subAnswers[sub.id] === key) {
        correctCount += 1;
      }
    });
    if (correctCount === total) {
      resultStatus.value = "correct";
    } else if (correctCount === 0) {
      resultStatus.value = "incorrect";
    } else {
      resultStatus.value = "partial";
    }
  } else if (question.type === 2) {
    resultStatus.value = "text";
  } else {
    const correctKey = getCorrectKey(question);
    resultStatus.value =
      answerState.optionKey === correctKey ? "correct" : "incorrect";
  }

  hasSubmitted.value = true;

  // 考试模式下客观题做错自动加入错题本
  if (
    mode.value === "practice" &&
    question.type !== 2 &&
    (resultStatus.value === "incorrect" || resultStatus.value === "partial")
  ) {
    addToWrongBook(question.id, false);
  }
};

const onTextAnswerInput = (event) => {
  answerState.textAnswer = event.detail?.value || "";
};

const goNextQuestion = async () => {
  if (!currentQuestion.value || !questionIds.value.length) return;
  if (mode.value === "practice" && !hasSubmitted.value) {
    Taro.showToast({ title: "请先提交答案", icon: "none" });
    return;
  }

  await recordProgress();

  const nextIndex = currentIndex.value + 1;
  if (nextIndex >= questionIds.value.length) {
    sessionFinished.value = true;
    currentQuestion.value = null;
    // 完成时清除当前类型的进度，保留其他类型的暂存记录
    const currentType = useWrongBook.value ? 'wrongbook' : (mode.value === 'study' ? 'study' : 'practice');
    clearProgress(currentType);
    return;
  }
  await loadQuestionDetail(nextIndex);
};

const goPrevQuestion = async () => {
  if (!questionIds.value.length) return;
  const prevIndex = currentIndex.value - 1;
  if (prevIndex < 0) {
    Taro.showToast({ title: "已经是第一题", icon: "none" });
    return;
  }
  sessionFinished.value = false;
  await loadQuestionDetail(prevIndex);
};

const handleSliderChanging = (event) => {
  if (!questionIds.value.length) return;
  const rawValue = Number(event.detail?.value || 1);
  const target = Math.min(
    Math.max(rawValue - 1, 0),
    questionIds.value.length - 1
  );
  sliderIndex.value = target;
  isSliding.value = true;
};

const handleSliderChange = async (event) => {
  if (!questionIds.value.length) return;
  const rawValue = Number(event.detail?.value || 1);
  const target = Math.min(
    Math.max(rawValue - 1, 0),
    questionIds.value.length - 1
  );
  if (target === currentIndex.value) {
    isSliding.value = false;
    return;
  }
  sessionFinished.value = false;
  await loadQuestionDetail(target);
};

const recordProgress = async () => {
  if (!currentQuestion.value) return;
  try {
    const payload = {
      project_id: projectId,
      question_id: currentQuestion.value.id,
    };
    if (mode.value === "study") {
      await questionsAPI.recordStudy(payload);
    } else if (mode.value === "practice") {
      await questionsAPI.recordPractice(payload);
    }
  } catch (error) {
    console.error("record progress failed", error);
  }
};

const resetSession = () => {
  mode.value = null;
  resetSessionState();
};

const fetchProjectMeta = async () => {
  if (!projectId || projectInfo.value.description) return;
  try {
    const res = await questionsAPI.getProjects();
    const list = Array.isArray(res?.projects)
      ? res.projects
      : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
    const target = list.find((item) => Number(item.id) === projectId);
    if (target) {
      projectInfo.value = {
        ...projectInfo.value,
        ...target,
      };
    }
  } catch (error) {
    console.error("fetchProjectMeta error", error);
  }
};

const fetchOnlineCount = async () => {
  if (!projectId) return;
  try {
    const res = await statAPI.getProjectOnline(projectId);
    // 处理不同的响应格式
    if (typeof res === 'object' && res !== null) {
      onlineCount.value = res.online_count ?? res.onlineCount ?? null;
    } else if (typeof res === 'number') {
      onlineCount.value = res;
    }
  } catch (error) {
    console.error("fetchOnlineCount error", error);
    // 失败时不显示在线人数，不设置 onlineCount
  }
};

onMounted(fetchProjectMeta);
onMounted(() => {
  // 不再自动恢复进度，让用户主动选择接续进度
  loadWrongBook();
  // 立即获取一次在线人数
  fetchOnlineCount();
  // 每 60 秒轮询一次在线人数
  if (!onlineCountTimer.value) {
    onlineCountTimer.value = setInterval(() => {
      fetchOnlineCount();
    }, 60000);
  }
});

onBeforeUnmount(() => {
  if (onlineCountTimer.value) {
    clearInterval(onlineCountTimer.value);
    onlineCountTimer.value = null;
  }
});

const loadWrongBook = () => {
  try {
    const saved = Taro.getStorageSync(WRONG_BOOK_KEY);
    wrongBookIds.value = Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("load wrong book failed", error);
    wrongBookIds.value = [];
  }
};

const saveWrongBook = () => {
  try {
    Taro.setStorageSync(WRONG_BOOK_KEY, wrongBookIds.value);
  } catch (error) {
    console.error("save wrong book failed", error);
  }
};

const addToWrongBook = (questionId, showToast = true) => {
  if (!questionId) return;
  if (wrongBookIds.value.includes(questionId)) {
    if (showToast) {
      Taro.showToast({ title: "已在错题本中", icon: "none" });
    }
    return;
  }
  wrongBookIds.value = [...wrongBookIds.value, questionId];
  saveWrongBook();
  if (showToast) {
    Taro.showToast({ title: "已加入错题本", icon: "none" });
  }
};

const removeFromWrongBook = (questionId, showToast = true) => {
  if (!questionId) return;
  if (!wrongBookIds.value.includes(questionId)) return;
  wrongBookIds.value = wrongBookIds.value.filter((id) => id !== questionId);
  saveWrongBook();
  if (showToast) {
    Taro.showToast({ title: "已从错题本移出", icon: "none" });
  }
};

const toggleWrongBook = () => {
  if (!currentQuestion.value) return;
  const id = currentQuestion.value.id;
  if (wrongBookIds.value.includes(id)) {
    removeFromWrongBook(id, true);
  } else {
    addToWrongBook(id, true);
  }
};

const saveProgress = () => {
  if (!mode.value || !questionIds.value.length || currentIndex.value < 0) return;
  try {
    const progressData = {
      projectId,
      mode: mode.value,
      randomOrder: randomOrder.value,
      useWrongBook: useWrongBook.value,
      questionIds: questionIds.value,
      currentIndex: currentIndex.value,
      timestamp: Date.now(),
    };

    // 根据类型和来源选择存储键
    let storageKey;
    if (useWrongBook.value) {
      // 错题本
      storageKey = STORAGE_KEY_WRONGBOOK;
    } else if (mode.value === 'study') {
      // 学习模式
      storageKey = STORAGE_KEY_STUDY;
    } else {
      // 考试模式
      storageKey = STORAGE_KEY_PRACTICE;
    }

    Taro.setStorageSync(storageKey, progressData);
    // 触发 computed 更新
    progressUpdateTrigger.value++;
  } catch (error) {
    console.error("save progress failed", error);
  }
};

const clearProgress = (type = null) => {
  try {
    if (type === 'study') {
      Taro.removeStorageSync(STORAGE_KEY_STUDY);
    } else if (type === 'practice') {
      Taro.removeStorageSync(STORAGE_KEY_PRACTICE);
    } else if (type === 'wrongbook') {
      Taro.removeStorageSync(STORAGE_KEY_WRONGBOOK);
    } else {
      // 清除所有（包括旧版）
      Taro.removeStorageSync(STORAGE_KEY_STUDY);
      Taro.removeStorageSync(STORAGE_KEY_PRACTICE);
      Taro.removeStorageSync(STORAGE_KEY_WRONGBOOK);
      Taro.removeStorageSync(STORAGE_KEY_OLD);
    }
    // 触发 computed 更新
    progressUpdateTrigger.value++;
  } catch (error) {
    console.error("clear progress failed", error);
  }
};

const restoreProgress = async () => {
  try {
    // 兼容旧版存储
    const saved = Taro.getStorageSync(STORAGE_KEY_OLD);
    if (!saved || Number(saved.projectId) !== projectId) return;
    if (!saved.questionIds?.length || !saved.mode) return;
    mode.value = saved.mode;
    randomOrder.value = !!saved.randomOrder;
    useWrongBook.value = !!saved.useWrongBook;
    questionIds.value = saved.questionIds;
    sessionFinished.value = false;
    const resumeIndex = Math.min(
      saved.currentIndex ?? 0,
      saved.questionIds.length - 1
    );
    if (resumeIndex < 0) return;
    await loadQuestionDetail(resumeIndex);
  } catch (error) {
    console.error("restore progress failed", error);
  }
};

const handleBackToSelection = async () => {
  // 暂存当前进度
  if (mode.value && questionIds.value.length && currentIndex.value >= 0) {
    saveProgress();
    // 返回选择界面
    resetSession();
    // 等待 DOM 更新后触发 computed 更新
    await nextTick();
    progressUpdateTrigger.value++;
    Taro.showToast({ title: "进度已暂存", icon: "success", duration: 1000 });
  } else {
    // 返回选择界面
    resetSession();
  }
};

const resumeProgress = async (progress) => {
  if (!progress) {
    Taro.showToast({ title: "未找到保存的进度", icon: "none" });
    return;
  }

  try {
    if (!progress.questionIds?.length) {
      Taro.showToast({ title: "进度数据无效", icon: "none" });
      return;
    }

    // 如果是错题本类型，检测是否有变化
    if (progress.type === 'wrongbook' || progress.useWrongBook) {
      const hasUpdate = checkWrongBookUpdate();
      if (hasUpdate) {
        const res = await Taro.showModal({
          title: "错题本数据已更新",
          content: "错题本内容有变化，是否仍要恢复之前的进度？",
          confirmText: "恢复进度",
          cancelText: "取消",
          confirmColor: "#6366F1",
        });

        if (!res.confirm) {
          // 用户取消，不恢复
          return;
        }
      }
    }

    // 如果是旧版记录，迁移到新格式
    if (progress.isOldVersion) {
      migrateOldProgress(progress);
    }

    // 恢复模式，如果缺失则根据类型推断
    if (!progress.mode) {
      // 根据类型推断模式
      if (progress.type === 'study') {
        mode.value = 'study';
      } else if (progress.type === 'practice') {
        mode.value = 'practice';
      } else if (progress.type === 'wrongbook') {
        // 错题本默认为考试模式
        mode.value = 'practice';
      } else {
        mode.value = 'practice'; // 默认考试模式
      }
    } else {
      mode.value = progress.mode;
    }

    randomOrder.value = !!progress.randomOrder;
    useWrongBook.value = !!progress.useWrongBook;
    questionIds.value = progress.questionIds;
    sessionFinished.value = false;
    const resumeIndex = Math.min(
      progress.currentIndex ?? 0,
      progress.questionIds.length - 1
    );
    if (resumeIndex < 0) {
      Taro.showToast({ title: "进度数据无效", icon: "none" });
      return;
    }
    await loadQuestionDetail(resumeIndex);
    Taro.showToast({ title: "已恢复进度", icon: "success", duration: 1000 });
  } catch (error) {
    console.error("resume progress failed", error);
    Taro.showToast({ title: "恢复进度失败", icon: "none" });
  }
};

// 迁移旧版进度到新格式
const migrateOldProgress = (oldProgress) => {
  try {
    const progressData = {
      projectId: oldProgress.projectId,
      mode: oldProgress.mode,
      randomOrder: oldProgress.randomOrder,
      useWrongBook: oldProgress.useWrongBook,
      questionIds: oldProgress.questionIds,
      currentIndex: oldProgress.currentIndex,
      timestamp: oldProgress.timestamp || Date.now(),
    };

    // 根据类型和来源选择存储键
    let storageKey;
    if (oldProgress.useWrongBook) {
      storageKey = STORAGE_KEY_WRONGBOOK;
    } else if (oldProgress.mode === 'study') {
      storageKey = STORAGE_KEY_STUDY;
    } else {
      storageKey = STORAGE_KEY_PRACTICE;
    }

    // 保存到新格式
    Taro.setStorageSync(storageKey, progressData);
    // 删除旧版存储
    Taro.removeStorageSync(STORAGE_KEY_OLD);
    // 触发更新
    progressUpdateTrigger.value++;
  } catch (error) {
    console.error("migrate old progress failed", error);
  }
};

const deleteProgress = (type, isOldVersion = false) => {
  if (!type && !isOldVersion) return;

  Taro.showModal({
    title: "删除暂存记录",
    content: "确定要删除这条暂存记录吗？",
    confirmColor: "#ef4444",
    success(res) {
      if (res.confirm) {
        if (isOldVersion) {
          // 删除旧版存储
          try {
            Taro.removeStorageSync(STORAGE_KEY_OLD);
            progressUpdateTrigger.value++;
            Taro.showToast({ title: "已删除", icon: "success", duration: 1000 });
          } catch (error) {
            console.error("delete old progress failed", error);
            Taro.showToast({ title: "删除失败", icon: "none" });
          }
        } else {
          clearProgress(type);
          Taro.showToast({ title: "已删除", icon: "success", duration: 1000 });
        }
      }
    },
  });
};


Taro.useShareAppMessage((res) => {
    if (res.from === 'button') {
    }
    return {
      title: "江理一起来学期末复习",
      path: '/pages/final-review/index',
    }
  })

Taro.useShareTimeline((res) => {
    if (res.from === 'button') {
    }
    return {
      title: "江理一起来学期末复习",
      path: '/pages/final-review/index',
    }
  })
</script>

<style scoped></style>

