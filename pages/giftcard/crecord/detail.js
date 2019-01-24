//礼品卡首页
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
Page({
    data: {

    },
    onPullDownRefresh: function() {
        this.onLoad(this.data.onloadoptions);
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
            title:'礼品卡详情'
        });
    },
    onLoad: function(options) {
        var _this = this;
        this.setData({
            onloadoptions:options
        });
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/gcrecord-detail-'+options.crecord_id+'.html',
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
        util.loadImage(this,image_id,'l');
    },
    load_image_m: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this,image_id,'m');
    },
    load_image_s: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this,image_id,'xs');
    },
    load_image_xs: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this,image_id,'xs');
    }
});
