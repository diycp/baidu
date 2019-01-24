const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const timeago = require('../../utils/timeago.js');
// var md5 = require('../../../../utils/md5.js');
var current_page = 1;
var loading_more = false;
var load_list = function(user_id, page) {
    loading_more = true;
    var _this = this;
    var page = page ? page : 1;
    var timeago_ins = timeago();
    util.wxRequest({
        url: config.BASE_URL + '/m/communityblog-user-' + user_id + '-' + page + '.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata && newdata.blog_data) {
                if(newdata.blog_data.blog_list){
                    for (let i = 0; i < newdata.blog_data.blog_list.length; i++) {
                        newdata.blog_data.blog_list[i].timeago = timeago_ins.format(parseInt(newdata.blog_data.blog_list[i].createtime)*1000);
                    }
                }
                if (_thisdata.blog_data && _thisdata.blog_data.blog_list && page > 1) {
                    newdata.blog_data.blog_list = _thisdata.blog_data.blog_list.concat(newdata.blog_data.blog_list);
                    newdata.blog_data.media_audio = newdata.blog_data.media_audio || {};
                    Object.assign(newdata.blog_data.media_audio, _thisdata.blog_data.media_audio);
                    newdata.blog_data.media_images = newdata.blog_data.media_images || {};
                    Object.assign(newdata.blog_data.media_images, _thisdata.blog_data.media_images);
                    newdata.blog_data.media_video = newdata.blog_data.media_video || {};
                    Object.assign(newdata.blog_data.media_video, _thisdata.blog_data.media_video);
                    newdata.blog_data.author_list = newdata.blog_data.author_list || {};
                    Object.assign(newdata.blog_data.author_list, _thisdata.blog_data.author_list);
                }
                if (!newdata.blog_data.blog_list || !newdata.blog_data.blog_list.length) {
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
const load_my_map = function() {
    var _this = this;
    util.wxRequest({
        url: config.BASE_URL + '/m/communityblog-my_follow_map.html',
        success: function(res) {
            _this.setData(res.data);

                util.wxRequest({
                    url: config.BASE_URL + '/m/communityrelation-my_relation_map.html',
                    success: function(res) {
                        _this.setData(res.data);
                    }

                });
        }
    });
}

Page(Object.assign({
    data: {
        audio_playing: false,
        hideLoading: false,
        in_user_page: true
    },
    onHide: function() {
        this.setData({
            current_play_video_id: false
        });
    },
    onPullDownRefresh: function() {
        if (!this.data.member) return;
        current_page = 1;
        this.onLoad({user_id:this.data.user_id});
    },
    onReachBottom: function() {
        if (!this.data.member) return;
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    onReady: function() {
        var _this = this;

        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    media_image_size: (res.windowWidth - 21) / 4 - 4,
                    win_height: res.windowHeight,
                    win_width: res.windowWidth
                });
            }
        });
    },
    onLoad: function(options) {
        var _this = this;
        var user_id = options.user_id;
        if (!user_id) {
            swan.navigateBack();
        }
        this.setData({
            user_id: user_id
        });
        util.checkMember.call(this, function(re) {
            load_list.apply(_this, [user_id, 1]);
            load_my_map.call(_this);
        });
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'm');
    },

},require('_require_evt.js')));
