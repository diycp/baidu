const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();
Page({
    data:{
        img_url: config.BASE_HOST,
        modal_status:false,
        show_rules:false,
        show_success:false,
        show_error:false
    },
    cancelModal:function(){
        this.setData({
            modal_status:false,
            show_rules:false,
            show_success:false,
            show_error:false
        })
    },
    showRules:function(){
        this.setData({
            modal_status:true,
            show_rules:true
        })
    },
    showSuccess:function(){
        this.setData({
            modal_status:true,
            show_success:true
        })
    },
    showError:function(){
        this.setData({
            modal_status:true,
            show_error:true
        })
    },
    goToIndex:function(){
        swan.switchTab({
            url:'/pages/index/index'
        })
    },
    onReady: function() {
        
    },
    onPullDownRefresh: function() {
        this.onLoad.call(this);
    },
    onShow:function(){
        if(this.data.hideLoading){
            this.onLoad.call(this);
        }
    },
    load_image: function(e) {
        console.info(e);
        util.loadImage(this,e.currentTarget.dataset.ident,'m');
    },
    evt_goindex:function(){
        swan.switchTab({
          url: '/pages/index/index'
        })
    },
    onLoad: function(options) {
        var _this = this;
        _this.setData({
          themecolor:app.globalData.themecolor
        })
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/vshop.html',
                success: function(res) {
                    var pagedata = res.data;
                    if (pagedata.vshop && pagedata.vshop.shop_id) {
                        swan.setNavigationBarTitle({
                            title: "我的微店"
                        });
                        swan.setStorageSync('own_shop', pagedata.vshop.shop_id);
                    }else{
                        swan.setNavigationBarTitle({
                            title: "开通微店"
                        });
                        swan.removeStorageSync('own_shop');
                    }
                    if (pagedata.data) {
                        _this.setData(pagedata.data)
                    }
                    if(!pagedata || !pagedata.vshop){
                        return;
                    }
                    try{
                        pagedata['vshop']['logo_url'] = util.fixImgUrl(pagedata['vshop']['logo_url']);
                        pagedata['vshop']['banner_url'] = util.fixImgUrl(pagedata['vshop']['banner_url']);
                    }catch(e){

                    }
                    _this.setData(pagedata);
                },
                complete: function() {
                    //swan.hideNavigationBarLoading();
                    swan.stopPullDownRefresh();
                    _this.setData({
                        hideLoading:true
                    });

                }
            });
        });
    },
    myCatchTouch: function () {
        // 阻止滚动穿透
        console.log('stop user scroll it!');
        return;
    },
    evt_joinvshop:function(e){
        //成为店主
        const _this = this;
        let _vshop_id = swan.getStorageSync('_vshop_id');
        if (!_vshop_id) {
            _vshop_id = 0
        }
        util.wxRequest({
            url: config.BASE_URL + '/m/vshop-info-save.html',
            method:'POST',
            data:{_vshop_id},
            success: function(res) {
                var pagedata = res.data;
                if(pagedata.success && pagedata.success === '保存成功'){
                    //保存成功
                    if (pagedata.data && pagedata.data.status && pagedata.data.status === 'validate') {
                        // 审核中,跳转待审核页面
                        swan.showToast({
                            title:'申请成功',
                            icon:'success',
                            duration:1500,
                            success:function(){
                                _this.onLoad();
                            }
                        })
                    }else if(pagedata.data && pagedata.data.status && pagedata.data.status === 'active'){
                        // 开店成功
                        _this.showSuccess();
                        _this.onPullDownRefresh();
                    }
                }else if(pagedata.error && pagedata.error === '未满足开店要求'){
                    //消费金额不满足
                    _this.setData({
                        open_shop_money:pagedata.data.open_shop_money
                    })
                    _this.showError();
                }
            },
            complete: function() {
                swan.hideToast();
            }
        });
    },
    evt_getphonenumber:function(e){
        var _this = this;
        var res = e.detail;
        if(!res.iv || !res.encryptedData){
            return;
        }
        var wx_session_key = this.data.member.wx_session_key;
        if(!wx_session_key){
            return;
        }
        swan.showToast({
            icon:'loading',
            title:'正在绑定',
            mask:true,
            duration:50000
        });
        let _vshop_id = swan.getStorageSync('_vshop_id');
        if (!_vshop_id) {
            _vshop_id = 0
        }
        util.wxRequest({
            url: config.BASE_URL + '/openapi/toauth/callback/wechat_toauth_wxapppam/bind_mobile',
            method:'POST',
            data:{
                session_key:wx_session_key,
                iv:res.iv,
                encryptedData:res.encryptedData,
                _vshop_id:_vshop_id
            },
            success: function(res) {
                var resdata = res.data;
                if(resdata.result == 'error'){
                    swan.showModal({
                        title:'绑定失败',
                        content:resdata.data
                    });
                }
                if(resdata.result == 'success'){
                    swan.showModal({
                        title:'绑定成功',
                        content:'已成功绑定手机:'+resdata.data.purePhoneNumber,
                        showCancel:false,
                        success:function(res){
                            app.globalData.member.exist_login_type &&
                            app.globalData.member.exist_login_type.push &&
                            app.globalData.member.exist_login_type.push('mobile');
                            //成为店主
                            util.wxRequest({
                                url: config.BASE_URL + '/m/vshop-info-save.html',
                                method:'POST',
                                data:{
                                    _vshop_id:_vshop_id
                                },
                                success: function(res) {
                                    var pagedata = res.data;
                                    if(pagedata.success && pagedata.success === '保存成功'){
                                        //保存成功
                                        if (pagedata.data && pagedata.data.status && pagedata.data.status === 'validate') {
                                            // 审核中,跳转待审核页面
                                            swan.showToast({
                                                title:'申请成功',
                                                icon:'success',
                                                duration:1500,
                                                success:function(){
                                                    _this.onLoad();
                                                }
                                            })
                                        }else if(pagedata.data && pagedata.data.status && pagedata.data.status === 'active'){
                                            // 开店成功
                                            _this.showSuccess();
                                            _this.onPullDownRefresh();
                                        }
                                    }else if(pagedata.error && pagedata.error === '未满足开店要求'){
                                        //消费金额不满足
                                        _this.setData({
                                            open_shop_money:pagedata.data.open_shop_money
                                        })
                                        _this.showError();
                                    }
                                },
                                complete: function() {
                                    swan.hideToast();
                                }
                            });
                        }
                    });
                }
            },
            complete: function() {
                swan.hideToast();
            }
        });
    },
    evt_getqrcode: function(e) {
        var _this = this;
        swan.showToast({
            title:'正在生成',
            icon:'loading',
            mask:true,
            duration:10000
        });
        util.getqrcode({
            'path': '/pages/index/page/page?_vshop_id=' + _this.data.vshop.shop_id,
            'type': 'scene',
            'width': 430
        }, function(qr_image_data) {
            swan.hideToast();
            swan.previewImage({
                urls: [qr_image_data.qrcode_image_url]
            });
        });
    },
    onShareAppMessage: function () {
      let the_path = '/pages/index/page/page?_vshop_id=' + this.data.vshop.shop_id;
      the_path = util.merchantShare(the_path);
        return {
            title: '微店分享',
            path: the_path,
        };
    },
    evt_redirect:function(e){
        swan.redirectTo({
            url:e.currentTarget.dataset.url
        });
    }
});
