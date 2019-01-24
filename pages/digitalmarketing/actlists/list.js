//gallery.js
//商品列表页
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();

Page({
    data: {
        type:{
            '1':'dzp',
            '2':'sgj',
            '3':'ggk',
            '4':'yyy',
        }
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '营销活动列表'
        });
    },
    onLoad: function(options) {
        var _this = this;
        util.wxRequest({
            url: config.BASE_URL+'/openapi/prize/actives',
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
    },
})
