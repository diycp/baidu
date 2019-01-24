const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
var dateFormat = require('../../../utils/dateformat.js');
var oshop = require('../oshop.js');
var app = getApp();
var current_page = 1;
var loading_more = false;
var format_order_list = function(order_list){
    for (var i = 0; i < order_list.length; i++) {
        order_list[i]['createtime'] = dateFormat(parseInt(order_list[i]['createtime'])*1000,'yyyy-mm-dd HH:MM:ss');
    }
    return order_list;
}
var load_list = function(page) {
    var _this = this;
    var page = page ? page : 1;
    loading_more = true;
    util.wxRequest({
        url: config.BASE_URL + '/m/o2ocds-orders' + ('-' + this.data.order_type) + '-' + page + '.html',
        method:'POST',
        data:_this.filter?_this.filter:{},
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            newdata.order_list && (newdata.order_list = format_order_list(newdata.order_list));
            if (newdata) {
                if (_thisdata.order_list && page > 1) {
                    newdata.order_list = _thisdata.order_list.concat(newdata.order_list);
                    Object.assign(newdata.order_items_group,_thisdata.order_items_group);
                    Object.assign(newdata.sc_member_list,_thisdata.sc_member_list);
                    Object.assign(newdata.rel_store_list,_thisdata.rel_store_list);
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
        inputVal:'',
        current_filter_index:0,
        filter_range:[{
            'key':'order[order_id|has]',
            'title':'订单号',
        },{
            'key':'order[consignee_name|has]',
            'title':'收货人',
        },{
            'key':'order[consignee_mobile|has]',
            'title':'手机号',
        }
        ],
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
            title: '分销订单列表'
        });
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
    evt_changefilter:function(e){
        this.setData({
            current_filter_index:e.detail.value
        });
    },
    clearInput: function() {
        this.setData({
            inputVal: ""
        });
        this.confirmInput();
    },
    inputTyping: function(e) {
        this.setData({
            inputVal: e.detail.value
        });
    },
    confirmInput: function(e) {
        if (this.data.inputVal != '') {
            this.filter = {};
            this.filter[this.data.filter_range[this.data.current_filter_index]['key']] = this.data.inputVal;
        }else{
            this.filter = null;
        }
        load_list.call(this);
    },
});
