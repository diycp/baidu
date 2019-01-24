const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');

Page({
    data:{
        status_map:{
            '1':'审核中',
            '2':'被拒绝',
            '3':'退货处理中',
            '4':'退款处理中',
            '5':'处理完成'
        },
        selected_dlycorp_index:0,
        img_url:config.BASE_HOST
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '售后详情'
        });
    },
    onLoad: function(options) {
        var _this = this;
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/aftersales-req_detail-' + options.request_id+'.html',
                success: function(res) {
                    var pagedata = res.data;
                    if(pagedata.delivery){
                        pagedata.delivery.consignee.area = util.formatArea(pagedata.delivery.consignee.area);
                        if(!pagedata.delivery.logistics_no){
                            pagedata['status_map.3'] = '已接受服务请求,请完善退货物流信息';
                        }
                        if(pagedata.delivery.dlycorp_id){
                            for (var i = 0; i < pagedata.dlycorp_list.length; i++) {
                                if(pagedata.dlycorp_list[i].corp_id == pagedata.delivery.dlycorp_id){
                                    pagedata['selected_dlycorp_index'] = i;
                                    break;
                                }
                            }
                        }
                    }
                    if(pagedata.req_detail.remarks){
                        pagedata.req_detail.remarks = pagedata.req_detail.remarks.split('<br>');
                    }
                    _this.setData(pagedata);
                }
            });
        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'xs');
    },
    evt_setpagedata: function(e) {
        // var _set = {};
        // _set[e.currentTarget.dataset.key] = e.detail.value;
        // this.setData(_set);
    },
    evt_seldlycorp:function(e){
        console.info(e);
        this.setData({
            'selected_dlycorp_index':e.detail.value
        });
    },
    evt_scan: function(e) {
        var _this = this;
        swan.scanCode({
            success: function(res) {
                //{errMsg: "scanCode:ok", result: "Agetcoupon", scanType: "QR_CODE", charSet: "UTF-8"}
                console.log(res);
                let set = {};
                set['delivery.logistics_no'] = res.result;
                _this.setData(set);
            }
        });
    },
    evt_submit:function(e){
        swan.showToast({
            title:'正在提交',
            icon:"loading",
            mask:true,
            duration:10000
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/aftersales-update_delivery.html',
            method:'POST',
            data:{
                'request_id':this.data.req_detail.request_id,
                'delivery[dlycorp_id]':this.data.dlycorp_list[this.data.selected_dlycorp_index].corp_id,
                'delivery[logistics_no]':e.detail.value.logistics_no
            },
            success: function(res) {
                swan.hideToast();
                swan.showModal({
                    title: '保存成功',
                    content: '物流信息保存成功!',
                    success:function(res){
                        if (res.confirm) {
                            swan.navigateBack();
                        }
                    }
                });
            }
        });
    }

});
