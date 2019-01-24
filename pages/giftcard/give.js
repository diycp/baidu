//礼品卡首页
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
            title: '赠送礼品卡'
        });
    },
    onLoad: function(options) {
        var crecord_id = options.crecord_id;
        if (!crecord_id) {
            return swan.showModal({
                content: '未知礼品卡',
                showCancel: false,
                success: function(re) {
                    if (re.confirm) {
                        swan.navigateBack();
                    }
                }
            });
        };

        var _this = this;
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/gcgive-' + crecord_id + '.html',
                success: function(res) {
                    var pagedata = res.data;
                    if (pagedata.error) {
                        swan.showModal({
                            content: pagedata.error || '未知礼品卡',
                            showCancel: false,
                            success: function(re) {
                                if (re.confirm) {
                                    swan.navigateBack();
                                }
                            }
                        });
                        return;
                    }
                    pagedata.textarea_count = pagedata.crecord.card_memo.length;
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
    load_image_xs: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this, image_id, 'xs');
    },
    evt_textareainput: function(e) {
        this.setData({
            'textarea_count': e.detail.value.length,
            'memo':e.detail.value
        });
    },
    onShareAppMessage: function(options) {
        var _this = this;
        var share_path = '/pages/giftcard/recipient?token=' + _this.data.recipient_token;
        share_path = util.merchantShare(share_path);
        //console.log(share_path);
        var title = '礼品卡请查收！附言:'+(_this.data.memo||_this.data.crecord.card_memo);
        return {
            title: title,
            path: share_path,
            success: function(re) {
                //转发成功
                util.checkMember.call(this, function() {
                    if(!_this.data.memo || _this.data.memo==_this.data.crecord.card_memo){
                        return;
                    }
                    util.wxRequest({
                        url: config.BASE_URL + '/m/gcgive-update_memo-' + _this.data.crecord.crecord_id + '.html',
                        method:'POST',
                        data:{'memo':_this.data.memo},
                        success: function(res) {
                            console.info(res);
                        }
                    });
                });
                _this.setData({
                    'share_success':true
                });
            }
        };
    },
    evt_gohome: function(e) {
        swan.reLaunch({
            url: '/pages/index/index'
        });
    }
});
