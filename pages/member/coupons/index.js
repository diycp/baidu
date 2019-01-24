const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const dateFormat = require('../../../utils/dateformat.js');
// const app = getApp();

var format_pagedata = function(pagedata){
    for (var k in pagedata.available_coupons) {
        pagedata.available_coupons[k].from_time = dateFormat(parseInt(pagedata.available_coupons[k].from_time)*1000,'yy-mm-dd HH:MM');
        pagedata.available_coupons[k].to_time = dateFormat(parseInt(pagedata.available_coupons[k].to_time)*1000,'yy-mm-dd HH:MM');
    }
    for (var k in pagedata.couponlogs) {
        pagedata.couponlogs[k].usetime = dateFormat(parseInt(pagedata.couponlogs[k].usetime)*1000,'yyyy-mm-dd HH:MM');
    }
    return pagedata;
}

Page({
  data: {
    img_url: config.BASE_HOST
  },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '我的优惠券'
        });
    },
    onLoad: function(options) {
        var _this = this;
        swan.getSystemInfo({success:function(res){
            _this.setData({
                sv_height:res.windowHeight,
            });
        }});
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/my-coupon.html',
                success: function(res) {
                    var pagedata = format_pagedata(res.data);
                    pagedata['hideLoading'] = true;
                    _this.setData(pagedata);
                }
            });
        });
    },
    evt_tapnavbar:function(e){
        var navindex = e.currentTarget.dataset.navindex;
        this.setData({
            'couponlogs_active':parseInt(navindex)>0
        });
    }
});
