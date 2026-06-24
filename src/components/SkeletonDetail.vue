<template>
  <view class="min-h-screen bg-page">
    <view class="p-4">
      <view class="bg-surface rounded-xl p-4 shadow-sm border border-line">
        <!-- 标题骨架 -->
        <view class="mb-4">
          <view class="skeleton-box h-6 w-3/4 mb-3 rounded"></view>

          <!-- 元信息骨架 -->
          <view class="flex flex-wrap items-center gap-3 mb-3">
            <view class="skeleton-box h-4 w-20 rounded"></view>
            <view class="skeleton-box h-4 w-32 rounded"></view>
            <view class="skeleton-box h-4 w-16 rounded"></view>
          </view>

          <!-- 分类标签骨架 -->
          <view class="flex gap-2">
            <view class="skeleton-box h-6 w-16 rounded-full"></view>
            <view class="skeleton-box h-6 w-20 rounded-full"></view>
          </view>
        </view>

        <!-- 分割线 -->
        <view class="border-t border-line my-4"></view>

        <!-- 内容骨架 -->
        <view class="mb-6 space-y-2">
          <view class="skeleton-box h-4 w-full rounded"></view>
          <view class="skeleton-box h-4 w-full rounded"></view>
          <view class="skeleton-box h-4 w-5/6 rounded"></view>
          <view class="skeleton-box h-4 w-4/5 rounded"></view>
          <view class="skeleton-box h-4 w-full rounded"></view>
          <view class="skeleton-box h-4 w-3/4 rounded"></view>
        </view>

        <!-- 额外信息骨架（可选） -->
        <view v-if="showExtra" class="skeleton-box h-24 w-full rounded-lg"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  showExtra: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.skeleton-box {
  background: linear-gradient(
    90deg,
    var(--theme-skeleton-from) 25%,
    var(--theme-skeleton-via) 50%,
    var(--theme-skeleton-to) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}
</style>
