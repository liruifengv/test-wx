//app.js
'use strict';
import util from './utils/index';
App({
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch () {
    console.log('小程序初始化')
    this.getDeviceInfo()
    // 增加初始化缓存数据功能
    util.getStorageData('visited', (data) => {
      this.globalData.visitedArticles = data
    })
  },
  getDeviceInfo () {
    let self = this
    wx.getSystemInfo({
      success: function(res) {
        self.globalData.deviceInfo = res
      }
    })
  },
  //小程序全局数据
  globalData: {
    user: {
      openId: null
    },
    visitedArticles: '',
    deviceInfo: {}
  }
})
