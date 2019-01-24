//礼品卡首页
const config = require('../../config/config.js');
const util = require('../../utils/util.js');

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
        'crecord_id': pagedata.crecord.crecord_id,
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
    _return['payapp_id'] = 'giftcard';
    return _return;

}
Page({
    data: {

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
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    win_height: res.windowHeight,
                    win_width: res.windowWidth
                });
            }
        });
        swan.setNavigationBarTitle({
            title: '使用礼品卡兑换'
        });
    },
    onLoad: function(options) {
        var _this = this;
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/gcrecord-exchange-' + options.crecord_id + '.html',
                success: function(res) {
                    var pagedata = res.data;
                    _this.setData(pagedata);
                },
                fail: function(re) {
                    console.info(re);
                },
                complete: function(e) {
                    // swan.hideToast();
                    //swan.hideNavigationBarLoading();
                    swan.stopPullDownRefresh();
                    _this.setData({
                        hideLoading: true
                    });

                }
            });
        });
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
            url: config.BASE_URL + '/m/gcrecord-crate_order.html',
            data: submit_data,
            method: 'POST',
            success: function(res) {
                if (res.data.error) {
                    swan.hideToast();
                    swan.showModal({
                        title: '礼品卡使用失败',
                        content: res.data.error || '',
                        showCancel: false
                    });
                } else {
                    var new_order = res.data.data;
                    var order_id = new_order['order_id'];
                    swan.showModal({
                        title: '礼品卡使用成功',
                        content: '成功使用礼品卡生成订单',
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                swan.reLaunch({
                                    url: '/pages/member/index',
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
            },
            complete: function() {
                swan.hideToast();
            }
        });
    },
    load_image_l: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this, image_id, 'l');
    },
    load_image_m: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this, image_id, 'm');
    },
    load_image_s: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this, image_id, 's');
    },
    evt_gohome: function(e) {
        swan.reLaunch({
            url: '/pages/index/index'
        });
    }
});
