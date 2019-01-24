const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const qcloud = require('../../../utils/qcloud.js');
const navtitle = ['音频', '视频', '图片'];
var toast_timer = 0;
var record_timer = 0;
var audio_playing_timer = 0;
Page({
    data: {
        swiper_current: 2,
        location: {},
        content: '',
        media: {
            audio_tmpfile: null,
            video_tmpfile: null,
            image_tmpfile: [],
            audio_duration: 0
        },
        audio_recording: false,
        audio_play_time: 0
    },
    onShow: function() {
        // swan.showActionSheet({
        //     itemList:['前往电脑端发布作品'],
        //     success:function(res){
        //         if(res.tapIndex == 0){
        //             swan.navigateTo({
        //                 url:'/pages/community/publish/pc/index'
        //             });
        //         }
        //     }
        // });
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '发布' + navtitle[this.data.swiper_current]
        });

    },
    evt_setpagedata: function(e) {
        var _set = {};
        _set[e.currentTarget.dataset.key] = e.detail.value;
        this.setData(_set);
    },
    onLoad: function(options) {
        var _this = this;
        util.checkMember.call(this, function(re) {
            util.wxRequest({
                url: config.BASE_URL + '/m/communitypublish-index.html',
                success: function(res) {
                    let resdata = res.data;
                    let user_lv_data = resdata.user_lv;
                    if(user_lv_data.allow_image == 'true'){
                        _this.evt_swiperhandle({
                            target:{dataset:{swiper:2}}
                        });
                    }else if(user_lv_data.allow_shortvideo == 'true'){
                        _this.evt_swiperhandle({
                            target:{dataset:{swiper:1}}
                        });
                    }else if(user_lv_data.allow_audio == 'true'){
                        _this.evt_swiperhandle({
                            target:{dataset:{swiper:0}}
                        });
                    }
                    _this.setData(res.data);
                },
                complete: function() {
                    _this.setData({
                        hideLoading:true
                    });
                }
            });
        });
    },
    evt_swiperhandle: function(e) {
        var _this = this;
        var current = parseInt(_this.data.swiper_current);
        var swiper = parseInt(e.target.dataset.swiper);
        // console.info(current);
        // console.info(swiper);
        if (swiper == 0) {
            swan.getSetting({
                success: function(res) {
                    console.info(res.authSetting);
                    if (!res.authSetting['scope.record']) {
                        swan.authorize({
                            scope: 'scope.record',
                            success(res) {
                                swan.getSetting({
                                    success: function(auth_res) {
                                        if (auth_res.authSetting['scope.record']) {
                                            _this.setData({
                                                swiper_current: swiper
                                            });
                                        } else {
                                            //TODO
                                            swan.showModal({
                                                title: '需要设备录音权限',
                                                content: '是否前往配置相关权限？',
                                                success: function(res) {
                                                    if (res.confirm) {
                                                        swan.openSetting();
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            },
                            fail: function() {
                                console.info('scope.record authorize fail!');
                                swan.showModal({
                                    title: '需要设备录音权限',
                                    content: '是否前往配置相关权限？',
                                    success: function(res) {
                                        if (res.confirm) {
                                            swan.openSetting();
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        _this.setData({
                            swiper_current: swiper
                        });
                    }
                }
            });
        };
        if (current != swiper) {
            swan.setNavigationBarTitle({
                title: '发布' + navtitle[swiper]
            });
            this.setData({
                swiper_current: swiper
            });
            if (swiper != 1) {
                swan.createVideoContext('tmp_video').pause();
            }
            if (swiper != 0) {
                _this.setData({
                    audio_recording: false
                });
                swan.stopRecord();
                swan.stopVoice();
                swan.createAudioContext('tmp_audio').pause();
            }
        }

    },
    evt_chooseimage: function(e) {
        var _this = this;
        var choose_limit = (12 - parseInt(_this.data.media.image_tmpfile.length));
        console.info(choose_limit);
        swan.chooseImage({
            count: choose_limit,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function(res) {
                console.info(res);
                var tmp_file_paths = res.tempFilePaths;
                var tmp_files = res.tempFiles;
                var tmpfiles_obj = []
                for (let i = 0; i < tmp_file_paths.length; i++) {
                    let _obj = {
                        'tmp_path': tmp_file_paths[i],
                        'file': tmp_files[i]
                    }
                    tmpfiles_obj.push(_obj);
                }
                if (_this.data.media.image_tmpfile.length < 12) {
                    let _set = _this.data.media.image_tmpfile.concat(tmpfiles_obj);
                    _this.setData({
                        'media.image_tmpfile': _set
                    });
                }
                // for (let i = 0; i < tmp_file_paths.length; i++) {
                //     let tmpfile = tmp_file_paths[i];
                //     qcloud.cos_upload(tmpfile, function(res, err) {
                //         if (!res) {
                //             swan.showModal({
                //                 title: (err || '上传失败')
                //             });
                //         }
                //     });
                // }
            },
            fail: function(e) {

            }
        });
    },
    evt_previewimage: function(e) {
        var index = e.currentTarget.dataset.idx;
        var url = this.data.media.image_tmpfile[index]['tmp_path'];
        console.info(url);
        swan.previewImage({
            urls: [url]
        })
    },
    evt_removeimage: function(e) {
        var index = e.currentTarget.dataset.idx;
        var update_tmpfiles = this.data.media.image_tmpfile;
        update_tmpfiles.splice(index, 1);
        this.setData({
            'media.image_tmpfile': update_tmpfiles
        });
    },
    evt_selvoice: function(e) {

    },
    evt_startrecord: function(e) {
        var _this = this;
        this.setData({
            audio_recording: true
        });
        var _start = function() {
            _this.setData({
                'media.audio_duration': 0
            });
            record_timer = setInterval(function() {
                _this.setData({
                    'media.audio_duration': _this.data.media.audio_duration + 100
                });
            }, 100);
            swan.startRecord({
                success: function(res) {
                    console.info(res);
                    let tempFilePath = res.tempFilePath
                    _this.setData({
                        'media.audio_tmpfile': tempFilePath
                    });
                    clearTimeout(toast_timer);
                    clearInterval(record_timer);
                    swan.hideToast();
                },
                fail: function(res) {
                    console.info(res);
                }
            });
            setTimeout(function() {
                //60秒强制结束录音
                _this.evt_stoprecord.call(_this);
            }, 60000);
        };
        _start();
    },
    evt_stoprecord: function(e) {
        toast_timer = setTimeout(function() {
            swan.showToast({
                title: '处理中',
                mask: true,
                icon: 'loading',
                duration: 5000
            });
        }, 500);
        this.setData({
            audio_recording: false
        });
        swan.stopRecord();
    },
    evt_audiotmpcontrol: function(e) {
        var _this = this;
        if (!this.data.media.audio_tmpfile) {
            return;
        }
        if (this.data.audio_playing) {
            swan.pauseVoice();
            clearInterval(audio_playing_timer);
            this.setData({
                'audio_playing': false,
                'audio_play_time': 0
            });
        } else {
            swan.playVoice({
                filePath: this.data.media.audio_tmpfile
            });
            this.setData({
                'audio_playing': true,
                'audio_play_time': 0
            });
            audio_playing_timer = setInterval(function() {
                if (!_this.data.media.audio_duration) {
                    return clearInterval(audio_playing_timer);
                }
                let _audio_play_time_percent = (_this.data.audio_play_time / _this.data.media.audio_duration * 100);
                if (_audio_play_time_percent > 100) _audio_play_time_percent = 100;
                _this.setData({
                    audio_play_time: (_this.data.audio_play_time + 100),
                    audio_play_time_percent: _audio_play_time_percent
                });
                if (_this.data.audio_play_time > _this.data.media.audio_duration) {
                    clearInterval(audio_playing_timer);
                    swan.pauseVoice();
                    _this.setData({
                        'audio_playing': false,
                        'audio_play_time': 0,
                        'audio_play_time_percent': 0
                    });
                }
            }, 100);
        }

    },
    evt_clearaudiotmp: function(e) {
        this.setData({
            'media.audio_tmpfile': false,
            'media.audio_duration': 0,
            'audio_play_time': 0,
            'audio_play_time_percent': 0
        });
    },
    evt_choosevideo: function(e) {
        var _this = this;
        swan.chooseVideo({
            sourceType: ['album', 'camera'],
            maxDuration: 60,
            //camera: 'front',
            success: function(res) {
                _this.setData({
                    'media.video_tmpfile': res.tempFilePath
                })
            }
        })
    },
    evt_clearvideotmp: function(e) {
        this.setData({
            'media.video_tmpfile': false
        });
    },
    evt_chooselocation: function(e) {
        var _this = this;
        swan.chooseLocation({
            type: 'gcj02',
            success: function(res) {
                _this.setData({
                    location: res
                });
            }
        });
    },
    evt_publish: function(e) {
        ///m/communitypublish-save.html
        var _this = this;
        util.checkMember.call(this, function(re) {

            var mode = 'text';
            switch (_this.data.swiper_current) {
                case 0:
                    mode = 'audio';
                    break;
                case 1:
                    mode = 'video';
                    break;
                case 2:
                    mode = 'image';
                    break;
            }
            var form_data = {
                'blog[mode]': (mode == 'video' ? 'short_video' : mode),
                'blog[title]': _this.data.title ? _this.data.title : '',
                'blog[content]': _this.data.content ? _this.data.content : '',
                'blog[blog_tag]': _this.data.tag ? _this.data.tag : ''
            };
            if (_this.data.location.name) {
                //位置
                form_data['blog[lnandla]'] = [_this.data.location.longitude, _this.data.location.latitude].join('|');
                form_data['blog[location]'] = _this.data.location.name;
                form_data['blog[address]'] = _this.data.location.address;
            }

            var submit_form = function() {
                swan.showToast({
                    title: '正在发布',
                    icon: 'loading',
                    mask: true,
                    duration: 50000
                });
                util.wxRequest({
                    url: config.BASE_URL + '/m/communitypublish-topic.html',
                    data: form_data,
                    method: 'POST',
                    success: function(res) {
                        //console.info(res);
                        var resdata = res.data;
                        if (resdata.success) {
                            _this.setData({
                                publish_success: true
                            });
                        } else {
                            swan.showModal({
                                title: '发布失败',
                                showCancel: false,
                                content: resdata.error || ''
                            });
                        }
                    },
                    complete: function() {
                        swan.hideToast();
                    }
                });
            };
            switch (mode) {
                case 'audio':
                    form_data['media[duration]'] = _this.data.media.audio_duration;
                case 'video':
                    swan.showToast({
                        title: '正在上传',
                        icon: 'loading',
                        mask: true,
                        duration: 50000
                    });
                    if (_this.data.media[mode + '_tmpfile']) {
                        qcloud.cos_upload(_this.data.media[mode + '_tmpfile'], function(res, err) {
                            if (!res) {
                                swan.hideToast();
                                return swan.showModal({
                                    title: (err || '上传文件失败')
                                });
                            } else {
                                for (let key in res) {
                                    form_data['media[' + key + ']'] = res[key];
                                }
                                submit_form();
                            }
                        }, function(upload_task_ins) {
                            if (upload_task_ins && upload_task_ins.onProgressUpdate) {
                                upload_task_ins.onProgressUpdate(function(res) {
                                    swan.showToast({
                                        title: res.progress + '%',
                                        icon: 'loading',
                                        mask: true
                                    });
                                });
                            }

                        });
                    } else {
                        form_data['blog[mode]'] = 'text';
                        submit_form();
                    }
                    break;
                case 'image':
                    var image_tmpfiles = _this.data.media[mode + '_tmpfile'].slice(0);
                    var image_ids = [];
                    if (image_tmpfiles && image_tmpfiles.length) {
                        swan.showToast({
                            title: '正在上传图片',
                            icon: 'loading',
                            mask: true,
                            duration: 150000
                        });
                        var upload_task = function(tmp_file) {
                            util.wxUpload({
                                url: config.BASE_URL + '/m/communitypublish-image_upload.html',
                                filePath: tmp_file,
                                name: 'file',
                                success: function(res) {
                                    try {
                                        var res_data = JSON.parse(res.data);
                                    } catch (e) {
                                        console.info(e);
                                    }
                                    if (!res_data || res_data.error) {
                                        //return;
                                        console.info(res);
                                    } else {
                                        console.info(res_data);
                                        image_ids.push(res_data.image_id);
                                        if (image_tmpfiles.length) {
                                            upload_task(image_tmpfiles.shift().tmp_path);
                                        } else {
                                            swan.hideToast();
                                            publish_image(image_ids);
                                        }
                                    }
                                },
                                fail: function(re) {
                                    console.error(re);
                                }
                            });
                        };
                        var publish_image = function(image_ids) {

                            form_data['blog[mode]'] = 'image';
                            form_data['media[image_ids]'] = image_ids.join('|');
                            submit_form();
                        }
                        //start
                        upload_task(image_tmpfiles.shift().tmp_path);
                    } else {
                        form_data['blog[mode]'] = 'text';
                        submit_form();
                    }
                    break;
                default:
            }

        }); //util.checkMember.call end

    },
    evt_gotomypublish: function(e) {
        swan.switchTab({
            url: '/pages/member/index',
            success: function() {
                swan.navigateTo({
                    url: '/pages/community/my/index'
                });
            }
        });
    },
    evt_gotoback: function(e) {
        swan.navigateBack();
    }
});
