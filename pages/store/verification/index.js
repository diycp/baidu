//index.js
//获取应用实例
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
//const WxParse = require('../../../utils/wxParse/wxParse.js');
const vlog = function(schedule_id,order){
    //console.info(schedule_id,order);
    var _this =this;
    order['store'] = {
        id:_this.data.store.id,
        name:_this.data.store.name
    };
    order['subject'] = {
        id:_this.data.subject.id,
        title:_this.data.subject.title
    };
    order['vtime'] = new Date().getTime();
    if(!schedule_id)return;
    var k = 'experiencestore-verification-log-'+schedule_id;
    swan.getStorage({
        key:k,
        success:function(res){
            var d = res.data||[];
            d.push(order);
            swan.setStorage({
                key:k,
                data:d
            });
        },fail:function(){
            var d = [];
            d.push(order);
            swan.setStorage({
                key:k,
                data:d
            });
        }
    });
};
Page({
    data: {
        hideLoading: false,
    },
    onReady: function() {
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    win_height: res.windowHeight,
                    win_width: res.windowWidth
                });
            }
        });
    },
    onShow: function() {

    },
    onShareAppMessage: function() {
      let the_path = '/pages/store/verification/index?schedule_id_encode=' + this.data.onloadoptions.schedule_id_encode;
      the_path = util.merchantShare(the_path);
        return {
            title: '活动入场核销',
            path: the_path
        };
    },
    onPullDownRefresh: function() {
        swan.hideLoading();
        this.onLoad.call(this, this.data.onloadoptions);
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
            onloadoptions: options
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/verification-index-' + options.schedule_id_encode + '.html',
            success: function(res) {
                _this.setData(res.data);
            },
            fail: function(re) {
                console.info(re);
            },
            complete: function() {
                _this.setData({
                    hideLoading: true
                });
                swan.stopPullDownRefresh();
            }
        });
    },
    evt_scan: function(e) {
        var _this = this;
        swan.scanCode({
            onlyFromCamera: true,
            scanType: 'qrCode',
            success: function(res) {
                var order_id = res.result;
                var check_action = config.BASE_URL + '/m/verification-check-' + _this.data.onloadoptions.schedule_id_encode + '.html';
                swan.showLoading({mask:true});
                util.wxRequest({
                    url: check_action,
                    method:'POST',
                    data:{
                        order_id:order_id
                    },
                    success: function(res) {
                        if(res.data.error){
                            swan.showModal({
                                title:'预约单异常',
                                content:res.data.error,
                                showCancel:false
                            });
                        }else{
                            _this.setData(res.data);
                        }
                    },
                    fail: function(re) {
                        swan.showModal({
                            title:'扫码失败',
                            content:'稍后重试',
                            showCancel:false
                        });
                    },complete:function(){
                        swan.hideLoading();
                    }
                });
            },
            fail: function() {
                swan.showModal({
                    title:'扫码失败',
                    content:'稍后重试',
                    showCancel:false
                });
            }
        });
    },
    evt_cancel:function(e){
        if(!e.target.dataset.cancelel)return;
        this.setData({
            order:false
        });
    },
    evt_confirm:function(e){
        var _this = this;
        var check_action = config.BASE_URL + '/m/verification-check-' + _this.data.onloadoptions.schedule_id_encode + '.html';
        swan.showLoading({mask:true});
        util.wxRequest({
            url: check_action,
            method:'POST',
            data:{
                order_id:_this.data.order.id,
                confirm:true
            },
            success: function(res) {
                if(res.data.error){
                    swan.showModal({
                        title:'核销失败',
                        content:res.data.error,
                        showCancel:false
                    });
                }else{
                    if(res.data.success){
                        vlog.apply(_this,[_this.data.schedule.id,_this.data.order]);
                        swan.showModal({
                            title: '核销成功',
                            content: res.data.success,
                            showCancel:false,
                            success:function(res){
                                if(res.confirm){
                                    _this.setData({
                                        order:false
                                    });
                                }
                            }
                        });
                    }else{
                        swan.showModal({
                            title:'核销失败',
                            content:'确认数据失败',
                            showCancel:false
                        });
                    }

                }
            },
            fail: function(re) {
                swan.showModal({
                    title:'核销失败',
                    content:'稍后重试',
                    showCancel:false
                });
            },complete:function(){
                swan.hideLoading();
            }
        });
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'm');
    }
});
