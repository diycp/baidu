const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const app = getApp();

Page({
    data:{
        hideLoading:false,
	   img_url: config.BASE_HOST
    },
    onPullDownRefresh: function() {
        this.onLoad.call(this,this.data.onloadoptions);
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '线下活动'
        });
    },
    onShow: function() {

    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
          themecolor:app.globalData.themecolor,
          onloadoptions:options
        })
        util.wxRequest({
            url:config.BASE_URL + '/m/customer-schedule_order.html',
            success: function(res) {
                _this.setData(res.data);
            },
            fail: function(re) {
                console.info(re);
            },complete:function(){
                _this.setData({
                    hideLoading:true
                });
                swan.stopPullDownRefresh();
            }
        });
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'm');
    }
});
