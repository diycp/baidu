const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();
var current_page = 1;
var loading_more = false;
var load_list = function(page) {
    loading_more = true;
    var _this = this;
    var page = page ? page : 1;
    util.wxRequest({
        url: config.BASE_URL + '/m/gbmember-orders_list' + ('-' + this.data.order_type) + '-' + page + '.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata) {
                if (_thisdata.order_list && page > 1) {
                    newdata.order_list = _thisdata.order_list.concat(newdata.order_list);
                }
                if (!newdata.order_list || !newdata.order_list.length) {
                    newdata.empty_list = 'YES';
                } else {
                    newdata.empty_list = 'NO';
                }
                _this.setData(newdata);
            }
        },
        complete:function(){
            _this.setData({hideLoading:true});
            loading_more = false;
        }
    });
};

Page({
    data: {
        order_type: 'all',
        empty_list: 'NO',
        status_kvmap: {
            order_status: {
                'active': '执行中',
                'dead': '已作废',
                'finish': '已完成'
            },
            pay_status: ['未支付', '已支付', '已付款至到担保方', '部分付款', '部分退款', '全额退款'],
            ship_status: ['未发货', '已发货', '部分发货', '部分退货', '已退货'],
        }
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '我的团单'
        });
    },
    onLoad: function(options) {
        var _this = this;
        this.setData({
          themecolor: app.globalData.themecolor
        })
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight,
                });
            }
        });
        this.setData(options);
        current_page = 1;
        util.checkMember.call(this, function() {
            load_list.call(_this);
        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'xs');
    },
    evt_scrolltolower: function(e) {
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    evt_navigator:function(e){
        swan.navigateTo({
            url:e.currentTarget.dataset.url
        });
    },
});
