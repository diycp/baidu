//payment.js
//团单成功&支付
const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const app = getApp();


Page({
  data:{
  img_url:config.BASE_HOST
  },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '交易详情'
        });
    },
    onLoad: function(options) {
        this.setData({
            'type':options.type,
            themecolor: app.globalData.themecolor
        })
        var _this = this;
        util.wxRequest({
            url:config.BASE_URL+'/m/pslcheckout-payresult-'+options.pslorder_id+'-'+options.type+'.html',
            success: function(res) {
                swan.hideNavigationBarLoading();
                var pagedata = res.data;
                if (options.type != 'deposit_price') {
                    pagedata.order.consignee.area = util.formatArea(pagedata.order.consignee.area);
                }
                _this.setData({
                    'bill':pagedata.bill,
                    'order':pagedata.order
                })
            }
        });
    },
})
