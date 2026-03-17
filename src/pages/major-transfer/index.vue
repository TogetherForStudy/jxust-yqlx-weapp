<template>
  <scroll-view class="h-screen bg-slate-50" :scroll-y="true">
    <view class="px-4 pt-3 pb-8">
      <view class="rounded-2xl bg-white px-2 shadow-sm">
        <view class="flex">
          <view
            v-for="tab in topTabs"
            :key="tab.key"
            @tap="activeSection = tab.key"
            :class="[
              'flex-1 border-b-2 px-1 py-3 text-center text-sm transition-colors duration-200',
              activeSection === tab.key ? 'border-orange-500 text-orange-600 font-semibold' : 'border-transparent text-slate-500'
            ]"
          >
            {{ tab.label }}
          </view>
        </view>
      </view>

      <view v-if="pageLoading" class="mt-4 rounded-2xl bg-white py-14 text-center shadow-sm">
        <view class="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-orange-400 border-t-transparent animate-spin"></view>
        <text class="text-sm text-slate-500">正在加载转专业数据...</text>
      </view>

      <template v-else>
        <view v-if="activeSection === 'notice'" class="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <view class="border-b border-slate-200 pb-3">
            <view class="flex items-center justify-between">
              <text class="text-base font-semibold text-slate-900">通知文件</text>
            </view>
            <text class="mt-1 block text-xs text-slate-500">按年份和学期查看，点击通知展开附件列表</text>
          </view>

          <view class="flex border-b border-slate-200">
            <view
              v-for="tab in yearTabs"
              :key="tab.key"
              @tap="noticeYearTab = tab.key"
              :class="[
                'mr-6 border-b-2 py-3 text-sm',
                noticeYearTab === tab.key ? 'border-orange-500 text-orange-600 font-semibold' : 'border-transparent text-slate-500'
              ]"
            >
              {{ tab.label }}
            </view>
          </view>

          <view v-if="sectionErrors.notice" class="border-b border-slate-200 py-4 text-sm text-rose-500">
            {{ sectionErrors.notice }}
          </view>

          <view v-else>
            <view v-for="season in currentNoticeSeasons" :key="season.key" class="border-b border-slate-200">
              <view class="flex items-center justify-between py-3">
                <text class="text-sm font-semibold text-slate-800" :user-select="true">{{ season.label }}</text>
                <text class="text-xs text-slate-400" :user-select="true">{{ season.items.length }} 条</text>
              </view>

              <view class="border-t border-slate-100">
                <view v-if="season.items.length === 0" class="border-t border-slate-100 py-3 text-sm text-slate-400">
                  暂无通知
                </view>

                <view v-else>
                  <view
                    v-for="(notice, noticeIndex) in season.items"
                    :key="`${noticeYearTab}-${season.key}-${noticeIndex}`"
                    class="border-t border-slate-100"
                  >
                    <view class="flex items-start gap-3 py-3" @tap="toggleNotice(`${noticeYearTab}-${season.key}-${noticeIndex}`)">
                      <text class="i-lucide-file-text mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" :user-select="true"></text>
                      <view class="min-w-0 flex-1">
                        <view class="flex items-center justify-between gap-3">
                          <text class="block min-w-0 flex-1 truncate text-sm leading-6 text-slate-800" :user-select="true">{{ notice.name || '未命名通知' }}</text>
                          <text :class="Number(notice.status) === 1 ? 'flex-shrink-0 text-xs text-emerald-600' : 'flex-shrink-0 text-xs text-slate-400'" :user-select="true">
                            {{ Number(notice.status) === 1 ? '已发布' : '未发布' }}
                          </text>
                        </view>
                        <view class="mt-1 flex items-center justify-between text-xs text-slate-400">
                          <text :user-select="true">{{ notice.publishDate || '发布时间待定' }}</text>
                          <text
                            :class="[
                              'i-lucide-chevron-down h-4 w-4 transform transition-transform duration-200',
                              isNoticeExpanded(`${noticeYearTab}-${season.key}-${noticeIndex}`) ? 'rotate-180 text-orange-500' : 'rotate-0'
                            ]"
                            :user-select="true"
                          ></text>
                        </view>
                      </view>
                    </view>

                    <view
                      v-if="isNoticeExpanded(`${noticeYearTab}-${season.key}-${noticeIndex}`)"
                      class="border-t border-slate-100 pb-3 pl-7 pt-2"
                    >
                      <view class="space-y-2">
                        <view
                          v-for="(attachment, attachmentIndex) in normalizeAttachments(notice.attachments)"
                          :key="`${noticeYearTab}-${season.key}-${noticeIndex}-${attachmentIndex}`"
                          class="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <text class="i-lucide-paperclip h-3.5 w-3.5 flex-shrink-0 text-slate-400" :user-select="true"></text>
                          <text class="min-w-0 flex-1 truncate" :user-select="true">{{ attachment.name }}</text>
                        </view>
                      </view>
                      <view class="mt-2 flex items-center justify-between text-sm">
                        <text class="text-slate-500" :user-select="true">附件 {{ getNoticeAttachmentCount(notice.attachments) }} 个</text>
                        <text
                          :class="Number(notice.status) === 1 ? 'text-orange-600' : 'text-slate-400'"
                          @tap.stop="handleAttachmentTap(notice)"
                          :user-select="true"
                        >
                          {{ Number(notice.status) === 1 ? '复制下载链接' : '暂未发布' }}
                        </text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view class="pt-4">
            <view class="border-b border-slate-200 pb-3">
              <text class="text-base font-semibold text-slate-900">情况说明</text>
              <text class="mt-1 block text-xs text-slate-500">常规机会、特殊情形和禁止转专业情况</text>
            </view>

            <view class="flex border-b border-slate-200">
              <view
                v-for="tab in explainTabs"
                :key="tab.key"
                @tap="explainTab = tab.key"
                :class="[
                  'mr-6 border-b-2 py-3 text-sm',
                  explainTab === tab.key ? 'border-orange-500 text-orange-600 font-semibold' : 'border-transparent text-slate-500'
                ]"
              >
                {{ tab.label }}
              </view>
            </view>

            <view v-if="sectionErrors.explain" class="border-b border-slate-200 py-4 text-sm text-rose-500">
              {{ sectionErrors.explain }}
            </view>

            <view v-else>
              <view v-if="explainTab === 'regular'" class="border-b border-slate-200 py-3">
                <view class="mb-2 flex items-center gap-2">
                  <view class="h-2 w-2 rounded-full bg-orange-400"></view>
                  <text class="text-sm font-semibold text-slate-800">常规机会</text>
                </view>
                <view v-if="majorExplain.regularChances.length === 0" class="py-2 text-sm text-slate-400">暂无说明</view>
                <view v-else>
                  <view
                    v-for="(chance, index) in majorExplain.regularChances"
                    :key="`${chance.name}-${index}`"
                    class="border-t border-slate-100 py-3 first:border-t-0 first:pt-0"
                  >
                    <view class="flex items-center justify-between gap-3">
                      <text class="text-sm font-semibold text-slate-800" :user-select="true">{{ chance.name || `机会 ${index + 1}` }}</text>
                      <text class="text-xs text-orange-600" :user-select="true">常规批次</text>
                    </view>
                    <view class="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs leading-5 text-slate-600">
                      <text :user-select="true">咨询时间：{{ chance.consultTime || '未说明' }}</text>
                      <text :user-select="true">申请时间：{{ chance.applyTime || '未说明' }}</text>
                      <text :user-select="true">考核时间：{{ chance.assessmentTime || '未说明' }}</text>
                      <text :user-select="true">转入时间：{{ chance.transferTime || '未说明' }}</text>
                      <text v-if="chance.approvalTime" class="col-span-2" :user-select="true">审批时间：{{ chance.approvalTime }}</text>
                    </view>
                    <text class="mt-2 block text-xs leading-6 text-slate-500" :user-select="true">{{ chance.principle || '暂无原则说明' }}</text>
                  </view>
                </view>
              </view>

              <view v-else-if="explainTab === 'special'" class="border-b border-slate-200 py-3">
                <view class="mb-2 flex items-center gap-2">
                  <view class="h-2 w-2 rounded-full bg-sky-400"></view>
                  <text class="text-sm font-semibold text-slate-800" :user-select="true">特殊情况</text>
                </view>
                <view v-if="majorExplain.specialCases.length === 0" class="py-2 text-sm text-slate-400">暂无特殊情况说明</view>
                <view v-else>
                  <view
                    v-for="(item, index) in majorExplain.specialCases"
                    :key="`${item.title}-${index}`"
                    class="border-t border-slate-100 py-3 first:border-t-0 first:pt-0"
                  >
                      <text class="text-sm font-semibold text-slate-800" :user-select="true">{{ item.title || `特殊情况 ${index + 1}` }}</text>
                      <text class="mt-1 block text-sm leading-6 text-slate-600" :user-select="true">{{ item.content || '暂无说明' }}</text>
                  </view>
                </view>
              </view>

              <view v-else class="border-b border-slate-200 py-3">
                <view class="mb-2 flex items-center gap-2">
                  <view class="h-2 w-2 rounded-full bg-rose-400"></view>
                    <text class="text-sm font-semibold text-slate-800" :user-select="true">禁止转专业情形</text>
                </view>
                <view v-if="majorExplain.prohibited.length === 0" class="py-2 text-sm text-slate-400">暂无限制说明</view>
                <view v-else>
                  <view
                    v-for="(item, index) in majorExplain.prohibited"
                    :key="`${index}-${item}`"
                    class="flex items-start gap-2 border-t border-slate-100 py-2.5 first:border-t-0 first:pt-0"
                  >
                    <view class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400"></view>
                      <text class="text-sm leading-6 text-slate-700" :user-select="true">{{ item }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-else-if="activeSection === 'major'" class="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <view class="border-b border-slate-200 pb-3">
            <text class="text-base font-semibold text-slate-900" :user-select="true">学院专业</text>
            <text class="mt-1 block text-xs text-slate-500" :user-select="true">查看可选择的学院、专业</text>
          </view>

          <view class="flex border-b border-slate-200">
            <view
              v-for="tab in yearTabs"
              :key="tab.key"
              @tap="majorListTab = tab.key"
              :class="[
                'mr-6 border-b-2 py-3 text-sm',
                majorListTab === tab.key ? 'border-orange-500 text-orange-600 font-semibold' : 'border-transparent text-slate-500'
              ]"
            >
              {{ tab.label }}
            </view>
          </view>

          <view v-if="sectionErrors.majorList" class="border-b border-slate-200 py-4 text-sm text-rose-500">
            {{ sectionErrors.majorList }}
          </view>

          <view v-else-if="currentMajorGroups.length === 0" class="border-b border-slate-200 py-8 text-center text-sm text-slate-400">
            无
          </view>

          <view v-else class="overflow-x-auto border-b border-slate-200">
            <view class="grid grid-cols-[1fr,1.1fr,1.2fr] gap-3 border-b border-slate-200 py-3 text-xs text-slate-400">
              <text :user-select="true">学院</text>
              <text :user-select="true">专业</text>
              <text :user-select="true">备注</text>
            </view>
            <view
              v-for="(group, groupIndex) in currentMajorGroups"
              :key="`${group.college}-${groupIndex}`"
              class="grid grid-cols-[1fr,2.3fr] gap-3 border-t border-slate-100 text-sm leading-6"
            >
              <view class="flex items-center border-r border-slate-100 py-3 pr-3 text-slate-800">
                <text :user-select="true">{{ group.college }}</text>
              </view>
              <view>
                <view
                  v-for="(row, rowIndex) in group.rows"
                  :key="`${group.college}-${row.name}-${rowIndex}`"
                  class="grid grid-cols-[1.1fr,1.2fr] gap-3 py-3"
                  :class="rowIndex > 0 ? 'border-t border-slate-100' : ''"
                >
                  <text class="text-slate-800" :user-select="true">{{ row.name }}</text>
                  <text class="whitespace-pre-line text-slate-500" :user-select="true">{{ row.note || '-' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-else-if="activeSection === 'data'" class="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <view class="border-b border-slate-200 pb-3">
            <view class="flex items-start justify-between gap-3">
              <view>
                <text class="text-base font-semibold text-slate-900">数据分析</text>
                <text class="mt-1 block text-xs text-slate-500">桑基图展示学院流向，点击可高亮</text>
              </view>
              <text class="text-xs text-orange-600">{{ majorDataSourceYear }}级数据</text>
            </view>
            <view class="mt-2 flex gap-6 text-sm">
              <text class="text-slate-600">总人数 <text class="font-semibold text-slate-900">{{ totalFlowCount }}</text></text>
              <text class="text-slate-600">流向数 <text class="font-semibold text-slate-900">{{ currentFlowData.length }}</text></text>
            </view>
          </view>

          <view class="flex border-b border-slate-200">
            <view
              v-for="tab in dataTabs"
              :key="tab.key"
              @tap="switchDataMode(tab.key)"
              :class="[
                'mr-6 border-b-2 py-3 text-sm',
                dataTab === tab.key ? 'border-orange-500 text-orange-600 font-semibold' : 'border-transparent text-slate-500'
              ]"
            >
              {{ tab.label }}
            </view>
          </view>

          <view v-if="sectionErrors.majorData" class="border-b border-slate-200 py-4 text-sm text-rose-500">
            {{ sectionErrors.majorData }}
          </view>

          <view v-else-if="currentFlowData.length === 0" class="border-b border-slate-200 py-8 text-center text-sm text-slate-400">
            暂无数据
          </view>

          <view v-else>
            <view class="border-b border-slate-200 py-3">
              <view class="mb-2 flex items-center justify-between">
                <text class="text-sm font-semibold text-slate-800">学院流向桑基图</text>
                <text class="text-xs text-slate-400">左侧来源，右侧目标</text>
              </view>
              <view id="major-sankey-wrapper" class="overflow-hidden border border-slate-100">
                <canvas
                  canvas-id="major-sankey-canvas"
                  id="major-sankey-canvas"
                  class="w-full"
                  :style="{ width: `${chartWidth}px`, height: `${chartHeight}px` }"
                  :width="chartWidth"
                  :height="chartHeight"
                  @tap="handleChartTap"
                />
              </view>
            </view>

            <view class="border-b border-slate-200 py-3">
              <text class="text-sm font-semibold text-orange-600" :user-select="true">{{ selectionTitle }}</text>
              <text class="mt-1 block text-sm leading-6 text-slate-600" :user-select="true">{{ selectionDescription }}</text>
            </view>

            <view class="border-b border-slate-200 py-3">
              <view class="mb-2 flex items-center justify-between">
                <text class="text-sm font-semibold text-slate-800">主要流向</text>
                <text class="text-xs text-slate-400">点击高亮</text>
              </view>
              <view>
                <view
                  v-for="(flow, index) in topFlows"
                  :key="`${flow.source}-${flow.target}-${index}`"
                  @tap="selectFlow(flow)"
                  :class="[
                    'flex items-center justify-between border-t border-slate-100 py-2 text-sm first:border-t-0',
                    isSelectedFlow(flow) ? 'text-orange-600' : 'text-slate-600'
                  ]"
                >
                  <text>{{ flow.source }} → {{ flow.target }}</text>
                  <text>{{ flow.count }}人</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <view class="border-b border-slate-200 pb-3">
            <view class="flex items-center justify-between">
              <text class="text-base font-semibold text-slate-900">常见问题</text>
              <text class="text-xs text-orange-600">{{ majorQA.length }} 问</text>
            </view>
            <text class="mt-1 block text-xs text-slate-500">点击问题展开答案</text>
          </view>

          <view v-if="sectionErrors.majorQA" class="border-b border-slate-200 py-4 text-sm text-rose-500">
            {{ sectionErrors.majorQA }}
          </view>

          <view v-else-if="majorQA.length === 0" class="border-b border-slate-200 py-8 text-center text-sm text-slate-400">
            暂无常见问题
          </view>

          <view v-else>
            <view
              v-for="item in majorQA"
              :key="item.id || item.title"
              class="border-b border-slate-200"
            >
              <view class="flex items-center gap-3 py-3" @tap="toggleQA(item.id)">
                <text class="w-6 flex-shrink-0 text-center text-sm font-semibold text-orange-600" :user-select="true">{{ item.id || '?' }}</text>
                <text class="min-w-0 flex-1 text-sm leading-6 text-slate-800" :user-select="true">{{ item.title || '未命名问题' }}</text>
                <text
                  :class="[
                    'i-lucide-chevron-down h-4 w-4 flex-shrink-0 transform text-slate-400 transition-transform duration-200',
                    activeQuestionId === item.id ? 'rotate-180 text-orange-500' : 'rotate-0'
                  ]"
                  :user-select="true"
                ></text>
              </view>
              <view v-if="activeQuestionId === item.id" class="pb-3 pl-9 text-sm leading-7 text-slate-600">
                <text class="whitespace-pre-line" :user-select="true">{{ item.content || '内容待补充' }}</text>
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import Taro from '@tarojs/taro'
import { configAPI } from '../../api/index'

const topTabs = [
  { key: 'notice', label: '通知文件' },
  { key: 'major', label: '学院专业' },
  { key: 'data', label: '数据分析' },
  { key: 'qa', label: '常见问题' },
]

const yearTabs = [
  { key: 'lastYear', label: '去年' },
  { key: 'thisYear', label: '今年' },
]

const explainTabs = [
  { key: 'regular', label: '常规机会' },
  { key: 'special', label: '特殊情况' },
  { key: 'prohibited', label: '禁止情形' },
]

const dataTabs = [
  { key: 'apply', label: '申请情况' },
  { key: 'accept', label: '拟转入情况' },
]

const seasonLabels = {
  spring: '春季通知',
  autumn: '秋季通知',
}

const nodePalette = [
  '#f97316',
  '#0ea5e9',
  '#14b8a6',
  '#8b5cf6',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ec4899',
  '#6366f1',
  '#84cc16',
  '#06b6d4',
]

const pageLoading = ref(true)
const activeSection = ref('notice')
const noticeYearTab = ref('thisYear')
const majorListTab = ref('thisYear')
const dataTab = ref('apply')
const explainTab = ref('regular')
const activeQuestionId = ref(null)
const expandedNoticeMap = ref({})

const sectionErrors = ref({
  notice: '',
  explain: '',
  majorList: '',
  majorData: '',
  majorQA: '',
})

const majorNotice = ref({
  lastYear: { spring: [], autumn: [] },
  thisYear: { spring: [], autumn: [] },
})

const majorExplain = ref({
  regularChances: [],
  specialCases: [],
  prohibited: [],
})

const majorList = ref({
  lastYear: [],
  thisYear: [],
})

const majorData = ref({
  year: '',
  apply: [],
  accept: [],
})

const majorQA = ref([])

const chartWidth = ref(320)
const chartHeight = ref(620)
const chartRenderState = ref({ nodes: [], links: [] })
const selectedChartItem = ref(null)

const showToast = (title) => {
  Taro.showToast({
    title,
    icon: 'none',
    duration: 2000,
  })
}

const parseConfigValue = (payload, fallback) => {
  if (payload === null || payload === undefined || payload === '') {
    return fallback
  }

  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload)
    } catch (error) {
      console.warn('parseConfigValue error', error)
      return fallback
    }
  }

  return payload
}

const normalizeNoticeData = (value) => ({
  lastYear: {
    spring: Array.isArray(value?.lastYear?.spring) ? value.lastYear.spring : [],
    autumn: Array.isArray(value?.lastYear?.autumn) ? value.lastYear.autumn : [],
  },
  thisYear: {
    spring: Array.isArray(value?.thisYear?.spring) ? value.thisYear.spring : [],
    autumn: Array.isArray(value?.thisYear?.autumn) ? value.thisYear.autumn : [],
  },
})

const normalizeExplainData = (value) => ({
  regularChances: Array.isArray(value?.regularChances) ? value.regularChances : [],
  specialCases: Array.isArray(value?.specialCases) ? value.specialCases : [],
  prohibited: Array.isArray(value?.prohibited) ? value.prohibited : [],
})

const normalizeMajorList = (value) => ({
  lastYear: Array.isArray(value?.lastYear) ? value.lastYear : [],
  thisYear: Array.isArray(value?.thisYear) ? value.thisYear : [],
})

const normalizeFlowList = (value) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item) => item?.source && item?.target && Number(item?.count) > 0)
    .map((item) => ({
      source: item.source,
      target: item.target,
      count: Number(item.count),
    }))
}

const normalizeMajorData = (value) => ({
  year: value?.year || value?.sourceYear || value?.dataYear || value?.source_year || '',
  apply: normalizeFlowList(value?.apply),
  accept: normalizeFlowList(value?.accept),
})

const normalizeMajorQA = (value) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item, index) => ({
    id: item?.id ?? index + 1,
    title: item?.title || `问题 ${index + 1}`,
    content: item?.content || '',
  }))
}

const normalizeAttachments = (attachments) => {
  if (!Array.isArray(attachments)) {
    return []
  }

  return attachments.map((item) => {
    if (typeof item === 'string') {
      return {
        name: item,
        url: '',
      }
    }

    return {
      name: item?.name || item?.title || item?.url || '未命名附件',
      url: item?.url || item?.link || item?.path || item?.downloadUrl || '',
    }
  })
}

const noticeGroups = computed(() => yearTabs.map((tab) => {
  const value = majorNotice.value[tab.key] || { spring: [], autumn: [] }
  const seasons = ['spring', 'autumn'].map((seasonKey) => ({
    key: seasonKey,
    label: seasonLabels[seasonKey],
    items: Array.isArray(value[seasonKey]) ? value[seasonKey] : [],
  }))

  return {
    key: tab.key,
    label: tab.label,
    seasons,
    total: seasons.reduce((sum, item) => sum + item.items.length, 0),
  }
}))

const publishedNoticeCount = computed(() => noticeGroups.value.reduce(
  (sum, group) => sum + group.seasons.reduce(
    (seasonSum, season) => seasonSum + season.items.filter((item) => Number(item.status) === 1).length,
    0,
  ),
  0,
))

const currentMajorList = computed(() => majorList.value[majorListTab.value] || [])
const currentMajorGroups = computed(() => currentMajorList.value.map((college) => ({
  college: college?.college || '未命名学院',
  rows: Array.isArray(college?.majors) && college.majors.length > 0
    ? college.majors.map((major) => ({
        name: major?.name || '未命名专业',
        note: major?.note || '',
      }))
    : [{ name: '-', note: '无' }],
})))
const currentFlowData = computed(() => majorData.value[dataTab.value] || [])
const totalFlowCount = computed(() => currentFlowData.value.reduce((sum, item) => sum + Number(item.count || 0), 0))
const currentNoticeLabel = computed(() => yearTabs.find((item) => item.key === noticeYearTab.value)?.label || '')
const currentNoticeSeasons = computed(() => {
  const value = majorNotice.value[noticeYearTab.value] || { spring: [], autumn: [] }
  return ['spring', 'autumn'].map((seasonKey) => ({
    key: seasonKey,
    label: seasonLabels[seasonKey],
    items: Array.isArray(value[seasonKey]) ? value[seasonKey] : [],
  }))
})

const inferMajorDataYear = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  return month < 7 ? `${now.getFullYear() - 1}` : `${now.getFullYear()}`
}

const majorDataSourceYear = computed(() => majorData.value.year || inferMajorDataYear())

const topFlows = computed(() => [...currentFlowData.value]
  .sort((left, right) => right.count - left.count)
  .slice(0, 8))

const selectionTitle = computed(() => {
  if (!selectedChartItem.value) {
    return dataTab.value === 'apply' ? '申请总览' : '拟转入总览'
  }

  if (selectedChartItem.value.type === 'node') {
    return `${selectedChartItem.value.name}`
  }

  return `${selectedChartItem.value.source} → ${selectedChartItem.value.target}`
})

const selectionDescription = computed(() => {
  if (!selectedChartItem.value) {
    return dataTab.value === 'apply'
      ? `当前共记录 ${totalFlowCount.value} 人次申请流向，点击图中的学院节点或流向连线可查看具体人数。`
      : `当前共记录 ${totalFlowCount.value} 人次拟转入流向，点击图中的学院节点或流向连线可查看具体人数。`
  }

  if (selectedChartItem.value.type === 'node') {
    const direction = selectedChartItem.value.side === 'source' ? '流出' : '流入'
    return `${selectedChartItem.value.name} 在当前视图中的${direction}总人数为 ${selectedChartItem.value.total} 人，涉及 ${selectedChartItem.value.relatedCount} 条流向。`
  }

  return `${selectedChartItem.value.source} 转向 ${selectedChartItem.value.target} 的人数为 ${selectedChartItem.value.count} 人。`
})

const isNoticeExpanded = (key) => Boolean(expandedNoticeMap.value[key])

const toggleNotice = (key) => {
  expandedNoticeMap.value = {
    ...expandedNoticeMap.value,
    [key]: !expandedNoticeMap.value[key],
  }
}

const toggleQA = (id) => {
  activeQuestionId.value = activeQuestionId.value === id ? null : id
}

const getNoticeAttachmentCount = (attachments) => normalizeAttachments(attachments).length

const handleAttachmentTap = async (notice) => {
  if (Number(notice?.status) !== 1) {
    showToast('暂未发布')
    return
  }

  const copyText = typeof notice?.url === 'string' ? notice.url.trim() : ''
  if (!copyText) {
    showToast('未配置')
    return
  }

  try {
    await Taro.setClipboardData({ data: copyText })
    Taro.showToast({
      title: '网址已复制成功',
      icon: 'success',
      duration: 2000,
    })
  } catch (error) {
    console.error('copy attachment url error', error)
    showToast('复制失败')
  }
}

const switchDataMode = (mode) => {
  if (dataTab.value === mode) {
    return
  }

  dataTab.value = mode
  selectedChartItem.value = null
}

const isSelectedFlow = (flow) => selectedChartItem.value?.type === 'link'
  && selectedChartItem.value.source === flow.source
  && selectedChartItem.value.target === flow.target
  && Number(selectedChartItem.value.count) === Number(flow.count)

const selectFlow = (flow) => {
  selectedChartItem.value = {
    type: 'link',
    source: flow.source,
    target: flow.target,
    count: Number(flow.count),
  }
  drawChart()
}

const createColorMap = (flows) => {
  const names = Array.from(new Set(flows.flatMap((item) => [item.source, item.target])))
  return names.reduce((map, name, index) => ({
    ...map,
    [name]: nodePalette[index % nodePalette.length],
  }), {})
}

const hexToRgba = (hex, alpha) => {
  if (!hex) {
    return `rgba(148, 163, 184, ${alpha})`
  }

  const normalized = hex.replace('#', '')
  const length = normalized.length === 3 ? 1 : 2
  const values = normalized.length === 3
    ? normalized.split('').map((item) => parseInt(item.repeat(2), 16))
    : [
        parseInt(normalized.slice(0, 2), 16),
        parseInt(normalized.slice(2, 4), 16),
        parseInt(normalized.slice(4, 6), 16),
      ]

  if (length === 1) {
    return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`
  }

  return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`
}

const truncateText = (ctx, text, maxWidth) => {
  if (!text) {
    return ''
  }

  if (ctx.measureText(text).width <= maxWidth) {
    return text
  }

  let current = text
  while (current.length > 0 && ctx.measureText(`${current}...`).width > maxWidth) {
    current = current.slice(0, -1)
  }
  return `${current}...`
}

const getShortCollegeName = (name) => {
  if (!name) {
    return ''
  }

  return name.slice(0, 2)
}

const cubicBezierPoint = (p0, p1, p2, p3, t) => {
  const nt = 1 - t
  return (
    nt * nt * nt * p0
    + 3 * nt * nt * t * p1
    + 3 * nt * t * t * p2
    + t * t * t * p3
  )
}

const distancePointToSegment = (pointX, pointY, x1, y1, x2, y2) => {
  const deltaX = x2 - x1
  const deltaY = y2 - y1

  if (deltaX === 0 && deltaY === 0) {
    return Math.hypot(pointX - x1, pointY - y1)
  }

  const projection = ((pointX - x1) * deltaX + (pointY - y1) * deltaY) / (deltaX * deltaX + deltaY * deltaY)
  const ratio = Math.max(0, Math.min(1, projection))
  const closestX = x1 + ratio * deltaX
  const closestY = y1 + ratio * deltaY
  return Math.hypot(pointX - closestX, pointY - closestY)
}

const isPointNearPolyline = (points, pointX, pointY, tolerance) => {
  if (!Array.isArray(points) || points.length < 2) {
    return false
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index]
    const end = points[index + 1]
    if (distancePointToSegment(pointX, pointY, start.x, start.y, end.x, end.y) <= tolerance) {
      return true
    }
  }

  return false
}

const buildChartLayout = () => {
  const flows = currentFlowData.value
  if (!Array.isArray(flows) || flows.length === 0 || chartWidth.value <= 0) {
    chartHeight.value = 620
    chartRenderState.value = { nodes: [], links: [] }
    return
  }

  const colorMap = createColorMap(flows)
  const leftMap = new Map()
  const rightMap = new Map()
  const minLinkWidth = 4
  const linkScale = 1.15
  const nodeGap = 10
  const topPadding = 28
  const bottomPadding = 18
  const sidePadding = 8
  const nodeWidth = 18
  const labelWidth = Math.min(44, chartWidth.value * 0.12)
  const linkStartX = sidePadding + labelWidth + nodeWidth
  const linkEndX = chartWidth.value - sidePadding - labelWidth - nodeWidth

  flows.forEach((flow) => {
    const width = Math.max(minLinkWidth, flow.count * linkScale)

    if (!leftMap.has(flow.source)) {
      leftMap.set(flow.source, {
        name: flow.source,
        side: 'source',
        total: 0,
        links: [],
        color: colorMap[flow.source],
      })
    }

    if (!rightMap.has(flow.target)) {
      rightMap.set(flow.target, {
        name: flow.target,
        side: 'target',
        total: 0,
        links: [],
        color: colorMap[flow.target],
      })
    }

    const leftNode = leftMap.get(flow.source)
    const rightNode = rightMap.get(flow.target)
    leftNode.total += flow.count
    rightNode.total += flow.count
    leftNode.links.push(width)
    rightNode.links.push(width)
  })

  const leftNodes = [...leftMap.values()]
    .map((node) => ({
      ...node,
      height: Math.max(18, node.links.reduce((sum, width) => sum + width, 0) + 6),
    }))
    .sort((left, right) => right.total - left.total)

  const rightNodes = [...rightMap.values()]
    .map((node) => ({
      ...node,
      height: Math.max(18, node.links.reduce((sum, width) => sum + width, 0) + 6),
    }))
    .sort((left, right) => right.total - left.total)

  const getSideHeight = (nodes) => nodes.reduce((sum, node) => sum + node.height, 0) + Math.max(0, nodes.length - 1) * nodeGap
  chartHeight.value = Math.max(620, topPadding + bottomPadding + getSideHeight(leftNodes), topPadding + bottomPadding + getSideHeight(rightNodes))

  let currentLeftY = topPadding
  leftNodes.forEach((node) => {
    node.x = sidePadding + labelWidth
    node.y = currentLeftY
    node.width = nodeWidth
    currentLeftY += node.height + nodeGap
  })

  let currentRightY = topPadding
  rightNodes.forEach((node) => {
    node.x = chartWidth.value - sidePadding - labelWidth - nodeWidth
    node.y = currentRightY
    node.width = nodeWidth
    currentRightY += node.height + nodeGap
  })

  const leftCursorMap = Object.fromEntries(leftNodes.map((node) => [
    node.name,
    node.y + (node.height - node.links.reduce((sum, width) => sum + width, 0)) / 2,
  ]))

  const rightCursorMap = Object.fromEntries(rightNodes.map((node) => [
    node.name,
    node.y + (node.height - node.links.reduce((sum, width) => sum + width, 0)) / 2,
  ]))

  const leftNodeMap = Object.fromEntries(leftNodes.map((node) => [node.name, node]))
  const rightNodeMap = Object.fromEntries(rightNodes.map((node) => [node.name, node]))

  const links = flows.map((flow) => {
    const width = Math.max(minLinkWidth, flow.count * linkScale)
    const sourceNode = leftNodeMap[flow.source]
    const targetNode = rightNodeMap[flow.target]
    const startY = leftCursorMap[flow.source] + width / 2
    const endY = rightCursorMap[flow.target] + width / 2
    leftCursorMap[flow.source] += width
    rightCursorMap[flow.target] += width

    const controlOffset = Math.max(80, (linkEndX - linkStartX) * 0.35)
    const points = []
    for (let index = 0; index <= 24; index += 1) {
      const t = index / 24
      points.push({
        x: cubicBezierPoint(linkStartX, linkStartX + controlOffset, linkEndX - controlOffset, linkEndX, t),
        y: cubicBezierPoint(startY, startY, endY, endY, t),
      })
    }

    return {
      ...flow,
      width,
      color: sourceNode?.color || targetNode?.color || '#94a3b8',
      points,
      startX: linkStartX,
      startY,
      endX: linkEndX,
      endY,
      bounds: {
        minX: Math.min(linkStartX, linkEndX),
        maxX: Math.max(linkStartX, linkEndX),
        minY: Math.min(startY, endY) - width,
        maxY: Math.max(startY, endY) + width,
      },
    }
  })

  chartRenderState.value = {
    nodes: [...leftNodes, ...rightNodes],
    links,
  }
}

const drawChart = () => {
  if (activeSection.value !== 'data' || chartWidth.value <= 0) {
    return
  }

  buildChartLayout()
  const { nodes, links } = chartRenderState.value
  const ctx = Taro.createCanvasContext('major-sankey-canvas')

  ctx.clearRect(0, 0, chartWidth.value, chartHeight.value)
  ctx.setFillStyle('#ffffff')
  ctx.fillRect(0, 0, chartWidth.value, chartHeight.value)

  links.forEach((link) => {
    const isSelectedNode = selectedChartItem.value?.type === 'node'
      && selectedChartItem.value.name
      && (selectedChartItem.value.name === link.source || selectedChartItem.value.name === link.target)
    const isSelectedLink = selectedChartItem.value?.type === 'link'
      && selectedChartItem.value.source === link.source
      && selectedChartItem.value.target === link.target
      && Number(selectedChartItem.value.count) === Number(link.count)
    const highlight = !selectedChartItem.value || isSelectedNode || isSelectedLink
    const opacity = highlight ? (isSelectedLink ? 0.78 : 0.42) : 0.1

    ctx.beginPath()
    ctx.moveTo(link.startX, link.startY)
    ctx.bezierCurveTo(
      link.startX + Math.max(80, (link.endX - link.startX) * 0.35),
      link.startY,
      link.endX - Math.max(80, (link.endX - link.startX) * 0.35),
      link.endY,
      link.endX,
      link.endY,
    )
    ctx.setStrokeStyle(hexToRgba(link.color, opacity))
    ctx.setLineWidth(link.width)
    ctx.setLineCap('round')
    ctx.stroke()
  })

  ctx.setTextBaseline('middle')
  nodes.forEach((node) => {
    const isSelectedNode = selectedChartItem.value?.type === 'node' && selectedChartItem.value.name === node.name
    const isRelatedNode = selectedChartItem.value?.type === 'link'
      && (selectedChartItem.value.source === node.name || selectedChartItem.value.target === node.name)
    const highlight = !selectedChartItem.value || isSelectedNode || isRelatedNode
    const fillColor = highlight ? node.color : '#cbd5e1'

    ctx.setFillStyle(fillColor)
    ctx.fillRect(node.x, node.y, node.width, node.height)

    if (isSelectedNode) {
      ctx.setStrokeStyle(hexToRgba('#f97316', 0.35))
      ctx.setLineWidth(2)
      ctx.strokeRect(node.x - 2, node.y - 2, node.width + 4, node.height + 4)
    }

    ctx.setFontSize(11)
    ctx.setFillStyle('#334155')
    const maxWidth = Math.min(120, chartWidth.value * 0.28)
    const label = truncateText(ctx, getShortCollegeName(node.name), maxWidth)
    const labelY = node.y + node.height / 2

    if (node.side === 'source') {
      ctx.setTextAlign('right')
      ctx.fillText(label, node.x - 8, labelY)
      ctx.setFillStyle('#94a3b8')
      ctx.setFontSize(10)
      ctx.fillText(`${node.total}`, node.x - 8, labelY + 14)
    } else {
      ctx.setTextAlign('left')
      ctx.fillText(label, node.x + node.width + 8, labelY)
      ctx.setFillStyle('#94a3b8')
      ctx.setFontSize(10)
      ctx.fillText(`${node.total}`, node.x + node.width + 8, labelY + 14)
    }
  })

  ctx.draw()
}

const getTapPosition = (event) => {
  const touch = event?.touches?.[0] || event?.changedTouches?.[0] || event?.detail
  if (!touch) {
    return { x: 0, y: 0 }
  }

  return {
    x: touch.x ?? touch.pageX ?? 0,
    y: touch.y ?? touch.pageY ?? 0,
  }
}

const handleChartTap = (event) => {
  const { x, y } = getTapPosition(event)
  const tappedNode = chartRenderState.value.nodes.find((node) => (
    x >= node.x - 8
    && x <= node.x + node.width + 8
    && y >= node.y - 8
    && y <= node.y + node.height + 8
  ))

  if (tappedNode) {
    const relatedLinks = currentFlowData.value.filter((item) => (
      tappedNode.side === 'source' ? item.source === tappedNode.name : item.target === tappedNode.name
    ))
    selectedChartItem.value = {
      type: 'node',
      side: tappedNode.side,
      name: tappedNode.name,
      total: tappedNode.total,
      relatedCount: relatedLinks.length,
    }
    drawChart()
    return
  }

  const tappedLink = chartRenderState.value.links.find((link) => (
    x >= link.bounds.minX
    && x <= link.bounds.maxX
    && y >= link.bounds.minY
    && y <= link.bounds.maxY
    && isPointNearPolyline(link.points, x, y, Math.max(8, link.width / 2 + 2))
  ))

  if (tappedLink) {
    selectedChartItem.value = {
      type: 'link',
      source: tappedLink.source,
      target: tappedLink.target,
      count: tappedLink.count,
    }
    drawChart()
    return
  }

  selectedChartItem.value = null
  drawChart()
}

const measureChartWidth = () => new Promise((resolve) => {
  const query = Taro.createSelectorQuery()
  query.select('#major-sankey-wrapper').boundingClientRect()
  query.exec((result) => {
    const rect = result?.[0]
    if (rect?.width) {
      chartWidth.value = Math.floor(rect.width)
      resolve(chartWidth.value)
      return
    }

    const systemInfo = Taro.getSystemInfoSync()
    chartWidth.value = Math.max(280, Math.floor((systemInfo.windowWidth || 375) - 56))
    resolve(chartWidth.value)
  })
})

const refreshChart = async () => {
  if (activeSection.value !== 'data' || currentFlowData.value.length === 0) {
    return
  }

  await nextTick()
  await measureChartWidth()
  drawChart()
}

const loadPageData = async () => {
  pageLoading.value = true

  const configs = [
    { key: 'majorNotice', errorKey: 'notice', assign: (value) => { majorNotice.value = normalizeNoticeData(value) } },
    { key: 'majorExplain', errorKey: 'explain', assign: (value) => { majorExplain.value = normalizeExplainData(value) } },
    { key: 'majorList', errorKey: 'majorList', assign: (value) => { majorList.value = normalizeMajorList(value) } },
    { key: 'majorData', errorKey: 'majorData', assign: (value) => { majorData.value = normalizeMajorData(value) } },
    { key: 'majorQA', errorKey: 'majorQA', assign: (value) => { majorQA.value = normalizeMajorQA(value) } },
  ]

  const results = await Promise.allSettled(configs.map((item) => configAPI.getConfig(item.key)))
  let failedCount = 0

  results.forEach((result, index) => {
    const current = configs[index]
    if (result.status === 'fulfilled' && result.value) {
      const parsed = parseConfigValue(result.value.value, null)
      if (parsed !== null) {
        current.assign(parsed)
        sectionErrors.value[current.errorKey] = ''
        return
      }
    }

    failedCount += 1
    sectionErrors.value[current.errorKey] = `${current.key} 配置加载失败`
  })

  pageLoading.value = false

  if (failedCount > 0) {
    showToast('部分数据加载失败')
  }

  if (majorQA.value.length > 0 && activeQuestionId.value === null) {
    activeQuestionId.value = majorQA.value[0].id
  }

  await refreshChart()
}

watch(activeSection, async (value) => {
  if (value === 'data') {
    await refreshChart()
  }
})

watch(dataTab, async () => {
  if (activeSection.value === 'data') {
    await refreshChart()
  }
})

watch(selectedChartItem, () => {
  if (activeSection.value === 'data') {
    drawChart()
  }
}, { deep: true })

onMounted(async () => {
  await loadPageData()
})

Taro.useShareAppMessage(() => ({
  title: '江理一起来转专业',
  path: '/pages/major-transfer/index',
}))

Taro.useShareTimeline(() => ({
  title: '江理一起来转专业',
  path: '/pages/major-transfer/index',
}))
</script>
