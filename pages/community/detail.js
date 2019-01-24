const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const timeago = require('../../utils/timeago.js');
// var md5 = require('../../../../utils/md5.js');
var current_page = 1;
var loading_more = false;
const load_list = function(page, blog_id) {
    loading_more = true;
    var _this = this;
    var page = page ? page : 1;
    var timeago_ins = timeago();

    util.wxRequest({
        url: config.BASE_URL + '/m/communityblog-get_follow-' + blog_id + '-' + page + '.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata && newdata.blog_follow_data) {
                if (newdata.blog_follow_data.blog_list) {
                    for (let i = 0; i < newdata.blog_follow_data.blog_list.length; i++) {
                        newdata.blog_follow_data.blog_list[i].timeago = timeago_ins.format(parseInt(newdata.blog_follow_data.blog_list[i].createtime) * 1000);
                    }
                }
                if (_thisdata.blog_follow_data && _thisdata.blog_follow_data.blog_list && page > 1) {
                    newdata.blog_follow_data.blog_list = _thisdata.blog_follow_data.blog_list.concat(newdata.blog_follow_data.blog_list);
                    Object.assign(newdata.blog_follow_data.author_list, _thisdata.blog_follow_data.author_list);
                }
                if (!newdata.blog_follow_data.blog_list || !newdata.blog_follow_data.blog_list.length) {
                    newdata.empty_list = 'YES';
                } else {
                    newdata.empty_list = 'NO';
                }
                _this.setData(newdata);
            }
        },
        complete: function() {
            swan.stopPullDownRefresh();
            loading_more = false;
        }
    });
};
const load_reward = function(page,blog_id){
    var _this = this;
    util.wxRequest({
        url: config.BASE_URL + '/m/communityreward-list_for_blog-' + blog_id + '-' + page + '.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata && newdata.reward_data) {
                if (_thisdata.reward_data  && page > 1) {
                    newdata.reward_data = _thisdata.reward_data.concat(newdata.reward_data);
                    Object.assign(newdata.user_data, _thisdata.user_data);
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
            //swan.stopPullDownRefresh();
            //loading_more = false;
        }
    });
}
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

const followzan_func = function(blog_idx, unzan) {
    var _this = this;
    if (!_this.data.blog_follow_data || !_this.data.blog_follow_data.blog_list || !_this.data.blog_follow_data.blog_list.length) {
        return false;
    }
    var blog_id = _this.data.blog_follow_data.blog_list[blog_idx].blog_id;
    var exist_zan_count = _this.data.blog_follow_data.blog_list[blog_idx][unzan ? 'unzan_count' : 'zan_count'];
    if (!exist_zan_count) {
        exist_zan_count = 0;
    }
    if (!blog_id) return false;
    let _set = {};
    _set['blog_follow_data.blog_list[' + blog_idx + '].' + (unzan ? 'unzan_count' : 'zan_count')] = (parseInt(exist_zan_count) + 1);
    _set['my_follow_map._' + blog_id + '.' + (unzan ? 'unzan' : 'zan')] = 1;
    _this.setData(_set);
    // swan.showToast({
    //     icon:'loading'
    // });
    util.wxRequest({
        url: config.BASE_URL + '/m/communitypublish-' + (unzan ? 'unzan' : 'zan') + '-' + blog_id + '.html',
        success: function(res) {
            let resdata = res.data;
            if (resdata.success) {
                // swan.showToast({
                //     icon:'success'
                // });

            } else {
                swan.hideToast();
                console.error(res);
            }
        }
    });
}
Page(Object.assign({
    data: {
        current_play_video_id: false,
        audio_playing: false,
        hideLoading: false,
        my_follow_map: {},
        focus_comment_input: false,
        in_detail: true
    },
    onShow: function() {
        if (this.data.hideLoading) {
            let current_blog_id = this.data.blog_data.blog_list[0].blog_id;
            load_list.apply(this, [current_page, current_blog_id]);
            load_reward.apply(this,[1,current_blog_id]);
        }

    },
    onShareAppMessage: function() {
        let current_blog_id = this.data.blog_data.blog_list[0].blog_id;
        let the_path = '/pages/community/detail?blog_id=' + current_blog_id;
        the_path = util.merchantShare(the_path);
        return {
            title: this.data.blog_data.blog_list[0].title || this.data.blog_data.blog_list[0].content || '社区分享',
          path: the_path,
            success: function(e) {
                //转发计数
                util.wxRequest({
                    url: config.BASE_URL + '/m/communitypublish-share-' + current_blog_id + '.html',
                    success: function(res) {
                        console.info(res);
                    }
                });
            }
        };
    },
    onPullDownRefresh: function() {
        if (!this.data.member) return;
        let current_blog_id = this.data.blog_data.blog_list[0].blog_id;
        load_list.apply(this, [current_page = 1, current_blog_id]);
    },
    onReachBottom: function() {
        if (!this.data.member) return;
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        let current_blog_id = this.data.blog_data.blog_list[0].blog_id;
        load_list.apply(this, [current_page, current_blog_id]);
    },
    onHide: function() {
        this.setData({
            current_play_video_id: false
        });
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
        var blog_id = options.blog_id;
        util.checkMember.call(this, function(re) {
            util.wxRequest({
                url: config.BASE_URL + '/m/communityblog.html',
                method: 'POST',
                data: {
                    'filter[blog_id]': blog_id
                },
                success: function(res) {
                    let resdata = res.data;
                    swan.setNavigationBarTitle({
                        title: resdata.blog_data.blog_list[0].title || resdata.blog_data.blog_list[0].content || '详情'
                    });
                    let timeago_ins = timeago();
                    resdata.blog_data.blog_list[0].timeago = timeago_ins.format(parseInt(resdata.blog_data.blog_list[0].createtime) * 1000);
                    _this.setData(resdata);
                },
                complete: function() {
                    _this.setData({
                        hideLoading: true
                    });
                    load_list.apply(_this, [1, blog_id]);
                    load_reward.apply(_this,[1,blog_id]);
                    load_my_map.call(_this);
                }
            });

        });
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'm');
    },
    load_reward_image:function(e){
        util.loadImage(this, e.currentTarget.dataset.ident, 's' ,'reward_avatar_images');
    },
    evt_tapfollowzan: function(e) {
        //let blog_id = e.currentTarget.dataset.blogid;
        let blog_idx = e.currentTarget.dataset.blogidx;
        let iszan = e.currentTarget.dataset.iszan;
        if (iszan) return;
        console.info(e);
        //if(!blog_id)return;
        followzan_func.apply(this, [blog_idx]);
    },
    evt_tapfollowunzan: function(e) {
        //let blog_id = e.currentTarget.dataset.blogid;
        let blog_idx = e.currentTarget.dataset.blogidx;
        let isunzan = e.currentTarget.dataset.isunzan;
        if (isunzan) return;
        console.info(e);
        //if(!blog_id)return;
        followzan_func.apply(this, [blog_idx, 'reverse']);
    }
}, require('_require_evt.js'), {
    evt_tapcomment: function(e) {
        this.setData({
            focus_comment_input: true
        });
    },
    evt_comment_confirm: function(e) {
        let _this = this;
        let comment_val = e.detail.value;
        let blog_id = _this.data.blog_data.blog_list[0].blog_id;
        if (!blog_id) {
            return;
        }
        if (!comment_val || comment_val.trim().length < 3) {
            return swan.showModal({
                title: '发布评论失败',
                content: '请完善评论内容',
                success: function() {
                    _this.setData({
                        focus_comment_input: true
                    });
                }
            });
        }
        swan.showToast({
            icon: 'loading',
            title: '正在发布',
            mask: true,
            duration: 5000
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/communitypublish-comment-' + blog_id + '.html',
            method: 'POST',
            data: {
                'content': comment_val
            },
            success: function(res) {
                let resdata = res.data;
                if (resdata.success) {
                    swan.showToast({
                        icon: 'success',
                        title: '发布成功'
                    });
                    _this.onLoad.call(_this, {
                        blog_id: blog_id
                    });
                } else {
                    swan.hideToast();
                }
            },
            complete: function() {
                _this.setData({
                    focus_comment_input: false,
                    comment_input_val: ''
                });
            }
        });
        //console.info(comment_val);
    },
    evt_tapshare: function(e) {
        swan.showShareMenu({});
    }
}));
