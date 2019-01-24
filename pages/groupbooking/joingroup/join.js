const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();

Page({
    data: {
        hideLoading:false,
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '参团'
        });
    },
    onLoad: function(options) {
        var _this = this;
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/gbitem-offered-' + options.activity_id +'-'+ options.product_id +'-'+ options.gb_id + '.html',
                success:function(re){
                    var arr = [re.data.data_detail];
                    _this.setData({
                        activity:re.data.activity,
                        showimg:arr,
                        main_order:re.data.main_order,
                        members:re.data.members,
                        hideLoading:true
                    })
                    //倒计时
                    _this.countdown();
                }
            })
        });
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'xs');
    },
    evt_navigator:function(e){
        swan.navigateTo({
            url:e.currentTarget.dataset.url
        });
    },
    countdown: function(){
        var _this = this;
        util.countdown(_this,_this.data.activity.surplus_time);
    },
});
