<template>
  <web-view :src="webviewUrl"></web-view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'

const webviewUrl = ref('')

onMounted(() => {
  const instance = Taro.getCurrentInstance()
  const params = instance.router.params

  if (params.url) {
    webviewUrl.value = decodeURIComponent(params.url)

    // 动态设置导航栏标题
    if (params.title) {
      Taro.setNavigationBarTitle({
        title: decodeURIComponent(params.title)
      })
    }
  } else {
    Taro.showToast({
      title: 'URL参数错误',
      icon: 'none'
    })
  }
})
</script>
