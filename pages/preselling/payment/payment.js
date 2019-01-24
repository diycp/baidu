//payment.js
//团单成功&支付
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
//var md5 = require('../../../utils/md5.js');
const app = getApp();

//小程序内微信支付
var wxpay = function () {
    var pagedata = this.data;
    swan.showToast({
        'icon': 'loading',
        'title': '正在加载',
        'mask': true,
        'duration': 2500
    });
    var _this = this;
    var order_id = pagedata.order.presell_id;
    var reqUrl = config.BASE_URL + '/m/pslcheckout-dopayment-' + order_id + '.html?openid=' + pagedata.member.openid;
    var page = "/pages/member/presellingorder/detail/detail?order_id=" + order_id;
    util.wxRequest({
        url: reqUrl,
        success: function (res) {
            swan.hideToast()
            if (res.data.error) {
                swan.showModal({
                    title: '支付请求异常',
                    content: res.data.error || '',
                });
            } else {
                let pay_params = res.data;
                pay_params.success = function (res) {
                    // swan.showToast({
                    //     'icon':'success',
                    //     'title':'支付成功',
                    //     'duration':1500
                    // });
                    _this.onLoad({
                        'order_id': order_id,
                        'type': _this.data.type
                    });
                    /**
                     * 模板消息发送
                     */
                    if (_this.data.type == 'balance_payment') {
                        if (pay_params.package) {
                            var action_url = false;
                            var msgCode = '';
                            var msgType = 'AT0007';
                            var msgId = config.TPLMSGID['AT0007'];
                            if (app.globalData.msg_templates && app.globalData.msg_templates.order_deliver_remind) {
                                var action_url = config.BASE_URL + '/openapi/open_app/wx_send_message';
                                msgCode = 'order_deliver_remind';
                                msgType = app.globalData.msg_templates.order_deliver_remind.type;
                                msgId = app.globalData.msg_templates.order_deliver_remind.template;
                            }
                            util.sendMsg({
                                "touser": pagedata.member.openid,
                                "action_url": action_url,
                                "msg_code": msgCode,
                                "msg_type": msgType, //团单发货成功消息模板(对应小程序平台模板类型ID)
                                "template_id": msgId,
                                "page": page,
                                "form_id": pay_params.package.match(/prepay_id=([^&]+)/i)[1],
                                "order_id": order_id
                                        /**
                                         *  'keyword1'#团单号
                                         *  'keyword2'#发货时间
                                         *  'keyword3'#物流公司
                                         *  'keyword4'#物流单号
                                         *  'keyword5'#收货人
                                         *  'keyword6'#收货地址
                                         *  'keyword7'#收货联系方式
                                         */
                                        //"emphasis_keyword": "keyword1.DATA" //高亮
                            });
                        }
                    }
                };
                pay_params.fail = function (res) {
                    if (res.errMsg == 'requestPayment:fail cancel') {
                        return;
                    }
                    swan.showModal({
                        title: '支付失败',
                        content: '请稍后再试'
                    });
                }

                swan.requestPayment(pay_params);
            }
        }
    });
}

Page({
    onReady: function () {
        swan.setNavigationBarTitle({
            title: '订单支付'
        });
    },
    evt_tapmodal: function (e) {
        var modal_name = e.target.dataset.modalname;
        if (!modal_name) {
            return;
        }
        var _set = {
        };
        _set['active_' + modal_name] = false;
        this.setData(_set);
        this.animation.opacity(0).step();
        this.setData({modal_animation_data: this.animation.export()});
    },
    evt_showmodal: function (e) {
        var modal_name = e.currentTarget.dataset.modalname;
        if (!modal_name) {
            return;
        }
        var _set = {};
        _set['active_' + modal_name] = true;
        this.setData(_set);
        this.animation = this.animation ? this.animation : swan.createAnimation({
            duration: 400,
            timingFunction: 'ease',
        });
        this.animation.opacity(1).step();
        this.setData({modal_animation_data: this.animation.export()});
    },
    evt_payappchange: function (e) {
        var payapp_id = e.currentTarget.dataset.appid;
        swan.showNavigationBarLoading();
        var oid = this.data.order.presell_id;
        this.onLoad({
            'order_id': oid,
            'flow_success': this.data.flow_success,
            'payapp_id': payapp_id,
            'type': this.data.type
        });
        var _this = this;
        setTimeout(function () {
            _this.evt_tapmodal({
                target: {
                    dataset: {
                        modalname: 'payapp_panel'
                    }
                }
            });
        }, 300);

    },
    evt_alipayqr:function(){
        //alipay_qr_pay who care
        swan.navigateTo({
            url:'/pages/order/alipayqr/payment?order_id='+this.data.order.order_id
        })
    },
    evt_dopayment: function (e) {
        var payapp = this.data.selected_payapp;
        switch (payapp.app_id) {
            case 'wxpayinwxapp':
                wxpay.call(this);
                break;
            case 'balance':
                swan.redirectTo({
                    url: '/pages/ubalance/pay?order_id=' + this.data.order.order_id
                });
                break;
            case 'alipayqr':
                  this.evt_alipayqr(); 
                break;
        }
    },
    onLoad: function (options) {
        console.info(options)
        var _this = this;
        _this.setData({
            themecolor: app.globalData.themecolor
        })
        var order_id = options.order_id;
        var type = '', act_url = '';
        if (options.type != undefined) {
            act_url = config.BASE_URL + '/m/pslcheckout-payment-' + order_id + '-' + (options.flow_success ? 1 : 0) + '-' + options.type;
        } else {
            act_url = config.BASE_URL + '/m/pslcheckout-payment-' + order_id + '-' + (options.flow_success ? 1 : 0);
        }


        if (options.payapp_id) {
            act_url += '-' + options.payapp_id
        }
        util.checkMember.call(this, function () {
            console.info(act_url)
            util.wxRequest({
                url: act_url + '.html',
                success: function (res) {
                    swan.hideNavigationBarLoading();
                    if (res.data.error) {
                        swan.showModal({
                            title: '错误',
                            content: res.data.error || ''
                        });
                    } else {
                        if (res.data.success && res.data.redirect && res.data.redirect.match(/pslmember-orders_list/)) {
                            //已支付订单
                            if (_this.data.type == 'deposit_price') {
                                swan.showModal({
                                    title: '支付成功',
                                    content: "您已支付订金成功,可前往我的预售查看预售单据",
                                    showCancel: true,
                                    cancelText: '我的预售',
                                    cancelColor: '#000000',
                                    confirmText: '确定',
                                    confirmColor: '#0BBD09',
                                    success: function (res) {
                                        if (res.confirm) {
                                            swan.switchTab({
                                                url: "/pages/index/index",
                                            });
                                        }
                                        if (res.cancel) {
                                            swan.redirectTo({
                                                url: "/pages/member/presellingorder/index?order_type=all",
                                            });
                                        }
                                    }
                                });
                            }
                            if (_this.data.type == 'balance_payment') {
                                swan.showModal({
                                    title: '支付成功',
                                    content: "您已成功支付尾款",
                                    showCancel: true,
                                    cancelText: '订单详情',
                                    cancelColor: '#000000',
                                    confirmText: '确定',
                                    confirmColor: '#0BBD09',
                                    success: function (res) {
                                        if (res.confirm) {
                                            swan.switchTab({
                                                url: "/pages/index/index",
                                            });
                                        }
                                        if (res.cancel) {
                                            swan.redirectTo({
                                                url: "/pages/member/order/index/index",
                                            });
                                        }
                                    }
                                });
                            }
                            return;
                        }
                        for (var i in res.data.payapps) {
                            if (res.data.payapps[i].app_id == res.data.selected_payapp.app_id) {
                                res.data.payapps[i]['selected'] = 'true';
                            }
                        }
                        if (res.data.order.consignee && res.data.order.consignee.area) {
                            res.data.order.consignee.area = util.formatArea(res.data.order.consignee.area);
                        }
                        _this.setData(res.data);

                    }
                }
            });
        });
    },

})
