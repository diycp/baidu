const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
var app = getApp();


Page({
    data: {

    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '激活店铺二维码'
        });
    },
    onLoad: function(options) {
        this.setData(options);
        var _this = this;
        util.checkMember.call(this);
    },
    evt_checkmember: function() {
        util.checkMember.call(this);
    },
    evt_submit: function(e) {
        var form_data = e.detail.value;
        var post_data = {};
        var qrcode = swan.getStorageSync('_qrcode') || this.data.qrcode;
        if (!qrcode) {
            swan.showModal({
                title: '提交失败',
                content: '未知来源QRCODE',
            });
            return false;
        }
        form_data['qrcode'] = qrcode;
        for (var n in form_data) {
            switch (n) {
                // case 'name':
                default: if (!form_data[n]) {
                    swan.showModal({
                        title: '提交失败',
                        content: '请完整填写',
                    });
                    return false;
                }
                break;
            }
            //post_data['x[' + n + ']'] = form_data[n];
        }


        util.wxRequest({
            url: config.BASE_URL + '/m/cdspassport-create_store.html',
            method: 'POST',
            data: form_data,
            success: function(res) {
                if (res.data.error || !res.data.success) {
                    return swan.showModal({
                        title: '提交失败',
                        content: (res.data.error || '保存出现异常')
                    });
                }

                swan.showToast({
                    title: '提交成功',
                    icon: 'success',
                    duration: 1500,
                    success: function(e) {
                        swan.redirectTo({
                            url: '/pages/oshop/my/index'
                        });
                    }
                });
            }
        });

    },
});
