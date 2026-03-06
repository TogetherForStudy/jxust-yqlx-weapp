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
    try {
      webviewUrl.value = decodeURIComponent(params.url)
    } catch (e) {
      webviewUrl.value = params.url
    }

    if (params.title) {
      try {
        Taro.setNavigationBarTitle({
          title: decodeURIComponent(params.title)
        })
      } catch (e) {
        Taro.setNavigationBarTitle({ title: params.title })
      }
    }
  } else {
    Taro.showToast({
      title: 'URL参数错误',
      icon: 'error'
    })
  }
})

Taro.useShareAppMessage((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学小程序',
      path: '/pages/discover/index',
    }
  })

  Taro.useShareTimeline((res) => {
    if (res.from === 'button') {
    }
    return {
      title: '江理一起来学小程序',
      path: '/pages/discover/index',
    }
  })
</script>
