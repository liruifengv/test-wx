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
  },
      /*
    * 每次触发，我们都会先判断是否还可以『加载更多』
    * 如果满足条件，那说明可以请求下一页列表数据，这时候把 data.page 累加 1
    * 然后调用公用的请求函数
    */
  onReachBottom () {
    if (this.data.hasMore) {
      let nextPage = this.data.page + 1
      this.setData({
        page: nextPage
      })
      this.requestArticle()
    }
  },
  onShareAppMessage () {
    let title = config.defaultShareTitle || ''
    return {
      title: title,
      path: `/pages/index/index`,
      success (res) {
        // 转发成功
      },
      fail (err) {
        // 转发失败
      }
    }
  },
      /*
    * 通过点击事件，我们可以获取到当前的节点对象
    * 同样也可以获取到节点对象上绑定的 data-X 数据
    * 获取方法： e.currentTarget.dataset
    * 此处我们先获取到 item 对象，它包含了文章 id
    * 然后带着参数 id 跳转到详情页面
    */
  showDetail (e) {
    let dataset = e.currentTarget.dataset
    let item = dataset && dataset.item
    let contentId = item.contentId || 0
    this.markRead(contentId)
    wx.navigateTo({
      url: `../detail/detail?contentId=${contentId}`,
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },
      /*
    * 如果我们只是把阅读过的文章contentId保存在globalData中，则重新打开小程序后，记录就不存在了
    * 所以，如果想要实现下次进入小程序依然能看到阅读标识，我们还需要在缓存中保存同样的数据
    * 当进入小程序时候，从缓存中查找，如果有缓存数据，就同步到 globalData 中
    */
  markRead (contendId) {
       //先从缓存中查找 visited 字段对应的所有文章 contentId 数据
    util.getStorageData('visited', (data) => {
      let newStorage = data
      if (data) {
          //如果当前的文章 contentId 不存在，也就是还没有阅读，就把当前的文章 contentId 拼接进去
        if (data.indexOf(contendId) === -1) {
          newStorage = `${data},${contendId}`
        }
         // 如果还没有阅读 visited 的数据，那说明当前的文章是用户阅读的第一篇，直接赋值就行了 
      } else {
        newStorage = `${contendId}`
      }
      /*
        * 处理过后，如果 data(老数据) 与 newStorage(新数据) 不一样，说明阅读记录发生了变化
        * 不一样的话，我们就需要把新的记录重新存入缓存和 globalData 中 
      */
      if (data !== newStorage) {
        if (app.globalData) {
          app.globalData.visitedArticles = newStorage
        }
        util.setStorageData('visited', newStorage, ()=> {
          this.resetArticles()
        })
      }
    })
  },
  resetArticles () {
    let old = this.data.articleList
    let newArticles = this.formatArticleData(old)
    this.setData({
      articleList: newArticles
    })
  }
})