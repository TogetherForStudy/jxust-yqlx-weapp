export default {
  darkmode: true,
  themeLocation: 'theme.json',
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
    'pages/terms-of-service/index',
    'pages/webview/index',
    'pages/hero/index',
    'pages/failrate/index',
    'pages/gpa-calculator/index',
    'pages/groupchat/index',
    'pages/address/index',
    'pages/final-review/index',
    'pages/final-review/detail/index',
    'pages/major-transfer/index',
    'pages/competition/index',
    'pages/organization/index',
    'pages/organization/detail/index',
    'pages/qualification/index',
    'pages/exchange/index',
    // 通知公告相关页面
    'pages/notifications/index',
    'pages/notifications/detail/index',
    // 资料库相关页面
    'pages/materials/index',
    'pages/materials/detail/index',
    // 积分页面
    'pages/points/index',
  ],
  window: {
    backgroundTextStyle: '@backgroundTextStyle',
    backgroundColor: '@pageBgColor',
    backgroundColorTop: '@pageBgColorTop',
    backgroundColorBottom: '@pageBgColorBottom',
    navigationBarBackgroundColor: '@navBgColor',
    navigationBarTitleText: '江理一起来学',
    navigationBarTextStyle: '@navTxtStyle'
  },
  tabBar: {
    color: '@tabFontColor',
    selectedColor: '@tabSelectedColor',
    backgroundColor: '@tabBgColor',
    borderStyle: '@tabBorderStyle',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: '@tabHomeIcon',
        selectedIconPath: '@tabHomeSelectedIcon'
      },
      {
        pagePath: 'pages/schedule/index',
        text: '课表',
        iconPath: '@tabScheduleIcon',
        selectedIconPath: '@tabScheduleSelectedIcon'
      },
      {
        pagePath: 'pages/discover/index',
        text: '发现',
        iconPath: '@tabDiscoverIcon',
        selectedIconPath: '@tabDiscoverSelectedIcon'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: '@tabProfileIcon',
        selectedIconPath: '@tabProfileSelectedIcon'
      }
    ]
  }
}
