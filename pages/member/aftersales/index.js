const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();
var current_page = 1;
var loading_more = false;


var load_list = function(page){
    loading_more = true;
    swan.showNavigationBarLoading();
    page = page?page:current_page;
    var _this = this;
    util.wxRequest({
        url: config.BASE_URL + '/m/aftersales-order-'+page+'.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if(newdata){
                if(_thisdata.order_list && page>1){
                    newdata.order_list = _thisdata.order_list.concat(newdata.order_list);
                    Object.assign(newdata.order_items_group,_thisdata.order_items_group);
                    // for (var order_id in _thisdata.order_items_group) {
                    //     newdata.order_items_group[order_id] = _thisdata.order_items_group[order_id];
                    // }
                }
                if(!newdata.order_list || !newdata.order_list.length){
                    newdata.empty_list = 'YES';
                }else{
                    newdata.empty_list = 'NO';
                }
                _this.setData(newdata);
            }
        },fail: function(re) {
            console.info(re);
        },
        complete:function(e){
            swan.hideNavigationBarLoading();
            loading_more = false;
        }
    });
    current_page = page;
}

Page({
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '售后申请'
        });
    },
    evt_scrolltolower:function(){
        if(loading_more || this.data.pager.total == this.data.pager.current){
            return;
        }
        current_page+=1;
        load_list.call(this,current_page);
    },
    onLoad: function(options) {
        var _this = this;
        swan.getSystemInfo({success:function(res){
            _this.setData({
                sv_height:res.windowHeight,
            });
        }});
        util.checkMember.call(this, function() {
            load_list.call(_this,1);
        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'xs');
    }

});
