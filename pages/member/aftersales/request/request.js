const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const WxParse = require('../../../../utils/wxParse/wxParse.js');
const app = getApp();
var req_images = [];


Page({
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '售后申请'
        });
    },
    onLoad: function(options) {
        var _this = this;
        var order_id = options.order_id;
        var product_id = options.product_id;
        if (!order_id || !product_id) {
            swan.showModal({
                title: '异常',
                content: '无法进行售后申请',
                showCancel:false,
                success: function(res) {
                    swan.navigateBack();
                }
            });
        }
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/aftersales-newrequest-' + order_id + '-' + product_id + '.html',
                success: function(res) {
                    var pagedata = res.data;
                    if(pagedata.error){
                        return swan.showModal({
                            title: '异常',
                            content: pagedata.error,
                            showCancel:false,
                            success: function(res) {
                                swan.navigateBack();
                            }
                        });
                    }
                    _this.setData(pagedata);
                    WxParse.wxParse('assule_fmt', 'html', pagedata.assule, _this, 0);
                    WxParse.wxParse('return_item_helpinfo_fmt', 'html', pagedata.return_item_helpinfo, _this, 0);

                }
            });
        });
    },
    evt_selimage: function(e) {
        var _this = this;
        // if (this.data.req_images && this.data.req_images.length > 4) {
        //     return swan.showModal({
        //         title: '提示',
        //         showCancel: false,
        //         content: '最多上传5张照片'
        //     }); 
        // }
        swan.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            success: function(re) {
                if (re.tempFilePaths && re.tempFilePaths.length) {
                    // req_images = req_images.concat(re.tempFilePaths);
                    
                    //TODO 暂时仅允许1张图片
                    req_images = re.tempFilePaths;
                }
                _this.setData({
                    request_images: req_images
                });
            }
        });
    },
    evt_removeimage: function(e) {
        var index = e.currentTarget.dataset.index;
        req_images[index] = null;
        req_images = req_images.filter(function(v) {
            return !!v;
        });
        this.setData({
            request_images: req_images
        });
    },
    image_load: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'xs');
    },
    event_quantity_blur: function(e) {
        var val = e.detail.value;
        if (val > this.data.request_item.sendnum) {
            val = this.data.request_item.sendnum;
        }
        if (val < 1 || isNaN(val)) {
            val = 1;
        }
        this.setData({
            page_prn: val
        });
    },
    evt_submit: function(e) {
        var form_params = e.detail.value;
        var order_id = this.data.order.order_id;
        var product_id = this.data.request_item.product_id;
        if(form_params['request[description]'] == ''){
            return swan.showModal({
                title: '信息未填写完整',
                showCancel: false,
                content: '请描述问题'
            });
        }
        swan.showToast({
            title:'正在提交',
            icon:"loading",
            mask:true,
            duration:10000
        });
        var action = config.BASE_URL + '/m/aftersales-newrequest-' + order_id + '-' + product_id + '-save.html';
        var on_success = function(res){
            var resdata = res.data;
            if(typeof resdata == 'string'){
                resdata = JSON.parse(resdata);
            }
            if(resdata.success){
                var newrequest_order = resdata.data;
                swan.showModal({
                    title: '售后申请已成功提交',
                    showCancel: false,
                    content: '感谢您的配合,我们已收到您的售后服务请求,请等待客服审核。',
                    success:function(res){
                        if (res.confirm) {
                            swan.redirectTo({
                                url:'/pages/member/aftersales/reqlist/index'
                            });
                        }
                    }
                });
            }else{
                swan.showModal({
                    title: '提交售后信息失败',
                    showCancel: false,
                    content: '提交失败'
                });
            }
        };
        var on_complete = function(){
            swan.hideToast();
        }
        console.log(this.data.request_images,'en')
        if(this.data.request_images && this.data.request_images.length){
            util.wxUpload({
                url: action,
                filePath: this.data.request_images[0],
                name: 'images',
                formData:form_params,
                success: on_success,
                complete:on_complete
            });
        }else{
            util.wxRequest({
                url: action,
                method:'POST',
                data:form_params,
                success: on_success,
                complete:on_complete
            });
        }


    }

});
