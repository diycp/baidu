const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
// var md5 = require('../../../../utils/md5.js');

Page({
    data: {
      img_url:config.BASE_HOST
    },
    onReady: function() {
        // var _this = this;
        swan.setNavigationBarTitle({
            title: '从电脑发布作品'
        });
    },
    onLoad: function(options) {
        this.setData({
            locationhref: config.BASE_URL.match(/\/([^\/]+)/)[1]
        });
    },
    evt_qrcodelogin: function(e) {
        var _this = this;
        util.checkMember.call(this, function() {
            swan.scanCode({
                onlyFromCamera: true,
                success: function(res) {
                    var qrcode_content = res.result;
                    _this.setData({
                        qrcode: res.result
                    })
                    console.info(res);
                }
            });
        });

    },
    evt_qrcodelogin_cancel: function(e) {
        this.setData({
            qrcode: null
        });
    },
    evt_qrcodelogin_confirm: function(e) {
        var _this = this;
        var member_id = this.data.member.member_id;
        var session_str = this.data.qrcode;
        swan.showToast({
            title: '正在登录',
            icon: 'loading',
            duration: 5000,
            mask: true
        });
        util.wxRequest({
            url: config.BASE_URL + '/communitypublish-qrcode_login-' + session_str + '-' + member_id + '.html',
            success: function(res) {
                var resdata = res.data;
                if (resdata.success) {
                    swan.showModal({
                        title: '登录电脑端成功',
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                swan.switchTab({
                                    url: '/pages/member/index'
                                });
                            }
                        }
                    });
                } else {
                    swan.showModal({
                        title: '登录失败',
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                _this.setData({
                                    qrcode: null
                                });
                            }
                        }
                    });
                }
            },
            fail: function(re) {
                console.info(re);
            },
            complete: function(e) {
                swan.hideToast();
            }
        });

    }


});
