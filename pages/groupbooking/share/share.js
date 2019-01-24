const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();

Page({
    data: {
        hideLoading:false,
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '邀请参团'
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
                        hideLoading:true,
                    })
                    _this.setData({
                        'activity.gb_id':options.gb_id
                    })
                    //倒计时
                    _this.countdown();
                }
            })
        });
    },
    load_image: function(e) {
        console.log(e)
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
    onShareAppMessage:function(){
        var _this = this;
        let the_path = '/pages/groupbooking/share/product/product?activity_id=' + _this.data.activity.activity_id + '&gb_id=' + _this.data.activity.gb_id + '&product_id=' + _this.data.activity.product_id;
        the_path = util.merchantShare(the_path);

        return {
          title: '邀请参团',
          path: the_path,
          success: function(res) {
            // 转发成功
          },
          fail: function(res) {
            // 转发失败
          }
        }
    }
});
