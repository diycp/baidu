const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
var dateFormat = require('../../../utils/dateformat.js');
var oshop = require('../oshop.js');
var app = getApp();
var current_page = 1;
var loading_more = false;
var format_voucher_list = function(voucher_list){
    for (var i = 0; i < voucher_list.length; i++) {
        voucher_list[i]['createtime'] = dateFormat(parseInt(voucher_list[i]['createtime'])*1000,'yyyy-mm-dd HH:MM:ss');
    }
    return voucher_list;
}
var load_list = function(page) {
    var _this = this;
    var page = page ? page : 1;
    loading_more = true;
    util.wxRequest({
        url: config.BASE_URL + '/m/o2ocds-orderlog_achieve-' + page + '.html',
        method:'POST',
        data:_this.data.filter_data,
        success: function(res) {
            var newdata = res.data;
            parseFloat(newdata.count_subprice)>0 &&
            swan.setNavigationBarTitle({
                title: ('合计:¥'+newdata.count_subprice)
            });
            var _thisdata = _this.data;
            if (newdata) {
                newdata.achieve_list && (newdata.achieve_list = format_voucher_list(newdata.achieve_list));
                if (_thisdata.achieve_list && page > 1) {
                    newdata.achieve_list = _thisdata.achieve_list.concat(newdata.achieve_list);
                    Object.assign(newdata.achieve_items,_thisdata.achieve_items);
                }
                if (!newdata.achieve_list || !newdata.achieve_list.length) {
                    newdata.empty_list = 'YES';
                } else {
                    newdata.empty_list = 'NO';
                }
                _this.setData(newdata);
            }
        },
        complete:function(){
            swan.stopPullDownRefresh();
            _this.setData({hideLoading:true});
            loading_more = false;
        }
    });
};

Page({
    data: {
        filter_data: {
            status:''
        },
        empty_list: 'NO',
        status_kvmap: {
            'ready': '待结算',
            'process': '处理中',
            'succ': '已结算'
        }
    },
    onPullDownRefresh: function() {
        load_list.call(this, current_page);
    },
    onReady: function() {
    },
    onLoad: function(options) {
        var _this = this;
        var oshop_role = oshop.getRole();
        this.setData(oshop_role);
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight - 49,
                });
            }
        });
        swan.setNavigationBarTitle({
            title: '结算管理'
        });
        this.setData({filter_data:Object.assign(this.data.filter_data,options)});
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
    evt_changefilter_from:function(e){
        this.setData({
            'filter_data.from':e.detail.value
        });
    },
    evt_changefilter_to:function(e){
        this.setData({
            'filter_data.to':e.detail.value
        });
    },
    evt_dofilter:function(e){
        load_list.call(this, current_page);
    }
});
