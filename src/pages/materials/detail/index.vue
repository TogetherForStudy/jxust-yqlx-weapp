<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 加载状态 -->
    <view v-if="loading" class="flex justify-center items-center py-20">
      <text class="text-gray-400">加载中...</text>
    </view>

    <view v-else-if="material" class="pb-20">
      <!-- 文件信息卡片 -->
      <view class="bg-white p-4 mb-2">
        <view class="flex items-start space-x-3">
          <view class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <text class="i-lucide-file-text text-white w-6 h-6"></text>
          </view>
          <view class="flex-1 min-w-0">
            <text class="text-gray-800 font-bold text-base line-clamp-2 break-all" :user-select="true">
              {{ material.file_name }}
            </text>
            <view class="flex items-center space-x-3 mt-2 text-xs text-gray-400">
              <text>{{ formatFileSize(material.file_size) }}</text>
            </view>
          </view>
        </view>

        <!-- 分类路径 -->
        <view v-if="material.category_path" class="pt-3">
          <text class="text-xs text-gray-500" :user-select="true">分类：{{ material.category_path }}</text>
        </view>

        <!-- 标签 -->
        <view v-if="material.tags" class="flex flex-wrap gap-2 mt-3">
          <text
            v-for="tag in material.tags.split(',')"
            :key="tag"
            class="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
          >
            {{ tag.trim() }}
          </text>
        </view>

        <!-- 推荐标识 -->
        <view v-if="material.is_recommended" class="mt-3">
          <view class="inline-flex items-center px-2 py-1 bg-yellow-50 rounded-lg">
            <text class="i-lucide-star text-yellow-500 w-4 h-4 mr-1"></text>
            <text class="text-xs text-yellow-600 font-medium">官方推荐</text>
          </view>
        </view>
      </view>

      <!-- 描述信息 -->
      <view v-if="material.description" class="bg-white p-4 mb-2">
        <text class="text-gray-800 font-medium text-sm mb-2 block">资料描述</text>
        <text class="text-gray-600 text-sm leading-relaxed" :user-select="true">{{ material.description }}</text>
      </view>

      <!-- 外部链接 -->
      <view v-if="material.external_link" class="bg-white p-4 mb-2" @tap="openExternalLink">
        <view class="flex items-center justify-between">
          <view class="flex items-center space-x-2">
            <text class="i-lucide-link text-blue-500 w-5 h-5"></text>
            <text class="text-blue-500 text-sm">复制外部链接</text>
          </view>
          <text class="i-lucide-external-link text-blue-500 w-4 h-4"></text>
        </view>
      </view>

      <!-- 统计信息 -->
      <view class="bg-white p-4 mb-2">
        <text class="text-gray-800 font-medium text-sm mb-3 block">统计信息</text>
        <view class="grid grid-cols-3 gap-4">
          <view class="text-center">
            <text class="text-xl font-bold text-blue-500 block">{{ material.view_count }}</text>
            <text class="text-sm text-gray-400 mt-1">查看</text>
          </view>
          <view class="text-center">
            <text class="text-xl font-bold text-green-500 block">{{ material.download_count }}</text>
            <text class="text-sm text-gray-400 mt-1">下载</text>
          </view>
          <view class="text-center">
            <text class="text-xl font-bold text-yellow-500 block">{{ material.total_hotness }}</text>
            <text class="text-sm text-gray-400 mt-1">热度</text>
          </view>
        </view>
      </view>

      <!-- 评分区域 -->
      <view class="bg-white p-4 mb-2">
        <text class="text-gray-800 font-medium text-sm mb-3 block">资料评分</text>

        <!-- 平均评分 -->
        <view class="flex items-center justify-center">
          <view class="text-center">
            <text class="text-3xl font-bold text-yellow-500">{{ material.rating ? material.rating.toFixed(1) : '暂无' }}</text>
            <view class="flex items-center justify-center mt-2">
              <view
                v-for="i in 5"
                :key="i"
                class="mx-0.5"
              >
                <text
                  :class="i <= Math.round(material.rating) ? 'text-yellow-500' : 'text-gray-300'"
                  class="i-lucide-star w-4 h-4"
                ></text>
              </view>
            </view>
            <text class="text-xs text-gray-400 mt-1">{{ material.rating_count }} 人评分</text>
          </view>
        </view>

        <!-- 用户评分 -->
        <view>
          <text class="text-gray-600 text-sm mb-2 block">
            {{ material.user_rating ? '您的评分' : '为这份资料评分' }}
          </text>
          <view class="flex items-center justify-center space-x-2">
            <view
              v-for="i in 5"
              :key="i"
              @tap="rateMaterial(i)"
              class="p-2"
            >
              <text
                :class="i <= (userRating || material.user_rating || 0) ? 'text-yellow-500' : 'text-gray-300'"
                class="i-lucide-star w-6 h-6"
              ></text>
            </view>
          </view>
          <text v-if="userRating || material.user_rating" class="text-center text-sm text-gray-500 mt-2 block">
            {{ userRating || material.user_rating }} 星
          </text>
        </view>
      </view>

      <!-- 管理员操作 -->
      <view v-if="authStore.isAdmin" class="bg-white p-4 mb-2">
        <text class="text-gray-800 font-medium text-sm mb-3 block">管理员操作</text>
        <view class="flex space-x-2">
          <view
            class="bg-blue-500 text-white text-center py-2 rounded-lg w-full"
            @tap="editMaterial"
          >
            编辑资料描述
          </view>
          <view
            class="bg-red-500 text-white text-center py-2 rounded-lg w-full"
            @tap="deleteMaterial"
          >
            删除资料
          </view>
        </view>
      </view>
    </view>

    <!-- 底部下载按钮 -->
    <view v-if="material" class="fixed bottom-0 left-0 right-0 bg-white p-4">
      <view
        class="flex items-center justify-center bg-blue-500 text-white py-3 rounded-xl font-medium w-full"
        @tap="handleDownload"
      >
        <text class="i-lucide-download w-5 h-5 mr-2"></text>
        下载资料
      </view>
    </view>

    <!-- 编辑对话框 -->
    <view v-if="showEditDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @tap="showEditDialog = false">
      <view class="bg-white rounded-xl p-4 m-4 w-full max-w-lg" @tap.stop>
        <text class="text-gray-800 font-bold text-lg mb-4 block">编辑资料描述</text>

        <view class="mb-3">
          <text class="text-gray-600 text-sm mb-1 block">标签（逗号分隔）</text>
          <input
            v-model="editForm.tags"
            class="border-solid border-[1px] border-gray-400 rounded-lg p-2"
          />
        </view>

        <view class="mb-3">
          <text class="text-gray-600 text-sm mb-1 block">资料描述</text>
          <textarea
            v-model="editForm.description"
            class="border-solid border-[1px] border-gray-400 rounded-lg p-2 box-border w-full"
            :maxlength="1000"
            placeholder="请输入资料描述..."
          />
        </view>

        <view class="mb-3">
          <text class="text-gray-600 text-sm mb-1 block">外部链接</text>
          <input
            v-model="editForm.external_link"
            class="border-solid border-[1px] border-gray-400 rounded-lg p-2"
          />
        </view>

        <view class="mb-4">
          <label class="flex items-center">
            <switch
              :checked="editForm.is_recommended"
              @change="e => editForm.is_recommended = e.detail.value"
              class="mr-2"
            />
            <text class="text-gray-600 text-sm">设为推荐</text>
          </label>
        </view>

        <view class="flex space-x-2">
          <view
            class="flex-1 bg-gray-200 text-gray-800 text-center py-2 rounded-lg"
            @tap="showEditDialog = false"
          >
            取消
          </view>
          <view
            class="flex-1 bg-blue-500 text-white text-center py-2 rounded-lg"
            @tap="submitEdit"
          >
            保存
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { materialAPI } from '../../../api'
import { useAuthStore } from '../../../stores/auth'

const authStore = useAuthStore()

// 路由参数
const md5 = ref('')

// 数据
const material = ref(null)
const loading = ref(false)
const userRating = ref(0)

// 编辑
const showEditDialog = ref(false)
const editForm = ref({
  tags: '',
  description: '',
  external_link: '',
  is_recommended: false
})

// 初始化
onMounted(() => {
  if (!authStore.requireAuth()) return

  const instance = Taro.getCurrentInstance()
  md5.value = instance.router.params.md5

  if (md5.value) {
    loadMaterialDetail()
  }
})

// 加载资料详情
const loadMaterialDetail = async () => {
  loading.value = true
  const res = await materialAPI.getMaterialDetail(md5.value)
  material.value = res
  userRating.value = res.user_rating || 0
  loading.value = false
}

// 静默刷新特定数据（不显示加载状态，避免页面闪烁）
const refreshMaterialData = async (fieldsToUpdate = []) => {
  try {
    const res = await materialAPI.getMaterialDetail(md5.value)

    // 如果没有指定字段，更新所有数据
    if (fieldsToUpdate.length === 0) {
      material.value = res
      userRating.value = res.user_rating || 0
      return
    }

    // 只更新指定的字段
    fieldsToUpdate.forEach(field => {
      if (res[field] !== undefined) {
        material.value[field] = res[field]
      }
    })

    // 如果更新了用户评分，也更新本地状态
    if (fieldsToUpdate.includes('user_rating')) {
      userRating.value = res.user_rating || 0
    }
  } catch (error) {
    console.error('刷新数据失败:', error)
  }
}

// 评分
const rateMaterial = async (rating) => {
  const oldRating = userRating.value
  userRating.value = rating

  try {
    await materialAPI.rateMaterial(md5.value, { rating })

    Taro.showToast({
      title: '评分成功',
      icon: 'success',
      duration: 1000
    })

    // 延迟后重新获取数据，只更新评分相关字段
    setTimeout(() => {
      refreshMaterialData(['rating', 'rating_count', 'user_rating'])
    }, 300)
  } catch (error) {
    // 评分失败，恢复之前的评分
    userRating.value = oldRating

    Taro.showToast({
      title: '评分失败',
      icon: 'none'
    })
    console.error('评分失败:', error)
  }
}

// 下载资料
const handleDownload = async () => {
  try {
    // 记录下载行为
    await materialAPI.downloadMaterial(md5.value)

    // 显示引导弹窗
    Taro.showModal({
      title: '获取资料',
      content: `请前往"江理一起来学"公众号（不是小程序客服），回复"资料"获取下载链接。\n\n然后按照路径查找：\n${material.value.category_path || '根目录'} > ${material.value.file_name}`,
      confirmText: '我知道了',
      showCancel: false,
      success: () => {
        // 重新获取数据，只更新下载次数、查看次数和热度
        refreshMaterialData(['download_count', 'view_count', 'total_hotness'])
      }
    })
  } catch (error) {
    Taro.showToast({
      title: '操作失败',
      icon: 'none'
    })
    console.error('下载记录失败:', error)
  }
}

// 打开外部链接
const openExternalLink = () => {
  if (!material.value.external_link) return

  Taro.setClipboardData({
    data: material.value.external_link,
    success: () => {
      Taro.showToast({
        title: '请到浏览器粘贴使用',
        icon: 'success'
      })
    }
  })
}

// 编辑资料
const editMaterial = () => {
  editForm.value = {
    tags: material.value.tags || '',
    description: material.value.description || '',
    external_link: material.value.external_link || '',
    is_recommended: material.value.is_recommended || false
  }
  showEditDialog.value = true
}

// 提交编辑
const submitEdit = async () => {
  try {
    await materialAPI.updateMaterialDesc(md5.value, editForm.value)

    Taro.showToast({
      title: '更新成功',
      icon: 'success'
    })

    showEditDialog.value = false

    // 重新获取数据，只更新编辑的字段
    refreshMaterialData(['tags', 'description', 'external_link', 'is_recommended'])
  } catch (error) {
    Taro.showToast({
      title: '更新失败',
      icon: 'none'
    })
    console.error('更新失败:', error)
  }
}

// 删除资料
const deleteMaterial = () => {
  Taro.showModal({
    title: '确认删除',
    content: '确定要删除这份资料吗？此操作不可撤销。',
    success: async (res) => {
      if (res.confirm) {
          const result = await materialAPI.deleteMaterial(md5.value)
            Taro.showToast({
              title: result.message,
              icon: 'success'
            })
            setTimeout(() => {
              Taro.navigateBack()
            }, 1500)
      }
    }
  })
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '未知'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

Taro.useShareAppMessage((res) => {
    if (res.from === 'button') {
    }
    return {
      title: material.value.file_name,
      path: '/pages/materials/detail/index?md5=' + md5.value,
    }
  })

Taro.useShareTimeline((res) => {
    if (res.from === 'button') {
    }
    return {
      title: material.value.file_name,
      path: '/pages/materials/detail/index?md5=' + md5.value,
    }
  })
</script>

<style scoped>
.active\:scale-98:active {
  transform: scale(0.98);
}

.grid {
  display: grid;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}
</style>

