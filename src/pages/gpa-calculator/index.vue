<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <page-meta
    :page-style="themeStore.pageStyle"
    :background-color="themeStore.nativeTheme.pageBg"
    :background-text-style="themeStore.nativeTheme.backgroundTextStyle"
  />
  <view class="h-screen bg-page flex flex-col text-fg" :class="[themeStore.rootClass]">
    <view class="px-4 pt-4 shrink-0">
      <!-- 绩点结果显示区域 -->
      <view class="bg-surface rounded-xl shadow-sm px-6 py-3 mb-4">
        <view class="text-center">
          <view class="grid grid-cols-3 gap-4">
            <!-- 五分制 -->
            <view class="flex flex-col items-center">
              <text class="text-fg-subtle text-xs mb-1">五分制</text>
              <text class="text-2xl font-bold" :user-select="true">
                {{ gpaResults.fivePoint.toFixed(2) }}
              </text>
            </view>
            <!-- 百分制 -->
            <view class="flex flex-col items-center">
              <text class="text-fg-subtle text-xs mb-1">百分制</text>
              <text class="text-2xl font-bold text-brand" :user-select="true">
                {{ gpaResults.percentage.toFixed(2) }}
              </text>
            </view>
            <!-- 四分制 -->
            <view class="flex flex-col items-center">
              <text class="text-fg-subtle text-xs mb-1">四分制</text>
              <text class="text-2xl font-bold" :user-select="true">
                {{ gpaResults.fourPoint.toFixed(2) }}
              </text>
            </view>
          </view>
          <!-- 总学分显示 -->
          <view class="mt-2 pt-2 border-t border-line">
            <text class="text-fg-muted text-xs">总学分：</text>
            <text class="text-brand text-sm font-medium">{{ totalSelectedCredits.toFixed(1) }}</text>
            <text class="text-fg-subtle text-xs"> / </text>
            <text class="text-fg-muted text-sm font-medium">{{ totalCredits.toFixed(1) }}</text>
          </view>
        </view>
      </view>

      <!-- 功能按钮区域 -->
      <view class="mb-3 grid grid-cols-4 gap-3">
        <!-- 反向计算 -->
        <view
          @tap="openReverseCalcModal"
          class="bg-brand rounded-xl p-2 active:opacity-90 transition-opacity"
        >
          <view class="flex flex-col items-center justify-center">
            <text class="i-lucide-calculator w-5 h-5 text-white mb-1"></text>
            <text class="text-white text-xs font-medium">反向计算</text>
          </view>
        </view>

        <!-- 保研均分 -->
        <view
          @tap="openGraduateModal"
          class="bg-brand rounded-xl p-2 active:opacity-90 transition-opacity"
        >
          <view class="flex flex-col items-center justify-center">
            <text class="i-lucide-graduation-cap w-5 h-5 text-white mb-1"></text>
            <text class="text-white text-xs font-medium">保研均分</text>
          </view>
        </view>

        <!-- 添加课程 -->
        <view
          @tap="openAddModal"
          class="bg-brand rounded-xl p-2 active:opacity-90 transition-opacity"
        >
          <view class="flex flex-col items-center justify-center">
            <text class="i-lucide-plus w-5 h-5 text-white mb-1"></text>
            <text class="text-white text-xs font-medium">添加课程</text>
          </view>
        </view>

        <!-- 备份恢复 -->
        <view
          @tap="openBackupModal"
          class="bg-brand rounded-xl p-2 active:opacity-90 transition-opacity"
        >
          <view class="flex flex-col items-center justify-center">
            <text class="i-lucide-database w-5 h-5 text-white mb-1"></text>
            <text class="text-white text-xs font-medium">备份恢复</text>
          </view>
        </view>
      </view>

      <view
        v-if="!isLocalDataView"
        class="mb-4 bg-surface-muted rounded-xl px-4 py-3 flex items-center justify-between"
      >
        <view class="flex items-center pr-3 min-w-0">
          <text class="i-lucide-eye text-fg-muted w-4 h-4 mr-2 shrink-0"></text>
          <view class="min-w-0">
            <text class="text-fg text-sm font-medium block truncate">
              正在预览：{{ activeBackupTitle || `云端存档 ${activeBackupId}` }}
            </text>
            <text class="text-fg-subtle text-xs block mt-0.5">当前操作不会影响本地数据</text>
          </view>
        </view>
        <view
          @tap="switchToLocalData"
          class="shrink-0 bg-surface text-fg text-xs px-3 py-2 rounded-lg border border-line active:bg-surface-muted"
        >
          <text>切回本地</text>
        </view>
      </view>
    </view>

    <!-- 历史数据列表 -->
    <view class="px-4 flex-1 h-[1px] flex flex-col">
      <view v-if="courses.length > 0" class="bg-surface rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col h-full">
        <view class="px-4 py-3 border-b border-line shrink-0 flex items-center justify-between">
          <view>
            <text class="text-fg font-medium text-sm block">
              {{ isLocalDataView ? '已添加课程' : '备份预览课程' }}
            </text>
            <text v-if="!isLocalDataView && activeBackupUpdatedAt" class="text-fg-subtle text-xs block mt-1">
              更新时间：{{ activeBackupUpdatedAt }}
            </text>
          </view>
          <view class="flex items-center shrink-0">
            <view
              @tap="selectAll"
              class="mx-2 active:bg-surface-muted rounded"
            >
              <text class="text-brand text-xs">全选</text>
            </view>
            <view
              @tap="toggleAll"
              class="mx-2 active:bg-surface-muted rounded"
            >
              <text class="text-brand text-xs">不选</text>
            </view>
          </view>
        </view>
        <scroll-view :scroll-y="true" class="flex-1 h-[0px]">
          <view class="divide-y divide-line">
            <view
              v-for="(course, index) in courses"
              :key="`${course.courseName}-${index}`"
              class="px-4 py-3 flex items-center"
            >
              <!-- 左侧勾选框 -->
              <view class="mr-3 shrink-0" @tap.stop="toggleCourseSelection(index)">
                <view
                  class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                  :class="course.selected
                    ? 'bg-brand border-brand'
                    : 'bg-surface border-line'"
                >
                  <text
                    v-if="course.selected"
                    class="i-lucide-check text-white text-xs"
                  ></text>
                </view>
              </view>

              <!-- 课程信息 -->
              <view class="flex-1" @tap="toggleCourseSelection(index)">
                <text class="text-fg font-medium text-sm mb-1 line-clamp-1">
                  {{ course.courseName }}
                </text>
                <view class="flex items-center space-x-4 text-xs text-fg-muted">
                  <text>学分: {{ course.credits }}</text>
                  <text>成绩: {{ course.score }}</text>
                </view>
              </view>

              <!-- 右侧操作按钮 -->
              <view class="flex items-center shrink-0">
                <view
                  @tap.stop="editCourse(index)"
                  :class="[
                    'ml-3 p-2 rounded',
                    isLocalDataView ? 'active:bg-surface-muted' : 'opacity-40'
                  ]"
                >
                  <text class="i-lucide-edit text-brand w-5 h-5"></text>
                </view>
                <view
                  @tap.stop="removeCourse(index)"
                  :class="[
                    'ml-2 p-2 rounded',
                    isLocalDataView ? 'active:bg-surface-muted' : 'opacity-40'
                  ]"
                >
                  <text class="i-lucide-trash-2 text-danger w-5 h-5"></text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 空状态 -->
      <view v-else class="bg-surface rounded-xl shadow-sm p-8">
        <view class="text-center">
          <text class="i-lucide-book-open w-12 h-12 text-fg-subtle block mx-auto mb-3"></text>
          <text class="text-fg-muted text-sm block">暂无课程数据</text>
          <text class="text-fg-subtle text-xs mt-1 block">
            {{ isLocalDataView ? '请在上方添加课程信息' : '当前备份中没有可恢复的课程' }}
          </text>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="p-4 shrink-0">
      <text class="text-fg-subtle text-xs text-center block">
        默认仅保存在本地，点击“备份恢复”后才会上传到服务器
      </text>
    </view>

    <!-- 添加课程弹窗 -->
    <view v-if="showAddModal" class="fixed inset-0 bg-overlay flex items-center justify-center z-50" @tap="closeAddModal">
      <view class="bg-surface rounded-xl p-6 w-full max-w-sm mx-4" @tap.stop>
        <view class="text-fg font-medium text-lg mb-4">添加课程</view>

        <!-- 课程名称 -->
        <view class="mb-3">
          <text class="text-fg text-sm mb-2 block">课程名称</text>
          <view class="flex items-center bg-surface-muted rounded-lg px-3 py-2 h-10">
            <input
              v-model="currentCourse.courseName"
              placeholder="请输入课程名称"
              class="flex-1 bg-transparent text-sm outline-none h-full"
            />
          </view>
        </view>

        <!-- 学分和成绩 -->
        <view class="grid grid-cols-2 gap-3 mb-4">
          <view>
            <text class="text-fg text-sm mb-2 block">学分</text>
            <view class="flex items-center bg-surface-muted rounded-lg px-3 py-2 h-10">
              <input
                v-model.number="currentCourse.credits"
                type="digit"
                placeholder="请输入学分"
                class="flex-1 bg-transparent text-sm outline-none h-full"
              />
            </view>
          </view>
          <view>
            <text class="text-fg text-sm mb-2 block">成绩</text>
            <view class="flex items-center bg-surface-muted rounded-lg px-3 py-2 h-10">
              <input
                v-model.number="currentCourse.score"
                type="digit"
                placeholder="请输入成绩"
                class="flex-1 bg-transparent text-sm outline-none h-full"
              />
            </view>
          </view>
        </view>

        <!-- 按钮 -->
        <view class="flex gap-2 pt-2">
          <view
            @tap="closeAddModal"
            class="flex-1 bg-surface-muted text-fg-muted text-center py-3 rounded-lg active:bg-line transition-colors"
          >
            <text class="text-sm">取消</text>
          </view>
          <view
            @tap="addCourse"
            :class="[
              'flex-1 text-center py-3 rounded-lg transition-colors',
              canAdd ? 'bg-brand text-white active:bg-brand' : 'bg-surface-muted text-fg-subtle opacity-50'
            ]"
          >
            <text class="text-sm">添加</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 反向计算弹窗 -->
    <view v-if="showReverseCalcModal" class="fixed inset-0 bg-overlay flex items-center justify-center z-50" @tap="closeReverseCalcModal">
      <view class="bg-surface rounded-xl p-6 w-full max-w-sm mx-4" @tap.stop>
        <view class="text-fg font-medium text-lg mb-4">反向计算</view>

        <!-- 说明文本 -->
        <view class="bg-brand-soft rounded-lg p-3 mb-4">
          <text class="text-brand text-xs leading-relaxed">
            输入目标绩点，计算剩余课程需要达到的平均分数
          </text>
        </view>

        <!-- 目标绩点 -->
        <view class="mb-3">
          <text class="text-fg text-sm mb-2 block">目标绩点（百分制）</text>
          <view class="flex items-center bg-surface-muted rounded-lg px-3 py-2 h-10">
            <input
              v-model.number="reverseCalc.targetGPA"
              type="digit"
              placeholder="例如：85"
              class="flex-1 bg-transparent text-sm outline-none h-full"
            />
          </view>
        </view>

        <!-- 剩余学分 -->
        <view class="mb-4">
          <text class="text-fg text-sm mb-2 block">剩余学分</text>
          <view class="flex items-center bg-surface-muted rounded-lg px-3 py-2 h-10">
            <input
              v-model.number="reverseCalc.remainingCredits"
              type="digit"
              placeholder="例如：20"
              class="flex-1 bg-transparent text-sm outline-none h-full"
            />
          </view>
        </view>

        <!-- 计算结果 -->
        <view v-if="reverseCalcResult" class="bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg p-4 mb-4">
          <view class="text-center">
            <text class="text-fg-muted text-xs block mb-1">所需平均分</text>
            <text class="text-3xl font-bold text-brand block">{{ reverseCalcResult.requiredScore }}</text>
            <text class="text-fg-muted text-xs mt-2 block">各科平均需要达到此分数以上</text>
          </view>
        </view>

        <!-- 按钮 -->
        <view class="flex gap-2 pt-2">
          <view
            @tap="closeReverseCalcModal"
            class="flex-1 bg-surface-muted text-fg-muted text-center py-3 rounded-lg active:bg-line transition-colors"
          >
            <text class="text-sm">关闭</text>
          </view>
          <view
            @tap="calculateReverse"
            :class="[
              'flex-1 text-center py-3 rounded-lg transition-colors',
              canReverseCalc ? 'bg-brand text-white active:bg-brand' : 'bg-surface-muted text-fg-subtle opacity-50'
            ]"
          >
            <text class="text-sm">计算</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 保研均分查询弹窗 -->
    <view v-if="showGraduateModal" class="fixed inset-0 bg-overlay flex items-center justify-center z-50" @tap="closeGraduateModal">
      <view class="bg-surface rounded-xl p-6 w-full max-w-sm mx-4" @tap.stop>
        <view class="text-fg font-medium text-lg mb-3">保研均分查询</view>

        <!-- 说明文本 -->
        <view class="bg-brand-soft rounded-lg p-3 mb-3">
          <text class="text-brand text-xs leading-relaxed">
            {{ graduateYear }}届保研各专业绩点平均及加分平均数据
          </text>
        </view>

        <!-- 表头 -->
        <view class="grid grid-cols-[2fr_1fr_1fr] gap-2 pb-2 border-b border-line mb-1">
          <text class="text-fg-muted text-xs font-medium">专业</text>
          <text class="text-fg-muted text-xs font-medium text-center">平均绩点</text>
          <text class="text-fg-muted text-xs font-medium text-center">平均附加</text>
        </view>

        <!-- 数据列表 -->
        <scroll-view :scroll-y="true" class="-mx-2 mb-3" style="max-height: 300px;">
          <view class="px-2">
            <view
              v-for="(major, index) in graduateMajorData"
              :key="index"
              class="grid grid-cols-[2fr_1fr_1fr] gap-2 py-2 border-b border-line"
            >
              <text class="text-fg text-xs leading-tight">{{ major.name }}</text>
              <text class="text-brand text-xs font-medium text-center">{{ major.gpa }}</text>
              <text class="text-fg-muted text-xs text-center">{{ major.bonus }}</text>
            </view>
          </view>
        </scroll-view>

        <!-- 按钮 -->
        <view>
          <view
            @tap="closeGraduateModal"
            class="w-full bg-surface-muted text-fg-muted text-center py-3 rounded-lg active:bg-line transition-colors"
          >
            <text class="text-sm">关闭</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 备份恢复弹窗 -->
    <view v-if="showBackupModal" class="fixed inset-0 bg-overlay flex items-center justify-center z-50" @tap="closeBackupModal">
      <view class="bg-surface rounded-xl p-6 w-full max-w-sm mx-4" @tap.stop>
        <!-- 头部 -->
        <view class="flex items-center justify-between mb-4">
          <view>
            <text class="text-fg font-semibold text-lg block leading-tight">备份恢复</text>
            <text class="text-fg-subtle text-xs block mt-1">数据存云端，可跨设备同步</text>
          </view>
          <view
            @tap="closeBackupModal"
            class="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center active:bg-line"
          >
            <text class="i-lucide-x text-fg-muted w-4 h-4"></text>
          </view>
        </view>

        <!-- 本地数据区 -->
        <view class="bg-page rounded-xl p-3 mb-4">
          <view class="flex items-center justify-between mb-3">
            <text class="text-fg text-sm font-medium">本地数据</text>
            <text class="text-fg-subtle text-xs">{{ localCoursesSnapshot.length }} 门课程</text>
          </view>
          <view
            @tap="uploadCurrentLocalBackup"
            :class="[
              'rounded-lg py-3 text-center transition-colors',
              canUploadLocalBackup ? 'bg-brand active:opacity-90' : 'bg-surface-muted'
            ]"
          >
            <text
              class="text-sm font-medium"
              :class="canUploadLocalBackup ? 'text-white' : 'text-fg-subtle'"
            >备份到云端</text>
          </view>
          <view
            v-if="!isLocalDataView"
            @tap="switchToLocalData"
            class="mt-2 rounded-lg py-2.5 text-center border border-line active:bg-surface-muted"
          >
            <text class="text-fg text-sm font-medium">切回本地数据</text>
          </view>
        </view>

        <!-- 云端备份区 -->
        <view class="flex items-center justify-between mb-3">
          <view class="flex items-center">
            <text class="text-fg text-sm font-medium">云端备份</text>
            <text class="text-fg-subtle text-xs ml-2">{{ displayedBackupList.length }} / {{ BACKUP_LIMIT }}</text>
          </view>
          <view
            @tap="loadBackupList"
            class="px-2 py-1 rounded-lg active:bg-brand-soft"
          >
            <text class="text-brand text-xs">{{ isBackupLoading ? '加载中' : '刷新' }}</text>
          </view>
        </view>

        <scroll-view :scroll-y="true" class="mb-4" style="max-height: 300px;">
          <view v-if="displayedBackupList.length > 0" class="space-y-3">
            <view
              v-for="backup in displayedBackupList"
              :key="backup.id"
              class="rounded-xl border overflow-hidden"
              :class="isActiveBackup(backup.id) ? 'border-line bg-surface-muted' : 'border-line bg-page'"
            >
              <!-- 信息行 -->
              <view class="px-3 pt-3 pb-2.5">
                <view class="flex items-center justify-between mb-1.5">
                  <text class="text-fg text-sm font-semibold truncate flex-1 mr-2">
                    {{ backup.title || `云端存档 ${backup.id}` }}
                  </text>
                  <text
                    v-if="isActiveBackup(backup.id)"
                    class="shrink-0 text-fg-muted text-xs bg-surface rounded-full px-2 py-0.5"
                  >查看中</text>
                </view>
                <text class="text-fg-muted text-xs block">
                  {{ getBackupCourseCount(backup) }} 门课程 · {{ formatBackupTime(backup.updated_at || backup.created_at) }}
                </text>
              </view>
              <!-- 操作行 -->
              <view class="flex border-t border-line">
                <view
                  @tap="previewBackup(backup.id)"
                  class="flex-1 py-2.5 text-center active:bg-surface-muted"
                >
                  <text class="text-brand text-xs font-medium">预览</text>
                </view>
                <view
                  @tap="overwriteBackup(backup.id)"
                  class="flex-1 py-2.5 text-center border-l border-line active:bg-surface-muted"
                >
                  <text class="text-brand text-xs font-medium">恢复</text>
                </view>
                <view
                  @tap="deleteBackupItem(backup.id)"
                  class="flex-1 py-2.5 text-center border-l border-line active:bg-danger-soft"
                >
                  <text class="text-danger text-xs font-medium">删除</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-else class="bg-page rounded-xl px-4 py-8 text-center">
            <text class="text-fg-muted text-sm block">
              {{ isBackupListLoadFailed ? '备份加载失败' : '暂无云端备份' }}
            </text>
            <text class="text-fg-subtle text-xs block mt-1">
              {{ isBackupListLoadFailed ? '请点击上方刷新重试' : '点击上方按钮备份当前数据' }}
            </text>
          </view>
        </scroll-view>

        <!-- 底部说明 -->
        <text class="text-fg-subtle text-xs text-center block leading-relaxed">
          预览仅临时查看不影响本地，恢复会覆盖当前数据
        </text>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view v-if="showEditModal" class="fixed inset-0 bg-overlay flex items-center justify-center z-50" @tap="closeEditModal">
      <view class="bg-surface rounded-xl p-6 w-full max-w-sm mx-4" @tap.stop>
        <view class="text-fg font-medium text-lg mb-4">编辑课程</view>

        <!-- 课程名称 -->
        <view class="mb-3">
          <text class="text-fg text-sm mb-2 block">课程名称</text>
          <view class="flex items-center bg-surface-muted rounded-lg px-3 py-2 h-10">
            <input
              v-model="editCourseData.courseName"
              placeholder="请输入课程名称"
              class="flex-1 bg-transparent text-sm outline-none h-full"
            />
          </view>
        </view>

        <!-- 学分和成绩 -->
        <view class="grid grid-cols-2 gap-3 mb-4">
          <view>
            <text class="text-fg text-sm mb-2 block">学分</text>
            <view class="flex items-center bg-surface-muted rounded-lg px-3 py-2 h-10">
              <input
                v-model.number="editCourseData.credits"
                type="digit"
                placeholder="请输入学分"
                class="flex-1 bg-transparent text-sm outline-none h-full"
              />
            </view>
          </view>
          <view>
            <text class="text-fg text-sm mb-2 block">成绩</text>
            <view class="flex items-center bg-surface-muted rounded-lg px-3 py-2 h-10">
              <input
                v-model.number="editCourseData.score"
                type="digit"
                placeholder="请输入成绩"
                class="flex-1 bg-transparent text-sm outline-none h-full"
              />
            </view>
          </view>
        </view>

        <!-- 按钮 -->
        <view class="flex gap-2 pt-2">
          <view
            @tap="closeEditModal"
            class="flex-1 bg-surface-muted text-fg-muted text-center py-3 rounded-lg active:bg-line transition-colors"
          >
            <text class="text-sm">取消</text>
          </view>
          <view
            @tap="saveEditCourse"
            :class="[
              'flex-1 text-center py-3 rounded-lg transition-colors',
              canSaveEdit ? 'bg-brand-soft text-brand active:bg-brand-soft' : 'bg-surface-muted text-fg-subtle opacity-50'
            ]"
          >
            <text class="text-sm">保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useThemePage } from '../../composables/useThemePage'
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { configAPI, gpaAPI } from '../../api'

const themeStore = useThemePage()

const STORAGE_KEY = 'gpa_calculator_courses'
const BACKUP_LIMIT = 6

const normalizeCourse = (course = {}) => {
  const credits = parseFloat(course.credits)
  const score = parseFloat(course.score)

  return {
    courseName: String(course.courseName ?? course.name ?? '').trim(),
    credits: Number.isFinite(credits) ? credits : '',
    score: Number.isFinite(score) ? score : '',
    selected: course.selected !== undefined ? Boolean(course.selected) : true
  }
}

const cloneCourseList = (list = []) => {
  if (!Array.isArray(list)) {
    return []
  }

  return list.map(item => normalizeCourse(item))
}

const extractCoursesFromBackupData = (data) => {
  if (Array.isArray(data)) {
    return cloneCourseList(data)
  }

  if (!data || typeof data !== 'object') {
    return []
  }

  if (Array.isArray(data.courses)) {
    return cloneCourseList(data.courses)
  }

  if (Array.isArray(data.list)) {
    return cloneCourseList(data.list)
  }

  if (Array.isArray(data.data)) {
    return cloneCourseList(data.data)
  }

  if (data.data && Array.isArray(data.data.courses)) {
    return cloneCourseList(data.data.courses)
  }

  return []
}

const formatBackupTime = (value) => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const pad = num => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const currentCourse = ref({
  courseName: '',
  credits: '',
  score: ''
})

const courses = ref([])
const localCoursesSnapshot = ref([])

const showEditModal = ref(false)
const editCourseIndex = ref(-1)
const editCourseData = ref({
  courseName: '',
  credits: '',
  score: ''
})

const showAddModal = ref(false)

const showReverseCalcModal = ref(false)
const reverseCalc = ref({
  targetGPA: '',
  remainingCredits: ''
})
const reverseCalcResult = ref(null)

const showGraduateModal = ref(false)
const graduateYear = ref(2026)
const graduateMajorData = ref([])

const showBackupModal = ref(false)
const backupList = ref([])
const isBackupLoading = ref(false)
const isBackupListLoadFailed = ref(false)
const isBackupSubmitting = ref(false)
const activeDataSource = ref('local')
const activeBackupId = ref(null)
const activeBackupTitle = ref('')
const activeBackupUpdatedAt = ref('')

const isLocalDataView = computed(() => activeDataSource.value === 'local')

const displayedBackupList = computed(() => {
  return [...backupList.value]
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, BACKUP_LIMIT)
})

const canUploadLocalBackup = computed(() => {
  return !isBackupSubmitting.value && localCoursesSnapshot.value.length > 0
})

const canAdd = computed(() => {
  return (
    currentCourse.value.courseName.trim() &&
    currentCourse.value.credits &&
    currentCourse.value.credits > 0 &&
    currentCourse.value.score !== '' &&
    currentCourse.value.score >= 0 &&
    currentCourse.value.score <= 100
  )
})

const canSaveEdit = computed(() => {
  return (
    editCourseData.value.courseName.trim() &&
    editCourseData.value.credits &&
    editCourseData.value.credits > 0 &&
    editCourseData.value.score !== '' &&
    editCourseData.value.score >= 0 &&
    editCourseData.value.score <= 100
  )
})

const canReverseCalc = computed(() => {
  return (
    reverseCalc.value.targetGPA &&
    reverseCalc.value.targetGPA > 0 &&
    reverseCalc.value.targetGPA <= 100 &&
    reverseCalc.value.remainingCredits &&
    reverseCalc.value.remainingCredits > 0
  )
})

const gpaResults = computed(() => {
  const selectedCourses = courses.value.filter(course => course.selected !== false)

  if (selectedCourses.length === 0) {
    return {
      percentage: 0,
      fivePoint: 0,
      fourPoint: 0
    }
  }

  let totalCreditsValue = 0
  let totalScoreWeighted = 0
  let totalFivePointWeighted = 0
  let totalFourPointWeighted = 0

  selectedCourses.forEach(course => {
    const credits = parseFloat(course.credits) || 0
    const score = parseFloat(course.score) || 0

    if (credits > 0 && score >= 0 && score <= 100) {
      totalCreditsValue += credits
      totalScoreWeighted += score * credits
      totalFivePointWeighted += convertToFivePoint(score) * credits
      totalFourPointWeighted += convertToFourPoint(score) * credits
    }
  })

  if (totalCreditsValue === 0) {
    return {
      percentage: 0,
      fivePoint: 0,
      fourPoint: 0
    }
  }

  return {
    percentage: totalScoreWeighted / totalCreditsValue,
    fivePoint: totalFivePointWeighted / totalCreditsValue,
    fourPoint: totalFourPointWeighted / totalCreditsValue
  }
})

const totalCredits = computed(() => {
  return courses.value.reduce((sum, course) => {
    const credits = parseFloat(course.credits) || 0
    return sum + credits
  }, 0)
})

const totalSelectedCredits = computed(() => {
  return courses.value
    .filter(course => course.selected !== false)
    .reduce((sum, course) => {
      const credits = parseFloat(course.credits) || 0
      return sum + credits
    }, 0)
})

const convertToFivePoint = (score) => {
  const gpa = (score - 50) / 10
  return Math.max(0, Math.min(5, gpa))
}

const convertToFourPoint = (score) => {
  if (score >= 90) return 4.0
  if (score >= 85) return 3.7
  if (score >= 82) return 3.3
  if (score >= 78) return 3.0
  if (score >= 75) return 2.7
  if (score >= 72) return 2.3
  if (score >= 68) return 2.0
  if (score >= 64) return 1.5
  if (score >= 60) return 1.0
  return 0
}

const calculatePercentageFromCourses = (courseList = []) => {
  let totalCreditsValue = 0
  let totalScoreWeighted = 0

  courseList.forEach(course => {
    const credits = parseFloat(course.credits) || 0
    const score = parseFloat(course.score) || 0

    if (credits > 0 && score >= 0 && score <= 100) {
      totalCreditsValue += credits
      totalScoreWeighted += score * credits
    }
  })

  if (totalCreditsValue <= 0) {
    return 0
  }

  return totalScoreWeighted / totalCreditsValue
}

const buildBackupTitle = () => {
  const courseList = cloneCourseList(localCoursesSnapshot.value)
  const percentage = calculatePercentageFromCourses(courseList).toFixed(2)
  const courseCount = courseList.length
  const totalCreditsValue = courseList.reduce((sum, course) => {
    const credits = parseFloat(course.credits) || 0
    return sum + credits
  }, 0)

  return `${percentage}-${courseCount}门-${totalCreditsValue.toFixed(1)}学分`
}

const buildBackupPayload = () => {
  return {
    title: buildBackupTitle(),
    data: {
      courses: cloneCourseList(localCoursesSnapshot.value),
      exported_at: new Date().toISOString(),
      source: 'weapp'
    }
  }
}

const isActiveBackup = (backupId) => {
  return !isLocalDataView.value && activeBackupId.value === backupId
}

const getBackupCourseCount = (backup) => {
  return extractCoursesFromBackupData(backup?.data).length
}

const persistLocalCourseList = (courseList) => {
  const normalizedCourses = cloneCourseList(courseList)
  Taro.setStorageSync(STORAGE_KEY, normalizedCourses)
  localCoursesSnapshot.value = cloneCourseList(normalizedCourses)
  return normalizedCourses
}

const saveToLocalStorage = () => {
  if (!isLocalDataView.value) {
    return
  }

  try {
    persistLocalCourseList(courses.value)
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}

const loadFromLocalStorage = () => {
  try {
    const saved = Taro.getStorageSync(STORAGE_KEY)
    const normalizedCourses = cloneCourseList(saved)
    localCoursesSnapshot.value = cloneCourseList(normalizedCourses)
    courses.value = cloneCourseList(normalizedCourses)
    activeDataSource.value = 'local'
    activeBackupId.value = null
    activeBackupTitle.value = ''
    activeBackupUpdatedAt.value = ''
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const switchToLocalData = () => {
  if (isLocalDataView.value) {
    return
  }

  courses.value = cloneCourseList(localCoursesSnapshot.value)
  activeDataSource.value = 'local'
  activeBackupId.value = null
  activeBackupTitle.value = ''
  activeBackupUpdatedAt.value = ''
  closeBackupModal()

  Taro.showToast({
    title: '已切回本地数据',
    icon: 'success'
  })
}

const toggleCourseSelection = (index) => {
  if (courses.value[index]) {
    courses.value[index].selected = !courses.value[index].selected
    saveToLocalStorage()
  }
}

const selectAll = () => {
  courses.value.forEach(course => {
    course.selected = true
  })
  saveToLocalStorage()
}

const toggleAll = () => {
  courses.value.forEach(course => {
    course.selected = !course.selected
  })
  saveToLocalStorage()
}

const openAddModal = () => {
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  currentCourse.value = {
    courseName: '',
    credits: '',
    score: ''
  }
}

const addCourse = () => {
  if (!canAdd.value) {
    Taro.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  courses.value.unshift(normalizeCourse({
    courseName: currentCourse.value.courseName,
    credits: currentCourse.value.credits,
    score: currentCourse.value.score,
    selected: true
  }))

  saveToLocalStorage()
  closeAddModal()
}

const openReverseCalcModal = () => {
  showReverseCalcModal.value = true
  reverseCalcResult.value = null
}

const closeReverseCalcModal = () => {
  showReverseCalcModal.value = false
  reverseCalc.value = {
    targetGPA: '',
    remainingCredits: ''
  }
  reverseCalcResult.value = null
}

const calculateReverse = () => {
  if (!canReverseCalc.value) {
    Taro.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  const selectedCourses = courses.value.filter(course => course.selected !== false)
  let currentTotalCredits = 0
  let currentWeightedScore = 0

  selectedCourses.forEach(course => {
    const credits = parseFloat(course.credits) || 0
    const score = parseFloat(course.score) || 0

    if (credits > 0 && score >= 0 && score <= 100) {
      currentTotalCredits += credits
      currentWeightedScore += score * credits
    }
  })

  const targetScore = parseFloat(reverseCalc.value.targetGPA)
  const remainingCredits = parseFloat(reverseCalc.value.remainingCredits)
  const totalFutureCredits = currentTotalCredits + remainingCredits
  const requiredScore = (targetScore * totalFutureCredits - currentWeightedScore) / remainingCredits

  if (requiredScore > 100) {
    Taro.showToast({
      title: '目标过高无法达到',
      icon: 'none',
      duration: 1500
    })
    return
  }

  if (requiredScore < 0) {
    Taro.showToast({
      title: '当前成绩已超过目标',
      icon: 'success',
      duration: 1500
    })
    reverseCalcResult.value = {
      requiredScore: '已达标',
      requiredGPA: '0'
    }
    return
  }

  reverseCalcResult.value = {
    requiredScore: Math.round(requiredScore),
    requiredGPA: requiredScore.toFixed(1)
  }
}

const openGraduateModal = () => {
  showGraduateModal.value = true
}

const closeGraduateModal = () => {
  showGraduateModal.value = false
}

const openBackupModal = async () => {
  showBackupModal.value = true
  await loadBackupList()
}

const closeBackupModal = () => {
  showBackupModal.value = false
}

const loadBackupList = async () => {
  if (isBackupLoading.value) {
    return
  }

  isBackupLoading.value = true
  isBackupListLoadFailed.value = false
  try {
    const response = await gpaAPI.getBackupList()
    backupList.value = Array.isArray(response) ? response : []

    if (!isLocalDataView.value && activeBackupId.value) {
      const activeBackup = backupList.value.find(item => item.id === activeBackupId.value)
      activeBackupTitle.value = activeBackup?.title || activeBackupTitle.value || `云端存档 ${activeBackupId.value}`
    }
  } catch (error) {
    console.error('加载绩点备份失败:', error)
    backupList.value = []
    isBackupListLoadFailed.value = true
  } finally {
    isBackupLoading.value = false
  }
}

const uploadCurrentLocalBackup = async () => {
  if (!canUploadLocalBackup.value) {
    Taro.showToast({
      title: '本地暂无可上传数据',
      icon: 'none'
    })
    return
  }

  isBackupSubmitting.value = true
  Taro.showLoading({
    title: '上传中...',
    mask: true
  })

  try {
    await gpaAPI.createBackup(buildBackupPayload())
    await loadBackupList()
    Taro.showToast({
      title: '备份上传成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('上传绩点备份失败:', error)
  } finally {
    isBackupSubmitting.value = false
    Taro.hideLoading()
  }
}

const previewBackup = async (backupId) => {
  if (!backupId) {
    return
  }

  await restoreBackupItem(backupId, { overwriteLocal: false })
}

const overwriteBackup = async (backupId) => {
  if (!backupId) {
    return
  }

  try {
    const { confirm } = await Taro.showModal({
      title: '恢复到本地',
      content: '将用这份备份覆盖当前本地数据，覆盖后不可撤销，确定继续吗？',
      confirmText: '覆盖',
      confirmColor: '#ef4444'
    })

    if (!confirm) {
      return
    }
  } catch (error) {
    console.error('确认恢复备份失败:', error)
    return
  }

  await restoreBackupItem(backupId, { overwriteLocal: true })
}

const deleteBackupItem = async (backupId) => {
  if (!backupId || isBackupLoading.value) {
    return
  }

  try {
    const { confirm } = await Taro.showModal({
      title: '删除备份',
      content: '删除后不可恢复，确定删除这份备份吗？',
      confirmText: '删除',
      confirmColor: '#ef4444'
    })

    if (!confirm) {
      return
    }
  } catch (error) {
    console.error('确认删除备份失败:', error)
    return
  }

  isBackupLoading.value = true
  Taro.showLoading({
    title: '删除中...',
    mask: true
  })

  try {
    await gpaAPI.deleteBackup(backupId)
    backupList.value = backupList.value.filter(item => item.id !== backupId)

    if (!isLocalDataView.value && activeBackupId.value === backupId) {
      courses.value = cloneCourseList(localCoursesSnapshot.value)
      activeDataSource.value = 'local'
      activeBackupId.value = null
      activeBackupTitle.value = ''
      activeBackupUpdatedAt.value = ''
    }

    Taro.showToast({
      title: '备份已删除',
      icon: 'success'
    })
  } catch (error) {
    console.error('删除绩点备份失败:', error)
  } finally {
    isBackupLoading.value = false
    Taro.hideLoading()
  }
}

const restoreBackupItem = async (backupId, { overwriteLocal = false } = {}) => {
  if (!backupId || isBackupLoading.value) {
    return
  }

  isBackupLoading.value = true
  Taro.showLoading({
    title: '恢复中...',
    mask: true
  })

  try {
    const backup = await gpaAPI.getBackupDetail(backupId)
    const backupCourses = extractCoursesFromBackupData(backup?.data)
    const backupUpdatedAt = formatBackupTime(backup?.updated_at || backup?.created_at)
    const backupTitle = backup?.title || backupList.value.find(item => item.id === backupId)?.title || `云端存档 ${backupId}`

    if (overwriteLocal) {
      const normalizedCourses = persistLocalCourseList(backupCourses)
      courses.value = cloneCourseList(normalizedCourses)
      activeDataSource.value = 'local'
      activeBackupId.value = null
      activeBackupTitle.value = ''
      activeBackupUpdatedAt.value = ''
    } else {
      courses.value = backupCourses
      activeDataSource.value = 'backup'
      activeBackupId.value = backup?.id ?? backupId
      activeBackupTitle.value = backupTitle
      activeBackupUpdatedAt.value = backupUpdatedAt
    }

    closeBackupModal()

    Taro.showToast({
      title: overwriteLocal ? '已覆盖本地数据' : '已切换到备份',
      icon: 'success'
    })
  } catch (error) {
    console.error('恢复绩点备份失败:', error)
  } finally {
    isBackupLoading.value = false
    Taro.hideLoading()
  }
}

const editCourse = (index) => {
  if (!isLocalDataView.value) {
    return
  }

  editCourseIndex.value = index
  editCourseData.value = {
    courseName: courses.value[index].courseName,
    credits: courses.value[index].credits,
    score: courses.value[index].score
  }
  showEditModal.value = true
}

const saveEditCourse = () => {
  if (!canSaveEdit.value) {
    Taro.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  const originalSelected = courses.value[editCourseIndex.value]?.selected !== undefined
    ? courses.value[editCourseIndex.value].selected
    : true

  courses.value[editCourseIndex.value] = normalizeCourse({
    courseName: editCourseData.value.courseName,
    credits: editCourseData.value.credits,
    score: editCourseData.value.score,
    selected: originalSelected
  })

  saveToLocalStorage()
  closeEditModal()
}

const closeEditModal = () => {
  showEditModal.value = false
  editCourseIndex.value = -1
  editCourseData.value = {
    courseName: '',
    credits: '',
    score: ''
  }
}

const removeCourse = (index) => {
  if (!isLocalDataView.value) {
    return
  }

  Taro.showModal({
    title: '提示',
    content: '确定要删除这条课程记录吗？',
    success: (res) => {
      if (res.confirm) {
        courses.value.splice(index, 1)
        saveToLocalStorage()
      }
    }
  })
}

const loadGraduateData = async () => {
  try {
    const response = await configAPI.getConfig('bygpa')
    if (response && response.value) {
      const configData = JSON.parse(response.value)
      if (configData.year) {
        graduateYear.value = configData.year
      }
      if (configData.data && Array.isArray(configData.data)) {
        graduateMajorData.value = configData.data
      }
    }
  } catch (error) {
    console.error('加载保研专业数据失败:', error)
  }
}

onMounted(() => {
  loadFromLocalStorage()
  loadGraduateData()
})

Taro.useShareAppMessage((res) => {
  if (res.from === 'button') {
  }
  return {
    title: '绩点计算 - 江理一起来学',
    path: '/pages/gpa-calculator/index',
  }
})

Taro.useShareTimeline((res) => {
  if (res.from === 'button') {
  }
  return {
    title: '绩点计算 - 江理一起来学',
    path: '/pages/gpa-calculator/index',
  }
})
</script>

<style scoped></style>
