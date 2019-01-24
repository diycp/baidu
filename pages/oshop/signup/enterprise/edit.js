const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
var app = getApp();


Page({
    data: {

    },
    onReady: function() {

    },
    // onShareAppMessage: function() {
    //     return {
    //         title: '成为分销企业',
    //         path: '/pages/oshop/signup/enterprise/edit'
    //     };
    // },
    onLoad: function(options) {
        var _this = this;
        util.checkMember.call(this,function(){
            util.getRegionData([0, 0], function(data) {
                var region_data = [];
                for (var i = 0; i < data.length; i++) {
                    region_data.push(data[i].split(':')[0]);
                }

                _this.setData({
                    region_data: region_data,
                    hideLoading: true
                });
            });
        });
    },
    evt_submit: function(e) {
        var form_data = e.detail.value;
        var post_data = {};
        swan.showToast({
            title: '正在提交',
            icon: 'loading',
            mask: true,
            duration: 50000
        });
        for (var n in form_data) {
            switch (n) {
                // case 'name':
                // case 'address':
                // case 'mobile':
                default: if (!form_data[n]) {
                        swan.hideToast();
                        swan.showModal({
                            title: '提交失败',
                            content: '必填信息不完善',
                        });
                        return false;
                    }
                break;
            }
        }
        if (this.data.region_data_index) {
            form_data['area'] = this.data.region_data[this.data.region_data_index];
        }
        util.wxRequest({
            url: config.BASE_URL + '/m/cdspassport-create_enterprise.html',
            method: 'POST',
            data: form_data,
            success: function(res) {
                if (res.data.error || !res.data.success) {
                    swan.hideToast();
                    return swan.showModal({
                        title: '保存失败',
                        content: (res.data.error || '保存出现异常')
                    });
                }
                swan.showToast({
                    title: '申请成功',
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
    evt_changeregion: function(e) {
        this.setData({
            region_data_index: e.detail.value
        });
    }
});
