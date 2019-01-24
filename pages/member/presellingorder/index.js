const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();
var current_page = 1;
var loading_more = false;
var load_list = function(page) {
    loading_more = true;
    var _this = this;
    var page = page ? page : 1;
    util.wxRequest({
        url: config.BASE_URL + '/m/pslmember-orders_list' + ('-' + this.data.order_type) + '-' + page + '.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata) {
                if (_thisdata.order_list && page > 1) {
                    newdata.order_list = _thisdata.order_list.concat(newdata.order_list);
                }
                if (!newdata.order_list || !newdata.order_list.length) {
                    newdata.empty_list = 'YES';
                } else {
                    newdata.empty_list = 'NO';
                }
                var arr = [];
                for (var i = 0; i < newdata.order_list.length; i++) {
                    arr.push({'isshow':false})
                }
                _this.setData(newdata);
                _this.setData({
                    isshow:arr
                })
                _this.countdown(_thisdata.order_list);
            }
        },
        complete:function(){
            _this.setData({hideLoading:true});
            loading_more = false;
        }
    });
};
Page({
    data: {
        order_type: 'all',
        empty_list: 'NO',
        status_kvmap: {
            status: ['待付订金', '已付订金', '预售成功', '预售失败'],
        }
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '我的预售'
        });
    },
    onLoad: function(options) {
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight,
                });
            }
        });
        
        this.setData(options);
        current_page = 1;
        util.checkMember.call(this, function() {
            load_list.call(_this);
        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'xs');
    },
    evt_scrolltolower: function(e) {
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    evt_navigator:function(e){
        swan.navigateTo({
            url:e.currentTarget.dataset.url
        });
    },
    countdown: function(lists){
        var _this = this;
        //倒计时
        var neworderlist = [];
        for (var i = 0; i < lists.length; i++) {
            (function(i){
                neworderlist[i] = '';
                if (lists[i].status == '0') {
                    //订金支付倒计时
                    neworderlist[i] = lists[i].surplus_deposit_endtime;
                }else if(lists[i].status == '1' && lists[i].surplus_balance_starttime < 0){
                    //尾款支付开始倒计时
                    neworderlist[i] = 0 - parseInt(lists[i].surplus_balance_starttime);
                }else if(lists[i].status == '1' && lists[i].surplus_balance_endtime > 0 && lists[i].surplus_balance_starttime > 0){
                    //尾款支付结束倒计时
                    neworderlist[i] = lists[i].surplus_balance_endtime;
                }
                else{
                    neworderlist[i] = 0;
                }
            })(i)
        } 
        var count_down = function (){
            var countdownarr  = [];
            let intDiff = neworderlist;
            clearInterval(timer)
            for (let i = 0; i < intDiff.length; i++) {
                var timer = setInterval(function(){
                    var day=0,
                        hour=0,
                        minute=0,
                        second=0;//时间默认值
                    if(intDiff[i] > 0){
                        day = Math.floor(intDiff[i] / (60 * 60 * 24)).toString();
                        hour = (Math.floor(intDiff[i] / (60 * 60)) - (day * 24)).toString();
                        minute = (Math.floor(intDiff[i] / 60) - (day * 24 * 60) - (hour * 60)).toString();
                        second = (Math.floor(intDiff[i]) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60)).toString();
                    }
                    if (day <= 9) day = '0' + day;
                    if (hour <= 9) hour = '0' + hour;
                    if (minute <= 9) minute = '0' + minute;
                    if (second <= 9) second = '0' + second;
                    if(day == 0 && hour == 0 && minute == 0 && second == 0){
                       clearInterval(timer);
                    }
                    countdownarr[i] = {
                            days:day,
                            hours:hour,
                            minutes:minute,
                            seconds:second,
                        }
                    _this.setData({
                        countdown:countdownarr
                    })
                    intDiff[i]--;
                }, 1000)
            }            
        };
        return new count_down();
        //var timer = setInterval(count_down, 1000);
    } ,
    showdetail:function(e){
        var index = e.currentTarget.dataset.index;
        var _this = this;
        var newarr = _this.data.isshow;
        newarr[index].isshow = !newarr[index].isshow;
        _this.setData({
            isshow:newarr
        })
        
    }   
});
