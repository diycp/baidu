//checkout.js
//尾款结算页
const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const strip_tags = require('../../../../utils/striptags.js');
const dateFormat = require('../../../../utils/dateformat.js');
const app = getApp();

var update_checkout = function (op) {
    var _this = this;
    var reqUrl = '', addr_id = '', dly_id = '', pay_id = '';
    //if (_this.data.member_addrs != undefined) {
    for (var i in _this.data.member_addrs) {
        if (_this.data.member_addrs[i].selected) {
            addr_id = _this.data.member_addrs[i]['addr_id'];
            break;
        }
    }
    //}

    if (_this.data.selecteddly != undefined) {
        dly_id = _this.data.selecteddly.dt_id;
    } else {
        dly_id = '';
    }
    if (_this.data.selectedpay != undefined) {
        pay_id = _this.data.selectedpay.app_id;
    } else {
        pay_id = '';
    }
    reqUrl = config.BASE_URL + '/m/pslcheckout-balance_index-' + op.order_id + '.html?addr_id=' + addr_id + '&dlytype_id=' + dly_id + '&payapp_id=' + pay_id;

    util.wxRequest({
        url: reqUrl,
        success: function (res) {
            var pagedata = res.data;
            for (var i in pagedata.member_addrs) {
                pagedata.member_addrs[i]['area_format'] = util.formatArea(pagedata.member_addrs[i]['area']);
            }
            for (var k in pagedata.dlytypes) {
                if (pagedata.dlytypes[k].selected == "true") {
                    pagedata['selecteddly'] = pagedata.dlytypes[k]
                    // _this.setData({
                    //     selecteddly:pagedata.dlytypes[k],
                    // })
                }
            }
            for (var key in pagedata.paymentapps) {
                if (pagedata.paymentapps[key].selected == "true") {
                    pagedata['selectedpay'] = pagedata.paymentapps[key]
                    // _this.setData({
                    //     selectedpay:pagedata.paymentapps[key],
                    // })
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
        'invoice_title': pagedata.order.invoice_title,
        'memo': pagedata.order.memo,
        'cart_md5': pagedata.activity_result.cart_md5,
    };
    _return['need_invoice'] = (_return['invoice_title'] && _return['invoice_title'] != '');
    _return['dlytype_id'] = pagedata.selecteddly.dt_id;
    _return['payapp_id'] = pagedata.selectedpay.app_id;
    for (var i in pagedata.member_addrs) {
        if (pagedata.member_addrs[i].selected) {
            _return['addr_id'] = pagedata.member_addrs[i]['addr_id'];
            break;
        }
    }
    return _return;

}

var update_maddr = function (addr_selected) {
    var _this = this;
    for (var k in _this.data.member_addrs) {

        if (_this.data.member_addrs[k].addr_id == addr_selected.addr_id) {
            _this.data.member_addrs[k].selected = 'true';
        } else {
            delete(_this.data.member_addrs[k].selected);
        }
        _this.data.member_addrs[k].area_format = util.formatArea(_this.data.member_addrs[k].area);
    }
    _this.setData({
        'member_addrs': _this.data.member_addrs
    });
};

Page({
    data: {
        'quantityVal': 1,
        'memo': '',
        'invoice_title': '',
        img_url:config.BASE_HOST
    },
    onReady: function () {
        swan.setNavigationBarTitle({
            title: '确认订单'
        });
    },
    onLoad: function (options) {
        var _this = this;
        util.checkMember.call(this, function () {
            update_checkout.call(_this, options);
        });

    },
    onShow: function () {
        //地址变更处理
        var _this = this;
        var addr_selected = swan.getStorageSync('member_addr_selected');
        if (!addr_selected || !addr_selected.addr_id) {
            return;
        }
        if (addr_selected.addr_id)
            util.wxRequest({
                url: config.BASE_URL + '/m/my-receiver-edit-' + addr_selected.addr_id + '.html',
                success: function (res) {
                    if (!res.data.maddr) {
                        return;
                        //_this.setData({member_addrs:false});
                    }
                    _this.data.member_addrs = _this.data.member_addrs || {};
                    _this.data.member_addrs[addr_selected.addr_id] = res.data.maddr;
                    update_maddr.call(_this, addr_selected);
                }
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
    evt_dlytypechange: function (e) {
        var _this = this;
        _this.setData({
            selecteddly: e.currentTarget.dataset.dtid
        })
        var newdata = _this.data.dlytypes;
        for (var k in newdata) {
            if (newdata[k].dt_id != _this.data.selecteddly.dt_id) {
                newdata[k].selected = "false";
            } else {
                newdata[k].selected = "true";
            }
        }
        _this.setData({
            "dlytypes": newdata,
        })
        _this.evt_tapmodal({
            target: {
                dataset: {
                    modalname: 'dlytype_panel'
                }
            }
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
    evt_setpagedata: function (e) {
        var _set = {};
        _set[e.currentTarget.dataset.key] = e.detail.value;
        this.setData(_set);
    },
    evt_submit_order: function (e) {
        console.log(this.data);
        var pagedata = this.data;
        var submit_data = get_submit_data(pagedata);
        var form_id = e.detail.formId; //模板消息用
        swan.showToast({
            title: '正在提交',
            icon: 'loading',
            mask: true,
            duration: 2000
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/pslcheckout-create_balance.html',
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
                        "page": "/pages/member/gborder/detail/detail?order_id=" + order_id,
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
                        url: '/pages/preselling/payment/payment?order_id=' + order_id + '&flow_success=1&type=balance_payment'
                    });

                }
            }
        });
    },
});
