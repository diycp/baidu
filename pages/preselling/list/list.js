//groupbookingList.js
//拼团商品列表页
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
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
    util.wxRequest({
        url: config.BASE_URL + '/m/psllist.html?' + query_str_arr.join('&'),
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
        empty_list: 'NO',
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
          themecolor:app.globalData.themecolor
        })
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight - 48,
                    fp_height: res.windowHeight - 30
                });
            }
        });
        load_list.apply(this, [1]);
    },
    onPullDownRefresh: function() {
        load_list.call(this, 1);
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'xs');
    },
    evt_scrolltolower: function() {
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '预售列表'
        });
    },
});
