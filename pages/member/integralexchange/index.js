const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const dateFormat = require('../../../utils/dateformat.js');
// const app = getApp();

var format_pagedata = function(pagedata){
    for (var k in pagedata.coupon_list) {
        pagedata.coupon_list[k].from_time = dateFormat(parseInt(pagedata.coupon_list[k].from_time)*1000,'yy-mm-dd HH:MM');
        pagedata.coupon_list[k].to_time = dateFormat(parseInt(pagedata.coupon_list[k].to_time)*1000,'yy-mm-dd HH:MM');
    }

    return pagedata;
}

Page({
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '积分兑换优惠券'
        });
    },
    onLoad: function(options) {
        var _this = this;
        swan.getSystemInfo({success:function(res){
            _this.setData({
                sv_height:res.windowHeight,
            });
        }});
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/integralexchange-exchange_coupon.html',
                success: function(res) {
                    var pagedata = format_pagedata(res.data);
                    pagedata['hideLoading'] = true;
                    _this.setData(pagedata);
                }
            });
        });
    },
    evt_exchange:function(e){
        var coupon_id = e.currentTarget.dataset.couponid;
        swan.showToast({
            title:'正在兑换',
            icon:'loading',
            duration:3000
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/integralexchange-exchange_coupon-'+coupon_id+'.html',
            success: function(res) {
                if(res.data && res.data.success){
                    swan.showModal({
                        title: '兑换成功',
                        showCancel: false,
                        content: '优惠券兑换成功',
                        success:function(res){
                            if (res.confirm) {
                                swan.redirectTo({
                                    url:'/pages/member/coupons/index'
                                });
                            }
                        }
                    });
                }else{
                    swan.showModal({
                        title: '兑换失败',
                        showCancel: false,
                        content: ((res.data && res.data.error)?res.data.error:'优惠券兑换失败')
                    });
                }
            },
            complete:function(){
                swan.hideToast();
            }
        });
    }
});
