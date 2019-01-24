//payment.js
//团单成功&支付
const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const app = getApp();


Page({
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '团单支付'
        });
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
          themecolor:app.globalData.themecolor
        })
        util.wxRequest({
            url:config.BASE_URL+'/m/gbcheckout-payresult-'+options.gb_id+'.html',
            success: function(res) {
                swan.hideNavigationBarLoading();
                var pagedata = res.data;
                //pagedata.order.consignee.area = util.formatArea(pagedata.order.consignee.area);
                _this.setData({
                    'bill':pagedata.bill,
                    'order':pagedata.order
                })
            }
        });
    },
})
