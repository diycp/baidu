const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const dateFormat = require('../../../utils/dateformat.js');
const app = getApp();
var current_page = 1;
var loading_more = false;
var format_statement_list = function(statement_list){
    for (var i = 0; i < statement_list.length; i++) {
        statement_list[i]['createtime'] = dateFormat(parseInt(statement_list[i]['createtime'])*1000,'yyyy-mm-dd HH:MM:ss');
    }
    return statement_list;
}
var load_list = function(page) {
    var _this = this;
    var page = page ? page : 1;
    loading_more = true;
    util.wxRequest({
        url: config.BASE_URL + '/m/vshop-statement-' + page +'-20-'+_this.data.status+ '.html',
        method:'POST',
        data:_this.data.filter_data,
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata) {
                newdata.statement_list && (newdata.statement_list = format_statement_list(newdata.statement_list));
                if (!newdata.statement_list || !newdata.statement_list.length) {
                    newdata.empty_list = 'YES';
                    _this.setData({
                        statement_list:false
                    })
                } else {
                    newdata.empty_list = 'NO';
                }
                _this.setData(newdata);
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
        filter_data: {},
        empty_list: 'NO',
        img_url:config.BASE_HOST,
        input_placeholder_style:'color:#BBBBBB;text-align:right;font-size:26rpx;',
        animationData: {},
        showError:false,
        status: 'all',
        status_kvmap: {
            'ready': '待结算',
            'process': '处理中',
            'succ': '已结算',
            'noconfirm':'待确认'
        }
    },
    evt_confirm_order:function(e){
        let statement_id = e.currentTarget.dataset.statement_id;
        this.setData({
            statement_id:statement_id
        })
        var animation = swan.createAnimation({
            timingFunction:'linear',
            transformOrigin:'0,0,0',
            duration:250
        })
        this.animation = animation;
        animation.translate3d(0,0,0).step();
        this.setData({
            animationData:animation.export()
        })
    },
    inputFocus:function(){
        this.setData({
            showError:false
        })
    },
    evt_cancel_modal:function(){
        var animation = swan.createAnimation({
            timingFunction:'linear',
            transformOrigin:'0,0,0',
            duration:250
        })
        this.animation = animation;
        animation.translate3d(0,1000,0).step();
        this.setData({
            animationData:animation.export()
        })
    },
    evt_submit:function(e){
        let formdata = e.detail.value;
        for(let k in formdata){
            if (formdata[k] == '') {
                this.setData({
                    showError:true,
                })
                return;
            }
        }
        formdata.pay_app_id = 'chinapay';
        const _this = this;
        util.wxRequest({
            url:config.BASE_URL + '/m/vshop-statement_confirm-'+_this.data.statement_id+'.html',
            method:'post',
            data:formdata,
            success:function(re){
                console.log(re.data.error);
                if (re.data.error) {
                    swan.showModal({
                        title:'结算失败',
                        content:re.data.error,
                        showCancel:false,
                        success: function(res) {
                            if (res.confirm) {
                              _this.evt_cancel_modal();
                            } 
                        }
                    })
                }else{
                     _this.evt_cancel_modal();
                    swan.showToast({
                        title:'确认成功',
                        mask:true
                    })
                }
            },
            complete:function(){
                load_list.call(_this,1)
            }
        })
    },
    onReady: function() {
    },
    onLoad: function(options) {
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight - 49,
                });
            }
        });
        this.setData(options);
        swan.setNavigationBarTitle({
            title: '财务结算'
        });
        current_page = 1;
        util.checkMember.call(this, function() {
            load_list.call(_this);
        });
    },
    evt_scrolltolower: function(e) {
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    evt_changefilter_from:function(e){
        this.setData({
            'filter_data.from':e.detail.value
        });
    },
    evt_changefilter_to:function(e){
        this.setData({
            'filter_data.to':e.detail.value
        });
    },
    evt_dofilter:function(e){
        load_list.call(this, current_page);
    },
    myCatchTouch: function () {
        // 阻止滚动穿透
        console.log('stop user scroll it!');
        return;
    },
});
