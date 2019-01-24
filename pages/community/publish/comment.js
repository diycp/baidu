const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');

Page({
    data: {

    },
    onShow: function() {

    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '回复'
        });
    },
    onLoad: function(options) {
        var _this = this;
        util.checkMember.call(this, function(re) {
            util.wxRequest({
                url: config.BASE_URL + '/m/communitypublish-index.html',
                success: function(res) {
                    let resdata = res.data;
                    _this.setData(res.data);
                },
                complete: function() {
                    _this.setData({
                        hideLoading:true
                    });
                }
            });
        });
    },
    evt_submit:function(e){
        console.info(e);
    },
    evt_gotoback: function(e) {
        swan.navigateBack();
    }
});
