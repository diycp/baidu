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
        },
        shareImg:'',
        img_url:config.BASE_HOST
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '团单详情'
        });
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
          themecolor:app.globalData.themecolor
        })
        var order_id = options.order_id;
        this.setData(options);
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/gbmember-detail-'+order_id+'.html',
                success: function(res) {
                    var pagedata = res.data;
                    pagedata.order.consignee.area = util.formatArea(pagedata.order.consignee.area);
                    _this.setData(pagedata);
                    if (_this.data.order&&_this.data.order.image_id){
                      console.log(111111111111111111111);
                      util.getImg([_this.data.order.image_id], 'xs',function(imgs){
                        _this.data.shareImg = imgs[0];
                      });
                      
                    }
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
    onShareAppMessage: function () {
      
      var _this = this;
      console.log(_this.data.shareImg);
      var the_path = '/pages/groupbooking/joingroup/join?product_id=' + this.data.order.product_id+'&activity_id='+this.data.order.activity_id+'&gb_id='+this.data.order.gb_id;
      the_path = util.merchantShare(the_path);
      return {
        title: _this.data.order.name,
        path: the_path,
        imageUrl: _this.data.shareImg
      };
    }
});
