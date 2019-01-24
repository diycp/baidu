//水果机
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const dateFormat = require('../../../utils/dateformat.js');
const dm = require('../../../utils/digitalmarketing.js');
const app = getApp();
//var currentPages = getCurrentPages();

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
var flag;
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
Page({
    data: {
        static_path:config.BASE_HOST+'/public/wechat/statics/image',
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '水果机'
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
    doRun: function () {
        var _this = this;
        if(flag === 0) return;
        flag = 0;
        var ct = 0,
            len = 12,
            // flag = false,
            cnt = 100,
            ctime,
            ratio = [],
            c = 1, n = 1;
        ratio[1] = [1, 0.8, 0.6, 0.4, 0.4, 0.4, 0.2, 0.2, 0.1, 0.1];
        ratio[2] = [0.1, 0.1, 0.2, 0.2, 0.4, 0.4, 0.4, 0.6, 0.8, 1];
        var result, code, msg, data = null, is_error, prize = null, partin = null;

        var onEnd = function () {
            // if (!flag)
            //     return false;
            // flag = false;
            c = 1;
            cnt = 100;
            n = 1;
            ct = 0;

            setTimeout(function () {
                dm.getNum.call(_this);
                dm.onLottery.apply(_this,[partin, prize]);
            }, 1500);
        };

        var moveToNext = function () {
            var _m = 180 + (2 * prize.prize_grade) + 1;

            n = 1;

            for (n = 1; n <= _m; n++) {

                (function (x) {
                    ctime = 60 * (ratio[String(cnt).substr(0, 1)][String(cnt).substr(1, 1)]);
                    ct += ctime;
                    cnt++;

                    setTimeout(function ()
                    {
                        _this.setData({
                            'detail.target_item': x % 12
                        })
                        if (x == _m)
                            onEnd();
                        c++;
                        if (c > len)
                            c = 1;
                    }, ct);
                })(n);
            }
        };

        var startRun = function () {
            // if (flag)
            //     return;
            // flag = true;

            // 获取参与结果

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
                    moveToNext();
                }
            })
        };

        startRun();
    }
})
