const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
var dateFormat = require('../../../../utils/dateformat.js');
var oshop = require('../../oshop.js');
Page({
    data: {
        status_kvmap: {
            'noconfirm': '待确认',
            'ready':'待结算',
            'process': '处理中',
            'succ': '已结算'
        }
    },
    onPullDownRefresh: function() {
        this.onLoad.call(this,{statement_id:this.data.statement_id});
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '结算单详情'
        });
    },
    onLoad: function(options) {
        var _this = this;
        var statement_id = options.statement_id;
        var oshop_role = oshop.getRole();
        this.setData(oshop_role);
        this.setData(options);
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/o2ocds-statement_detail-'+statement_id+'.html',
                success: function(res) {
                    var pagedata = res.data;
                    pagedata['statement']['last_modify'] = dateFormat(parseInt(pagedata['statement']['last_modify'])*1000,'yyyy-mm-dd HH:MM:ss');
                    pagedata['statement']['createtime'] = dateFormat(parseInt(pagedata['statement']['createtime'])*1000,'yyyy-mm-dd HH:MM:ss');
                    _this.setData(pagedata);
                },
                complete:function(){
                    swan.stopPullDownRefresh();
                    _this.setData({hideLoading:true});
                }
            });
        });
    },
    evt_update:function(e){
        var form_data = e.detail.value;
        form_data['statement_id'] = this.data.statement.statement_id;
        swan.showModal({
            title:'确认提交收款信息？',
            content:'我们将审核您的收款信息并结算到您提交的收款账户内,请确认信息无误!',
            mask:true,
            success:function(res){
                if(res.confirm){
                    swan.showToast({
                        icon:'loading',
                        title:'正在提交',
                        mask:true,
                        duration:10000
                    });
                    util.wxRequest({
                        url: config.BASE_URL + '/m/o2ocds-save_statement.html',
                        method:'POST',
                        data:form_data,
                        success: function(res) {
                            var pagedata = res.data;
                            console.info(pagedata);
                            if(pagedata.success){
                                return swan.showModal({
                                    title:'提交成功',
                                    content:'收款信息提交成功,请等待财务打款',
                                    showCancel:false,
                                    success:function(res){
                                        if(res.confirm){
                                            swan.navigateBack();
                                        }
                                    }
                                });
                            }
                            swan.showModal({
                                title:'提交失败',
                                content:pagedata.error||'',
                                showCancel:false
                            });
                        },
                        complete:function(){
                            swan.hideToast();
                        }
                    });
                }
            }
        });



    }
});
