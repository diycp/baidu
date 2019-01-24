const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
var WxParse = require('../../../../utils/wxParse/wxParse.js');
var dateFormat = require('../../../../utils/dateformat.js');

Page({
    data: {
    },
    onLoad: function(options) {
        var _this = this;
        var notice_id = options.notice_id;
        this.setData(options);
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/o2ocds-notice-'+notice_id+'.html',
                success: function(res) {
                    var pagedata = res.data;
                    pagedata.notice.pubtime = dateFormat(parseInt(pagedata.notice.pubtime)*1000,'yyyy-mm-dd HH:MM:ss');
                    WxParse.wxParse('notice_content', 'html', pagedata.notice.content, _this, 0);
                    swan.setNavigationBarTitle({
                        title: pagedata.notice.title
                    });
                    if(pagedata.notice.is_integral){
                        swan.showToast({
                            icon:'success',
                            title:'获赠积分:'+pagedata.notice.integral,
                            duration:3000
                        });
                    }
                    _this.setData(pagedata);
                },
                complete:function(){
                    _this.setData({hideLoading:true});
                }
            });
        });
    }
});
