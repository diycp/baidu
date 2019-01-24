const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const zan_func = function(blog_idx, unzan) {
    var _this = this;
    if (!_this.data.blog_data || !_this.data.blog_data.blog_list || !_this.data.blog_data.blog_list.length) {
        return false;
    }
    var blog_id = _this.data.blog_data.blog_list[blog_idx].blog_id;
    var exist_zan_count = _this.data.blog_data.blog_list[blog_idx][unzan ? 'unzan_count' : 'zan_count'];
    if (!exist_zan_count) {
        exist_zan_count = 0;
    }
    if (!blog_id) return false;
    let _set = {};
    _set['blog_data.blog_list[' + blog_idx + '].' + (unzan ? 'unzan_count' : 'zan_count')] = (parseInt(exist_zan_count) + 1);
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
                click_rate(blog_id);//点击量统计
            } else {
                swan.hideToast();
                console.error(res);
            }
        }
    });
};
const click_rate = function(blog_id){
    //点击量统计。
    util.wxRequest({
        url: config.BASE_URL + '/m/communityblog-click_rate-' + blog_id + '.html',
        success: function(res) {
            console.log(res);
        }
    });
};
var audio_playing_timer = 0;
const video_time_sign = {};

module.exports = {
    evt_previewimage: function(e) {
        var image_id = e.currentTarget.dataset.imageid;
        var blogid = e.currentTarget.dataset.blogid;
        var evt_idx = e.currentTarget.dataset.idx;
        var images = this.data.blog_data.media_images[blogid];
        click_rate(blogid);//点击量统计
        var image_ids = [];
         for (let i = 0; i < images.length; i++) {
             image_ids.push(images[i].image_id);
         }
        //console.info(image_ids);
        util.wxRequest({
            url: config.BASE_URL + '/openapi/storager/l',
            method: 'POST',
            data: {
                'images': image_ids
            },
            success: function(res) {
                let image_src_data = res.data.data;
                //console.info(image_src_data);
                let url_arr = [];
                for (let i = 0; i < image_src_data.length; i++) {
                    url_arr.push(util.fixImgUrl(image_src_data[i]));
                }

                swan.previewImage({
                    urls: url_arr,
                    current:url_arr[evt_idx]
                });
            }
        });

    },
    evt_audiocontrol: function(e) {
        var _this = this;
        var audio_file = e.currentTarget.dataset.audiosrc;
        var audio_id = e.currentTarget.dataset.audioid;
        var blog_id = e.currentTarget.dataset.blogid;
        var audio_duration = _this.data.blog_data.media_audio[blog_id].duration;
        //var audio_context = swan.createInnerAudioContext();
        if (!audio_file) {
            return;
        }
        this.setData({
            current_play_video_id: null
        });
        var _audio_play = function() {
            _this.setData({
                'audio_waiting': audio_id
            });
            swan.downloadFile({
                url: audio_file,
                success: function(res) {
                    swan.playVoice({
                        filePath: res.tempFilePath,
                        complete: function(res) {
                            console.info(res);
                        }
                    });
                    _this.setData({
                        'audio_playing': audio_id
                    });
                    audio_playing_timer = setInterval(function() {
                        _this.setData({
                            audio_play_time: ((_this.data.audio_play_time || 0) + 100)
                        });
                        if (!audio_duration) {
                            return clearInterval(audio_playing_timer);
                        }
                        if (_this.data.audio_play_time > audio_duration) {
                            clearInterval(audio_playing_timer);
                            swan.pauseVoice();
                            _this.setData({
                                'audio_playing': false,
                                'audio_play_time': 0
                            });
                        }
                    }, 100);
                },
                complete: function() {
                    _this.setData({
                        'audio_waiting': null
                    });
                    click_rate(blog_id);//点击量统计
                }
            });
        }
        if (this.data.audio_playing) {
            if (this.data.audio_playing == audio_id) {
                clearInterval(audio_playing_timer);
                swan.pauseVoice();
                this.setData({
                    'audio_playing': false,
                    'audio_play_time': 0
                });
            } else {
                _audio_play();
            }
        } else {
            _audio_play();
        }

    },
    evt_videoplay: function(e) {
        var target_video_id = e.currentTarget.dataset.videoid;
        var blog_id = e.currentTarget.dataset.blogid;
        var current_video_id = this.data.current_play_video_id;
        if (current_video_id == target_video_id) {
            return;
        }
        if (current_video_id) {
            var current_video_context = swan.createVideoContext('video_' + current_video_id);
            current_video_context.pause();
            current_video_context.seek(0);
        }

        this.setData({
            current_play_video_id: target_video_id
        });
        var target_video_context = swan.createVideoContext('video_' + target_video_id);
        if(video_time_sign.target_video_id){
            target_video_context.seek(video_time_sign.target_video_id);
        }
        target_video_context.play();
        click_rate(blog_id);//点击量统计
    },
    // evt_videopause:function(e){
    //     var target_video_id = e.currentTarget.dataset.videoid;
    //     var target_video_context = swan.createVideoContext('video_' + target_video_id);
    //     target_video_context.pause();
    //     this.setData({
    //         current_play_video_id: null
    //     });
    // },
    // evt_videopaused:function(e){
    //     this.setData({
    //         current_play_video_id: null
    //     });
    // },
    evt_showlocation: function(e) {
        let lnandla = e.currentTarget.dataset.lnandla;
        let local_name = e.currentTarget.dataset.locationname;
        let local_address = e.currentTarget.dataset.locationaddress;
        lnandla = lnandla.split('|');
        swan.openLocation({
            latitude: parseFloat(lnandla[1]),
            longitude: parseFloat(lnandla[0]),
            name: local_name,
            address: local_address
        });
    },
    evt_taprelation: function(e) {
        let isrelation = e.currentTarget.dataset.isrelation;
        let relation_id = e.currentTarget.dataset.authorid;
        let _this = this;
        if (isrelation) return;
        let _set = {};
        _set['my_relation_map._' + relation_id] = 1;
        _this.setData(_set);
        util.wxRequest({
            url: config.BASE_URL + '/m/communityrelation-follow-' + relation_id + '.html',
            success: function(res) {
                let resdata = res.data;
                if (resdata.success) {
                    swan.showToast({
                        icon: 'success',
                        title: '关注成功'
                    });
                }
            }
        });
    },
    evt_tapzan: function(e) {
        //let blog_id = e.currentTarget.dataset.blogid;
        let blog_idx = e.currentTarget.dataset.blogidx;
        let iszan = e.currentTarget.dataset.iszan;
        if (iszan) return;
        console.info(e);
        //if(!blog_id)return;
        zan_func.apply(this, [blog_idx]);
    },
    evt_tapunzan: function(e) {
        //let blog_id = e.currentTarget.dataset.blogid;
        let blog_idx = e.currentTarget.dataset.blogidx;
        let isunzan = e.currentTarget.dataset.isunzan;
        if (isunzan) return;
        console.info(e);
        //if(!blog_id)return;
        zan_func.apply(this, [blog_idx, 'reverse']);
    },
    evt_tapcomment: function(e) {
        this.comment_blog_id = e.currentTarget.dataset.blogid;
        this.comment_blog_idx = e.currentTarget.dataset.blogidx;
        if(!this.data.in_user_page && !this.data.in_detail){
            return swan.navigateTo({
                url:'/pages/community/detail?blog_id='+this.comment_blog_id
            });
        }
        this.setData({
            show_comment_bar: true
        }, function() {
            // if (swan.pageScrollTo) {
            //     swan.createSelectorQuery()
            //         .select('#blog_panel_'+blog_id)
            //         .boundingClientRect(function(rect) {
            //
            //             swan.pageScrollTo({
            //                 scrollTop: rect.top
            //             });
            //         }).exec();
            // }
        });
        click_rate(this.comment_blog_id);//点击量统计
    },
    evt_comment_confirm: function(e) {
        let _this = this;
        let comment_val = e.detail.value;
        if (!comment_val || comment_val.trim().length < 3) {
            return swan.showModal({
                title: '发布评论失败',
                content: '请完善评论内容',
                success: function() {
                    _this.setData({
                        show_comment_bar: true
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
            url: config.BASE_URL + '/m/communitypublish-comment-' + this.comment_blog_id + '.html',
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
                    var exist_comment_count = _this.data.blog_data.blog_list[_this.comment_blog_idx].comment_count;
                    if (!exist_comment_count) {
                        exist_comment_count = 0;
                    }
                    let _set = {};
                    _set['blog_data.blog_list[' + _this.comment_blog_idx + '].comment_count'] = (parseInt(exist_comment_count) + 1);
                    _set['my_follow_map._' + _this.comment_blog_id + '.comment'] = 1;
                    _this.setData(_set);
                } else {
                    if(resdata.error){
                        swan.showModal({
                            title:'发布失败',
                            content:resdata.error,
                            showCancel:false
                        });
                    }
                    swan.hideToast();
                }
            },
            complete: function() {
                _this.setData({
                    show_comment_bar: false
                });
            }
        });
        //console.info(comment_val);
    },
    evt_tapcommentpanel: function(e) {
        this.setData({
            show_comment_bar: false
        });
    },
    evt_tapdelete: function(e, dis_val) {
        dis_val = dis_val ? dis_val : 'true';
        this.setData({
            current_play_video_id: false
        });
        let blog_id = e.currentTarget.dataset.blogid;
        let blog_idx = e.currentTarget.dataset.blogidx;
        let _this = this;
        swan.showModal({
            title: dis_val == 'true' ? '确认删除?' : '确认恢复?',
            success: function(res) {
                if (res.confirm) {
                    let _set = {};
                    _set['blog_data.blog_list[' + blog_idx + '].disabled'] = dis_val;
                    _this.setData(_set);
                    util.wxRequest({
                        url: config.BASE_URL + '/m/communitypublish-disabled-' + blog_id + '-' + dis_val + '.html',
                        success: function(res) {
                            let resdata = res.data;
                            if (resdata.success) {
                                //TODO
                            }
                        },
                        complete: function() {

                        }
                    });
                }
            }
        });
    },
    evt_taprecovery: function(e) {
        this.evt_tapdelete.apply(this, [e, 'false']);
    },
    evt_navuserpage: function(e) {
        let user_id = e.currentTarget.dataset.userid;
        swan.navigateTo({
            url: '/pages/community/user?user_id=' + user_id
        });
    },
    evt_getmediaqrcode:function(e){
        var blog_id = e.currentTarget.dataset.blogid;
        if(!blog_id)return;
        var the_path = '/pages/community/detail?blog_id=' + blog_id;
        swan.showToast({
            title: '正在生成..',
            icon: 'loading',
            duration: 10000
        });
        util.getqrcode({
            'path': the_path,
            'type': 'scene',
            'width': 430
        }, function(qr_image_data) {
            swan.hideToast();
            swan.previewImage({
                urls: [qr_image_data.qrcode_image_url]
            });
        });
    }
}
