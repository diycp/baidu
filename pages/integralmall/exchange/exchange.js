const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();

var update_maddr = function(addr_selected) {
    var _this = this;
    for (var k in _this.data.member_addrs) {

        if (_this.data.member_addrs[k].addr_id == addr_selected.addr_id) {
            _this.data.member_addrs[k].selected = 'true';
        } else {
            delete(_this.data.member_addrs[k].selected);
        }
        //_this.data.member_addrs[k].area_format = util.formatArea(_this.data.member_addrs[k].area);
    }
    _this.setData({
        'member_addrs': _this.data.member_addrs
    });
};
var get_submit_data = function(pagedata) {

    var _return = {
        'product_id': pagedata.options.product_id,
        'quantity': pagedata.options.quantity
    };
    for (var i in pagedata.member_addrs) {
        if (pagedata.member_addrs[i].selected) {
            _return['addr_id'] = pagedata.member_addrs[i]['addr_id'];
            break;
        }
    }
    for (var i in pagedata.dlytypes) {
        if (pagedata.dlytypes[i].selected) {
            _return['dlytype_id'] = pagedata.dlytypes[i]['dt_id'];
            break;
        }
    }
    _return['payapp_id'] = 'integraldeduction';
    return _return;

}
Page({
    data: {
        'active_integral_panel': false,
        'active_coupon_panel': false
    },
    onShow: function() {
        //地址变更处理
        var _this = this;
        var addr_selected = swan.getStorageSync('member_addr_selected');
        if (!addr_selected || !addr_selected.addr_id) {
            return;
        }
        if (addr_selected.addr_id)
            util.wxRequest({
                url: config.BASE_URL + '/m/my-receiver-edit-' + addr_selected.addr_id + '.html',
                success: function(res) {
                    if (!res.data.maddr) {
                        return _this.setData({
                            member_addrs: false
                        });
                    }
                    _this.data.member_addrs = _this.data.member_addrs || {};
                    _this.data.member_addrs[addr_selected.addr_id] = res.data.maddr;
                    update_maddr.call(_this, addr_selected);
                }
            });
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '确认积分兑换'
        });
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
          themecolor:app.globalData.themecolor
        })
        if (!options || !options.product_id || !options.quantity) {
            swan.showModal({
                title: '数据异常'
            });
            return;
        }
        var params = options.params || {};
        this.setData({
            "options": options
        });
        util.checkMember.call(this, function() {
            var action_url = config.BASE_URL + '/m/integralmallexchange-' + options.product_id + '-' + options.quantity + '.html';
            util.wxRequest({
                url: action_url,
                data: params,
                method: 'POST',
                success: function(res) {
                    var pagedata = res.data;
                    _this.setData(pagedata);
                },
                complete: function() {
                    _this.setData({
                        hideLoading: true
                    });
                },
                fail: function(re) {
                    console.info(re);
                },
            });
        });

    },
    evt_tapmodal: function(e) {
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
    evt_showmodal: function(e) {
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
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'xs');
    },
    evt_dlytypechange: function(e) {
        //this.data.options.params
        //this.onLoad();

    },
    evt_submit_order: function(e) {
        var pagedata = this.data;
        var submit_data = get_submit_data(pagedata);
        var form_id = e.detail.formId; //模板消息用
        swan.showToast({
            title: '正在提交',
            icon: 'loading',
            mask: true,
            duration: 5000
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/integralmallexchange-crate_order.html',
            data: submit_data,
            method: 'POST',
            success: function(res) {
                if (res.data.error) {
                    swan.hideToast();
                    swan.showModal({
                        title: '兑换失败',
                        content: res.data.error || ''
                    });
                } else {
                    var new_order = res.data.data;
                    var order_id = new_order['order_id'];
                    swan.showModal({
                        title: '兑换成功',
                        content: '成功兑换商品,消耗积分:' + new_order['score_u'],
                        cancelText: '查看订单',
                        success: function(res) {
                            if (res.confirm) {
                                swan.navigateBack();
                            } else {
                                swan.switchTab({
                                    url: '/pages/index/index',
                                    success: function() {
                                        swan.navigateTo({
                                            url: "/pages/member/order/detail/detail?order_id=" + order_id
                                        });
                                    }
                                });
                            }
                        }
                    });

                }
            },complete:function(){
                swan.hideToast();
            }
        });
    },
    evt_goto: function(e) {
        swan.switchTab({
            url: '/pages/index/index',
            success: function() {
                swan.navigateTo({
                    url: e.currentTarget.dataset.url
                });
            }
        });
    }
});
