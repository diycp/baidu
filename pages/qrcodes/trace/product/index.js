const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const app = getApp();

Page({
    data: {
        trace: false,
        error: false
    },
    onLoad: function (options) {
        var _this = this;
        if (!options.qrcode) {
            util.gotoIndex();
            return;
        }
        util.wxRequest({
            url: config.BASE_URL + '/m/qrcodes-trace-product.html',
            method: 'post',
            data: {
                qrcode: options.qrcode
            },
            success: function (res) {
                if (!res || !res.data || res.data.error || !res.data.trace_data) {
                    _this.setData({
                        error: res.data.error || '验证失败'
                    });
                    return;
                }
                _this.setData({
                    trace: res.data.trace_data
                });
                console.log(_this.data);
            },
            complete: function () {
                swan.stopPullDownRefresh();
                _this.setData({
                    hideLoading: true
                });
            },
            fail: function (re) {
                util.gotoIndex();
            }
        });
    },
    onPullDownRefresh: function () {
        this.onLoad();
    },
    evGotoIndex: function () {
        util.gotoIndex();
    }
});
