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
        if (filter[k] && filter[k] != '' && k != 'page') {
            filtering_status = 'YES';
            query_str_arr.push(k + "=" + filter[k]);
            if (k == 'keyword') {
                _this.setData({
                    inputVal: decodeURIComponent(filter[k])
                });
            }
        }
    }
    _this.setData({
        'filtering': filtering_status,
        //'query_str':query_str_arr.join('&')
    });
    util.wxRequest({
        url: config.BASE_URL + '/m/list.html?' + query_str_arr.join('&'),
        success: function(res) {
            console.info(res);
            var newdata = res.data;
            var _thisdata = _this.data;
          if (newdata) {
            if (page == 1) {
              let props = [];
              let params = {};
              let options = {
                PageController: config.BASE_URL + '/m/list.html?' + query_str_arr.join('&'),
                PageTitle: '商品列表',
                ResultCount: newdata.all_count
              }
              for (var k in filter) {
                if (filter[k] && filter[k] != '' && k != 'page') {
                  if (k == 'keyword') {
                    params['KeyWord'] = filter[k];
                  }
                  if (k == 'cat_id' && newdata.cat_path) {
                    let cat_path = newdata.cat_path;
                    cat_path.find(function (x) {
                      if (x.ident == filter[k]) {
                        params['FilterCat'] = x.title;
                      }
                    })
                  }
                  if (k == 'brand_id' && newdata.data_screen) {
                    let brand_path = newdata.data_screen.brand_id.options;
                    params['FilterBrand'] = brand_path[filter[k]];
                  }
                  if (k.indexOf('p_') > -1) {
                    let title = newdata.data_screen[k].title;
                    let detail = newdata.data_screen[k].options[filter[k]];
                    props.push(title + ':' + detail);
                  }
                }
              }
              if (props.length > 0) {
                params['FilterProperty'] = props.join('/');
              }
              Object.assign(options, params);
              app.oceanWay('SearchProduct', options, true);
            }
                if (_thisdata.data_list && page > 1) {
                    newdata.data_list = _thisdata.data_list.concat(newdata.data_list);
                }
                if(newdata.data_list){

                }
                if (!newdata.data_list) {
                    newdata.empty_list = 'YES';
                } else {
                    console.info(1);
                    newdata.empty_list = 'NO';
                    // for (var i = 0; i < newdata.data_list.length; i++) {
                    //     newdata.data_list[i]['image'] &&
                    //         (newdata.data_list[i]['image'] = util.fixImgUrl(newdata.data_list[i]['image']));
                    // }
                    load_profit.call(_this, newdata.data_list); //for vshop
                }
                // console.info(newdata);
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

/**
 *  vshop
 */
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

Page({
    data: {
        pickout: {},
        filter: {},
        inputVal: '',
        screen_active: 'NO',
        empty_list: 'NO',
        fromother:false,
        gallery_tpl_type:'grid',
        img_url: config.BASE_HOST
    },
    onPullDownRefresh: function() {
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
            if (this.data.filter[k] == ' ') {
                delete(this.data.filter[k]);
            }
        }
        this.setData({
            filter: this.data.filter
        });
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
            title: '商品列表'
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
          themecolor: app.globalData.themecolor
        })
        if(options._vshop_id){
            //for 微店
            swan.setStorageSync('_vshop_id',options._vshop_id);
            
        }
        if (options.from == 'other') {
          this.setData({
            fromother: true
          })
        }
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.screenHeight - 48,
                    fp_height: res.screenHeight - 30
                });
            }
        });
        this.setData({
            filter: options
        });
        load_list.apply(this, [1]);
    },
    clearInput: function() {
        this.setData({
            inputVal: ""
        });
        var filter = this.data.filter;
        if (!filter || filter['keyword'] == '') {
            return;
        }
        delete(filter['keyword']);
        this.setData({
            'filter': filter
        });
        load_list.call(this, 1);
    },
    inputTyping: function(e) {
        this.setData({
            inputVal: e.detail.value
        });
    },
    confirmInput: function(e) {
      var filter = this.data.filter;
      if (!filter) {
          filter = {};
      }
      filter['keyword'] = this.data.inputVal ? this.data.inputVal:'';
      this.setData({
          'filter': filter
      });
      load_list.call(this, 1);
    },
    onShareAppMessage: function() {
        var _this = this;
        console.log(this.data.query)
        var the_path = '/pages/gallery/gallery?' + this.data.query;
        the_path = util.merchantShare(the_path);
        var _return = {
            title: '商品列表',
            path: the_path
        };
        if (this.data.pickout) {
            var vshop_id = this.data.pickout[Object.keys(this.data.pickout)[0]]['vshop_id'];
            if (vshop_id) {
                the_path += '&_vshop_id=' + vshop_id+'&from=other';
                //强制分享风格
                _return['imageUrl'] = util.fixImgUrl(this.data.data_list[0].image);
                _return['path'] = the_path;
            }
        }
        console.info(_return);
        return _return;
    },
    evt_chgview: function() {
        this.setData({
            gallery_tpl_type: (this.data.gallery_tpl_type == 'grid' ? 'list' : 'grid')
        })
        swan.setStorageSync('gallery_tpl_type', this.data.gallery_tpl_type);
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
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'm');
    }
});
