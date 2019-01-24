//gallery.js
//商品列表页
const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
//const md5 = require('../../../../utils/md5.js');
const WxParse = require('../../../../utils/wxParse/wxParse.js');
//const dateFormat = require('../../utils/dateformat.js');
const app = getApp();
//var currentPages = getCurrentPages();

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

Page({
    data: {
        slide_images: [],
        'quantityVal':1,
    },
    onShareAppMessage: function() {
        var _this = this;
        var the_path = '/pages/product/product?product_id=' + this.data.data_detail.product.product_id;
        the_path = util.merchantShare(the_path);
        if(this.data.pickout_data){
            try{
                var vshop_id = this.data.pickout_data[Object.keys(this.data.pickout_data)[0]]['vshop_id'];
                if(vshop_id){
                    the_path+='&_vshop_id='+vshop_id;
                }
            }catch(e){}

        }
        this.setData({
            'onshare':true
        });
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
            title: '拼团'
        });
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight - 45,
                    slider_height_style:'height:'+res.windowWidth+'px'
                });
            }
        });
    },
    onLoad: function(options) {
        var _this = this;
        util.wxRequest({
            url: config.BASE_URL + '/m/gbitem-' + options.activity_id +'-'+options.product_id+ '.html',
            success: function(res) {
                var pagedata = res.data;
                _this.setData(pagedata);
                //相册
                set_slide.apply(_this, [pagedata.data_detail.images]);
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
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/gbitem-offered-' + options.activity_id +'-'+ options.product_id +'-'+ options.gb_id + '.html',
                success:function(re){
                    _this.setData({
                        activity:re.data.activity,
                        main_order:re.data.main_order,
                        members:re.data.members,
                        hideLoading:true
                    })
                }
            })
        });
    },
    countdown: function(){
        var _this = this;
        var arr = [];
        arr.push(_this.data.activity.surplus_time);
        util.countdown(_this,arr);
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
    addcart: function(e) {
        var _this = this;

        util.checkMember.call(this, function() {

            var _timer = setTimeout(function() {
                swan.showToast({
                    title: '正在开团..',
                    icon: 'loading',
                    duration: 2000
                });
            }, 500);
            util.wxRequest({
                url: config.BASE_URL + '/m/gbcheckout-'+_this.data.activity.activity_id+'-'+_this.data.current_product.product_id+'-'+_this.data.quantityVal+'.html',
                success: function(res) {
                    console.log(res)
                    var res_data = res.data;
                    swan.hideToast();
                    if (res_data.error) {
                        swan.showModal({
                            title: '开团失败',
                            content: res_data.error
                        });
                    } else {
                        //立即开团
                        if(getCurrentPages().length>2){
                            swan.redirectTo({
                                url: '/pages/groupbooking/checkout/checkout?activity_id='+_this.data.activity.activity_id+'&product_id='+_this.data.current_product.product_id+'&quantity='+_this.data.quantityVal
                            });
                            return;
                        }else{
                            swan.navigateTo({
                                url: '/pages/groupbooking/checkout/checkout?activity_id='+_this.data.activity.activity_id+'&product_id='+_this.data.current_product.product_id+'&quantity='+_this.data.quantityVal
                            });
                            return;
                        }
                        swan.showToast({
                            title: '开团成功',
                            icon: 'success',
                            duration: 1200
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
})
