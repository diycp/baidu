const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const app = getApp();


Page({
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '物流追踪'
        });
    },
    onLoad: function(options) {
        var _this = this;
        util.checkMember.call(this,function(){
            util.wxRequest({
                url: config.BASE_URL + '/m/logisticstracker-'+options.order_id+'.html',
                success: function(res) {
                    _this.setData(res.data);
                },
                complete:function(){
                    _this.setData({hideLoading:true});
                }
            });
        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'xs');
    },
});
