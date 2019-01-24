const util = require('../../../utils/util.js');
const config = require('../../../config/config.js');
const app = getApp();

Page({
    data: {
        slide_images: [],
        'quantityVal':1,
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '预售规则'
        });
        // swan.getSystemInfo({
        //     success: function(res) {
        //         _this.setData({
        //             sv_height: res.windowHeight - 45,
        //             slider_height_style:'height:'+res.windowWidth+'px'
        //         });
        //     }
        // });
    },
    onLoad: function(options) {
        var _this = this;
        util.wxRequest({
            url: config.BASE_URL + '/m/pslitem-' + options.activity_id +'-'+options.product_id+ '.html',
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
                //console.info(re);
            },
        });
    },
})
