const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();
const attr_process = function(attr) {
    for (let i = 0; i < attr.length; i++) {
        let attr_item = attr[i];
        if (attr_item.attr_option && (typeof attr_item.attr_option == 'object')) {
            attr[i].attr_option = (function(obj){
                let _return = [];
                for(let k in obj){
                    _return.push(obj[k]);
                }
                return _return;
            }(attr_item.attr_option));
        }
    }
    return attr;
}

Page({
    data: {

    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '个人设置'
        });
    },
    onLoad: function(options) {
        var _this = this;
        //swan.showNavigationBarLoading();
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/my-setting.html',
                success: function(res) {
                    var pagedata = res.data;
                    if (pagedata.attr) {
                        pagedata.attr = attr_process(pagedata.attr);
                    }
                    _this.setData(pagedata);
                },
                complete: function() {
                    _this.setData({
                        hideLoading: true
                    });
                }
            });
        });

    },
    evt_chgavatar: function(e) {
        var _this = this;
        swan.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function(res) {
                var tempFilePaths = res.tempFilePaths;
                if (!tempFilePaths[0]) {
                    return;
                }
                swan.showToast({
                    icon: 'loading',
                    mask: true,
                    title:'上传中',
                    duration: 50000
                });
                util.wxUpload({
                    url: config.BASE_URL + '/m/imagemanage-wx_upload.html',
                    filePath: tempFilePaths[0],
                    name: 'file',
                    success: function(res) {
                        if (res.data == '') {
                            swan.showModal({
                                title: '上传失败',
                                content: '图片上传失败,请重试',
                                showCancel: false
                            })
                            return;
                        };
                        var data = res.data;
                        var image_id = data.image_id;
                        _this.setData({
                            'member.avatar':image_id
                        });
                    },
                    complete: function(e) {
                        swan.hideToast();
                    }
                })
            }
        });
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'm');
    },
    evt_update: function(e) {
        console.info(e);
        var form_params = e.detail.value;

        for(let k in form_params){
            if(!(form_params[k])){
                delete(form_params[k]);
            }
        }
        console.info(form_params);
        swan.showToast({
            icon:'loading',
            mask:true,
            content:'保存中',
            duration:50000
        });
        util.wxRequest({
            url: config.BASE_URL + '/m/my-save_setting.html',
            method:'POST',
            data:form_params,
            success: function(res) {
                let resdata = res.data;
                if(resdata.success){
                    swan.showModal({
                        title:'保存成功',
                        content:'个人信息保存成功',
                        showCancel:false,
                        success:function(res){
                            if(res.confirm){
                                swan.setStorage({
                                    key:'reload_member_info',
                                    data:'true',
                                    complete:function(){
                                        swan.navigateBack();
                                    }
                                });

                            }
                        }
                    });
                }
            },
            complete: function() {
                swan.hideToast();
            }
        });
    },
    evt_selectchange: function(e) {
        let itemidx = e.currentTarget.dataset.itemidx;
        let current_value = this.data.attr[itemidx].attr_option[e.detail.value];
        let _set = {};
        _set['attr[' + itemidx + '].attr_value'] = current_value;
        this.setData(_set);
        // console.info(itemidx);
        // console.info(e);
    },
    evt_datechange: function(e) {
        let itemidx = e.currentTarget.dataset.itemidx;
        let current_value = e.detail.value;
        let _set = {};
        _set['attr[' + itemidx + '].attr_value'] = current_value;
        this.setData(_set);
        // console.info(itemidx);
        // console.info(current_value);
    },
    evt_opensetting: function(e) {
        swan.openSetting({
            success: function(authSetting) {
                console.info(authSetting);
            }
        });
    },
    evt_logout:function(){
        delete(app.globalData.member);
        swan.removeStorageSync('_SID');
        swan.showModal({
            title:'退出成功',
            content:'退出登录状态成功',
            success:function(re){
                if(re.confirm){
                    swan.reLaunch({
                        url:'/pages/index/index'
                    });
                }
            }
        });
    }
});
