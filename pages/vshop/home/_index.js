const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();

var init_pagedata = function(vshop_id) {
    var _this = this;
    util.wxRequest({
        url: config.BASE_URL + '/openapi/vshop/home/shop_id/' + vshop_id,
        success: function(res) {
            var pagedata = res.data.data;
            pagedata.vshop.logo_url = util.fixImgUrl(pagedata.vshop.logo_url);
            pagedata.vshop.banner_url = util.fixImgUrl(pagedata.vshop.banner_url);
            load_profit.call(_this, pagedata.goods_list);
            for (var i = 0; i < pagedata.goods_list.length; i++) {
                pagedata.goods_list[i]['image'] &&
                    (pagedata.goods_list[i]['image'] = util.fixImgUrl(pagedata.goods_list[i]['image']));
            }
            _this.setData(pagedata);
            swan.setNavigationBarTitle({
                title: pagedata.vshop.name||''
            });
        },
        fail: function(re) {
            console.info(re);
        },
        complete: function() {
            _this.setData({
                hideLoading: 'true'
            });
            swan.stopPullDownRefresh();
        }
    });
}

var load_profit = function(data_list) {
    var _this = this;
    var pids_map = {};
    for (var i = 0; i < data_list.length; i++) {
        pids_map[data_list[i]['product']['product_id']] = data_list[i]['product']['buy_price'];
    }
    util.wxRequest({
        url: config.BASE_URL + '/m/vshop-pickout.html',
        method: 'GET',
        data: {
            'pids': Object.keys(pids_map).join(',')
        },
        success: function(res) {
            var pickout_data = res.data.data;
            if (pickout_data) {
                for (var pid in pickout_data) {
                    if (pickout_data[pid]['profit'] > 1) {
                        pickout_data[pid]['s_price'] = parseFloat(pickout_data[pid]['profit']).toFixed(2);
                    } else {
                        pickout_data[pid]['s_price'] = (parseFloat(pids_map[pid]) * parseFloat(pickout_data[pid]['profit'])).toFixed(2);
                    }
                    var _set = {};
                    _set['pickout.' + pid] = pickout_data[pid];
                    _this.setData(_set);
                }
            }

        },
        complete: function() {

        }
    });
};

var page_options = {
    data: {
        is_vshop_index: true,
        fromother:false
    },
    onShow: function() {
        if (this.data.hideLoading) {
            //is_ready
            swan.setNavigationBarTitle({
                title: this.data.vshop.name
            });
        }
    },
    onReady: function() {
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight - 134,
                });
            }
        });
    },
    onPullDownRefresh: function() {
        this.onLoad.call(this);
    },
    onShareAppMessage: function() {
        var _this = this;
        var the_path = '/pages/vshop/home/index';
        the_path += '?_vshop_id=' + this.data.vshop['shop_id']+'&from=other';
        the_path = util.merchantShare(the_path);
        this.setData({
            'onshare': true
        });

        return {
            title: this.data.vshop['name'],
            path: the_path,
            imageUrl: _this.data.vshop.logo_url
        };
    },
    onLoad: function(options) {
        var _this = this;
        if(options._vshop_id){
            //for 微店
            swan.setStorageSync('_vshop_id',options._vshop_id);
            
        }
        if (options.from == 'other') {
          _this.setData({
            fromother: true
          })
        }
        var vshop_id = swan.getStorageSync('_vshop_id');
        if (!vshop_id) {
            util.wxRequest({
                url: config.BASE_URL + '/m/vshop-info.html',
                success: function(res) {
                    var vshop = res.data.vshop;
                    init_pagedata.call(_this, vshop['shop_id']);
                },
                fail: function(re) {
                    console.info(re);
                }
            });
        } else {
            init_pagedata.call(_this, vshop_id);
        }
        this.setData({
            gallery_tpl_type: swan.getStorageSync('gallery_tpl_type') || 'list'
        });

    },
    evt_pickout: function(e) {
        var _this = this;
        var gid = e.currentTarget.dataset.goodsid;
        var pid = e.currentTarget.dataset.productid;
        var pickout_data = _this.data.pickout;
        pickout_data[pid]['pickout'] = !pickout_data[pid]['pickout'];
        _this.setData({
            'pickout': pickout_data
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/vshop-pickout-save.html',
            method: 'GET',
            data: {
                'gids': gid
            },
            success: function(res) {
                if (res.data && res.data.error) {
                    pickout_data[pid]['pickout'] = !pickout_data[pid]['pickout'];
                    _this.setData({
                        'pickout': pickout_data
                    });
                }
            }
        });
    },
    evt_showdefaultgroupbooking: function () {

      swan.navigateTo({
        url: '/pages/groupbooking/list/list'
      });
    },
    evt_showdefaultpreselling: function () {
      
      swan.navigateTo({
        url: '/pages/preselling/list/list'
      });
    },
    evt_showdefaultindex: function() {
        swan.reLaunch({
            url:'/pages/index/index'
        });
    },
    evt_getqrcode: function(e) {
        var _this = this;
        swan.showToast({
            title:'正在生成',
            icon:'loading',
            mask:true,
            duration:10000
        });
        util.getqrcode({
            'path': '/pages/vshop/home/index?_vshop_id=' + _this.data.vshop.shop_id+'&from=other',
            'type': 'scene',
            'width': 430
        }, function(qr_image_data) {
            swan.hideToast();
            swan.previewImage({
                urls: [qr_image_data.qrcode_image_url]
            });
        });
    }
};

module.exports = page_options;
