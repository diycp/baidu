//gallery.js
//商品列表页
const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const app = getApp();
var current_page = 1;
var loading_more = false;
var load_list = function(page) {
    loading_more = true;
    var _this = this;
    var query_str_arr = [];
    swan.showNavigationBarLoading();
    page = page ? page : current_page;
    query_str_arr.push("page=" + page);
    var filter = _this.data.filter;
    var filtering_status = 'NO';
    for (var k in filter) {
        if (filter[k] && filter[k] != '') {
            query_str_arr.push(k + "=" + filter[k]);
            if(k!='orderby'){
                filtering_status = 'YES';
            }
        }

    }
    _this.setData({
        'filtering': filtering_status,
        //'query_str':query_str_arr.join('&')
    });
    util.wxRequest({
        url: config.BASE_URL + '/m/integralmall.html?' + query_str_arr.join('&'),
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata) {
                if (_thisdata.data_list && page > 1) {
                    newdata.data_list = _thisdata.data_list.concat(newdata.data_list);
                }
                if (!newdata.data_list || !newdata.data_list.length) {
                    newdata.empty_list = 'YES';
                } else {
                    newdata.empty_list = 'NO';
                    for (var i = 0; i < newdata.data_list.length; i++) {
                        newdata.data_list[i]['image'] &&
                            (newdata.data_list[i]['image'] = util.fixImgUrl(newdata.data_list[i]['image']));
                    }
                }
                _this.setData(newdata);
            }
        },
        fail: function(re) {
            console.info(re);
        },
        complete: function(e) {
            // swan.hideToast();
            swan.hideNavigationBarLoading();
            _this.setData({
                hideLoading: true
            });
            loading_more = false;
        }
    });
    current_page = page;
};


Page({
    data: {
        filter: {},
        screen_active: 'NO',
        empty_list: 'NO',
        img_url: config.BASE_HOST
        //gallery_tpl_type:'grid'
    },
    onPullDownRefresh: function() {
        // swan.showToast({
        //     title:'正在刷新',
        //     icon:'loading',
        //     deduction:1500
        // });
        load_list.call(this, 1);
    },
    evt_scrolltolower: function() {
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    evt_chgfilter: function(e) {
        var dataset = e.currentTarget.dataset;
        if (dataset['fkey'] == 'cat_id') {
            this.data.filter = {
                'cat_id': dataset['val'],
            }
        } else {
            this.data.filter[dataset['fkey']] = dataset['val'];
        }
        for (var k in this.data.filter) {
            if (this.data.filter[k] == '') {
                delete(this.data.filter[k]);
            }
        }
        this.setData({
            filter: this.data.filter
        });
        load_list.call(this, current_page = 1);
    },
    evt_min_numslider:function(e){
        if(this.data.filter.deduction){
            var deduction_arr = this.data.filter.deduction.split('~');
        }else{
            var deduction_arr = [this.data.data_screen.min_num,this.data.data_screen.max_num];
        }
        deduction_arr[0] = e.detail.value;
        this.setData({
            slide_deduction:deduction_arr
        });
        this.data.filter.deduction = deduction_arr.join('~');
        load_list.call(this, current_page = 1);
    },
    evt_max_numslider:function(e){
        if(this.data.filter.deduction){
            var deduction_arr = this.data.filter.deduction.split('~');
        }else{
            var deduction_arr = [this.data.data_screen.min_num,this.data.data_screen.max_num];
        }
        deduction_arr[1] = e.detail.value;
        this.setData({
            slide_deduction:deduction_arr
        });
        this.data.filter.deduction = deduction_arr.join('~');
        load_list.call(this, current_page = 1);
    },
    evt_tapscreen: function(e) {
        if (e.currentTarget.dataset.currenttap) {
            var val = (this.data.screen_active == 'YES' ? 'NO' : 'YES');
            this.setData({
                screen_active: val
            });
        }
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '积分商城'
        });
        var exist_gtype = swan.getStorageSync('gallery_tpl_type');
        if (!exist_gtype) {
            swan.setStorageSync('gallery_tpl_type', 'grid');
        }
        this.setData({
            gallery_tpl_type: swan.getStorageSync('gallery_tpl_type')
        });
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
            themecolor:app.globalData.themecolor
        })
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight - 35,
                    fp_height: res.windowHeight - 30
                });
            }
        });
        this.setData({
            filter: options
        });
        load_list.apply(this, [1]);
    },
    onShareAppMessage: function() {
        var _this = this;
        var the_path = '/pages/integralmall/gallery?' + this.data.query;
        the_path = util.merchantShare(the_path);

        this.setData({
            'onshare': true
        });
        return {
            title: '积分商城',
            path: the_path,
            complete: function() {
                _this.setData({
                    'onshare': false
                });
            }
        };
    },
    evt_chgview: function() {
        this.setData({
            gallery_tpl_type: (this.data.gallery_tpl_type == 'grid' ? 'list' : 'grid')
        })
        swan.setStorageSync('gallery_tpl_type', this.data.gallery_tpl_type);
    }
});
