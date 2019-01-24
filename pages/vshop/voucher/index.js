const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const dateFormat = require('../../../utils/dateformat.js');
const app = getApp();
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
        url: config.BASE_URL + '/m/vshop-voucher-' + page + '.html',
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
                newdata.voucher_list && (newdata.voucher_list = format_voucher_list(newdata.voucher_list));
                if (_thisdata.voucher_list && page > 1) {
                    newdata.voucher_list = _thisdata.voucher_list.concat(newdata.voucher_list);
                    Object.assign(newdata.voucher_items,_thisdata.voucher_items);
                }
                if (!newdata.voucher_list || !newdata.voucher_list.length) {
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
        filter_data: {
            status:''
        },
        empty_list: 'NO',
        status_kvmap: {
            'ready': '待结算',
            'process': '处理中',
            'succ': '已结算',
            'noconfirm':'待确认'
        }
    },
    onReady: function() {
    },
    onLoad: function(options) {
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight - 49,
                });
            }
        });
        swan.setNavigationBarTitle({
            title: '结算凭证'
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
