const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const dateFormat = require('../../../../utils/dateformat.js');

Page({
    data: {

    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '结算单详情'
        });
    },
    onLoad: function(options) {
        var _this = this;
        var statement_id = options.statement_id;
        this.setData(options);
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/vshop-statement_detail-'+statement_id+'.html',
                success: function(res) {
                    var pagedata = res.data;
                    _this.setData(pagedata);
                },
                complete:function(){
                    _this.setData({hideLoading:true});
                }
            });
        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'xs');
    }
});
