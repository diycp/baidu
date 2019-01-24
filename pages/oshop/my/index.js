const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
var oshop = require('../oshop.js');
var app = getApp();
Page({
    data: {
      'img_url': config.BASE_HOST
    },
    onReady: function() {

    },
    onPullDownRefresh: function() {
        this.onLoad.call(this);
    },
    onLoad: function(options) {
        var _this = this;
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/o2ocds.html',
                success: function(res) {
                    var pagedata = res.data;
                    _this.setData(pagedata);
                    //设置角色权限
                    if (pagedata.type && pagedata.relation) {
                        oshop.setRole({
                            'type': pagedata.type,
                            /**
                             * store  店铺
                             * enterprise 企业
                             */
                            'relation': pagedata.relation
                            // 'admin' => '管理员',
                            // 'salesman' => '业务员',
                            // 'manager' => '店长',
                            // 'salesclerk' => '店员',
                        });
                    } else {
                        //清除角色权限
                        oshop.clearRole();
                    }

                },
                complete: function() {
                    //swan.hideNavigationBarLoading();
                    swan.stopPullDownRefresh();
                    _this.setData({
                        hideLoading: true
                    });
                    swan.setNavigationBarTitle({
                        title: "分销" + (_this.data.type == 'enterprise' ? '企业' : '店铺') + "管理"
                    });
                    
                }
            });
        });
    },
    evt_goto: function(e) {
        swan.switchTab({
            url: '/pages/index/index',
            success: function() {
                swan.navigateTo({
                    url: e.currentTarget.dataset.url
                });
            }
        });
    },
    evt_redirect:function(e){
        swan.redirectTo({
            url:e.currentTarget.dataset.url
        });
    }
});
