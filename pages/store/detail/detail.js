//index.js
//获取应用实例
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const getGpsDistance = require('../../../utils/gpsdistance.js');
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

Page({
    data: {
      auto_height: 200,
      controls: [{
        id: 1,
        iconPath: '/resources/location.png',
        position: {
          left: 0,
          top: 300 - 50,
          width: 50,
          height: 50
        },
        clickable: true
      }]
    },
    onPullDownRefresh: function() {
        this.onLoad.call(this,this.data.onloadoptions);
    },
    onReady: function() {
        var _this = this;
        swan.getSystemInfo({
              success: function(res) {
                  _this.setData({
                      auto_height:res.windowWidth*0.5
                  });
              }
          });
    },
    onShareAppMessage: function() {
        let the_path = '/pages/store/detail/detail?store_id=' + this.data.store.id;
        the_path = util.merchantShare(the_path);
        return {
            title: this.data.store.name,
            path: the_path
        };
    },
    onShow: function() {
        if (!this.data.store) return;
        count_gpsdistance.call(this);
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
          themecolor: app.globalData.themecolor,
          onloadoptions:options
        })
        util.wxRequest({
            url: config.BASE_URL + '/m/store-detail-' + options.store_id + '.html',
            success: function(res) {
                res.data.store.region = util.formatArea(res.data.store.region);
                swan.setNavigationBarTitle({
                    title: res.data.store.name
                });
                var markers=[{
                      id: 0,
                      latitude: res.data.store.lat,
                      longitude: res.data.store.lng
                }];
                _this.setData({
                  markers:markers,
                  longitude: res.data.store.lng,
                  latitude: res.data.store.lat
                  });
                _this.setData(res.data);
                count_gpsdistance.call(_this);
            },
            fail: function(re) {
                console.info(re);
            },complete:function(){
                _this.setData({
                    hideLoading:true
                });
                swan.stopPullDownRefresh();
            }
        });
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'l');
    },
    evt_detailmodal: function(e) {
        swan.showModal({
            title: '前往方法',
            content: this.data.store.waytogo
        });
    },
    
    evt_navstart: function(e) {
        let _this = this;
        swan.getLocation({
            type: 'gcj02',
            success: function (res) {
                console.log(res);
                swan.openLocation({
                    latitude: parseFloat(_this.data.store.lat),
                    longitude: parseFloat(_this.data.store.lng),
                    scale: 18,
                    name: _this.data.store.name,
                    address: _this.data.store.address,
                    fail: function() {
                        console.info(arguments);
                    }
                });
            },
            fail: function (err) {
                console.log('错误码：' + err.errCode);
                console.log('错误信息：' + err.errMsg);
            }
        });
    },
    evt_phonestart: function(e) {
        swan.makePhoneCall({
            phoneNumber: this.data.store.phone
        });
    },
});
