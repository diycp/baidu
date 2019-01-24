//刮刮乐
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const dateFormat = require('../../../utils/dateformat.js');
const dm = require('../../../utils/digitalmarketing.js');
const app = getApp();
var result, code, msg, data = null, is_error, prize = null, partin = null;
var detailData = {
    num: 0,
    limit: false,
    
    showMask: false,
    showRule: false,
    
    showError: false,
    errMsg: null,

    showLose: false,

    showScore: false,
    scoreText: null,

    showCoupon: false,
    couponText: null,

    showProduct: false,
    productText: null,
    partin_addr_url: null,

    ggl_text:'',
    ggl_style:'-999px',
};
var _getDetail;

var bindData = function () {
    var _this = this;
    detailData.num = _getDetail.chance_num;
    detailData.limit = _getDetail.frequency_limit > 0 ? true : false;

    detailData.prize_items = _getDetail.items;
    detailData.target_item = 1;
    _this.setData({
        detail:detailData
    })
};

var getDetail = function (id) {
    var _this = this;
    util.wxRequest({
        url: config.BASE_URL+'/m/marketingactivity-ajax.html',
        method:'POST',
        data:{
           activity_id: id,
           type: 'detail' 
        },
        success:function(res){
            if (!res.data)
                return;
            _getDetail = res.data;
            return bindData.call(_this);
        }
    })
};
//获取中奖结果
var flag;
var doRun = function(){
    if (flag === 0) return;
    flag = 0;
    var _this = this;
    util.wxRequest({
        url:config.BASE_URL + '/openapi/prize/win',
        method:'POST',
        data:{
           activity_id:_this.data.data.activity_id,
           t: Math.random() 
        },
        success:function(res){
            if (!res.data)
                return dm.errorEvent.apply(_this,['03', '操作失败']);

            var json = res.data;

            if (!json)
                return dm.errorEvent.apply(_this,['03', '操作失败']);
            result = json.result;
            code = json.code;
            msg = json.msg;
            is_error = (result != 'success' || code) ? true : false;
            // 转动前判断 是否错误
            if (is_error) {
                return dm.errorEvent.apply(_this,[code, msg]);
            }

            data = json.data;
            prize = data ? data.prize : null;
            partin = data ? data.partin : null;
            _this.setData({
                partin_id:data.partin.partin_id
            })
            var _txt = prize ? prize.prize_name : '未中奖';
            _this.setData({
                'detail.ggl_text':_txt,
                'detail.ggl_style':'0px',
            })
        }
    })
}
//获取画布
var ctx = swan.createCanvasContext('ggl-canvas');
//初始化画布
var initCanvas = function(){
    count = 0;
    //设置背景填充颜色
    ctx.setFillStyle('#FFD3B6');
    ctx.fillRect(0, 0, 190, 80);
    //设置文字填充颜色
    ctx.setFillStyle('#000000');
    ctx.setFontSize(24);
    ctx.setTextAlign('center');
    ctx.fillText('刮一刮', 90, 50);
    ctx.draw();
    doRun.call(this);
}
//提示中奖结果
var onTxt = function(){
    count = 0;
    var _this = this;
    setTimeout(function () {
        dm.getNum.call(_this);
        dm.onLottery.apply(_this,[partin, prize]);
    }, 1500);
}
var count = 0;
Page({
    data: {
        x:0,
        y:0,
        static_path:config.BASE_HOST+'/public/wechat/statics/image',
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '刮刮乐'
        });
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowWidth:res.windowWidth,
                    windowHeight:res.windowHeight
                });
            }
        });

    },
    onLoad: function(options) {
        var _this = this;
        getDetail.apply(_this,[options.act_id]);
        util.wxRequest({
            url: config.BASE_URL+'/m/marketingactivity-detail-'+options.act_id+'.html',
            success: function(res) {
                var pagedata = res.data;
                pagedata.chance.activity.from_time = dateFormat(parseInt(pagedata.chance.activity.from_time)*1000,'yyyy-mm-dd HH:MM');
                pagedata.chance.activity.to_time = dateFormat(parseInt(pagedata.chance.activity.to_time)*1000,'yyyy-mm-dd HH:MM');
                _this.setData(pagedata);
                initCanvas.call(_this);
            },
            complete: function() {
                _this.setData({
                    hideLoading: true
                });
            },
            fail: function(re) {
                console.info(re);
            },
        });
    },
    start:function(e){
        this.setData({
          x: e.touches[0].x,
          y: e.touches[0].y
        })
    },
    move:function(e){
        var _this = this;
        ctx.beginPath();

        ctx.clearRect(_this.data.x, _this.data.y, 24, 24)
        count++;
        ctx.draw(true);
        if (Math.ceil((count/7)*24*24>= 190*80/2)) {
            ctx.clearRect(0, 0, 190, 80)
            onTxt.call(_this);
        }
        
        this.setData({
          x: e.touches[0].x,
          y: e.touches[0].y
        })
    },
    end:function(e){
        
    },
    viewRule:function(){
        dm.viewRule.call(this);
    },
    closeRule:function(){
        dm.closeRule.call(this);
    },
    closeError:function(){
        flag = 1;
        dm.closeError.call(this);
        initCanvas.call(this);
    },
    closeLose:function(){
        flag = 1;
        dm.closeLose.call(this);
        initCanvas.call(this);
    },
    closeScore:function(){
        flag = 1;
        dm.closeScore.call(this);
        initCanvas.call(this);
    },
    closeCoupon:function(){
        flag = 1;
        dm.closeCoupon.call(this);
        initCanvas.call(this);
    },
    closeProduct:function(){
        flag = 1;
        dm.closeProduct.call(this);
        swan.redirectTo({
            url:'/pages/digitalmarketing/addr/addr?partin_id='+this.data.partin_id
        })
    },
})
