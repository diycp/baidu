//文章详情
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
// const WxParse = require('../../../utils/wxParse/wxParse.js');
// const dateFormat = require('../../../utils/dateformat.js');
Page({
    data: {

    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title:'资讯'
        });
    },
    onLoad: function(options) {
        var _this = this;
        var article_id = options.article_id;
        this.setData({
            article_id:article_id,
            web_url:config.BASE_URL + '/m/p-' + article_id + '.html'
        });
    },
    onShareAppMessage: function() {
        var the_path = '/pages/article/detail/detail?article_id=' + this.data.article_id;
        the_path = util.merchantShare(the_path);
        return {
            title: this.data.title,
            path: the_path
        };
    },
    evt_gohome:function(){
        swan.switchTab({
            url:'/pages/article/index'
        });
    }
});
