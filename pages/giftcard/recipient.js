//获赠礼品卡
const config = require('../../config/config.js');
const util = require('../../utils/util.js');
Page({
    data: {
        images:{}
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
            title: '获赠礼品卡'
        });
    },
    onLoad: function(options) {
        var _this = this;
        if (!options.token) {
            return swan.showModal({
                content: '获赠礼品卡失败',
                showCancel: false,
                success: function(re) {
                    if (re.confirm) {
                        swan.navigateBack();
                    }
                }
            });
        }
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/gcrecipient.html',
                method: 'POST',
                data: {
                    recipient_token: options.token
                },
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
    load_image_xs: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this, image_id, 'xs');
    },
    evt_godetail: function(e) {
        let crecord_id = this.data.crecord.crecord_id;
        swan.switchTab({
            url: '/pages/member/index',
            success: function() {
                swan.navigateTo({
                    url: '/pages/giftcard/crecord/detail?crecord_id=' + crecord_id
                });
            }
        });
    },
    evt_gohome: function(e) {
        swan.reLaunch({
            url: '/pages/index/index'
        });
    }
});
