const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
// var QRcode = require('../../../../utils/qrcode.js');
Page({
    data: {},
    onReady: function() {
        swan.setNavigationBarTitle({
            title: "加入组织"
        });
    },
    onLoad: function(options) {
        var _this = this;
        var relation_encode = options.relation_encode;
        if (!relation_encode) {
            this.setData({
                error: '并未被邀请'
            });
            return;
        }
        this.setData({
            relation_encode: relation_encode
        });
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/cdspassport-bind_relation.html',
                method: 'POST',
                data: {
                    relation_encode: relation_encode
                },
                success: function(res) {
                    var pagedata = res.data;
                    _this.setData(pagedata);
                },
                complete: function() {
                    //swan.hideNavigationBarLoading();
                    //swan.stopPullDownRefresh();
                    _this.setData({
                        hideLoading: true
                    });
                }
            });
        });

    },
    evt_confirm: function(e) {
        var _this = this;
        if (!this.data.relation_encode) {
            swan.showModal({
                title: '加入失败',
                content: '错误的邀请数据',
                showCancel: false
            });
            return;
        }
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/cdspassport-bind_relation-conform.html',
                method: 'POST',
                data: {
                    relation_encode: _this.data.relation_encode
                },
                success: function(res) {
                    var pagedata = res.data;
                    if (pagedata.success) {
                        return swan.showModal({
                            title: '加入成功',
                            content: '成功加入“' + _this.data.biz.name + '”',
                            showCancel: false,
                            success: function(res) {
                                if (res.confirm) {
                                    swan.redirectTo({
                                        url: '/pages/oshop/my/index'
                                    });
                                }
                            }
                        });
                    } else {
                        swan.showModal({
                            title: '加入失败',
                            content: (pagedata.error || '错误的邀请数据'),
                            showCancel: false
                        });
                    }
                },
                complete: function() {

                }
            });
        });
    }
});
