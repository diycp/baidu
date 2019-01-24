//index.js
//获取应用实例
const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const app = getApp();
// var getGpsDistance = require('../../utils/gpsdistance.js');
//
// var format_gpsdistance = function(val){
//     let km = Math.round(val);
//     return (km > 0 ? (km + 'km') : (Math.round(val * 1000) + ' m'));
// }
//
// var count_gpsdistance = function(){
//     var _this = this;
//     let latitude = this.data.latitude;
//     let longitude = this.data.longitude;
//     for (var i = 0; i < _this.data.store_list.length; i++) {
//         let store = _this.data.store_list[i];
//         let gpsdistance = getGpsDistance(latitude,longitude,store.lat,store.lng);
//         let _set = {};
//             _set['store_list['+i+'].gpsdistance'] = format_gpsdistance(gpsdistance);
//         _this.setData(_set);
//     }
// }

const load_storelist = function(cat_id){
    var _this = this;
    cat_id = cat_id?cat_id:_this.data.cat_id;
    var getlist = function(lp){
        util.wxRequest({
            url: config.BASE_URL + '/m/store-storelist'+(lp?('-'+lp):'')+(cat_id?('-'+cat_id):'')+'.html',
            success: function(res) {
                _this.setData(res.data);
                if(!res.data.store_list){
                    _this.setData({
                        empty_store_list:true
                    });
                }else{
                    _this.setData({
                        empty_store_list:false
                    });
                }
                //count_gpsdistance.call(_this);
                // if(res.data.store_cat_list){
                //     swan.createSelectorQuery().select('#cat_select').boundingClientRect(function(rect){
                //         _this.setData({
                //             catselectHeight:rect.height
                //         });
                //     }).exec();
                // }
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
    };
    swan.getLocation({
        type:'gcj02',//腾讯\GOOGLE 地图坐标系（火星坐标)
        success:function(res){
            getlist(res.latitude+','+res.longitude);
        },fail:function(){
            getlist();
        }
    });
};

Page({
    data:{
        cat_id:null,
        hideLoading:false,
        auto_height:200,
        catselectHeight:48
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '线下活动'
        });
        swan.getSystemInfo({
              success: function(res) {
                  _this.setData({
                      win_width:res.windowWidth,
                      auto_height:res.windowWidth*0.5
                  });
              }
          });
    },
    onShareAppMessage: function() {
        let the_path = '/pages/store/index';
        the_path = util.merchantShare(the_path);
        return {
            title: '线下活动',
            path: the_path
        };
    },
    onShow:function(){
        if(!this.data.store_list)return;
        load_storelist.call(this);
    },
    onPullDownRefresh: function() {
        load_storelist.call(this);
    },
    onLoad: function() {
        this.setData({
          themecolor: app.globalData.themecolor
        });
        load_storelist.call(this);
    },
    evt_selcat:function(e){
        var cat_id = e.currentTarget.dataset.catid;
        if(!cat_id){
            this.setData({cat_id:false});
        }else{
            this.setData({cat_id:cat_id});
        }
        load_storelist.call(this);
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'l');
    },
    evt_godetail: function(e) {
        swan.navigateTo({
            url: '/pages/store/detail/detail?store_id=' + e.currentTarget.dataset.ident
        });
    }
});
