<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 功能卡片网格 -->
    <view class="p-4">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">学业</text>
      </view>
      <view class="grid grid-cols-4 gap-2">
        <!-- 教师评价 -->
        <view
          class="bg-white rounded-xl p-3 shadow-sm active:scale-95 transition-transform duration-200"
          @tap="goToTeacherReviews"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-book-open text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">选课助手</text>
          </view>
        </view>
        <view @tap="goToFailRate" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-red-300 to-red-500 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-alert-triangle text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">挂科率</text>
          </view>
        </view>
        <view
          @tap="goToGraduationPaper"
          class="bg-white rounded-xl p-3 shadow-sm"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-file-text text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">毕业论文</text>
          </view>
        </view>

      </view>
    </view>

    <!-- 来学 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">江理一起来学</text>
      </view>
      <view class="grid grid-cols-4 gap-2">
        <view @tap="goToNotice" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-indigo-300 to-indigo-500 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-bell text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">信息海洋</text>
          </view>
        </view>
        <view @tap="goToDatabase" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-folder-open text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">资料库</text>
          </view>
        </view>
        <view @tap="goToHero" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-trophy text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">英雄榜</text>
          </view>
        </view>
        <view @tap="goToGroupChat" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-message-circle text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">交流群</text>
          </view>
        </view>
      </view>
    </view>
    <!-- 校园 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">校园</text>
      </view>
      <view class="grid grid-cols-4 gap-2">
        <view @tap="goToAchievePrint" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-file-text text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">成绩打印</text>
          </view>
        </view>
        <view @tap="goToCalendar" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-green-200 to-green-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-calendar text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">校历</text>
          </view>
        </view>
        <view @tap="goToAddress" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-truck text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">快递地址</text>
          </view>
        </view>
        <view @tap="goToMap" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-green-200 to-green-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-map text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">地图</text>
          </view>
        </view>
        <view @tap="goToNoticeToZLK" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-pink-200 to-pink-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-eye text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">视觉资源</text>
          </view>
        </view>
        <view @tap="goToNoticeToZLK" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-purple-200 to-purple-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-book-open text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">学生手册</text>
          </view>
        </view>
        <view @tap="goToNoticeToZLK" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-image text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">校园风光</text>
          </view>
        </view>
        <view @tap="goToNoticeToZLK" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-layout-template text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">模板</text>
          </view>
        </view>
      </view>
    </view>
    <!-- INSERT_YOUR_CODE -->

    <!-- 学业 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">学业</text>
      </view>
      <view class="grid grid-cols-4 gap-2">
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-bar-chart-2 text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">成绩</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-calendar-days text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">考试安排</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-award text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">绩点排名</text>
          </view>
        </view>

        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-check-circle text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">毕业条件</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 发展 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">发展</text>
      </view>
      <view class="grid grid-cols-4 gap-2">
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-rocket text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">大学生涯</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-repeat text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">转专业</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-green-200 to-green-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-trophy text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">竞赛</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-purple-200 to-purple-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-badge-check text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">考级考证</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-pink-200 to-pink-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-globe text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">交换生</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-cyan-200 to-cyan-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-code-2 text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">专业技能</text>
          </view>
        </view>

        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-cyan-100 to-cyan-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-scroll text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">科研</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-green-100 to-green-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-flask-conical text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">项目</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 认可 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">认可</text>
      </view>
      <view class="grid grid-cols-4 gap-2">
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-pink-100 to-pink-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-star text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">综合测评</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-award text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">荣誉奖励</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 未来 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">未来</text>
      </view>
      <view class="grid grid-cols-4 gap-2">
        <view @tap="goToBaoYan" class="bg-white rounded-xl p-3 shadow-sm">
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-graduation-cap text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">保研</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-green-100 to-green-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-book text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">考研</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-briefcase text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">就业</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-clipboard-list text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">实习</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-banknote text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">考公</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-pink-100 to-pink-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-globe-2 text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">留学</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 生活 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center">
        <text class="text-gray-800 font-medium">生活</text>
      </view>
      <view class="grid grid-cols-4 gap-2 mb-2">
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-green-200 to-green-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-bolt text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">电费查询</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-red-200 to-red-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-search text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">失物招领</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-users text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">社团空间</text>
          </view>
        </view>
        <view
          @tap="goToCoding"
          class="bg-white rounded-xl p-3 shadow-sm opacity-60"
        >
          <view class="flex flex-col items-center text-center">
            <view
              class="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-300 rounded-full flex items-center justify-center mb-2"
            >
              <text class="i-lucide-book-user text-white w-4 h-4"></text>
            </view>
            <text class="text-gray-800 font-medium text-sm">通讯录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useAuthStore } from "../../stores/auth";
import Taro from "@tarojs/taro";

const authStore = useAuthStore();

// 导航方法
const goToTeacherReviews = () => {
  Taro.navigateTo({ url: "/pages/teacher-reviews/index" });
};

const goToCoding = () => {
  Taro.showToast({
    title: "敬请期待",
    icon: "none",
  });
};

const goToNotice = () => {
  if (!authStore.requireAuth()) return;
  Taro.navigateTo({
    url: "/pages/notifications/index"
  });
};

const goToDatabase = () => {
  Taro.navigateTo({
    url: "/pages/webview/index?url=https://mp.weixin.qq.com/s/iU1000Q7KQrfagS2Y-_7CQ",
  });
};

const goToGraduationPaper = () => {
  Taro.navigateTo({
    url: "/pages/webview/index?url=https://mp.weixin.qq.com/s/8lXrMp0ro3Z7flxHpAdq0A",
  });
};

const goToBaoYan = () => {
  Taro.navigateTo({
    url: "/pages/webview/index?url=https://mp.weixin.qq.com/s/beDH82F7Vgh_eADTofcVAA",
  });
};

const goToHero = () => {
  Taro.navigateTo({ url: "/pages/hero/index" });
};

const goToFailRate = () => {
  if (!authStore.requireAuth()) return;
  Taro.navigateTo({ url: "/pages/failrate/index" });
};

const goToAchievePrint = () => {
  if (!authStore.requireAuth()) return;
  Taro.navigateTo({ url: "/pages/achieveprint/index" });
};

const goToCalendar = () => {
  if (!authStore.requireAuth()) return;
  Taro.navigateTo({ url: "/pages/calendar/index" });
};

const goToAddress = () => {
  Taro.navigateTo({ url: "/pages/address/index" });
};

const goToMap = () => {
  if (!authStore.requireAuth()) return;
  Taro.navigateTo({ url: "/pages/map/index" });
};

const goToGroupChat = () => {
  if (!authStore.requireAuth()) return;
  Taro.navigateTo({ url: "/pages/groupchat/index" });
};

const goToNoticeToZLK = () => {
  Taro.showToast({
    title: "请在资料库查找",
    icon: "success",
  });
};

</script>

<style scoped></style>
