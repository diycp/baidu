const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
var dateFormat = require('../../../utils/dateformat.js');
Page({
    data: {
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: "店铺邀请码"
        });
    },
    onPullDownRefresh: function() {
        this.onLoad.call(this);
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
            hideLoading:false
        });
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/o2ocds-invitation_list.html',
                success: function(res) {
                    var pagedata = res.data;
                    if(pagedata.invitation_list){
                        for (var i = 0; i < pagedata.invitation_list.length; i++) {
                            pagedata.invitation_list[i]['createtime'] = dateFormat(parseInt(pagedata.invitation_list[i]['createtime'])*1000,"yyyy-mm-dd HH:MM:ss");
                            if(pagedata.invitation_list[i]['usetime']){
                                pagedata.invitation_list[i]['usetime'] = dateFormat(parseInt(pagedata.invitation_list[i]['usetime'])*1000,"yyyy-mm-dd HH:MM:ss");
                            }
                        }
                    }
                    _this.setData(pagedata);
                },
                complete: function() {
                    //swan.hideNavigationBarLoading();
                    //swan.stopPullDownRefresh();
                    _this.setData({
                        hideLoading:true
                    });
                }
            });
        });
    },
    evt_newinvitation:function(e){
        var _this = this;
        swan.showToast({
            title:'生成中',
            icon:'loading',
            mask:true,
            duration:5000
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/o2ocds-create_invitation.html',
            success: function(res) {
                if(!res.data.success){
                    swan.showModal({
                        title:'邀请码生成失败',
                        content:res.data.error||'',
                        showCancel:false
                    });
                    return;
                }

                _this.onLoad.call(_this);
            },complete:function(){
                swan.hideToast();
            }
        });
    },
    evt_tabinvitation:function(e){
        var invitation_index = e.currentTarget.dataset.index;
        var current_invitation = this.data.invitation_list[invitation_index];
        if(current_invitation.status == '1'){
            return swan.showModal({
                title:'邀请码已被使用了',
                content:'邀请码['+current_invitation.invitation_code+']已被使用,每个邀请码只能使用一次！',
                showCancel:false
            });
        }
        this.setData({
            show_full_screen:true,
            current_invitation:current_invitation
        });
    },
    evt_tabfullscreen:function(e){
        this.setData({
            show_full_screen:false
        });
    }
});
