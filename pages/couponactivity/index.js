//领券中心
const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const app = getApp();
var current_page = 1;
var loading_more = false;
var load_list = function(page) {
    loading_more = true;
    var _this = this;
    var query_str_arr = [];
    page = page ? page : current_page;
    util.wxRequest({
        url: config.BASE_URL + '/m/couponactivity.html',
        success: function(res) {
            console.log(res.data)
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata) {
                if (_thisdata.data_list && page > 1) {
                    newdata.data_list = _thisdata.data_list.concat(newdata.data_list);
                }
                if (!newdata.data_list || !newdata.data_list.length) {
                    newdata.empty_list = 'YES';
                } else {
                    newdata.empty_list = 'NO';
                }
                _this.setData(newdata);
                swan.setNavigationBarTitle({
                    title: '领券中心'
                });
            }
        },
        fail: function(re) {
            console.info(re);
        },
        complete: function(e) {
            swan.stopPullDownRefresh();
            _this.setData({
                hideLoading: true
            });
            loading_more = false;
        }
    });
    current_page = page;
};

Page({
    data: {
    },
    onPullDownRefresh: function() {
        load_list.call(this, 1);
    },
    onShareAppMessage: function() {
      let the_path = '/pages/couponactivity/index';
      the_path = util.merchantShare(the_path);

        return {
            title: '领券中心',
            path: the_path
        };
    },
    onReachBottom: function() {
        if (this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    onReady: function() {
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
          themecolor:app.globalData.themecolor
        })
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height:res.windowHeight,
                    fp_height:res.windowHeight - 30
                });
            }
        });
        load_list.apply(this, [1]);
        //埋点-领券活动页面
        app.oceanWay('ReceiveCampaignPageView', {
          PageController: config.BASE_URL + '/m/couponactivity.html',
          PageTitle: '领券中心',
          RecordId: swan.getStorageSync('_SID')
        }, true);
    },
    load_image: function(e) {
        console.info(e);
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this,image_id,'m');
    }
});
