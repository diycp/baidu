const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const app = getApp();
var current_page = 1;
var loading_more = false;

var load_list = function(page) {
    loading_more = true;
    swan.showNavigationBarLoading();
    page = page ? page : 1;
    var _this = this;
    util.wxRequest({
        url: config.BASE_URL + '/m/aftersales-request-' + page + '.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata) {
                if (_thisdata.request_list && page > 1) {
                    newdata.request_list = _thisdata.request_list.concat(newdata.request_list);
                }
                if (!newdata.request_list || !newdata.request_list.length) {
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
            swan.hideNavigationBarLoading();
            loading_more = false;
        }
    });
    current_page = page;
};

Page({
    data:{
        status_map:{
            '1':'审核中',
            '2':'被拒绝',
            '3':'退货处理中',
            '4':'退款处理中',
            '5':'处理完成'
        }
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '售后查询'
        });
    },
    evt_scrolltolower: function() {
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    onLoad: function(options) {
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight,
                });
            }
        });
        util.checkMember.call(this, function() {
            load_list.call(_this, 1);
        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'xs');
    }

});
