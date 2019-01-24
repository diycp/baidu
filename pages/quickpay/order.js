const config = require('../../config/config.js');
const util = require('../../utils/util.js');

Page({
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '快捷支付记录'
        });
    },
    onPullDownRefresh: function() {
        this.onLoad.call(this);
    },
    onLoad: function(options) {
        var _this = this;
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/qpcheckout-order_list.html',
                success: function(res) {
                    if (res.data.error) {
                        swan.showModal({
                            title: '错误',
                            content: res.data.error || ''
                        });
                    } else {
                        _this.setData(res.data);
                    }
                },
                complete: function(re) {
                    _this.setData({
                        hideLoading: true
                    });
                    swan.stopPullDownRefresh();
                }
            });
        });
    }

});
