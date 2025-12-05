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
              @tap="handleRestart"
            >
              重开
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

          <view class="text-base text-gray-900">
            {{ currentQuestion.title }}
          </view>

          <view
            v-if="mode"
            class="flex justify-end pt-1"
          >
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
            <view
              v-for="sub in currentQuestion.sub_questions"
              :key="sub.id"
            >
              <view class="text-sm font-medium text-gray-900">
                {{ sub.title }}
              </view>
              <view class="mt-3 space-y-2">
                <view
                  v-for="option in getOptions(sub)"
                  :key="option.key"
                  class="p-3 rounded-xl border text-sm flex items-center justify-between"
                  :class="getOptionClass(sub, option.key, sub.id)"
                  @tap="handleOptionTap(option.key, sub, sub.id)"
                >
                  <view class="flex items-center gap-2">
                    <text>{{ option.label }}</text>
                  </view>
                </view>
              </view>
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
            <view
              v-for="option in getOptions(currentQuestion)"
              :key="option.key"
              class="p-3 rounded-2xl border text-sm flex items-center justify-between"
              :class="getOptionClass(currentQuestion, option.key)"
              @tap="handleOptionTap(option.key, currentQuestion)"
            >
              <view class="flex items-center gap-2">
                <text>{{ option.label }}</text>
              </view>
            </view>
          </view>

          <view
            v-if="currentQuestion.type === 2 && (mode === 'study' || (mode === 'practice' && hasSubmitted))"
            class="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700"
          >
            答案：{{ getCorrectText(currentQuestion) }}
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
import { reactive, ref, computed, onMounted } from "vue";
import Taro from "@tarojs/taro";
import { questionsAPI } from "../../../api";

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
const STORAGE_KEY = `finalReviewProgress:${projectId}`;
const WRONG_BOOK_KEY = `finalReviewWrongBook:${projectId}`;
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
const lastPracticePayload = ref(null);
const wrongBookIds = ref([]);

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
  clearProgress();
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
  lastPracticePayload.value = null;
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
  lastPracticePayload.value = null;
  answerState.optionKey = "";
  answerState.textAnswer = "";
  answerState.subAnswers = {};
  Object.keys(subJudgeState).forEach((key) => delete subJudgeState[key]);
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

  lastPracticePayload.value = buildPracticePayload(question);
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

const buildPracticePayload = (question) => {
  if (!question) return null;
  const base = {
    project_id: projectId,
    question_id: question.id,
    mode: "practice",
  };
  if (question.sub_questions?.length) {
    return {
      ...base,
      sub_answers: question.sub_questions.map((sub) => ({
        id: sub.id,
        answer: answerState.subAnswers[sub.id] || "",
        answer_label: findOptionLabel(sub, answerState.subAnswers[sub.id]),
      })),
    };
  }
  if (question.type === 2) {
    return {
      ...base,
      answer_text: answerState.textAnswer.trim(),
    };
  }
  const answerKey = answerState.optionKey;
  return {
    ...base,
    answer: answerKey,
    answer_label: findOptionLabel(question, answerKey),
  };
};

const findOptionLabel = (question, key) => {
  if (!question || !key) return "";
  const option = getOptions(question).find((item) => item.key === key);
  return option?.label || "";
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
    clearProgress();
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
    if (mode.value === "study") {
      await questionsAPI.recordStudy({
        project_id: projectId,
        question_id: currentQuestion.value.id,
        mode: "study",
      });
    } else if (mode.value === "practice" && lastPracticePayload.value) {
      await questionsAPI.recordPractice(lastPracticePayload.value);
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

onMounted(fetchProjectMeta);
onMounted(() => {
  restoreProgress();
  loadWrongBook();
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
    Taro.setStorageSync(STORAGE_KEY, {
      projectId,
      mode: mode.value,
      randomOrder: randomOrder.value,
      useWrongBook: useWrongBook.value,
      questionIds: questionIds.value,
      currentIndex: currentIndex.value,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("save progress failed", error);
  }
};

const clearProgress = () => {
  try {
    Taro.removeStorageSync(STORAGE_KEY);
  } catch (error) {
    console.error("clear progress failed", error);
  }
};

const restoreProgress = async () => {
  try {
    const saved = Taro.getStorageSync(STORAGE_KEY);
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

const handleRestart = () => {
  Taro.showModal({
    title: "重新开始",
    content: "将清除当前练习进度，需要重新选择模式与顺序。",
    confirmColor: "#6366f1",
    success(res) {
      if (res.confirm) {
        clearProgress();
        resetSession();
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

