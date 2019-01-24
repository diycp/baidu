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
    var order_id = pagedata.order.gb_id;
    var reqUrl = config.BASE_URL + '/m/gbcheckout-dopayment-' + order_id + '.html?openid=' + pagedata.member.openid;
    var page = "/pages/member/gborder/detail/detail?order_id=" + order_id;
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
                    swan.showToast({
                        'icon': 'success',
                        'title': '支付成功',
                        'duration': 1500
                    });
                    //跳转到拼单成功的页面
                    swan.redirectTo({
                      url: '/pages/groupbooking/payment/paysuccess/paysuccess?activity_id=' + pagedata.activity_id + '&product_id=' + pagedata.product_id + '&imgsrc=' + pagedata.imgsrc
                    });
                    _this.onLoad({
                        'order_id': order_id
                    });
                    /**
                     * 模板消息发送
                     */
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
    data: {
      activity_id: '',
      product_id: '',
      imgsrc:'',
    },
    onReady: function () {
        swan.setNavigationBarTitle({
            title: '团单支付'
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
        var oid = this.data.order.gb_id;
        this.onLoad({
            'order_id': oid,
            'flow_success': this.data.flow_success,
            'payapp_id': payapp_id,
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
          url: '/pages/order/alipayqr/payment?order_id=' + this.data.order.order_id + '&from=gb' + '&activity_id=' + this.data.activity_id + '&product_id=' + this.data.product_id + '&imgsrc=' + this.data.imgsrc
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
                  url: '/pages/ubalance/pay?order_id=' + this.data.order.gb_id + '&from=gb' + '&activity_id=' + this.data.activity_id + '&product_id=' + this.data.product_id + '&imgsrc=' + this.data.imgsrc
                });
                break;
            case 'alipayqr':
                  this.evt_alipayqr(); 
                break;
        }
    },
    evt_orderdetail: function (e) {
        var order_id = e.currentTarget.dataset.orderid;
        var redirectUrl = '/pages/member/gborder/detail/detail?order_id=' + order_id;
        swan.redirectTo({
            url: redirectUrl
        });
    },
    evt_share:function(e){
      var url = e.currentTarget.dataset.url;
      swan.redirectTo({
        url: url
      });
    },
    onLoad: function (options) {
        this.setData({
          activity_id: options.activity_id,
          product_id: options.product_id,
          imgsrc:options.imgsrc,
        });

        var _this = this;
        _this.setData({
            themecolor: app.globalData.themecolor
        })
        var order_id = options.order_id;
        var act_url = config.BASE_URL + '/m/gbcheckout-payment-' + order_id + '-' + (options.flow_success ? 1 : 0);

        if (options.payapp_id) {
            act_url += '-' + options.payapp_id
        }
        util.checkMember.call(this, function () {
            console.info(act_url)
            util.wxRequest({
                url: act_url + '.html',
                success: function (res) {
                    res.data.order.consignee.area = util.formatArea(res.data.order.consignee.area);
                    swan.hideNavigationBarLoading();
                    if (res.data.error) {
                        swan.showModal({
                            title: '错误',
                            content: res.data.error || ''
                        });
                    } else {
                        if (res.data.success && res.data.redirect && res.data.redirect.match(/gbmember-orders_list/)) {
                            //已支付团单
                            swan.showModal({
                                title: '支付成功',
                                content: "您已支付成功,可前往我的拼团查看团单单据",
                                showCancel: true,
                                cancelText: "我的团单",
                                confirmText: "确定",
                                confirmColor: "#25C423",
                                success: function (res) {
                                    if (res.confirm) {
                                        swan.switchTab({
                                            url: '/pages/index/index'
                                        })
                                    }
                                    if (res.cancel) {
                                        swan.redirectTo({
                                            url: '/pages/member/gborder/detail/detail?is_gb=true&order_id=' + order_id
                                        })
                                    }
                                }
                            });
                            return;
                        }
                        for (var i in res.data.payapps) {
                            if (res.data.payapps[i].app_id == res.data.selected_payapp.app_id) {
                                res.data.payapps[i]['selected'] = 'true';
                            }
                        }
                        _this.setData(res.data);

                    }
                }
            });
        });
    },

})
