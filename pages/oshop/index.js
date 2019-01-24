const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const oshop = require('oshop.js');
Page({
    data:{
        hideLoading:false
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '正在跳转...'
        });
    },
    onLoad: function(options) {
        var _this = this;
        if(options && options.qrcode_sn){
            const qrcode_sn = options.qrcode_sn;
            util.wxRequest({
                url: config.BASE_URL + '/m/cdspassport-check_qrcode-' + qrcode_sn + '.html',
                success: function(res) {
                    var resdata = res.data;
                    if (resdata.success) {
                        console.info(resdata.data);
                        /**
                         *  {qrcode:'xxxx',store_name:'',store_sno:''}
                         */
                         swan.setStorage({
                             key:'_qrcode',
                             data:qrcode_sn,
                             success:function(){
                                 swan.switchTab({
                                     url:'/pages/index/index'
                                 });
                             }
                         });
                    } else {
                        swan.redirectTo({
                            url: '/pages/oshop/signup/shop/edit?qrcode=' + qrcode_sn,
                            complete: function() {
                                swan.removeStorageSync('_qrcode');
                            }
                        });
                    }
                }
            });
        }else{
            swan.switchTab({
                url:'/pages/index/index'
            });
        }

    }
});
