const config = require('../../config/config.js');
const util = require('../../utils/util.js');

const wxpay  = function(money){
    if(money<=0)return;
    var pagedata = this.data;
    swan.showToast({
        'icon':'loading',
        'title':'准备支付',
        'mask':true,
        'duration':10000
    });
    var _this = this;
    util.wxRequest({
        url:config.BASE_URL+'/m/balancepay-do_recharge.html?openid='+pagedata.member.openid,
        method:'POST',
        data:{
            money:money,
            payapp_id:'wxpayinwxapp'
        },
        success: function(res) {
            swan.hideToast();
            if(res.data.error){
                swan.showModal({
                  title: '支付请求异常',
                  content: res.data.error||''
                });
            }else{
                let pay_params = res.data;
                pay_params.success = function(res){
                    swan.showModal({
                        title: '充值成功',
                        showCancel: false,
                        success: function(e) {
                            swan.navigateBack();
                        }
                    });
                };
                pay_params.fail = function(res){
                    if(res.errMsg == 'requestPayment:fail cancel'){
                        return;
                    }
                }
                swan.requestPayment(pay_params);
            }
        }
    });
};
Page({
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '充值'
        });
    },
    onPullDownRefresh: function() {
        
    },
    onShow:function(){

    },
    onLoad: function(options) {
        var _this = this;
        //swan.showNavigationBarLoading();
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/ubalance-recharge.html',
                success: function(res) {
                    _this.setData(res.data);
                }
            });
        });
    },
    evt_moneyipt:function(e){
        //console.info(e);
        this.setData({
            update_ubalance_val:e.detail.value * this.data.setting.exchange_ratio
        });
    },
    evt_submit:function(e){
        wxpay.call(this,e.detail.value.money);
    }
});
