const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const app = getApp();


Page({
    data:{
        
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '赠品'
        });
    },
    onLoad: function(options) {
      this.setData({
        themecolor:app.globalData.themecolor,
        partin_id:options.partin_id,
        win_id:options.win_id,
      })
        util.wxRequest({
            url:config.BASE_URL + '/m/marketingactivity-addrs.html?type=success'+ '&partin_id=' + this.data.partin_id +'&win_id=' + this.data.win_id,
            success:function(res){
              console.log(res);
              this.setData({
                userinfo:res.data.order.consignee,
                productname:res.data.product.name,
                orderid:res.data.win.order_id,
                addr: util.formatArea(res.data.order.consignee.area)
              })
            }.bind(this),
        })
        
    },
    getback:function(){
      swan.switchTab({
        url: '/pages/index/index',
      })
    }
});
