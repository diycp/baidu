const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const timeago = require('../../utils/timeago.js');
var current_page = 1;
var loading_more = false;
var timeago_ins = timeago();
var load_list = function(blog_id,page) {
    loading_more = true;
    var _this = this;
    var page = page ? page : 1;

    util.wxRequest({
        url: config.BASE_URL + '/m/communityreward-list_for_blog-'+blog_id+'-' + page + '.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata && newdata.reward_data) {

                for (let i = 0; i < newdata.reward_data.length; i++) {
                    newdata.reward_data[i].timeago = timeago_ins.format(parseInt(newdata.reward_data[i].createtime)*1000);
                }

                if (_thisdata.reward_data && _thisdata.reward_data && page > 1) {
                    newdata.reward_data = _thisdata.reward_data.concat(newdata.reward_data);
                    Object.assign(newdata.reward_user_data, _thisdata.reward_user_data);
                }
                if (!newdata.reward_data || !newdata.reward_data.length) {
                    newdata.empty_list = 'YES';
                } else {
                    newdata.empty_list = 'NO';
                }
                _this.setData(newdata);
            }
        },
        complete: function() {
            swan.stopPullDownRefresh();
            _this.setData({
                hideLoading: true
            });
            loading_more = false;
        }
    });
};
Page({
    data: {

    },
    onShow:function(){

    },
    onHide: function() {

    },
    onPullDownRefresh: function() {
        if(!this.data.reward_data)return swan.stopPullDownRefresh();
        load_list.apply(this,[this.data.onload_options.blog_id,current_page = 1]);
    },
    onReachBottom: function() {
        if(!this.data.reward_data)return;
        if (loading_more || this.data.reward_pager.total == this.data.reward_pager.current) {
            return;
        }
        current_page+=1;
        load_list.apply(this,[this.data.onload_options.blog_id,current_page]);
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '打赏记录'
        });
        // swan.getSystemInfo({
        //     success: function(res) {
        //         _this.setData({
        //             win_height: res.windowHeight,
        //             win_width: res.windowWidth,
        //             canvas_height:res.windowWidth*0.15
        //         });
        //         var ctx = swan.createCanvasContext('top_canvas_wrap');
        //         ctx.arc(res.windowWidth/2,-res.windowWidth+res.windowWidth*0.15 , res.windowWidth, 0, 2 * Math.PI);
        //         ctx.setFillStyle('#E64340');
        //         ctx.fill();
        //         ctx.draw();
        //     }
        // });
    },
    onLoad: function(options) {
        var _this = this;
        var blog_id = options.blog_id;
        this.setData({
            onload_options:options
        });
        util.checkMember.call(this, function(re) {
            load_list.apply(_this,[blog_id,current_page])
        });
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 's');
    },
    evt_gotoback:function(e){
        console.info(e);
        swan.navigateBack();
    },

});
