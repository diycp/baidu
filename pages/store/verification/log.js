const config = require('../../../config/config.js');
const timeago = require('../../../utils/timeago.js');
Page({
    onReady: function() {

    },
    onShow: function() {

    },
    onLoad: function(options) {
        var _this = this;
        var timeago_ins = timeago();
        var schedule_id  = options.schedule_id;
        var k = 'experiencestore-verification-log-'+schedule_id;
        swan.getStorage({
            key:k,
            success:function(res){
                for (var i = 0; i < res.data.length; i++) {
                    res.data[i]['timeago'] = timeago_ins.format(parseInt(res.data[i]['vtime']));
                }
                _this.setData({
                    vlog:res.data
                });
                swan.setNavigationBarTitle({
                    title: ('核销记录'+' ( '+res.data.length+' ) ')
                });
            }
        });
    }
});
