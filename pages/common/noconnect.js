//index.js
//获取应用实例
const config = require('../../config/config.js');

Page({
    data: {
      img_url:config.BASE_HOST
    },
    evt_retry: function(e) {
        swan.getNetworkType({
            success:function(re){
                if(re.networkType != 'none'){
                    swan.reLaunch({
                        url:'/pages/index/index'
                    });
                }
            },
            fail:function(){
            }
        });
    }
});
