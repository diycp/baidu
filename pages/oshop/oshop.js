const config = require('../../config/config.js');
const util = require('../../utils/util.js');
exports.checkQRcode = function(code, callback = function() {}) {
    //验证二维码是否被激活
    util.wxRequest({
        url: config.BASE_URL + '/m/cdspassport-check_qrcode-' + code + '.html',
        // method: 'POST',
        // data: post_data,
        success: function(res) {
            var resdata = res.data;
            if (resdata.success) {
                console.info(resdata.data);
                callback(resdata.data);
            } else {
                swan.navigateTo({
                    url: '/pages/oshop/signup/shop/edit?qrcode=' + code,
                    complete: function() {
                        swan.removeStorageSync('_qrcode');
                    }
                });
            }
        }
    });

}
exports.getQRcode = function(callback = function() {}) {
    util.wxRequest({
        //根据当前用户获得相关qrcode 代码
        url: config.BASE_URL + '/m/o2ocds-get_qrocde.html',
        // method: 'POST',
        // data: post_data,
        success: function(res) {
            var resdata = res.data;
            if (resdata.success) {
                console.info(resdata.data);
                callback(resdata.data);
            }
        }
    });

}

exports.setRole = function(role) {
    if (typeof role != 'object' || !role.type || !role.relation) {
        return false;
    }
    swan.setStorageSync('_oshop_role', role);
    return true;
}
exports.getRole = function(role) {
    return swan.getStorageSync('_oshop_role');
}
exports.clearRole = function() {
    try {
        swan.removeStorageSync('_oshop_role')
    } catch (e) {
        // Do something when catch error
    }
}
