const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
var dateFormat = require('../../../utils/dateformat.js');
var current_page = 1;
var loading_more = false;
var load_list = function(page) {
    loading_more = true;
    var _this = this;
    var page = page ? page : 1;
    util.wxRequest({
        url: config.BASE_URL + '/m/o2ocds-notice_list-'  + page + '.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            for (var i = 0; i < newdata.notice_list.length; i++) {
                newdata.notice_list[i].pubtime = dateFormat(parseInt(newdata.notice_list[i].pubtime)*1000,'yyyy-mm-dd HH:MM:ss');
            }
            if (newdata) {
                if (_thisdata.notice_list && page > 1) {
                    newdata.notice_list = _thisdata.notice_list.concat(newdata.notice_list);
                }
                if (!newdata.notice_list || !newdata.notice_list.length) {
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
        empty_list: 'NO'
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '公告'
        });
    },
    onLoad: function(options) {
        var _this = this;
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
    }
});
