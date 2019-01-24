//领取优惠券
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const dateFormat = require('../../../utils/dateformat.js');
const app = getApp();
Page({
    data: {

    },
    onShareAppMessage: function() {
      let the_path =  "/pages/couponactivity/detail/detail?act_id=" + this.data.data_list.activity.activity_id;
      the_path = util.merchantShare(the_path);
        return {
            path: the_path,
            title: this.data.data_list.activity.name
        };
    },
    onPullDownRefresh:function(){
        this.onLoad.call(this,{act_id:this.data.data_list.activity.activity_id});
        swan.stopPullDownRefresh();
    },
    onReady: function() {
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowWidth: res.windowWidth,
                    windowHeight: res.windowHeight,
                    sv_width:res.windowWidth - 179,
                    //fp_height:res.windowHeight - 30
                });
            }
        });
    },
    onLoad: function(options) {
        var _this = this;
        var act_id = options.act_id;
        this.setData({
            onloadoptions:options
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/couponactivity-' + act_id + '.html',
            success: function(res) {
                var pagedata = res.data;
                if(!pagedata.data_list)return;
                for (var i in pagedata.data_list.cpns_list) {
                    pagedata.data_list.cpns_list[i].from_time = dateFormat(parseInt(pagedata.data_list.cpns_list[i].from_time)*1000,'yy-mm-dd');
                    pagedata.data_list.cpns_list[i].to_time = dateFormat(parseInt(pagedata.data_list.cpns_list[i].to_time)*1000,'yy-mm-dd');
                    pagedata.data_list.cpns_list[i]['bought'] = pagedata.data_list.cpns[pagedata.data_list.cpns_list[i].cpns_id].achieve_sum/pagedata.data_list.cpns[pagedata.data_list.cpns_list[i].cpns_id].num_sum*100;
                }
                _this.setData(pagedata);
                _this.countdown();
                swan.setNavigationBarTitle({
                    title:_this.data.data_list.activity.name
                });
                //埋点-优惠券页面
                app.oceanWay('ViewCouponPage', {
                  PageController: config.BASE_URL + '/m/couponactivity-' + act_id + '.html',
                  PageTitle: _this.data.data_list.activity.name
                }, true);
            },
            complete: function() {
                _this.setData({
                    hideLoading: true
                });
            }
        });
    },
    load_image: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this,image_id,'m');
    },
    getcoupon:function(e){
        var _this = this;
        var cpnurl = e.currentTarget.dataset.cpnurl;
        swan.showLoading({
            mask:true
        });
        util.checkMember.call(_this,function(){
            util.wxRequest({
                url: config.BASE_URL + '/openapi/acpns/achieve/'+cpnurl,
                success:function(res){
                    var r = res.data;
                    if (r.result == 'success') {
                        swan.showModal({
                            title: '领取成功',
                            content: '恭喜您已获得一张优惠券',
                            showCancel:true,
                            confirmText:'继续领',
                            confirmColor:'#02BB00',
                            cancelText:'查看',
                            cancelColor:'#000000',
                            success:function(res){
                                if (res.confirm) {
                                    //取消继续领
                                    _this.onLoad.call(_this,_this.data.onloadoptions);
                                } else if (res.cancel) {
                                    swan.navigateTo({
                                      url: '/pages/member/coupons/index'
                                  })
                                }
                            }
                        });
                    }else{
                        swan.showModal({
                            title: '领取失败',
                            showCancel:false,
                            content: r.msg,
                            confirmText:'知道了',
                        });
                    }
                },complete:function(){
                    swan.hideLoading();
                }
            })
        })
    },
    countdown: function(){
        var _this = this;
        var intDiff = _this.data.data_list.activity.now_time;
        //倒计时
        function count_down(){
            var day=0,
                hour=0,
                minute=0,
                second=0;//时间默认值
            if(intDiff > 0){
                day = Math.floor(intDiff / (60 * 60 * 24)).toString();
                hour = (Math.floor(intDiff / (60 * 60)) - (day * 24)).toString();
                minute = (Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60)).toString();
                second = (Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60)).toString();
            }
            if (day <= 9) day = '0' + day;
            if (hour <= 9) hour = '0' + hour;
            if (minute <= 9) minute = '0' + minute;
            if (second <= 9) second = '0' + second;
            if(day == 0 && hour == 0 && minute == 0 && second == 0){
               clearInterval(self.timer);
            }
            _this.setData({
                countdown: {
                    days: day,
                    hours: hour,
                    minutes: minute,
                    seconds: second,
                }
            })
            intDiff -= 1;
        }
        setInterval(count_down, 1000);
    },
    evt_showshare: function(e) {
        var _this = this;
        var activity_id = _this.data.data_list.activity.activity_id;
        var the_path = '/pages/couponactivity/detail/detail?act_id=' + activity_id;
        const zoom_drawimage = function(o_w, o_h, m_w, m_h) {
            if (o_w > m_w) {
                let scaling = 1 - (o_w - m_w) / o_w;
                o_w = o_w * scaling;
                o_h = o_h * scaling;
            }
            if (o_h > m_h) {
                let scaling = 1 - (o_h - m_h) / o_h;
                o_w = o_w * scaling;
                o_h = o_h * scaling;
            }
            return {
                w: o_w,
                h: o_h
            };
        };
        swan.showActionSheet({
            itemList: ['二维码', '海报二维码'],
            success: function(res) {
                console.info(res);
                if (res.cancel) return;
                switch (res.tapIndex) {
                    case 0:
                        //直接生成二维码
                        swan.showLoading({
                            mask: true
                        });
                        util.getqrcode({
                            'path': the_path,
                            'type': 'scene',
                            'width': 430
                        }, function(qr_image_data) {
                            swan.hideLoading();
                            swan.previewImage({
                                urls: [qr_image_data.qrcode_image_url]
                            });
                        });
                        break;
                    case 1:
                        if (_this.poster_canvas_draw_complete) {
                            return _this.setData({
                                'canvas_poster_show': true
                            });
                        }
                        swan.showLoading({
                            mask: true
                        });
                        //获得banner大图
                        util.wxRequest({
                            url: config.BASE_URL + '/openapi/storager/l',
                            method: 'POST',
                            data: {
                                'images': [_this.data.data_list.activity.image_id]
                            },
                            success: function(res) {
                                var image_src_data = res.data.data;
                                var big_img_url = util.fixImgUrl(image_src_data[0]);
                                if(!big_img_url)return;
                                //获得小程序二维码
                                util.getqrcode({
                                    'path': the_path,
                                    'type': 'scene',
                                    'width': 200
                                }, function(qr_image_data) {
                                    var qr_image_url = qr_image_data.qrcode_image_url;
                                    if (!qr_image_url) {
                                        return;
                                    }
                                    var win_width = _this.data.windowWidth;
                                    var win_height = _this.data.windowHeight;
                                    var canvas_max_width = win_width - 60;
                                    var canvas_max_height = win_height*0.7;
                                    var padding = 10;
                                    var h_fontsize = 16;
                                    var ctx = swan.createCanvasContext('poster_canvas');
                                    swan.getImageInfo({
                                        src: big_img_url,
                                        success: function(img_data) {
                                            if(!img_data){
                                                return;
                                            }
                                            var img_size = zoom_drawimage(img_data.width, img_data.height, canvas_max_width-padding*2, canvas_max_height*0.7-padding*2);

                                            //绘制商品默认相册图片
                                            ctx.setFillStyle('white');
                                            var img_rect_w = Math.round(img_size.w+padding*2);
                                            var img_rect_h = Math.round(img_size.h+padding*2);
                                            _this.setData({
                                                ctx_img_rect_w:img_rect_w,
                                                ctx_img_rect_h:img_rect_h,
                                            });
                                            ctx.fillRect(0, 0, img_rect_w, img_rect_h);
                                            ctx.drawImage(img_data.path,padding,padding, img_size.w, img_size.h);
                                            //绘制商品名称
                                            var activity_name = _this.data.data_list.activity.name;
                                            if(!activity_name)return;
                                            var max_text_width = img_size.w;
                                            ctx.fillRect(0, img_rect_h-1, img_rect_w, 50);
                                            ctx.setFontSize(h_fontsize);
                                            ctx.setTextAlign('left');
                                            ctx.setTextBaseline('middle');
                                            ctx.setFillStyle('black');
                                            console.info(ctx.measureText);
                                            if(typeof ctx.measureText == 'function'){
                                                //精准计算商品名称
                                                var activity_name_arr = activity_name.trim().split('');
                                                var line_loop_width = 0;
                                                var current_line = 0;
                                                for (let i = 0; i < activity_name_arr.length; i++) {
                                                    var loop_x = Math.ceil(line_loop_width+padding);
                                                    if(loop_x<max_text_width){
                                                        ctx.fillText(activity_name_arr[i],loop_x,img_rect_h+padding+(h_fontsize+5)*current_line);
                                                        line_loop_width+=ctx.measureText(activity_name_arr[i]).width;
                                                    }else{
                                                        current_line+=1;
                                                        if(current_line>1)break;
                                                        line_loop_width=0;
                                                        loop_x = padding;
                                                        ctx.fillText(activity_name_arr[i],loop_x,img_rect_h+padding+(h_fontsize+5)*current_line);
                                                        line_loop_width+=ctx.measureText(activity_name_arr[i]).width;
                                                    }
                                                }
                                            }else{
                                                //非精准计算商品名称(特别是有英文时)
                                                var line_count = max_text_width/h_fontsize;
                                                var row1 = activity_name.substr(0,line_count);
                                                var row2 = activity_name.substr(line_count,line_count);
                                                row1!=''&&
                                                ctx.fillText(row1,padding,img_rect_h+padding+(h_fontsize+5)*0);
                                                row2!=''&&
                                                ctx.fillText(row2,padding,img_rect_h+padding+(h_fontsize+5)*1);
                                            }
                                            ctx.setFillStyle('white');
                                            ctx.fillRect(0, img_rect_h+48, img_rect_w, 100);
                                            //绘制优惠券Icon
                                            ctx.setFillStyle('#777777');
                                            //ctx.drawImage('/statics/svg/coupon.svg',padding-5,img_rect_h+65,50,50);
                                            ctx.fillText("优惠券 x ",padding,img_rect_h+90);
                                            ctx.setFillStyle('black');
                                            ctx.setFontSize(25);
                                            ctx.fillText(Object.keys(_this.data.data_list.cpns_list).length,75,img_rect_h+90);
                                            //绘制小程序二维码
                                            swan.getImageInfo({
                                                src: qr_image_url,
                                                success: function(qrimg_data) {
                                                    ctx.drawImage(qrimg_data.path, img_rect_w - 90, img_rect_h+50, 80, 80);
                                                    ctx.draw();
                                                    swan.hideLoading();
                                                    _this.poster_canvas_draw_complete = true;
                                                    _this.setData({
                                                        'canvas_poster_show': true
                                                    });
                                                }
                                            });

                                        }
                                    });
                                });
                            }
                        });

                        break;


                }

            }

        });
    },
    evt_hideposter: function(e) {
        if(!e.target.dataset.hideposter)return;
        this.setData({
            'canvas_poster_show': false
        });
    },
    evt_previewposter: function(e) {
        var _this = this;
        swan.showLoading();
        swan.canvasToTempFilePath({
            canvasId: 'poster_canvas',
            success: function(res) {
                swan.hideLoading();
                swan.previewImage({
                    urls:[res.tempFilePath]
                });
            }
        });
    },
    evt_downloadposter: function(e) {
        var _this = this;
        swan.showLoading();
        swan.canvasToTempFilePath({
            canvasId: 'poster_canvas',
            success: function(res) {
                swan.hideLoading();
                swan.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function(res) {
                        console.info(res);
                        _this.setData({
                            'canvas_poster_show': false
                        });
                        swan.showToast({
                            title: '已保存到手机',
                            icon: 'success',
                            duration: 1200
                        });
                    }
                });
            }
        });
    }
});
