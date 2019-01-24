const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const getGpsDistance = require('../../../../utils/gpsdistance.js');
const WxParse = require('../../../../utils/wxParse/wxParse.js');
const app = getApp();
const format_gpsdistance = function(val) {
    let km = Math.round(val);
    return (km > 0 ? (km + 'km') : (Math.round(val * 1000) + ' m'));
}

const count_gpsdistance = function() {
    var _this = this;
    swan.getLocation({
        type:'gcj02',
        success: function(res) {
            let gpsdistance = getGpsDistance(res.latitude,
                res.longitude, _this.data.store.lat, _this.data.store.lng);
            let _set = {};
            _set['store.gpsdistance'] = format_gpsdistance(gpsdistance);
            _this.setData(_set);
        }
    });
}


const wxpay  = function(order_id){
    var pagedata = this.data;
    if(!order_id)return;
    swan.showToast({
        'icon':'loading',
        'title':'准备支付',
        'mask':true,
        'duration':10000
    });
    var _this = this;
    util.wxRequest({
        url:config.BASE_URL+'/m/activity-order_payment-'+order_id+'.html?openid='+pagedata.member.openid,
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
                    swan.showToast({
                        'icon':'success',
                        'title':'支付成功',
                        'duration':1500
                    });
                    _this.onLoad({
                        order_id:_this.data.order.id
                    });
                };
                pay_params.fail = function(res){
                    // if(res.errMsg == 'requestPayment:fail cancel'){
                    //     return;
                    // }
                    _this.onLoad({
                        order_id:_this.data.order.id
                    });
                }
                swan.requestPayment(pay_params);
            }
        }
    });
}


Page({
    data: {
        qrcode_api: config.BASE_URL + '/openapi/qrcode/encode/size/12/margin/0'
    },
    onPullDownRefresh: function() {
        this.onLoad.call(this,this.data.onloadoptions);
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '线下活动'
        });
    },
    onShow: function() {
        if (!this.data.store) return;
        count_gpsdistance.call(this);
        var _this = this;
        swan.getScreenBrightness({
            success:function(val){
                _this.normal_bright = val;
                console.info('normal_bright:'+val);
                swan.setScreenBrightness({
                    value:1
                });
            }
        });
    },
    onHide:function(){
        this.normal_bright &&
        swan.setScreenBrightness({
            value:this.normal_bright
        });
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
          themecolor: app.globalData.themecolor,
          onloadoptions:options
        })
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/activity-order_success-' + options.order_id + '.html',
                success: function(res) {
                    WxParse.wxParse('subject_desc', 'html', res.data.subject.desc, _this, 0);
                    _this.setData(res.data);
                    count_gpsdistance.call(_this);
                },
                fail: function(re) {
                    console.info(re);
                },
                complete: function() {
                    _this.setData({
                        hideLoading: true
                    });
                    swan.stopPullDownRefresh();
                }
            });
        });

    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'm');
    },
    evt_navstart: function(e) {
        swan.openLocation({
            latitude: parseFloat(this.data.store.lat),
            longitude: parseFloat(this.data.store.lng),
            scale: 28,
            name: this.data.store.name,
            address: this.data.store.address,
            fail: function() {
                console.info(arguments);
            }
        });
    },evt_ticketpay:function(e){
        wxpay.call(this,this.data.order.id);
    }
});
