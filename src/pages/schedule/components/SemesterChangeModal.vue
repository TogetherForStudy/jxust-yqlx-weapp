<template>
  <view v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 遮罩层 -->
    <view class="absolute inset-0 bg-black bg-opacity-50"></view>

    <!-- 弹窗内容 -->
    <view class="relative bg-white rounded-2xl mx-8 max-w-sm w-full shadow-2xl">
      <!-- 内容区域 -->
      <view class="flex flex-col items-center px-8 pt-8 pb-6">
        <!-- 鲜花 Emoji -->
        <view class="text-6xl text-center mb-4">
          🎉
        </view>

        <!-- 标题 -->
        <view class="text-center text-gray-800 mb-6">
          进入新学期
        </view>

        <!-- 按钮 -->
        <view
          @tap="handleConfirm"
          class="flex items-center justify-center bg-blue-500 text-white text-center w-10 h-10 rounded-full font-medium active:scale-95 transition-transform"
        >
          <view class="i-lucide-arrow-right w-5 h-5"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineOptions({
  name: 'SemesterChangeModal'
})

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  newSemester: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['confirm', 'close'])

const handleConfirm = () => {
  emit('confirm')
}
</script>