//index.js
//获取应用实例
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
//const WxParse = require('../../../utils/wxParse/wxParse.js');
Page({
    onReady: function() {

    },
    onShow: function() {

    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
            web_url:config.BASE_URL + '/m/store-desc-' + options.store_id + '.html'
        });
        //
        // util.wxRequest({
        //     url: config.BASE_URL + '/m/store-desc-' + options.store_id + '.html',
        //     success: function(res) {
        //         swan.setNavigationBarTitle({
        //             title: res.data.store.name
        //         });
        //         WxParse.wxParse('store_desc', 'html', res.data.store.desc, _this, 0);
        //         _this.setData(res.data);
        //     },
        //     fail: function(re) {
        //         console.info(re);
        //     }
        // });
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'm');
    }
});
