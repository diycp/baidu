//幸运大转盘
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const dateFormat = require('../../../utils/dateformat.js');
const dm = require('../../../utils/digitalmarketing.js');
const app = getApp();
var flag;
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
    partin_addr_url: null
};
var _getDetail;
var wResize = function () {
    //设备宽度
    var dwidth = this.data.windowWidth;
    //设备高度
    var dheight = this.data.windowHeight;

    // 原始大小
    var _srcW = 659;
    // 当前大小
    var _zhuanpanW = dwidth * 0.9;
    // 缩放比例
    var _ba = _zhuanpanW / _srcW;
    // 圆环大小位置
    var _ringW = 547;
    var _ringBw = 41;
    var _ringT = 52;
    var _ringL = 61;

    // 圆环当前大小位置
    var _newRingW = Math.ceil(_ringW * _ba);
    var _newRingBw = Math.ceil(_ringBw * _ba);
    var _newRingT = Math.ceil(_ringT * _ba);
    var _newRingL = Math.ceil(_ringL * _ba);
    
    // 箭头大小位置
    var _arrowW = 237;
    var _arrowH = 282;
    var _arrowT = 167;
    var _arrowL = 215;

    this.setData({
        stylesheets:{
            // 设置圆环大小位置
            ring:{
                width:_newRingW,
                height:_newRingW,
                borderWidth:_newRingBw,
                top:_newRingT,
                left:_newRingL
            },
            // 设置文字大小位置
            text:{
                width:_newRingW,
                height:_newRingW,
                top:_newRingT,
                left:_newRingL
            },
            // 设置箭头大小位置
            arrow:{
                width:Math.ceil(_arrowW * _ba),
                height:Math.ceil(_arrowH * _ba),
                top:Math.ceil(_arrowT * _ba),
                left:Math.ceil(_arrowL * _ba)
            },
            // 设置浮动层背景高度
            opacityBox:{
                height:dheight
            }

        }
    })
};

// 绑定数据
var bindData = function () {
    var _this = this;
    detailData.num = _getDetail.chance_num;
    detailData.limit = _getDetail.frequency_limit > 0 ? true : false;

    detailData.prize_items = _getDetail.items;
    _this.setData({
        detail:detailData
    })
};

var getDetail = function (id) {
    var _this = this;
    // if (_getDetail)
    //     return bindData.call(_this);
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

var whirlEvent = function () {
    var _this = this;
    // 是否在转
    if(flag === 0) return;
    flag = 0;
    // var isWhirl = false;

    // 角度
    var objDeg = function (deg) {
        _this.setData({
            'stylesheets.whirldeg':deg
        })
    };

    // 转动
    var onWhirl = function () {
        // 判断是否在转动
        // if (isWhirl)
        //     return;
        // // 设置已转动
        // isWhirl = true;

        // 索引数
        var cnt = 100;
        // 总转动角度
        var totalDeg = 0;
        var result, code, msg, data = null, is_error, prize = null, partin = null;

        // 转动角度算法
        var ratio = [];
        ratio[1] = [0.2, 0.4, 0.6, 0.8, 1, 1, 1.2, 1.4, 1.6, 1.8];
        ratio[2] = [1.8, 1.6, 1.4, 1.2, 1, 1, 0.8, 0.6, 0.4, 0.2];

        // 根据结果执行转动
        var doWhirl = function () {
            // 
            var amount, deg, ct = 0, ctime = 0;

            // 重置
            cnt = 100;
            objDeg(0);

            // 完成转动后
            var aftWhirl = function () {
                // if (!isWhirl)
                //     return false;

                cnt = 100;
                // isWhirl = false;
                setTimeout(function () {
                    dm.getNum.call(_this);
                    dm.onLottery.apply(_this,[partin, prize]);
                }, 1500);

            };

            // 计算每次转动角度偏移量
            amount = 18.18 - (0.18 * ((prize && prize.prize_grade ? (prize.prize_grade * 2 +1) : (parseInt(Math.random()*4,10) * 2 + 1)+1)));
            // 分200次 10秒转动完成
            for (var i = 0; i < 200; i++) {
                // 延时
                (function (x) {
                    ctime = 20 * x;
                    ct += ctime;

                    setTimeout(function ()
                    {

                        deg = amount * (ratio[String(cnt).substr(0, 1)][String(cnt).substr(1, 1)]);
                        cnt++;

                        totalDeg += deg;
                        objDeg(totalDeg);

                        if (x == 199) {
                            aftWhirl();
                        }
                    }, x * 20);

                })(i);

            }
        };
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
                doWhirl();
            }
        })
    };

    onWhirl();
};

Page({
    data: {
        static_path:config.BASE_HOST+'/public/wechat/statics/image',
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '幸运大转盘'
        });
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowWidth:res.windowWidth,
                    windowHeight:res.windowHeight
                });
                wResize.call(_this,{})
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
    viewRule:function(){
        dm.viewRule.call(this);
    },
    onWhirl:function(){
        var _this = this
        util.checkMember.call(_this,function(){
            whirlEvent.call(_this);
        })
    },
    closeRule:function(){
        dm.closeRule.call(this);
    },
    closeError:function(){
        flag = 1;
        dm.closeError.call(this);
    },
    closeLose:function(){
        flag = 1;
        dm.closeLose.call(this);
    },
    closeScore:function(){
        flag = 1;
        dm.closeScore.call(this);
    },
    closeCoupon:function(){
        flag = 1;
        dm.closeCoupon.call(this);
    },
    closeProduct:function(){
        flag = 1;
        dm.closeProduct.call(this);
        swan.redirectTo({
            url:'/pages/digitalmarketing/addr/addr?partin_id='+this.data.partin_id
        })
    },
})
