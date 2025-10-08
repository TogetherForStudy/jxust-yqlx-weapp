<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <view class="min-h-screen bg-gray-50 flex flex-col space-y-4 py-4">
    <TodayCourse />
    <NotificationCard />
    <StudyTaskCard />
    <CountdownCard />
  </view>
</template>

<script setup>
import TodayCourse from './components/TodayCourse.vue'
import CountdownCard from './components/CountdownCard.vue'
import StudyTaskCard from './components/StudyTaskCard.vue'
import NotificationCard from './components/NotificationCard.vue'
</script>
