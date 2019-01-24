const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();

Page({
    data:{

    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '百度授权登录'
        });

    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
          themecolor:app.globalData.themecolor
        });
        this.setData({
            onloadoptions:options
        });
    },
    evt_goback:function(e){

    },
    evt_getuserinfo:function(e){
        console.info(e);
        if(e.detail.encryptedData && e.detail.userInfo){
            //授信成功,回掉
            let callback_url = '/'+decodeURIComponent(this.data.onloadoptions.callback);
            if(this.data.onloadoptions.from_root_page){
                swan.reLaunch({
                    url:callback_url
                });
            }else{
                swan.redirectTo({
                    url:callback_url
                });
            }
        }
    }
});
