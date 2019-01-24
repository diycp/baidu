//礼品卡首页
const config = require('../../config/config.js');
const util = require('../../utils/util.js');


Page({
    data: {

    },
    onPullDownRefresh: function() {
        this.onLoad();
    },
    evt_scrolltolower: function() {

    },
    onReady: function() {
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    win_width:res.windowWidth,
                    win_height:res.windowHeight
                });
            }
        });
        swan.setNavigationBarTitle({
            title:'礼品卡'
        });
    },
    onLoad: function(options) {
        var _this = this;
        util.wxRequest({
            url: config.BASE_URL + '/m/gcindex.html',
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
    },
    onShareAppMessage: function() {
        var the_path = '/pages/giftcard/index';
        the_path = util.merchantShare(the_path);
        return {
            title: '礼品卡',
            path: the_path
        };
    },
    load_image_l: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this,image_id,'l');
    },
    load_image_m: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this,image_id,'m');
    }
});
