const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();


Page({
  data:{
    img_url:config.BASE_HOST
  },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '收货地址管理'
        });
    },
    evt_setdefault: function(e) {
        var _this = this;
        var addr_id = e.currentTarget.dataset.addrid;
        if (!addr_id) return;
        util.wxRequest({
            url: config.BASE_URL + '/m/my-receiver-set_default-' + addr_id + '.html',
            success: function(res) {
                for (var i = 0; i < _this.data.list.length; i++) {
                    if (_this.data.list[i].addr_id == addr_id) {
                        _this.data.list[i].is_default = 'true';
                    } else {
                        _this.data.list[i].is_default = 'false';
                    }

                }
                _this.setData({
                    'list': _this.data.list
                });
            }
        });
    },
    evt_empty: function(e) {
        //空事件处理
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
        themecolor:app.globalData.themecolor
      })
        var _this = this;
        if (options) {
            _this.setData(options);
        }

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
    evt_editaddr: function(e) {
        var addr_id = e.currentTarget.dataset.addrid;
        swan.navigateTo({
                url: '/pages/member/addr/edit/edit?addrid=' + addr_id
        });
    },
    evt_removeaddr: function(e) {
        var _this = this;
        var addr_id = e.currentTarget.dataset.addrid;
        swan.showModal({
            title: '删除收货地址',
            content: '确认删除？',
            success: function(res) {
                if (res.confirm) {
                    util.wxRequest({
                        url: config.BASE_URL + '/m/my-receiver-delete-' + addr_id + '.html',
                        success: function(res) {
                            if (res.data.success) {
                                _this.onShow.call(_this);
                            }
                        }
                    });
                }
            }
        });

    }
});
