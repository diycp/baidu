//礼品卡首页
const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const update_cart = function(product_id, num, callback) {
    if (this.data.cart && this.data.cart[product_id]) {
        //console.info(this.data.cart[product_id].quantity);
        var quantity = (parseInt(this.data.cart[product_id].quantity) + parseInt(num));
    } else {
        var quantity = (0 + parseInt(num));
    }
    if (quantity < 0) {
        quantity = 0;
    }
    let _set = {};
    _set['cart.' + product_id] = {
        product_id: product_id,
        quantity: quantity,
        price: this.data.product_data[product_id].buy_price
    };
    this.setData(_set);
    typeof callback == 'function' && callback(this.data.cart);
}
const count_cart = function() {
    let checkout_total = 0;
    let checkout_quantity = 0;
    var cart_data = this.data.cart;
    for (let i in cart_data) {
        checkout_total += parseFloat(cart_data[i].price) * cart_data[i].quantity;
        checkout_quantity += cart_data[i].quantity;
    }
    this.setData({
        checkout_total: checkout_total,
        checkout_quantity: checkout_quantity
    });
};
const wxpay = function(crecord_id,callback){
    swan.showToast({
        title:'准备支付',
        icon:'loading',
        mask:true,
        duration:10000
    });
    var _this = this;
    _this.setData({
        wxpaying:true
    });
    util.wxRequest({
        url: config.BASE_URL + '/m/gccheckout-payment-'+crecord_id+'.html?openid=' + this.data.member.openid,
        success: function(res) {
            if (res.data.error) {
                swan.showModal({
                    title: '支付请求异常',
                    content: res.data.error || ''
                });
            } else {
                let pay_params = res.data;
                pay_params.success = function(res) {
                    swan.showToast({
                        'icon': 'success',
                        'title': '支付成功',
                        'duration': 1500
                    });
                    typeof callback == 'function' && callback();
                };
                pay_params.fail = function(res) {
                    _this.setData({
                        wxpaying:false
                    });
                    if (res.errMsg == 'requestPayment:fail cancel') {
                        return;
                    }
                };
                swan.requestPayment(pay_params);
                swan.hideToast();
            }
        }
    });
};
Page({
    data: {

    },
    onPullDownRefresh: function() {
        this.onLoad(this.data.onloadoptions);
    },
    evt_scrolltolower: function() {

    },
    onReady: function() {
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    win_width: res.windowWidth,
                    win_height: res.windowHeight
                });
            }
        });
        swan.setNavigationBarTitle({
            title: '礼品卡购买'
        });
    },
    onLoad: function(options) {
        var _this = this;
        this.setData({
            onloadoptions:options
        });
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/gccheckout-index-' + options.cstyle_set + '.html',
                success: function(res) {
                    var pagedata = res.data;
                    for (let c in pagedata.style_list) {
                        _this.setData({
                            cstyle_selected: pagedata.style_list[c].id
                        });
                        break;
                    }

                    _this.setData(pagedata);
                },
                fail: function(re) {
                    console.info(re);
                },
                complete: function(e) {
                    // swan.hideToast();
                    //swan.hideNavigationBarLoading();
                    swan.stopPullDownRefresh();
                    _this.setData({
                        hideLoading: true
                    });

                }
            });
        });

    },
    load_image_l: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this, image_id, 'l');
    },
    load_image_m: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this, image_id, 'm');
    },
    evt_select_cstyle: function(e) {

        this.setData({
            cstyle_selected: e.currentTarget.dataset.cstyleid,
            cstyle_into_view:e.currentTarget.id
        });
        delete(this.new_crecord_id);
    },
    evt_setquantity: function(e) {
        let product_id = e.currentTarget.dataset.productid;
        let type = e.currentTarget.dataset.type;
        var _this = this;
        update_cart.apply(this, [product_id, (type == 'plus' ? +1 : -1), function(cart) {
            count_cart.call(_this)
        }]);
        delete(this.new_crecord_id);
    },
    evt_submit_order: function(e) {
        var _this = this;
        if(!this.data.checkout_quantity || this.data.checkout_quantity<1)return false;
        util.checkMember.call(this, function() {
            if(_this.new_crecord_id){
                wxpay.apply(_this,[_this.new_crecord_id,function(err_msg){
                    if(err_msg){
                        swan.showModal({
                            content: err_msg || '购买失败,无法完成支付',
                            showCancel: false
                        });
                    }else{
                        swan.redirectTo({
                            url:'/pages/giftcard/give?crecord_id='+_this.new_crecord_id
                        });
                    }
                }]);
                return;
            }
            swan.showToast({
                icon: 'loading',
                title: '正在提交',
                mask: true,
                duration: 50000
            });
            util.wxRequest({
                url: config.BASE_URL + '/m/gccheckout-submit_order.html',
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                data: {
                    cstyle_selected: _this.data.cstyle_selected,
                    cart_data: _this.data.cart
                },
                success: function(res) {
                    console.info(res);
                    let resdata = res.data;
                    if (resdata.success) {
                        console.info(resdata);
                        if(resdata.redirect){
                            //缓存new_crecord_id
                            _this.new_crecord_id = resdata.redirect;
                            wxpay.apply(_this,[_this.new_crecord_id,function(err_msg){
                                if(err_msg){
                                    swan.showModal({
                                        content: err_msg || '购买失败,无法完成支付',
                                        showCancel: false
                                    });
                                }else{
                                    swan.redirectTo({
                                        url:'/pages/giftcard/give?crecord_id='+_this.new_crecord_id
                                    });
                                }
                            }]);
                        }

                    } else {
                        swan.showModal({
                            content: res.error || '购买失败,稍后再试',
                            showCancel: false
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
        });
    }
});
