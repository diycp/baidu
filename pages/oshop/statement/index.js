const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
var dateFormat = require('../../../utils/dateformat.js');
var oshop = require('../oshop.js');
var app = getApp();
var current_page = 1;
var loading_more = false;
var my_type = 'store';
var format_statement_list = function(statement_list){
    for (var i = 0; i < statement_list.length; i++) {
        statement_list[i]['createtime'] = dateFormat(parseInt(statement_list[i]['createtime'])*1000,'yyyy-mm-dd HH:MM:ss');
        statement_list[i]['last_modify'] = dateFormat(parseInt(statement_list[i]['last_modify'])*1000,'yyyy-mm-dd HH:MM:ss');
    }
    return statement_list;
}
var load_list = function(page) {
    var _this = this;
    var page = page ? page : 1;
    loading_more = true;
    util.wxRequest({
        url: config.BASE_URL + '/m/o2ocds-statement-' + page + '.html',
        method:'POST',
        data:_this.data.filter_data,
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata) {
                newdata.statement_list && (newdata.statement_list = format_statement_list(newdata.statement_list));
                if (!newdata.statement_list || !newdata.statement_list.length) {
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
        filter_data: {},
        empty_list: 'NO',
        status_kvmap: {
            'noconfirm': '待确认',
            'ready':'待结算',
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
        current_page = 1;
        util.checkMember.call(this, function() {
            load_list.call(_this);
        });
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
