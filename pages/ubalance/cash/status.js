const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');

Page({
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '提现状态'
        });
    },
    onPullDownRefresh: function() {
        this.onLoad.call(this,{fundlog_id:this.data.fundlog_id});
    },
    onLoad: function(options) {
        var _this = this;
        //swan.showNavigationBarLoading();
        var fundlog_id = options.fundlog_id;
        _this.setData({
            fundlog_id:fundlog_id
        });
        if(!fundlog_id){
            swan.navigateBack();
        }
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/ubalance-cash_status-'+fundlog_id+'.html',
                success: function(res) {
                    _this.setData(res.data);
                },
                complete: function() {
                    _this.setData({
                        hideLoading: true
                    });
                    swan.stopPullDownRefresh();
                }
            });
        });
    }
});
