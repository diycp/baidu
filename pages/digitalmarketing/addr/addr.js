const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const dm = require('../../../utils/digitalmarketing.js');
const app = getApp();


Page({
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '选择收货地址'
        });
    },
    evt_navigateback: function(e) {
        var _this = this;
        var addr_id = e.currentTarget.dataset.addrid;
        if (!addr_id) return;
        swan.setStorageSync('member_addr_selected', {
            'member_id': _this.data.member.member_id,
            'addr_id': addr_id
        });
        swan.navigateBack();
    },
    onLoad: function(options) {
        this.setData({
            partin_id:options.partin_id,
            themecolor:app.globalData.themecolor
        })
    },
    onShow: function() {
        var _this = this;
        util.checkMember.call(this, function(member) {
            util.wxRequest({
                url: config.BASE_URL + '/m/my-receiver.html',
                success: function(res) {
                    var pagedata = res.data;
                    for(var i in pagedata.list){
                        pagedata.list[i]['area_format'] = util.formatArea(pagedata.list[i]['area']);
                    }
                    _this.setData(pagedata);
                }
            });
        });
    },
    evt_editaddr: function() {
        var _this = this;
        swan.navigateTo({
                url: '/pages/digitalmarketing/addr/edit/edit?partin_id='+_this.data.partin_id
        });
    },
    selectAddr:function(e){
        var _this = this;
        var addr_id = e.currentTarget.dataset.addrid;
        swan.showModal({
            title:'您确定使用该地址吗?',
            content:'您将选择该地址为收货地址',
            showCancel:true,
            cancelText:'取消',
            confirmText:'确定',
            success:function(res){
                if (res.confirm) {
                    swan.showToast({
                        title: '操作成功',
                        icon: 'success',
                        duration: 1500
                    })
                    dm.award.apply(_this,[_this.data.partin_id, 'product', addr_id, function (json) {
                        swan.redirectTo({
                          url:'/pages/digitalmarketing/addr/success/success?type=success&partin_id='+_this.data.partin_id+'&win_id='+json.data.win.win_id 
                        })
                    }]);
                } else if (res.cancel) {
                }
            }
        })
    }
});
