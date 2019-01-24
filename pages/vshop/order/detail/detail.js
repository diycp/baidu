const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const app = getApp();

Page({
    data: {
        order_type: 'all',
        status_kvmap: {
            order_status: {
                'active': '执行中',
                'dead': '已作废',
                'finish': '已完成'
            },
            pay_status: ['未支付', '已支付', '已付款至到担保方', '部分付款', '部分退款', '全额退款'],
            ship_status: ['未发货', '已发货', '部分发货', '部分退货', '已退货'],
        }
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '订单详情'
        });
    },
    onLoad: function(options) {
        var _this = this;
        var order_id = options.order_id;
        this.setData(options);
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    logistics_sv_height: res.windowHeight - 150,
                });
            }
        });
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/vshop-order_detail-'+order_id+'.html',
                success: function(res) {
                    var pagedata = res.data;
                    pagedata.order.consignee.area = util.formatArea(pagedata.order.consignee.area);
                    _this.setData(pagedata);

                },
                complete:function(){
                    _this.setData({hideLoading:true});
                }
            });
        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'xs');
    },
    evt_navigator:function(e){
        swan.navigateTo({
            url:e.currentTarget.dataset.url
        });
    },
    evt_goto:function(e){
        swan.switchTab({
            url:'/pages/member/index',
            success:function(){
                swan.navigateTo({
                    url:e.currentTarget.dataset.url
                });
            }
        });
    },
    evt_tapmodal: function(e) {
        var modal_name = e.target.dataset.modalname;
        if (!modal_name) {
            return;
        }
        var _set = {};
        _set['active_' + modal_name] = false;
        this.setData(_set);
        this.animation.opacity(0).step();
        this.setData({
            modal_animation_data: this.animation.export()
        });
    },
    evt_showmodal: function(e) {
        var modal_name = e.currentTarget.dataset.modalname;
        if (!modal_name) {
            return;
        }
        var _set = {};
        _set['active_' + modal_name] = true;
        this.setData(_set);
        this.animation = this.animation ? this.animation : swan.createAnimation({
            duration: 400,
            timingFunction: 'ease',
        });
        this.animation.opacity(1).step();
        this.setData({
            modal_animation_data: this.animation.export()
        });
    }
});
