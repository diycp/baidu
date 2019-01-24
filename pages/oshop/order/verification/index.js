const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');

Page({
    data: {
        empty_list: 'NO'
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '服务核销'
        });
    },
    onLoad: function(options) {

    },
    evt_submit:function(e){
        console.info(e);
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/cdspassport-cancel_service_code.html',
                method:'POST',
                data:{
                    service_code:e.detail.value.service_code
                },
                success: function(res) {
                    var resdata =res.data;
                    if(resdata.error){
                        swan.showModal({
                            title:'服务核销失败',
                            content:resdata.error,
                            showCancel:false,
                            success:function(res){
                                if (res.confirm) {

                                }
                            }
                        });
                    }
                    if(resdata.success){
                        swan.showModal({
                            title:'服务核销成功',
                            content:'奖励积分:'+resdata.data.integral,
                            showCancel:false,
                            success:function(res){
                                if (res.confirm) {
                                    swan.navigateBack();
                                }
                            }
                        });
                    }
                }
            });
        });
    }
});
