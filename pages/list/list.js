Page({
  data: {
    arrList: []
  },
  onReachBottom() {
    console.log('到达页面底部运行此函数')
    this.updateArrList();
  },
  updateArrList() {
    let arr = this.data.arrList
    arr.push(...this.createData())
    this.setData({
      arrList: arr
    })
  },
  createData() {
    let length = this.data.arrList.length
    if (length >= 30) return [];
    return Array.from({ length: 3 }, (v, i) => `数据${1 + i + length}`)
  }
})