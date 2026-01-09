export default {
  pages: [
    'pages/home/index',
    'pages/schedule/index',
    'pages/schedule/schedule-bind/index',
    'pages/discover/index',
    'pages/profile/index',
    'pages/login/index',
    'pages/calendar/index',
    'pages/achieveprint/index',
    'pages/gotojw/index',
    'pages/graduation/index',
    'pages/map/index',
    'pages/teacher-reviews/index',
    'pages/admin/teacher-reviews/index',
    'pages/admin/heroes/index',
    'pages/admin/config/index',
    'pages/admin/rbac/index',
    'pages/admin/points/index',
    'pages/terms-of-service/index',
    'pages/webview/index',
    'pages/hero/index',
    'pages/failrate/index',
    'pages/gpa-calculator/index',
    'pages/groupchat/index',
    'pages/address/index',
    'pages/final-review/index',
    'pages/final-review/detail/index',
    // 通知公告相关页面
    'pages/notifications/index',
    'pages/notifications/detail/index',
    'pages/notifications/create/index',
    'pages/notifications/manage/index',
    'pages/notifications/categories/index',
    // 用户投稿相关页面
    'pages/contributions/create/index',
    'pages/contributions/mine/index',
    'pages/contributions/detail/index',
    'pages/contributions/review/index',
    // 资料库相关页面
    'pages/materials/index',
    'pages/materials/detail/index',
    // 积分页面
    'pages/points/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '江理一起来学',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#666666',
    selectedColor: '#3b82f6',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/schedule/index',
        text: '课表',
        iconPath: 'assets/icons/schedule.png',
        selectedIconPath: 'assets/icons/schedule-active.png'
      },
      {
        pagePath: 'pages/discover/index',
        text: '发现',
        iconPath: 'assets/icons/discover.png',
        selectedIconPath: 'assets/icons/discover-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png'
      }
    ]
  }
}
