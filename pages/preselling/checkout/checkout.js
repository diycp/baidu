//checkout.js
//订金结算页
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const strip_tags = require('../../../utils/striptags.js');
const dateFormat = require('../../../utils/dateformat.js');
const app = getApp();
var update_checkout = function (op) {
    var _this = this;
    var q = '', reqUrl = '', pay_id = '';
    if (op.quantityVal != undefined) {
        q = op.quantityVal;
    } else {
        q = 1;
    }

    if (_this.data.selectedpay != undefined) {
        pay_id = _this.data.selectedpay.app_id;
    }
    reqUrl = config.BASE_URL + '/m/pslcheckout-' + op.activity_id + '-' + op.product_id + '-' + q + '.html';
    util.wxRequest({
        url: reqUrl,
        success: function (res) {
            var pagedata = res.data;
            _this.setData({
                quantityVal: parseInt(res.data.activity_result.quantity)
            })
            for (var key in pagedata.paymentapps) {
                if (pagedata.paymentapps[key].selected == "true") {
                    pagedata['selectedpay'] = pagedata.paymentapps[key]
                }
            }
            _this.setData(pagedata);
        },
        fail: function (re) {
            console.info(re);
        },
        complete: function (e) {
            _this.setData({
                hideLoading: true
            });
        }
    });
}
/**
 * 获得订单提交需要的数据
 */
var get_submit_data = function (pagedata) {
    var _return = {
        'cart_md5': pagedata.activity_result.cart_md5,
    };
    _return['quantity'] = pagedata.quantityVal;
    _return['payapp_id'] = pagedata.selectedpay.app_id;
    var _vshop_id = swan.getStorageSync('_vshop_id');
    if (_vshop_id) {
        //微店关系
        _return['_vshop_id'] = _vshop_id;
    }
    if (swan.getStorageSync('_qrcode')) {
        //O2O分销,门店扫码关系
        _return['qrcode'] = swan.getStorageSync('_qrcode');
    }
    return _return;
}

Page({
    data: {
        'quantityVal': 1,
        'memo': '',
        'invoice_title': ''
    },
    onReady: function () {
        swan.setNavigationBarTitle({
            title: '确认预售单'
        });
    },
    onLoad: function (options) {
        var _this = this;
        _this.setData({
            themecolor: app.globalData.themecolor
        })
        util.checkMember.call(this, function () {
            update_checkout.call(_this, options);
        });

    },

    load_image: function (e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'xs');
    },
    evt_tapmodal: function (e) {
        var modal_name = e.target.dataset.modalname;
        if (!modal_name) {
            return;
        }
        var _set = {};
        _set['active_' + modal_name] = false;
        this.setData(_set);
        this.animation.opacity(0).step();
        this.setData({
            modal_animation_data: this.animation.export()
        });
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
        this.setData({
            modal_animation_data: this.animation.export()
        });
    },
    evt_payappchange: function (e) {
        var _this = this;
        _this.setData({
            selectedpay: e.currentTarget.dataset.appid
        });
        var newdata = _this.data.paymentapps;
        for (var k in newdata) {
            if (newdata[k].app_id != _this.data.selectedpay.app_id) {
                newdata[k].selected = "false";

            } else {
                newdata[k].selected = "true";
            }
        }
        _this.setData({
            "paymentapps": newdata,
        })
        _this.evt_tapmodal({
            target: {
                dataset: {
                    modalname: 'payapp_panel'
                }
            }
        });
    },

    evt_submit_order: function (e) {
        console.log(this.data);
        var pagedata = this.data;
        var submit_data = get_submit_data(pagedata);
        var form_id = e.detail.formId; //模板消息用
        var _this = this;
        swan.showToast({
            title: '正在提交',
            icon: 'loading',
            mask: true,
            duration: 2000
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/pslcheckout-create.html',
            data: submit_data,
            method: 'POST',
            success: function (res) {
                if (res.data.error) {
                    swan.hideToast();
                    swan.showModal({
                        title: '订单提交失败',
                        content: res.data.error || ''
                    });
                } else {
                    swan.showToast({
                        title: '提交成功',
                        icon: 'success',
                        duration: 500
                    });
                    let order_id = res.data.redirect.match(/payment-([\d]+)/);
                    if (order_id) {
                        order_id = order_id[1];
                    }
                    /**
                     * 模板消息发送
                     */
                    var action_url = false;
                    var msgCode = '';
                    var msgType = 'AT0002';
                    var msgId = config.TPLMSGID['AT0002'];
                    if (app.globalData.msg_templates && app.globalData.msg_templates.order_create_success) {
                        var action_url = config.BASE_URL + '/openapi/open_app/wx_send_message';
                        msgCode = 'order_create_success';
                        msgType = app.globalData.msg_templates.order_create_success.type;
                        msgId = app.globalData.msg_templates.order_create_success.template;
                    }
                    util.sendMsg({
                        "touser": pagedata.member.openid,
                        "action_url": action_url,
                        "msg_code": msgCode,
                        "msg_type": msgType, //订单创建成功消息模板(对应小程序平台模板类型ID)
                        "template_id": msgId,
                        "page": "/pages/member/presellingorder/detail/detail?order_id=" + order_id,
                        "form_id": form_id,
                        "order_id": order_id,
                        "data": {
                            "keyword1": {
                                "value": order_id
                                        //（订单号）交易单号
                            },
                            "keyword2": {
                                "value": pagedata.activity_result.order_total
                                        //（订单金额,含运费）购买价格
                            },
                            "keyword3": {
                                "value": dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
                                        //（订单创建时间）购买时间
                            },
                            "keyword4": {
                                "value": "<进入订单详情查看>"
                                        //（交易明细）物品名称
                            }
                        },
                        //"emphasis_keyword": "keyword1.DATA" //高亮
                    });

                    swan.redirectTo({
                        url: '/pages/preselling/payment/payment?order_id=' + order_id + '&flow_success=1&activity_id=' + _this.data.activity.activity_id
                    });

                }
            }
        });
    },
    tappqminus: function (e) {
        var _this = this;
        this.setData({
            quantityVal: this.data.quantityVal - 1
        });
        update_checkout.call(this, {
            activity_id: _this.data.activity.activity_id,
            product_id: _this.data.activity_result.product.product_id,
            quantityVal: _this.data.quantityVal
        })
    },
    tappqplus: function (e) {
        var _this = this;
        this.setData({
            quantityVal: this.data.quantityVal + 1
        });
        update_checkout.call(this, {
            activity_id: _this.data.activity.activity_id,
            product_id: _this.data.activity_result.product.product_id,
            quantityVal: _this.data.quantityVal
        })
    },
});
