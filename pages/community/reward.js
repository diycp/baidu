const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const show_recharge = function(){
    swan.showModal({
        title:'余额不足',
        content:'是否立即充值?',
        success:function(e){
            if(e.confirm){
                swan.navigateTo({
                    url:'/pages/ubalance/recharge'
                });
            }
        }
    });
};
const send_reward = function(reward_val,callback){
    var _this = this;
    if(isNaN(reward_val)){
        return;
    }
    reward_val = parseFloat(reward_val);
    this.data.ubalance.ubalance = parseFloat(this.data.ubalance.ubalance);
    if(reward_val>this.data.ubalance.ubalance){
        return show_recharge();
    }
    swan.showToast({
        icon:'loading',
        title:'打赏中...',
        mask:true,
        duration:5000
    });
    util.wxRequest({
        url: config.BASE_URL + '/m/communityreward-send.html',
        method:'POST',
        data: {
            reward:reward_val,
            blog_id:this.data.blog_id,
            to_user_id:this.data.to_user.user_id
        },
        success: function(res) {
            let resdata = res.data;
            if(!resdata || typeof resdata!='object' || !resdata.success){
                swan.showModal({
                    title:'打赏失败',
                    content:resdata.error||'',
                    showCancel:false
                });
            }
            if(resdata.success){
                _this.setData({
                    reward_success:reward_val
                });
            }
            console.info(resdata);
            typeof callback == 'function' && callback(resdata);
        },
        complete: function() {
            swan.hideToast();
        }
    });
};
Page({
    data: {
        hideLoading: false,
        reward_section:[1,3,5,8,16,66,99,188,598],
    },
    onShow:function(){
        this.onLoad(this.data.onload_options);
    },
    onHide: function() {

    },
    onPullDownRefresh: function() {

    },
    onReachBottom: function() {

    },
    onReady: function() {
        var _this = this;
        swan.setNavigationBarTitle({
            title: '打赏'
        });
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    win_height: res.windowHeight,
                    win_width: res.windowWidth,
                    canvas_height:res.windowWidth*0.25
                });
                var ctx = swan.createCanvasContext('top_canvas_wrap');
                ctx.arc(res.windowWidth/2,-res.windowWidth+res.windowWidth*0.15 , res.windowWidth, 0, 2 * Math.PI);
                ctx.setFillStyle('#E64340');
                ctx.fill();
                ctx.draw();
            }
        });
    },
    onLoad: function(options) {
        var _this = this;
        var to_user_id = options.to_user_id;
        var blog_id = options.blog_id;
        this.setData({
            onload_options:options
        });
        util.checkMember.call(this, function(re) {
            util.wxRequest({
                url: config.BASE_URL + '/m/communityreward-index-'+to_user_id+'.html',
                data: {
                    'blog_id': blog_id
                },
                success: function(res) {
                    let resdata = res.data;
                    _this.setData(resdata);
                    util.loadImage(_this, resdata.to_user.avatar, 'm');
                },
                complete: function() {
                    _this.setData({
                        hideLoading: true
                    });
                }
            });
        });
    },
    evt_togglesection:function(e){
        this.setData({
            reward_input_show:!this.data.reward_input_show
        });
    },
    evt_reward_section:function(e){
        let reward_val = e.currentTarget.dataset.section;
        var _this = this;
        swan.showModal({
            title:'确认打赏？',
            content:'金额：'+reward_val,
            success:function(e){
                if(e.confirm){
                    send_reward.call(_this,reward_val);
                }
            }
        });
    },
    evt_reward_submit:function(e){
        let reward_val = e.detail.value.reward_input;
        var _this = this;
        swan.showModal({
            title:'确认打赏？',
            content:'金额：'+reward_val,
            success:function(e){
                if(e.confirm){
                    send_reward.call(_this,reward_val);
                }
            }
        });

    },
    evt_gotoback:function(e){
        console.info(e);
        swan.navigateBack();
    },
    evt_gotoubalance:function(e){
        swan.redirectTo({
            url:'/pages/ubalance/index'
        });
    }
});
