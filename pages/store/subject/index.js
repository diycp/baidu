const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const getGpsDistance = require('../../../utils/gpsdistance.js');
const WxParse = require('../../../utils/wxParse/wxParse.js');
const app = getApp();
const format_gpsdistance = function(val) {
    let km = Math.round(val);
    return (km > 0 ? (km + 'km') : (Math.round(val * 1000) + ' m'));
}

const count_gpsdistance = function() {
    var _this = this;
    swan.getLocation({
        type:'gcj02',
        success: function(res) {
            let gpsdistance = getGpsDistance(res.latitude,
                res.longitude, _this.data.store.lat, _this.data.store.lng);
            let _set = {};
            _set['store.gpsdistance'] = format_gpsdistance(gpsdistance);
            _this.setData(_set);
        }
    });
}

const wxpay  = function(order_id){
    var pagedata = this.data;
    if(!order_id)return;
    swan.showToast({
        'icon':'loading',
        'title':'准备支付',
        'mask':true,
        'duration':10000
    });
    var _this = this;
    util.wxRequest({
        url:config.BASE_URL+'/m/activity-order_payment-'+order_id+'.html?openid='+pagedata.member.openid,
        success: function(res) {
            swan.hideToast();
            if(res.data.error){
                swan.showModal({
                  title: '支付请求异常',
                  content: res.data.error||''
                });
            }else{
                _this.setData({
                    begin_wxpay:true
                });
                let pay_params = res.data;
                pay_params.success = function(res){
                    swan.showToast({
                        'icon':'success',
                        'title':'支付成功',
                        'duration':1500
                    });
                    swan.redirectTo({
                        url: '/pages/store/my/order/detail?order_id=' + order_id
                    });
                };
                pay_params.fail = function(res){
                    swan.redirectTo({
                        url: '/pages/store/my/order/detail?order_id=' + order_id
                    });
                }
                swan.requestPayment(pay_params);
            }
        }
    });


}

Page({
    data: {
        auto_height: 200,
        schedule_picked: [0, 0],
        schedule_pick_index: [0, 0],
        selected_ticket_id: -1
    },
    onPullDownRefresh: function() {
        //console.info(this.data.onloadoptions);
        this.onLoad.call(this,this.data.onloadoptions);
    },
    onReady: function() {
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    auto_height: res.windowWidth * 0.5
                });
            }
        });
    },
    onShow: function() {
        if (!this.data.store) return;
        count_gpsdistance.call(this);
    },
    onShareAppMessage: function() {
        let the_path = '/pages/store/subject/index?store_id=' + this.data.store_id + '&subject_id=' + this.data.subject_id;
        the_path = util.merchantShare(the_path);
        return {
            title: this.data.subject.title,
            path: the_path
        };
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
          themecolor: app.globalData.themecolor,
          onloadoptions:options
        });
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/activity-schedule-' + options.store_id + '-' + options.subject_id + '.html',
                success: function(res) {
                    //res.data.store.region = util.formatArea(res.data.store.region);
                    if (res.data && res.data.subject && res.data.subject.keywords) {
                        res.data.subject.keywords = res.data.subject.keywords.split(',');
                    }
                    swan.setNavigationBarTitle({
                        title: res.data.subject.title
                    });
                    WxParse.wxParse('subject_desc', 'html', res.data.subject.desc, _this, 0);
                    let schedule_group = res.data.schedule_list_group;
                    if (schedule_group) {
                        let schedule_group_arr = [
                            [],
                            []
                        ];
                        for (let key in schedule_group) {
                            schedule_group_arr[0].push(key);
                            schedule_group_arr[1].push(schedule_group[key]);
                        }
                        res.data.schedule_list_group = schedule_group_arr;
                    }
                    _this.setData(res.data);
                    count_gpsdistance.call(_this);
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
        });
    },
    load_image: function(e) {
        console.info(e);
        util.loadImage(this, e.currentTarget.dataset.ident, 'l');
    },
    evt_navstart: function(e) {
        swan.openLocation({
            latitude: parseFloat(this.data.store.lat),
            longitude: parseFloat(this.data.store.lng),
            scale: 28,
            name: this.data.store.name,
            address: this.data.store.address,
            fail: function() {
                console.info(arguments);
            }
        });
    },
    evt_schedulepicker: function(e) {
        console.info(e);
        this.setData({
            schedule_pick_index: e.detail.value
        });
    },
    evt_ticketselected: function(e) {
        console.info(e);
        this.setData({
            selected_ticket_id: e.currentTarget.dataset.ticketid
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
    evt_submit: function(e) {
        var slg = this.data.schedule_list_group;
        var spi = this.data.schedule_pick_index;
        if (slg[0].length==0){
          swan.showModal({
            content: '预约结束',
            showCancel: false
          });
          return false;
        }
        if (parseInt(this.data.selected_ticket_id) < 0 && slg[1][spi[0]][spi[1]].tickets) {
            if (swan.pageScrollTo) {
                swan.createSelectorQuery()
                    .select('#ticket_panel')
                    .boundingClientRect(function(rect) {
                        //console.info(rect);
                        swan.pageScrollTo({
                            scrollTop: rect.top
                        });
                    }).exec();
            }
            return swan.showModal({
                title: '请选择门票入场券',
                content: '本场活动需要购买门票入场券才可报名参与.',
                showCancel: false
            });
        }
        this.setData({
            active_submit_panel: true
        });
        this.animation = this.animation ? this.animation : swan.createAnimation({
            duration: 400,
            timingFunction: 'ease',
        });
        this.animation.opacity(1).step();
        this.setData({
            modal_animation_data: this.animation.export()
        });
    },
    evt_redirect:function(e){
        swan.redirectTo({
            url:e.currentTarget.dataset.url
        });    
    },
    evt_submitconfirm: function(e) {
        var _this = this;
        var form_data = {
            'order[pay_app_id]':'wxpayinwxapp',
            'order[wx_formid]':e.detail.formId,
            'store_id':this.data.store.id,
            'subject_id':this.data.subject.id,
            'schedule_id':this.data.schedule_list_group[1][this.data.schedule_pick_index[0]][this.data.schedule_pick_index[1]].id,
            'ticket_id':this.data.selected_ticket_id
        };
        form_data = Object.assign(e.detail.value,form_data);
        if(e.detail.value['order[name]'] == ''||e.detail.value['order[name]'] == ''){
            return swan.showModal({
                title: '请完善报名信息',
                showCancel: false
            });
        }
        swan.showToast({
            title:'正在提交',
            icon:'loading',
            duration:10000,
            mask:true
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/activity-order.html',
            method:'POST',
            data:form_data,
            success: function(res) {
                let resdata = res.data;
                console.info(resdata);
                if(resdata.success){
                    ///m/activity-order_success-7170903204257755.html
                    let ordr_id_match = resdata.redirect.match(/order_success-([^.]+)/);
                    if(ordr_id_match){
                        let order_id = ordr_id_match[1];
                        _this.setData({
                            success_order_id:order_id
                        });
                        let slg = _this.data.schedule_list_group;
                        let spi = _this.data.schedule_pick_index;
                        let tickets = slg[1][spi[0]][spi[1]].tickets;
                        for (let i = 0; i < tickets.length; i++) {
                            if(tickets[i].id == _this.data.selected_ticket_id){
                                if(parseFloat(tickets[i].price)>0){
                                    //需支付
                                    return wxpay.call(_this,order_id);
                                }
                                break;
                            }
                        }
                        swan.redirectTo({
                            url: '/pages/store/my/order/detail?order_id=' + order_id
                        });
                    }else{
                        swan.hideToast();
                        swan.showModal({
                            title:'预约失败',
                            showCancel:false,
                            content:'生成预约单失败'
                        });
                    }
                }else{
                    swan.hideToast();
                    swan.showModal({
                        title:'预约失败',
                        showCancel:false,
                        content:resdata.error||''
                    });
                }
            },
            fail: function(re) {
                console.info(re);
            },
            complete: function() {

            }
        });
        console.info(e);
        console.info(form_data);
    }
});
