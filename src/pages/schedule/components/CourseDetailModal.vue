<template>
  <view class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @tap="handleOverlayClick">
    <view class="bg-white rounded-xl shadow-xl max-w-sm w-full max-h-96 overflow-hidden" @tap.stop style="animation: modal-enter 0.3s ease-out;">
             <!-- 头部 -->
       <view class="flex items-center justify-between px-4 py-2 border-b border-gray-200">
         <view class="font-semibold text-gray-900 flex-1 pr-4" style="display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
           {{ course.hasMultipleCourses ? `${course.totalCourses}门课程` : course.course }}
         </view>
         <view @tap="copyInfo" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
           <view class="i-lucide-copy text-xl text-gray-500"></view>
         </view>
         <view @tap="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
           <view class="i-lucide-x-circle text-xl text-gray-500"></view>
         </view>
       </view>

       <!-- 内容 -->
       <view class="p-4 space-y-4 max-h-80 overflow-y-auto">
         <!-- 多课程切换 -->
         <view v-if="course.hasMultipleCourses" class="flex flex-wrap gap-2 mb-4">
           <view
             v-for="(courseItem, index) in course.allCourses"
             :key="index"
             class="px-3 py-1 rounded-full text-xs border transition-colors relative"
             :class="[
               currentCourseIndex === index
                 ? 'bg-blue-500 text-white border-blue-500'
                 : scheduleStore.isCourseInCurrentWeek(courseItem.week)
                   ? 'border-gray-300 text-gray-700 bg-white'
                   : 'border-gray-200 text-gray-400 bg-gray-50'
             ]"
             @tap="currentCourseIndex = index"
           >
             {{ courseItem.course }}
             <!-- 本周课程标识 -->
             <view
               v-if="scheduleStore.isCourseInCurrentWeek(courseItem.week)"
               class="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
             ></view>
           </view>
         </view>

         <!-- 基本信息 -->
         <view class="space-y-3">
           <view class="flex flex-col">
             <view class="text-sm font-medium text-gray-500 mb-1">时间</view>
             <view class="text-base text-gray-900">
               {{ course.dayName }} 第{{ course.period }}节
             </view>
             <view class="text-sm text-gray-600 mt-1">{{ course.time }}</view>
           </view>

           <view class="flex flex-col">
             <view class="text-sm font-medium text-gray-500 mb-1">课程名称</view>
             <view class="text-base text-gray-900">{{ currentCourse.course }}</view>
           </view>

           <view class="flex flex-col">
             <view class="text-sm font-medium text-gray-500 mb-1">教室</view>
             <view class="text-base text-gray-900">{{ currentCourse.classroom }}</view>
           </view>

           <view class="flex flex-col">
             <view class="text-sm font-medium text-gray-500 mb-1">教师</view>
             <view class="text-base text-gray-900">{{ currentCourse.teacher }}</view>
           </view>

           <view v-if="currentCourse.class" class="flex flex-col">
             <view class="text-sm font-medium text-gray-500 mb-1">班级</view>
             <view class="text-base text-gray-900">{{ currentCourse.class }}</view>
           </view>

           <view class="flex flex-col">
             <view class="text-sm font-medium text-gray-500 mb-1">上课周次</view>
             <view class="flex items-center justify-between">
               <view class="text-base text-gray-900">{{ currentCourse.week }}</view>
               <view
                 class="px-2 py-1 rounded-full text-xs font-medium"
                 :class="scheduleStore.isCourseInCurrentWeek(currentCourse.week)
                   ? 'bg-green-100 text-green-700'
                   : 'bg-gray-100 text-gray-500'"
               >
                 {{ scheduleStore.isCourseInCurrentWeek(currentCourse.week) ? '本周有课' : '本周无课' }}
               </view>
             </view>
           </view>
         </view>
      </view>
    </view>
  </view>
</template>

 <script setup>
 import { computed, ref } from 'vue'
 import Taro from '@tarojs/taro'
 import { useScheduleStore } from '../../../stores/schedule'

 const props = defineProps({
   course: {
     type: Object,
     required: true
   }
 })

 const emit = defineEmits(['close'])

 const scheduleStore = useScheduleStore()

 // 当前选中的课程索引（用于多课程切换）
 const currentCourseIndex = ref(0)

 // 当前显示的课程
 const currentCourse = computed(() => {
   if (props.course.hasMultipleCourses && props.course.allCourses) {
     return props.course.allCourses[currentCourseIndex.value] || props.course
   }
   return props.course
 })

 // 课程状态
 const courseStatusClass = computed(() => {
   const isInCurrentWeek = scheduleStore.isCourseInCurrentWeek(currentCourse.value.week)
   return isInCurrentWeek ? 'status-active' : 'status-inactive'
 })

 const courseStatusText = computed(() => {
   const isInCurrentWeek = scheduleStore.isCourseInCurrentWeek(currentCourse.value.week)
   return isInCurrentWeek ? '本周有课' : '本周无课'
 })

// 处理遮罩点击
const handleOverlayClick = () => {
  emit('close')
}

 // 复制课程信息
 const copyInfo = () => {
   const info = `课程：${currentCourse.value.course}
 时间：${props.course.dayName} 第${props.course.period}节 (${props.course.time})
 教室：${currentCourse.value.classroom}
 教师：${currentCourse.value.teacher}
 ${currentCourse.value.class ? `班级：${currentCourse.value.class}` : ''}
 周次：${currentCourse.value.week}`

  Taro.setClipboardData({
    data: info,
    success: () => {
      Taro.showToast({
        title: '已复制到剪贴板',
        icon: 'success'
      })
    }
  })
}
</script>

<style scoped>
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
