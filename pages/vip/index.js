const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const app = getApp();

const wxpay = function (order_id, callback) {
    swan.showToast({
        title: '准备支付',
        icon: 'loading',
        mask: true,
        duration: 10000
    });
    util.wxRequest({
        url: config.BASE_URL + '/m/vip-payment-' + order_id + '.html?openid=' + this.data.member.openid,
        success: function (res) {
            swan.hideToast();
            if (res.data.error) {
                swan.showModal({
                    title: '支付请求异常',
                    content: res.data.error || ''
                });
            } else {
                let pay_params = res.data;
                pay_params.success = function (res) {
                    swan.showToast({
                        'icon': 'success',
                        'title': '支付成功',
                        'duration': 1500
                    });
                    typeof callback == 'function' && callback();
                };
                pay_params.fail = function (res) {
                    if (res.errMsg == 'requestPayment:fail cancel') {
                        return;
                    }
                };
                swan.hideToast();
                swan.requestPayment(pay_params);
            }
        }
    });
};

Page({
    data: {
        vip_lvs: false,
        member_vip: false,
        selLv: false
    },
    onLoad: function (options) {
        var _this = this;
        util.checkMember.call(this, function () {
            util.wxRequest({
                url: config.BASE_URL + '/m/vip.html',
                success: function (res) {
                    if (!res || !res.data || res.data.error) {
                        _this.setData({
                            error: res.data.error || '操作失败'
                        });
                        return;
                    }
                    if (!res.data.member_vip_lvs) {
                        return;
                    }
                    _this.setData({
                        vip_lvs: res.data.member_vip_lvs,
                        member_vip: res.data.member_vip
                    });
                    if (res.data.member_vip && res.data.member_vip.status && res.data.member_vip.member_lv_id) {
                        _this.setData({
                            selLv: res.data.member_vip.member_lv_id
                        });
                    }
                    console.log(_this.data);
                },
                complete: function () {
                    swan.stopPullDownRefresh();
                    _this.setData({
                        hideLoading: true
                    });
//                    swan.showLoading({
//                        title: '加载中',
//                    });
                },
                fail: function (re) {
                    util.gotoIndex();
                }
            });
        });
    },
    onPullDownRefresh: function () {
        this.onLoad();
    },
    evGotoIndex: function () {
        util.gotoIndex();
    },
    lvChange: function (e) {
        this.setData({
            selLv: e.detail.value
        });
        console.log('selLv', this.data.selLv);
    },
    evCreatOrder: function () {
        var _this = this;
        if (!this.data.selLv) {
            swan.showModal({
                title: '提示',
                content: '请选择需要购买的VIP会员等级',
                showCancel: false,
                confirmText: '现在选择'
            });
            return;
        }
        swan.showLoading({
            title: '正在发送请求......',
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/vip-create_order.html',
            method: 'post',
            data: {
                lv: this.data.selLv
            },
            success: function (res) {
                console.log('create_order', res);
                if (!res || !res.data || res.data.error) {
                    swan.showModal({
                        title: '提示',
                        content: res.data.error || '购买失败',
                        confirmText: '稍后再试',
                        cancelText: '返回首页',
                        success: function (res) {
                            if (res.cancel) {
                                util.gotoIndex();
                            }
                        }
                    });
                    return;
                }
                if (res.data.success && res.data.data && res.data.data.order && res.data.data.order.order_id) {
                    console.log('res.data', res.data);
                    wxpay.apply(_this, [res.data.data.order.order_id, function (err_msg) {
                            if (err_msg) {
                                swan.showModal({
                                    content: err_msg || '购买失败,无法完成支付',
                                    showCancel: false
                                });
                            } else {
                                _this.onLoad();
                            }
                        }]);
                }
            },
            complete: function () {
                swan.hideLoading();
            }
        });
    }
});
