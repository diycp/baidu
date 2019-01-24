//cart.js
//购物车
const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const strip_tags = require('../../utils/striptags.js');
const app = getApp();

const form_cart_data = function(data) {
    let _return = data;
  if (_return.is_merchant && _return.objects){
    for (var i = 0; i < _return.objects.length;i++){
      if (_return.objects[i].promotions) {
            //格式化促销规则展示
        if (_return.objects[i].promotions.goods) {
          for (var obj_ident in _return.objects[i].promotions.goods) {
            for (var j = 0; j < _return.objects[i].promotions.goods[obj_ident].length; j++) {
              if (_return.objects[i].promotions.goods[obj_ident][j].tag == '送赠品') {
                _return.objects[i].promotions.goods[obj_ident][j].solution = strip_tags(_return.objects[i].promotions.goods[obj_ident][j].solution).replace(/[\n|\s]/ig, '').split("【赠品】");
                  }
                }
              }
            }
        if (_return.objects[i].promotions.order) {
          for (var j = 0; j < _return.objects[i].promotions.order.length; j++) {
            if (_return.objects[i].promotions.order[j].tag == '送赠品') {
              _return.objects[i].promotions.order[j].solution = strip_tags(_return.objects[i].promotions.order[j].solution).replace(/[\n|\s]/ig, '').split("【赠品】");
                }
              }
            }
          }
        }
    }else{
      if (_return.promotions) {
        //格式化促销规则展示
        if (_return.promotions.goods) {
          for (var obj_ident in _return.promotions.goods) {
            for (var i = 0; i < _return.promotions.goods[obj_ident].length; i++) {
              if (_return.promotions.goods[obj_ident][i].tag == '送赠品') {
                _return.promotions.goods[obj_ident][i].solution = strip_tags(_return.promotions.goods[obj_ident][i].solution).replace(/[\n|\s]/ig, '').split("【赠品】");
              }
            }
          }
        }
        if (_return.promotions.order) {
          for (var i = 0; i < _return.promotions.order.length; i++) {
            if (_return.promotions.order[i].tag == '送赠品') {
              _return.promotions.order[i].solution = strip_tags(_return.promotions.order[i].solution).replace(/[\n|\s]/ig, '').split("【赠品】");
            }
          }
        }
      }
    }
    
    return _return;
}

const update_cart = function(page_ins,action,method = 'GET',data = false) {
    //page_ins.data.hideLoading && swan.showNavigationBarLoading();
    let options = {
        url: action,
        method: method,
        success: function(res) {
            if (res.data.success) {
                page_ins.setData(form_cart_data(res.data.data));
                page_ins.setData({
                    cart_empty: 'false'
                });
            }
            if (res.data.redirect.match(/blank/)) {
                page_ins.setData({
                    cart_empty: 'true'
                });
            }
          if (page_ins.data.is_merchant){
            if (!page_ins.data.objects){
              page_ins.setData({
                cart_empty: 'true'
              });
            }
          }
        },complete:function(){
            swan.stopPullDownRefresh();
            //swan.hideNavigationBarLoading();
            page_ins.setData({
                hideLoading: true
            });
        }
    };
    if(data){
        options['data'] = data;
    }
    util.wxRequest(options);
}

const pageOptions = {
    data: {
        inputVal: '',
        cart_empty: 'false',
        coitem_transform_dis:{},
        img_url: config.BASE_HOST
    },
    onPullDownRefresh: function() {
        this.onShow();
    },
    onReachBottom: function() {
        // current_page+=1;
        // load_list(this,current_page);
    },
    onLoad: function() {
        this.setData({
          themecolor:app.globalData.themecolor
        })
    },
    onReady: function() {
        swan.setNavigationBarTitle({
            title: '购物车'
        });
    },
    onShow: function() {
        var _this = this;
        util.checkMember.call(this, function() {
            let action = config.BASE_URL + '/m/cart.html';
            update_cart(_this,action);
        });
        this.setData({
            coitem_transform_dis:{},
            win_width: swan.getSystemInfoSync().windowWidth
        });
    },
    load_image: function(e) {
        util.loadImage(this, e.currentTarget.dataset.ident, 'xs');
    },
    /*events*/
    evt_cocheck: function(e) {
        var dataset = e.currentTarget.dataset;
        var ident = dataset.ident;
        var nextstatus = dataset.nextstatus;
        var _this = this;
        if (!ident) {
            return;
        }
        let action = config.BASE_URL + '/m/cart-' + nextstatus + '-' + ident + '.html';
        update_cart(this,action);
    },
    tapquantity: function(e) {
        var _this = this;
        var dataset = e.currentTarget.dataset,
            ident = dataset.ident,
            cogindex = dataset.cogindex,
            quantity = parseInt(dataset.quantity),
            //update_quantity = (parseInt(_this.data.objects.goods[cogindex].quantity) + quantity);
            update_quantity = (parseInt(dataset.num) + quantity);
        if (isNaN(quantity) || update_quantity < 1 || !ident) {
            return;
        }
        let action = config.BASE_URL + '/m/cart-update-' + ident + '-' + update_quantity + '.html';
        update_cart(this,action);
    },
    event_co_trash: function(e) {
        var dataset = e.currentTarget.dataset,
            ident = dataset.ident,
            cogindex = dataset.cogindex;
        if (!ident) {
            return;
        }
        var _this = this;
        swan.showModal({
            title: '删除购物车项',
            content: '确认删除？',
            success: function(res) {
                if (res.confirm) {
                    let action = config.BASE_URL + '/m/cart-remove-' + ident + '.html';
                    update_cart(_this,action);
                }
            }
        });
    },
    event_quantity_blur: function(e) {
        var quantity = parseInt(e.detail.value),
            cur = parseInt(e.currentTarget.dataset.cur);
        if (isNaN(quantity) || quantity < 1 || quantity == cur) {
            return;
        }
        var _this = this;
        let action = config.BASE_URL + '/m/cart-update-' + e.currentTarget.dataset.ident + '-' + quantity + '.html';
        update_cart(this,action);
    },
    evt_tcoitem_start: function(e) {
        if(!e.touches.length)return;
        let clientX = e.touches[0].clientX;
        this.evt_tcoitem_start_clientx = clientX;
        let disX = 0;
        let _set = {};
        _set['coitem_transform_dis.' + e.currentTarget.dataset.ident] = disX;
        this.setData(_set);
    },
    evt_tcoitem_move: function(e) {
        if(!e.touches.length)return;
        let clientX = e.touches[0].clientX;
        let disX = this.evt_tcoitem_start_clientx - clientX;
        let trash_btn_width = 75;
        (disX < 0) && (disX = 0);
        (disX >= trash_btn_width) && (disX = trash_btn_width);
        let _set = {};
        _set[e.currentTarget.dataset.ident] = disX;
        Object.assign(this.data.coitem_transform_dis,_set);
        console.info(this.data);
        //this.setData(_set);
    },
    evt_tcoitem_end: function(e) {
        let trash_btn_width = 75;
        let disX = this.data.coitem_transform_dis[e.currentTarget.dataset.ident]||0;
        (disX >= trash_btn_width / 2) ? (disX = trash_btn_width) : (disX = 0);
        let _set = {};
        _set['coitem_transform_dis.' + e.currentTarget.dataset.ident] = disX;
        this.setData(_set);
    },
    go_index: function(e) {
        swan.switchTab({
            url: "/pages/index/index"
        });
    },
    check_all: function (e) {
      var str = e.currentTarget.dataset.status;
      var index  = e.currentTarget.dataset.index;
      var _this = this;
      var checkAllIdent = [];
      for (var k=0;k<this.data.objects[index].objects.goods.length;k++) {
        var item = this.data.objects[index].objects.goods[k];
        checkAllIdent.push('ident[]='+item.obj_ident);
      }
      let action;
      if (!checkAllIdent) {
        return;
      }
      console.log(checkAllIdent);
      action = config.BASE_URL + '/m/cart-' + str + '.html?'+ checkAllIdent.join('&');
      update_cart(_this, action);
    }
};


Page(pageOptions);

module.exports = pageOptions;
