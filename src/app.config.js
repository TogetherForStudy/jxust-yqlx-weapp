export default {
  pages: [
    'pages/schedule/index',
    'pages/schedule/schedule-bind/index',
    'pages/discover/index',
    'pages/profile/index',
    'pages/login/index',
    'pages/teacher-reviews/index',
    'pages/admin/teacher-reviews/index',
    'pages/terms-of-service/index'
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
