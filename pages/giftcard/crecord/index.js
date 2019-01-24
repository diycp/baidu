//礼品卡首页
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
var current_page = 1;
var loading_more = false;
var load_list = function(page) {
    loading_more = true;
    var _this = this;
    var page = page ? page : 1;
    util.wxRequest({
        url: config.BASE_URL + '/m/gcrecord-' + page + '-' + (this.data.is_recipient||0) + '.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata) {
                if (_thisdata.crecord_list && page > 1) {
                    newdata.crecord_list = _thisdata.crecord_list.concat(newdata.crecord_list);
                    //Object.assign(newdata.crecord_items_group,_thisdata.crecord_items_group);
                }
                if (!newdata.crecord_list || !newdata.crecord_list.length) {
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
            title:'我的礼品卡'
        });
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    win_height: res.windowHeight,
                    win_width: res.windowWidth
                });
            }
        });
    },
    onLoad: function(options) {
        var _this = this;
        this.setData(options);

        current_page = 1;
        util.checkMember.call(this, function() {
            load_list.call(_this);
        });
    },
    load_image_l: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this,image_id,'l');
    },
    load_image_m: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this,image_id,'m');
    },
    load_image_s: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this,image_id,'s');
    },
    load_image_xs: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this,image_id,'xs');
    }
});
