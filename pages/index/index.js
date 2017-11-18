'use strict';

import util from '../../utils/index';
import config from '../../utils/config';

let app = getApp();
let isDEV = config.isDev;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1, //当前加载第几页的数据
    days: 3,
    pageSize: 4,
    totalSize: 0,
    hasMore: true,// 用来判断下拉加载更多内容操作
    articleList: [], // 存放文章列表数据，与视图相关联
    defaultImg: config.defaultImg
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    console.log('首页加载成功！')
    this.setData({
      hiddenLoading: false
    })
    this.requestArticle()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  requestArticle () {
    util.request({
      url: 'list',
      mock: true,
      data: {
        tag: '微信热门',
        start: this.data.page || 1,
        days: this.data.days || 3,
        pageSize: this.data.pageSize,
        langs: config.appLang || 'en'
      }
    })
    .then(res => {
      // 数据正常
      if (res && res.status === 0 && res.data.length) {
        // console.log(res)
        let articleData = res.data
        let formatData = this.formatArticleData(articleData)
        // console.log(formatData)
        this.renderArticle(formatData)
      } else if (this.data.page === 1 && res.data && res.data.length === 0) {
              /*
      * 如果加载第一页就没有数据，说明数据存在异常情况
      * 处理方式：弹出异常提示信息（默认提示信息）并设置下拉加载功能不可用
      */ 
        util.alert()
        this.setData({
          hasMore: false
        })
              /*
      * 如果非第一页没有数据，那说明没有数据了，停用下拉加载功能即可
      */ 
      } else if (this.data.page !== 1 && res.data && res.data.length === 0 ) {
        this.setData({
          hasMore: false
        })
      }
           /*
      * 返回异常错误
      * 展示后端返回的错误信息，并设置下拉加载功能不可用
      */ 
      else {
        util.alert('提示',res)
        this.setData({
          hasMore: false
        })
        return null
      }
    })
  },
  formatArticleData (data) {
    let formatData = undefined
    if (data && data.length) {
      formatData = data.map((group) => {
        // 格式化日期
        group.formateDate = this.dateConvert(group.date)
        if (group && group.articles) {
          let formatArticleItems = group.articles.map((item) => {
            // 判断是否访问过
            item.hasVisited = this.isVisited(item.contentId)
            return item
          }) || []
          group.articles = formatArticleItems
        }
        return group
      })
    }
    return formatData
  },
    /*
  * 将原始日期字符串格式化 '2017-06-12'
  * return '今日' / 08-21 / 2017-06-12
  */
  dateConvert (dateStr) {
    if (!dateStr) {
      return '';
  }
  let today = new Date(),
      todayYear = today.getFullYear(),
      todayMonth = ('0' + (today.getMonth() + 1)).slice(-2),
      todayDay = ('0' + today.getDate()).slice(-2);
  let convertStr = '';
  let originYear = +dateStr.slice(0,4);
  let todayFormat = `${todayYear}-${todayMonth}-${todayDay}`;
  if (dateStr === todayFormat) {
      convertStr = '今日';
  } else if (originYear < todayYear) {
      let splitStr = dateStr.split('-');
      convertStr = `${splitStr[0]}年${splitStr[1]}月${splitStr[2]}日`;
  } else {
      convertStr = dateStr.slice(5).replace('-', '月') + '日'
  }
  return convertStr;
  },
  // 判断文章是否访问过
  isVisited (contentId) {
    let visitedArticles = app.globalData && app.globalData.visitedArticles || ''
    return visitedArticles.indexOf(`${contentId}`) > -1
  },
  renderArticle (data) {
    if (data && data.length) {
      let newList = this.data.articleList.concat(data)
      this.setData({
        articleList: newList,
        hiddenLoading: true
      })
    }
  }
})