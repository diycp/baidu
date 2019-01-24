const config = require('../../config/config.js');
const util = require('../../utils/util.js');
// var md5 = require('../../../../utils/md5.js');
var current_page = 1;
var loading_more = false;

const load_list = function(page) {
    loading_more = true;
    var _this = this;
    var page = page ? page : 1;
    util.wxRequest({
        url: config.BASE_URL + '/m/communityblog-' + page + '-' + _this.data.list_type + '.html',
        method: 'POST',
        data: _this.data.list_filter,
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (!newdata.blog_data && page == 1) {
                newdata.empty_list = 'YES';
                _this.setData(newdata);
            }
            if (newdata && newdata.blog_data) {
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
        current_play_video_id: false,
        audio_playing: false,
        hideLoading: false,
        my_follow_map: {},
        show_comment_bar: false,
        list_type: 'normal', //relation,local
        list_filter: {}
    },
    onShareAppMessage: function() {
        var the_path = '/pages/community/index';
        the_path = util.merchantShare(the_path);
        return {
            title: '社区动态',
            path: the_path
        };
    },
    onShow: function() {
        if (this.data.hideLoading) {
            load_list.call(this, current_page);
        }
    },
    onPullDownRefresh: function() {
        if (!this.data.member) return;
        load_list.call(this, current_page = 1);
        load_my_map.call(this);
    },
    onReachBottom: function() {
        if (!this.data.member) return;
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    onHide: function() {
        this.setData({
            current_play_video_id: false
        });
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '社区'
        });

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
        _this.setData({
            hideLoading: false
        });
        util.checkMember.call(this, function(re) {
            if (_this.data.list_type == 'local') {
                //位置回掉
                swan.getLocation({
                    type: 'gcj02',
                    success: function(re) {
                        _this.setData({
                            list_filter: {
                                'lnandla': [re.longitude, re.latitude].join('|')
                            }
                        });
                        load_list.call(_this, 1);
                    }
                });
            } else {
                if (_this.data.list_type == 'normal') {
                    _this.setData({
                        list_filter: {}
                    });
                }
                load_list.call(_this, 1);
            }
            load_my_map.call(_this);
        });
    },
    evt_changelisttype: function(e) {
        let list_type = e.currentTarget.dataset.listtype;
        this.setData({
            list_type: list_type
        });
        this.onLoad();
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'm');
    }
},require('_require_evt.js')));
