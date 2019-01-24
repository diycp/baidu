//gallery.js
//商品列表页
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');
const WxParse = require('../../../utils/wxParse/wxParse.js');
const dateFormat = require('../../../utils/dateformat.js');
const app = getApp();

//处理相册
var set_slide = function(image_arr) {
    var _this = this;
    var image_ids = [];
    for (var i in image_arr) {
        image_ids.push(image_arr[i].image_id);
    }
    util.wxRequest({
        url: config.BASE_URL + '/openapi/storager/m',
        method: 'POST',
        data: {
            'images': image_ids
        },
        success: function(res) {
            let resdata = res.data.data;
            //console.info(resdata);
            for (let i = 0; i < resdata.length; i++) {
                resdata[i] = util.fixImgUrl(resdata[i]);
            }
            _this.setData({
                'slide_images': resdata
            });
        }
    })

};

//评论
var set_comment = function() {
    var _this = this;
    util.wxRequest({
        url: config.BASE_URL + '/m/comment-show-' + _this.data.data_detail.goods_id + '.html',
        success: function(res) {
            var pagedata = res.data;
            _this.setData({
                'comment': pagedata
            });
        }
    });
}

var set_desc = function() {
    this.setData({
        desc_loaded:'YES',
    });
    WxParse.wxParse('product_desc', 'html', this.data.data_detail.description, this, 0);
}

var set_favorite = function() {
    var _this = this;
    util.checkMember.call(this,function(){
        util.wxRequest({
            url: config.BASE_URL + '/openapi/goods/check_fav/',
            data:{
                member_id:_this.data.member.member_id,
                goods_id:_this.data.data_detail.goods_id
            },
            success: function(res) {
                if(res.data.result == 'success'){
                    _this.setData({
                        isfav:(res.data.data.is_fav>0?'YES':'NO'),
                        favcount:res.data.data.fav_count
                    });
                }
            }
        });
    });

}

const set_cartcount = function() {
    var _this = this;
    util.wxRequest({
        url: config.BASE_URL + '/openapi/cart/count',
        success: function(res) {
            try {
                if (res.data.data.quantity > 0) {
                    _this.setData({
                        cartCount: res.data.data.quantity
                    });
                }else if(res.data.data.quantity == null){
                    _this.setData({
                        cartCount: 0
                    });
                }
            } catch (e) {

            }

        }
    });
}

Page({
    data: {
        slide_images: [],
        'quantityVal':1,
        themecolor:"",
        desc_loaded: 'NO',
        img_url:config.BASE_HOST
    },
    tappqminus: function(e) {
        var _this = this;
        this.setData({
            quantityVal: this.data.quantityVal - 1
        });
    },
    tappqplus: function(e) {
        var _this = this;
        if (this.data.quantityVal >= this.data.current_product.restrict_number) {
            return;
        }
        this.setData({
            quantityVal: this.data.quantityVal + 1
        });
    },
    onShareAppMessage: function() {
        var _this = this;
        var activity_id = this.data.activity.activity_id;
        var the_path = '/pages/preselling/product/product?activity_id=' + activity_id + '&product_id=' + product_id;
        if(this.data.pickout_data){
            var vshop_id = this.data.pickout_data[Object.keys(this.data.pickout_data)[0]]['vshop_id'];
            if(vshop_id){
                the_path+='&_vshop_id='+vshop_id;
            }
        }
        this.setData({
            'onshare':true
        });
        the_path = util.merchantShare(the_path);
        return {
            title: this.data.data_detail.name,
            path: the_path,
            complete:function(){
                _this.setData({
                    'onshare':false
                });
            }
        };
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '商品详情'
        });
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight - 45,
                    slider_height_style:'height:'+res.windowWidth+'px',
                    windowWidth: res.windowWidth,
                    windowHeight: res.windowHeight
                });
            }
        });
    },
    countdown: function(){
        var _this = this;
        util.countdown(_this,_this.data.activity.surplus_deposit_time);
    },
    onLoad: function(options) {
      this.setData({
        themecolor:app.globalData.themecolor
      })
        var _this = this;
        util.wxRequest({
            url: config.BASE_URL + '/m/pslitem-' + options.activity_id +'-'+options.product_id+ '.html',
            success: function(res) {
                var pagedata = res.data;
                _this.setData({
                    deposit_starttime:dateFormat(parseInt(pagedata.activity.deposit_starttime)*1000,'yyyy.mm.dd HH:MM'),
                    deposit_endtime:dateFormat(parseInt(pagedata.activity.deposit_endtime)*1000,'yyyy.mm.dd HH:MM'),
                    balance_starttime:dateFormat(parseInt(pagedata.activity.balance_starttime)*1000,'yyyy.mm.dd HH:MM'),
                    balance_endtime:dateFormat(parseInt(pagedata.activity.balance_endtime)*1000,'yyyy.mm.dd HH:MM'),
                    send_time:dateFormat(parseInt(pagedata.activity.send_time)*1000,'yyyy.mm.dd HH:MM'),
                })
                
                _this.setData(pagedata);
                //相册
                set_slide.apply(_this, [pagedata.data_detail.images]);
                //评论
                set_comment.call(_this);
                //购物车数量
                set_cartcount.call(_this);
                //收藏 favorite
                set_favorite.call(_this);
                //倒计时
                _this.countdown();
            },
            complete: function() {
                _this.setData({
                    hideLoading: true
                });
            },
            fail: function(re) {
                //console.info(re);
            },
        });
    },
    evt_loaddesc: function() {
        set_desc.call(this);
    },
    tapspecitem: function(e) {
        var product_id = e.currentTarget.dataset.productid;
        if (product_id && product_id != this.data.data_detail.product.product_id) {
            this.onLoad({
                "activity_id":this.data.activity.activity_id,
                "product_id": product_id,
            });
        }
    },
    tapslide: function(e) {
        var current_url = util.fixImgUrl(e.target.dataset.src);
        var urls = [];
        for (var i = 0; i < this.data.slide_images.length; i++) {
            urls.push(util.fixImgUrl(this.data.slide_images[i]));
        }
        swan.previewImage({
            current: util.fixImgUrl(e.target.dataset.src), // 当前显示图片的http链接
            urls: urls // 需要预览的图片http链接列表
        });
    },
    paydeposit: function(e) {
        var _this = this;

        util.checkMember.call(this, function() {

            var _timer = setTimeout(function() {
                swan.showToast({
                    title: '正在提交..',
                    icon: 'loading',
                    duration: 2000
                });
            }, 500);
            util.wxRequest({
                url: config.BASE_URL + '/m/pslcheckout-'+_this.data.activity.activity_id+'-'+_this.data.current_product.product_id+'-'+_this.data.quantityVal+'.html',
                success: function(res) {
                    console.log(res)
                    var res_data = res.data;
                    swan.hideToast();
                    if (res_data.error) {
                        swan.showModal({
                            title: '预购失败',
                            content: res_data.error
                        });
                    } else {
                        swan.showToast({
                            title: '预购成功',
                            icon: 'success',
                            duration: 1200
                        });
                        swan.redirectTo({
                            url: '/pages/preselling/checkout/checkout?activity_id='+_this.data.activity.activity_id+'&product_id='+_this.data.current_product.product_id+'&quantityVal='+_this.data.quantityVal
                        });
                    }
                },
                complete: function(e) {
                    clearTimeout(_timer);
                }
            });
        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'xs');
    },
    evt_previewimage: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.wxRequest({
            url: config.BASE_URL + '/openapi/storager/l',
            method: 'POST',
            data: {
                'images': [image_id]
            },
            success: function(res) {
                var image_src_data = res.data.data;
                swan.previewImage({
                    urls: [util.fixImgUrl(image_src_data[0])]
                });
            }
        });
    },
    evt_favorite: function(e) {
        var favstatus = e.target.dataset.favstatus;
        if(!favstatus)return true;
        var action = config.BASE_URL + '/m/my-favorite-'+(favstatus == 'YES'?'del':'add')+'-'+this.data.data_detail.goods_id+'.html';
        var _this = this;
        util.wxRequest({
            url: action,
            success: function(res) {
                if(res.data.success){
                    _this.setData({
                        isfav:(favstatus == 'YES'?'NO':'YES')
                    });
                    swan.showToast({
                        title: (favstatus == 'YES'?'移除收藏成功':'成功加入收藏'),
                        icon: 'success',
                        duration: 1200
                    });
                }
            }
        });

    },
    evt_goto:function(e){
        swan.switchTab({
            url:'/pages/index/index',
            success:function(){
                swan.navigateTo({
                    url:e.currentTarget.dataset.url
                });
            }
        });
    },
    evt_showqrcode: function (e) {

      var product_id = this.data.data_detail.product.product_id;
      var activity_id = this.data.activity.activity_id;
      var the_path = '/pages/preselling/product/product?activity_id=' + activity_id + '&product_id=' + product_id;
      if (this.data.pickout_data) {
        try {
          var vshop_id = this.data.pickout_data[Object.keys(this.data.pickout_data)[0]]['vshop_id'];
          if (vshop_id) {
            the_path += '&_vshop_id=' + vshop_id;
          }
        } catch (e) { }

      }
      swan.showToast({
        title: '正在生成..',
        icon: 'loading',
        duration: 10000
      });
      util.getqrcode({
        'path': the_path,
        'type': 'scene',
        'width': 430
      }, function (qr_image_data) {
        swan.hideToast();
        swan.previewImage({
          urls: [qr_image_data.qrcode_image_url]
        });
      });

    },
    goTop: function () {
      swan.pageScrollTo({
        scrollTop: 0
      })
    }
})
