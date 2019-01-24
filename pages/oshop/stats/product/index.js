const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
// const oshop = require('../../oshop.js');
// const app = getApp();
var current_page = 1;
var loading_more = false;

const load_list = function(page) {
    var _this = this;
    var page = page ? page : 1;
    loading_more = true;
    util.wxRequest({
        url: config.BASE_URL + '/m/cdsstats-hot_goods-'+page+'.html',
        method:'POST',
        data:_this.data.filter?_this.data.filter:{},
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata) {
                if (!newdata.goods_list || !newdata.goods_list.length) {
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
        filter:{order:'goods_count'}
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '热销商品'
        });
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight - 48
                });
            }
        });
    },
    evt_scrolltolower: function(e) {
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    onLoad: function(options) {
        var _this = this;
        util.checkMember.call(this, function() {
            load_list.call(_this);
        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'xs');
    },
    evt_navigator:function(e){
        swan.navigateTo({
            url:e.currentTarget.dataset.url
        });
    },
    evt_goto:function(e){
        swan.switchTab({
            url:'/pages/member/index',
            success:function(){
                swan.navigateTo({
                    url:e.currentTarget.dataset.url
                });
            }
        });
    },
    evt_changefilter_from:function(e){
        this.setData({
            'filter.from':e.detail.value
        });
    },
    evt_changefilter_to:function(e){
        this.setData({
            'filter.to':e.detail.value
        });
    },
    evt_radiochange:function(e){
        this.setData({
            'filter.order':e.detail.value
        });
        load_list.call(this,current_page = 1);
    },
    evt_dofilter:function(e){

        load_list.call(this,current_page = 1);
    }
});
