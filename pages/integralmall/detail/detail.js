const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
// var md5 = require('../../utils/md5.js');
const WxParse = require('../../../utils/wxParse/wxParse.js');
//const dateFormat = require('../../utils/dateformat.js');
const app = getApp();
//var currentPages = getCurrentPages();

//处理相册
const set_slide = function(image_arr) {
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


const set_desc = function() {
    this.setData({
        desc_loaded: 'YES',
    });
    WxParse.wxParse('product_desc', 'html', this.data.data_detail.description, this, 0);
}


Page({
    data: {
        desc_loaded: 'NO',
        slide_images: [],
        quantityVal: 1
    },
    onShareAppMessage: function() {
        var _this = this;
        var the_path = '/pages/integralmall/detail/detail?product_id=' + this.data.data_detail.product.product_id;
        the_path = util.merchantShare(the_path);
        this.setData({
            'onshare': true
        });
        return {
            title: this.data.data_detail.name,
            path: the_path,
            complete: function() {
                _this.setData({
                    'onshare': false
                });
            }
        };
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '兑换商品详情'
        });
        swan.getSystemInfo({
            success: function(res) {
                console.info(res);
                _this.setData({
                    sv_height: res.windowHeight - 45,
                    slider_height_style: 'height:' + res.windowWidth + 'px',
                    windowWidth: res.windowWidth,
                    windowHeight: res.windowHeight
                });
            }
        });

    },
    onLoad: function(options) {
      this.setData({
        themecolor:app.globalData.themecolor
      })
        var _this = this;
        util.checkMember.call(this,function(member){
            util.wxRequest({
                url: config.BASE_URL + '/m/integralmalldetail-' + options.product_id + '.html',
                success: function(res) {
                    var pagedata = res.data;
                    _this.setData(pagedata);
                    //相册
                    set_slide.apply(_this, [pagedata.data_detail.images]);
                },
                complete: function() {
                    _this.setData({
                        hideLoading: true
                    });
                },
                fail: function(re) {
                    console.info(re);
                },
            });
        });

    },
    onReachBottom:function(e){
        this.evt_loaddesc();
        this.onReachBottom = function(){};
    },
    evt_loaddesc: function() {
        set_desc.call(this);
    },
    tapspecitem: function(e) {
        var product_id = e.currentTarget.dataset.productid;
        if (product_id && product_id != this.data.data_detail.product.product_id) {
            this.onLoad({
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
    tappqminus: function(e) {
        this.setData({
            quantityVal: this.data.quantityVal - 1
        });
    },
    tappqplus: function(e) {
        this.setData({
            quantityVal: this.data.quantityVal + 1
        });
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'xs');
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
    evt_goto: function(e) {
        swan.switchTab({
            url: '/pages/index/index',
            success: function() {
                swan.navigateTo({
                    url: e.currentTarget.dataset.url
                });
            }
        });
    },
    evt_showqrcode: function (e) {
      var product_id = this.data.data_detail.product.product_id;
      var the_path = '/pages/integralmall/detail/detail?product_id=' + product_id;
      
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
    },
    goHome: function () {
      swan.switchTab({
        url: '/pages/index/index',
      })
    }
});
