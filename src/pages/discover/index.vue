<template>
  <view class="min-h-screen bg-gray-50">

    <!-- 功能卡片网格 -->
    <view class="p-4">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">学业</text>
      </view>
      <view class="grid grid-cols-2 gap-2 mb-2">
        <!-- 教师评价 -->
        <view
          class="bg-white rounded-xl p-4 shadow-sm active:scale-95 transition-transform duration-200"
          @tap="goToTeacherReviews"
        >
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <text class="i-lucide-book-open text-white w-5 h-5"></text>
            </view>
            <view class="flex flex-col ml-3">
              <text class="text-gray-800 font-medium mb-1">选课助手</text>
              <text class="text-gray-500 text-xs">点评上课体验</text>
            </view>
          </view>
        </view>
        <view @tap="goToFailRate" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-red-300 to-red-500 rounded-full flex items-center justify-center">
              <text class="i-lucide-alert-triangle text-white w-5 h-5"></text>
            </view>
            <view class="flex flex-col ml-3">
            <text class="text-gray-800 font-medium mb-1">挂科率</text>
            <text class="text-gray-500 text-xs">参与补考比率</text></view>
          </view>
        </view>
        <view @tap="goToGraduationPaper" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center">
              <text class="i-lucide-file-text text-white w-5 h-5"></text>
            </view>
            <view class="flex flex-col ml-3">
            <text class="text-gray-800 font-medium mb-1">毕业论文</text>
            <text class="text-gray-500 text-xs">全流程全解析</text></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 来学 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">来学</text>
      </view>
      <view class="grid grid-cols-2 gap-2 mb-2">
        <view @tap="goToDatabase" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center">
              <text class="i-lucide-folder-open text-white w-5 h-5"></text>
            </view>
            <view class="flex flex-col ml-3">
            <text class="text-gray-800 font-medium mb-1">资料库</text>
            <text class="text-gray-500 text-xs">学习永不止步</text></view>
          </view>
        </view>
        <view @tap="goToHero" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center">
              <text class="i-lucide-trophy text-white w-5 h-5"></text>
            </view>
            <view class="flex flex-col ml-3">
            <text class="text-gray-800 font-medium mb-1">英雄榜</text>
            <text class="text-gray-500 text-xs">平凡铸就伟大</text></view>
          </view>
        </view>
      <view @tap="goToGroupChat" class="bg-white rounded-xl p-4 shadow-sm">
        <view class="flex items-center">
          <view class="w-10 h-10 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center">
            <text class="i-lucide-message-circle text-white w-5 h-5"></text>
          </view>
          <view class="flex flex-col ml-3">
            <text class="text-gray-800 font-medium mb-1">交流群</text>
            <text class="text-gray-500 text-xs">分享产生价值</text>
          </view>
        </view>
      </view>
      </view>
    </view>
    <!-- 校园 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">校园</text>
      </view>
      <view class="grid grid-cols-2 gap-2 mb-2">
        <view @tap="goToAchievePrint" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-file-text text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">成绩打印</text>
          </view>
        </view>
        <view @tap="goToCalendar" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-green-200 to-green-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-calendar text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">校历</text>
          </view>
        </view>
        <view @tap="goToAddress" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-truck text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">快递地址</text>
          </view>
        </view>
        <view @tap="goToMap" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-green-200 to-green-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-map text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">地图</text>
          </view>
        </view>
        <view @tap="goToNoticeToZLK" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-pink-200 to-pink-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-eye text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">视觉资源</text>
          </view>
        </view>
        <view @tap="goToNoticeToZLK" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-purple-200 to-purple-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-book-open text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">学生手册</text>
          </view>
        </view>
        <view @tap="goToNoticeToZLK" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-image text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">校园风光</text>
          </view>
        </view>
        <view @tap="goToNoticeToZLK" class="bg-white rounded-xl p-4 shadow-sm">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-layout-template text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">模板</text>
          </view>
        </view>
      </view>
    </view>
    <!-- INSERT_YOUR_CODE -->
    <!-- 来学 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">来学</text>
      </view>
      <view class="grid grid-cols-2 gap-2 mb-2">
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-indigo-300 to-indigo-500 rounded-full flex items-center justify-center">
              <text class="i-lucide-bell text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">通知公告</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full flex items-center justify-center">
              <text class="i-lucide-clock text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">此时江理</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 学业 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">学业</text>
      </view>
      <view class="grid grid-cols-2 gap-2 mb-2">
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center">
              <text class="i-lucide-bar-chart-2 text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">成绩</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full flex items-center justify-center">
              <text class="i-lucide-calendar-days text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">考试安排</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full flex items-center justify-center">
              <text class="i-lucide-award text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">绩点排名</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center">
              <text class="i-lucide-check-circle text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">毕业条件</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 发展 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">发展</text>
      </view>
      <view class="grid grid-cols-2 gap-2 mb-2">
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-rocket text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">大学生涯</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center">
              <text class="i-lucide-repeat text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">转专业</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-green-200 to-green-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-trophy text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">竞赛</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-purple-200 to-purple-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-badge-check text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">考级考证</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-pink-200 to-pink-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-globe text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">交换生</text>
          </view>
        </view>
      <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
        <view class="flex items-center">
          <view class="w-10 h-10 bg-gradient-to-br from-cyan-200 to-cyan-400 rounded-full flex items-center justify-center">
            <text class="i-lucide-code-2 text-white w-5 h-5"></text>
          </view>
          <text class="ml-3 text-gray-800 font-medium">专业技能</text>
        </view>
      </view>
      </view>
    </view>

    <!-- 科研 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">科研</text>
      </view>
      <view class="grid grid-cols-2 gap-2 mb-2">
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-user-plus text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">助理招募</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-green-100 to-green-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-flask-conical text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">大创项目</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-users text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">伙伴匹配</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 认可 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">认可</text>
      </view>
      <view class="grid grid-cols-2 gap-2 mb-2">
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-star text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">综合测评</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-award text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">荣誉奖励</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 未来 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">未来</text>
      </view>
      <view class="grid grid-cols-2 gap-2 mb-2">
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-graduation-cap text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">保研</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-green-100 to-green-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-book text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">考研</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-briefcase text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">就业</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-clipboard-list text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">实习</text>
          </view>
        </view>
        <view class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-banknote text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">考公</text>
          </view>
        </view>
        <view @tap="goToNotice"  class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-globe-2 text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">留学</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 校园 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">校园</text>
      </view>
      <view class="grid grid-cols-2 gap-2 mb-2">
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-calendar-clock text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">日程</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-300 rounded-full flex items-center justify-center">
              <text class="i-lucide-book-user text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">通讯录</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 生活 -->
    <view class="p-4 pt-0">
      <view class="flex justify-between items-center mb-2">
        <text class="text-gray-800 font-medium">生活</text>
      </view>
      <view class="grid grid-cols-2 gap-2 mb-2">
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-green-200 to-green-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-bolt text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">电费查询</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-pink-200 to-pink-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-hourglass text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">倒数日</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-red-200 to-red-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-search text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">失物招领</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-purple-200 to-purple-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-list-checks text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">学习清单</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-users text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">社团空间</text>
          </view>
        </view>
        <view @tap="goToNotice" class="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <view class="flex items-center">
            <view class="w-10 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full flex items-center justify-center">
              <text class="i-lucide-share-2 text-white w-5 h-5"></text>
            </view>
            <text class="ml-3 text-gray-800 font-medium">经验分享</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="h-20"></view>
  </view>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import Taro from '@tarojs/taro'

const authStore = useAuthStore()

// 导航方法
const goToTeacherReviews = () => {
  Taro.navigateTo({ url: '/pages/teacher-reviews/index' })
}

const goToNotice = () => {
  Taro.showToast({
    title: '敬请期待',
    icon: 'none'
  })
}

const goToDatabase = () => {
  Taro.navigateTo({ url: '/pages/webview/index?url=https://mp.weixin.qq.com/s/iU1000Q7KQrfagS2Y-_7CQ' })
}

const goToGraduationPaper = () => {
  Taro.navigateTo({ url: '/pages/webview/index?url=https://mp.weixin.qq.com/s/8lXrMp0ro3Z7flxHpAdq0A' })
}

const goToHero = () => {
  Taro.navigateTo({ url: '/pages/hero/index' })
}

const goToFailRate = () => {
  if (!authStore.requireAuth()) return
  Taro.navigateTo({ url: '/pages/failrate/index' })
}

const goToAchievePrint = () => {
  if (!authStore.requireAuth()) return
  Taro.navigateTo({ url: '/pages/achieveprint/index' })
}

const goToCalendar = () => {
  if (!authStore.requireAuth()) return
  Taro.navigateTo({ url: '/pages/calendar/index' })
}

const goToAddress = () => {
  Taro.navigateTo({ url: '/pages/address/index' })
}

const goToMap = () => {
  if (!authStore.requireAuth()) return
  Taro.navigateTo({ url: '/pages/map/index' })
}

const goToGroupChat = () => {
  if (!authStore.requireAuth()) return
  Taro.navigateTo({ url: '/pages/groupchat/index' })
}

const goToNoticeToZLK = () => {
  Taro.showToast({
    title: '请在资料库查找',
    icon: 'none'
  })
}

</script>

<style scoped>
</style>
