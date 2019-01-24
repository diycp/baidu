//摇一摇
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const dateFormat = require('../../../utils/dateformat.js');
const dm = require('../../../utils/digitalmarketing.js');
const app = getApp();
//var currentPages = getCurrentPages();
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

var yaoEvent = function () {
    var _this = this;
    _this.setData({
        isShake:true
    })
    var result, code, msg, data = null, is_error, prize = null, partin = null;

    var doYao = function () {
        if(flag === 0) return;
        flag = 0;
        _this.setData({
            'detail.animate':true
        })

        util.wxRequest({
            url:config.BASE_URL + '/openapi/prize/win',
            method:'POST',
            data:{
               activity_id:_this.data.data.activity_id,
               t: Math.random() 
            },
            success:function(res){
                console.log('请求~~~~~');
                console.log(res.data)
                setTimeout(function(){
                    if (!res.data)
                        return dm.errorEvent.apply(_this,['03', '操作失败']);

                    var json = res.data;

                    if (!json)
                        return dm.errorEvent.apply(_this,['03', '操作失败']);
                    result = json.result;
                    code = json.code;
                    msg = json.msg;
                    is_error = (result != 'success' || code) ? true : false;
                    // 判断 是否错误
                    if (is_error) {
                        return dm.errorEvent.apply(_this,[code, msg]);
                    }

                    data = json.data;
                    prize = data ? data.prize : null;
                    partin = data ? data.partin : null;

                    _this.setData({
                        partin_id:data.partin.partin_id,
                        'detail.animate':false
                    })
                    setTimeout(function () {
                        dm.getNum.call(_this);
                        dm.onLottery.apply(_this,[partin, prize]);
                        
                    }, 1500);

                },2000)
            }
        })
        return true;
    };

    doYao();
}

Page({
    data: {
        isShake:false,
        static_path:config.BASE_HOST+'/public/wechat/statics/image',
    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '摇一摇'
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
    onshow:function(){
        
    },
    onHide:function(){
        
    },
    onLoad: function(options) {
        var _this = this;
        getDetail.apply(_this,[options.act_id]);
        _this.setData({
            'detail.animate':false
        })
        util.wxRequest({
            url: config.BASE_URL+'/m/marketingactivity-detail-'+options.act_id+'.html',
            success: function(res) {
                var pagedata = res.data;
                pagedata.chance.activity.from_time = dateFormat(parseInt(pagedata.chance.activity.from_time)*1000,'yyyy-mm-dd HH:MM');
                pagedata.chance.activity.to_time = dateFormat(parseInt(pagedata.chance.activity.to_time)*1000,'yyyy-mm-dd HH:MM');
                _this.setData(pagedata);
                //判断当前微信版本是否支持摇一摇
                if (swan.canIUse('onAccelerometerChange')) {
                    //加载完成开始监听摇一摇
                    swan.onAccelerometerChange(function (e) {
                        if (e.x > 0.5 && e.y > 0.5) {
                            if (_this.data.isShake) {
                                return;
                            }
                            _this.setData({
                                isShake:true
                            });
                            swan.showToast({
                                title: '摇一摇成功',
                                icon: 'success',
                                duration: 100
                            })
                            yaoEvent.call(_this);
                        }
                    })
                }else{
                    swan.showModal({
                        title: '暂不支持摇一摇',
                        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
                    })
                }
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
        this.setData({
            isShake:true,
        })
    },
    closeRule:function(){
        dm.closeRule.call(this);
        this.setData({
            isShake:false,
        })
    },
    closeError:function(){
        flag = 1;
        dm.closeError.call(this);
        this.setData({
            isShake:false,
        })
    },
    closeLose:function(){
        flag = 1;
        dm.closeLose.call(this);
        this.setData({
            isShake:false,
        })
    },
    closeScore:function(){
        flag = 1;
        dm.closeScore.call(this);
        this.setData({
            isShake:false,
        })
    },
    closeCoupon:function(){
        flag = 1;
        dm.closeCoupon.call(this);
        this.setData({
            isShake:false,
        })
    },
    closeProduct:function(){
        flag = 1;
        this.setData({
            isShake:false,
        })
        dm.closeProduct.call(this);
        swan.redirectTo({
            url:'/pages/digitalmarketing/addr/addr?partin_id='+this.data.partin_id
        })
    }
})
