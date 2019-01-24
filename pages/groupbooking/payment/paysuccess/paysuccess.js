// pages/groupbooking/payment/paysuccess/paysuccess.js
Page({
  data: {
    activity_id: '',
    product_id: '',
    imgsrc:'',
  },
  onLoad:function(options){
    console.log(options);
    this.setData({
      activity_id: options.activity_id,
      product_id: options.product_id,
      imgsrc:options.imgsrc
    });
  },
  onShareAppMessage: function (res) {
    let the_path = '/pages/groupbooking/product/product?activity_id=' + this.data.activity_id + '&product_id=' + this.data.product_id;
    the_path = util.merchantShare(the_path);

    return {
      title:'您的朋友邀请您参与拼团',
      imageUrl:this.data.imgsrc,
      path: the_path
    }
  }
})