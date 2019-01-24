//快速购买
const config = require('../../config/config.js');
const util = require('../../utils/util.js');

const loadData = () => {

}

Page({
    data: {
        tabIndex:'-1',
        isLoading:false,
        selectData:{},
        showProduct:false,
        showSpec:false,
        product:{},
        chooseSpec:{},
        cart:{},
        product_id:'',
    },
    onShow:function(){
        const _this = this;
        _this.setData({
            isLoading:true,
        })
        util.wxRequest({
            url:config.BASE_URL+'/m/fastbuy.html',
            success:function(res){
                if (res.data.selectData == []) {
                    res.data.selectData = {};
                }
                let {category,rec_goods,setting,goods_info,cat_goods,selectData} = res.data;
                _this.setData({category,rec_goods,setting,goods_info,cat_goods,selectData})
            },
            complete:function(){
                _this.setData({
                    isLoading:false,
                })
            }
        })
        util.wxRequest({
            url:config.BASE_URL+'/m/cart.html',
            success:function(res){
                console.log(res)
                _this.setData({
                    cart:res.data.data,
                })
            },
        })
    },
    onReady: function() {
        var _this = this;
        swan.getSystemInfo({
            success: function(res) {
                _this.setData({
                    WinHeight: res.windowHeight,
                    WinWidth:res.windowWidth
                });
            }
        });
    },
    tabChange:function(e){
        var tabindex = e.currentTarget.dataset.tabindex;
        const _this = this;
        this.setData({tabIndex:tabindex})
    },
    hideProduct:function(e){
        this.setData({
            showProduct:false,
        })
    },
    setProduct:function(idx,goods_id){
        var product = '';
        if (idx == '-1') {
            product = this.data.rec_goods[goods_id];
        }else{
            var _newData = this.data.goods_info[goods_id];
            _newData.image_url = this.data.cat_goods[idx][goods_id].image_url;
            product = _newData;
        }
        product.tabindex = idx;
        return product;
    },
    showProduct:function(e){
        var idx = e.currentTarget.dataset.tabindex;
        var goods_id = e.currentTarget.dataset.goods_id;
        
        this.setData({
            showProduct:true,
            product:this.setProduct(idx,goods_id)
        })
    },
    hideSpec:function(){
        this.setData({
            showSpec:false,
        })
    },
    showSpec:function(){
        this.setData({
            showSpec:true,
        })
    },
    addGoods:function(e){
        var idx = e.currentTarget.dataset.idx;
        var goods_id = e.currentTarget.dataset.goods_id;
        var product_id = e.currentTarget.dataset.product_id;
        var bn = e.currentTarget.dataset.bn;
        const _this = this;
        swan.showToast({
            title: '正在加入..',
            icon: 'loading',
            duration: 500
        });
        new Promise((resolve,reject) => {
            util.wxRequest({
                url:config.BASE_URL+'/openapi/stock/confirm',
                data:{
                    sku:bn
                },
                success:function(res){
                    if (res.data.result == 'success' && Number(res.data.data[bn].num) > 0 && ((_this.data.selectData[idx] && _this.data.selectData[idx][goods_id])?_this.data.selectData[idx][goods_id]:0) < Number(res.data.data[bn].num)) {
                        //有库存
                        return resolve(true);
                    }else{
                        return resolve(false);
                    }
                }
            })
        }).then(r=>{
            if(r){
                util.wxRequest({
                    url:config.BASE_URL+'/m/cart-add-' + product_id + '-1.html',
                    success:function(res){
                        console.log(res.data.data.objects.goods[product_id])
                        var obj = _this.data.selectData;
                        obj[idx] = Object.assign({},obj[idx],{
                            count:(_this.data.selectData[idx]?_this.data.selectData[idx].count:0)+1,
                            [goods_id]:((_this.data.selectData[idx] && _this.data.selectData[idx][goods_id])?_this.data.selectData[idx][goods_id]:0)+1
                        })
                        _this.setData({
                            selectData:obj,
                            cart:res.data.data,
                        })
                    },
                    complete:function(){
                        _this.hideSpec();
                    }
                })
            }else{
                swan.showModal({
                    title:'添加失败',
                    content:'库存不足',
                    showCancel:false
                })
            }
        }).catch(error=>{
            console.log(error);
        })
    },
    //数量减
    tappqminus:function(e){
        var idx = e.currentTarget.dataset.idx;
        var goods_id = e.currentTarget.dataset.goods_id;
        var obj = this.data.selectData;
        var allCount = (this.data.selectData[idx]?this.data.selectData[idx].count:0)-1;
        var goodsCount = ((this.data.selectData[idx] && this.data.selectData[idx][goods_id])?this.data.selectData[idx][goods_id]:0)-1;
        var product_id = e.currentTarget.dataset.product_id;
        var hasSpec = false;
        const _this = this;
        if (idx == '-1') {
            //精品推荐
            var spec = this.data.rec_goods[goods_id].spec_desc; 
            if (spec) {
                //多规格
                hasSpec = true;
            }
        }else{
            //分类商品
            var spec = this.data.goods_info[goods_id].spec_desc;
            if (spec) {
                //多规格
                hasSpec = true;
            }
        }
        if (hasSpec) {
            //弹出警告,多规格只能在购物车中删除
            swan.showModal({
                title:'删除失败',
                content:'多规格商品只能在购物车删除',
                showCancel:false
            })
            return;
        }
        swan.showToast({
            title: '正在删除..',
            icon: 'loading',
            duration: 500
        });
        var url,_DATA;
        if (goodsCount < 1) {
            url = config.BASE_URL+'/m/fastbuy-cart-remove.html';
            _DATA = {
                product_id :product_id,
            }
        }else{
            url = config.BASE_URL+'/m/fastbuy-cart-update.html';
            _DATA = {
                product_id :product_id,
                num:goodsCount
            }
        }
        util.wxRequest({
            url:url,
            method:'POST',
            data:_DATA,
            success:function(res){},
        })
        if(allCount<0 || goodsCount <0) return;
        obj[idx] = Object.assign({},obj[idx],{
            count:allCount>=0?allCount:0,
            [goods_id]:goodsCount>=0?goodsCount:0
        })
        this.setData({
            selectData:obj
        })
    },
    //数量加
    tapp_plus:function(e){
        //判断是否多规格,如果是多规格,这弹出规格选择并返回
        var idx = e.currentTarget.dataset.idx;
        var goods_id = e.currentTarget.dataset.goods_id;
        var product_id = e.currentTarget.dataset.product_id;
        var bn = e.currentTarget.dataset.bn;
        var hasSpec = false;
        const _this = this;
        if (idx == '-1') {
            //精品推荐
            var spec = this.data.rec_goods[goods_id].spec_desc; 
            if (spec) {
                //多规格
                hasSpec = true;
            }
        }else{
            //分类商品
            var spec = this.data.goods_info[goods_id].spec_desc;
            if (spec) {
                //多规格
                hasSpec = true;
            }
        }
        if (hasSpec) {
            this.setData({
                product:this.setProduct(idx,goods_id)
            })
            this.hideProduct();
            this.showSpec();
            this.setData({
                chooseSpec:{
                    spec,
                }
            })
            return;
        }
        swan.showToast({
            title: '正在加入..',
            icon: 'loading',
            duration: 500
        });
        new Promise((resolve,reject) => {
            util.wxRequest({
                url:config.BASE_URL+'/openapi/stock/confirm',
                data:{
                    sku:bn
                },
                success:function(res){
                    if (res.data.result == 'success' && Number(res.data.data[bn].num) > 0 && ((_this.data.selectData[idx] && _this.data.selectData[idx][goods_id])?_this.data.selectData[idx][goods_id]:0) < Number(res.data.data[bn].num)) {
                        //有库存
                        return resolve(true);
                    }else{
                        return resolve(false);
                    }
                }
            })
        }).then(r=>{
            if(r){
                util.wxRequest({
                    url:config.BASE_URL+'/m/cart-add-' + product_id + '-1.html',
                    success:function(res){
                        var obj = _this.data.selectData;
                        obj[idx] = Object.assign({},obj[idx],{
                            count:(_this.data.selectData[idx]?_this.data.selectData[idx].count:0)+1,
                            [goods_id]:((_this.data.selectData[idx] && _this.data.selectData[idx][goods_id])?_this.data.selectData[idx][goods_id]:0)+1
                        })
                        _this.setData({
                            selectData:obj,
                            cart:res.data.data,
                        })
                    },
                })
            }else{
                swan.showModal({
                    title:'添加失败',
                    content:'库存不足',
                    showCancel:false
                })
            }
        }).catch(error=>{
            console.log(error);
        })

    },
    //切换规格
    tapspecitem:function(e){
        var product_id = e.currentTarget.dataset.productid;
        var tabindex = e.currentTarget.dataset.idx;
        const _this = this;
        if (product_id && (this.data.product_id != product_id)) {
            util.wxRequest({
                url:config.BASE_URL + '/m/item-' + product_id + '.html',
                success:function(res){
                    var {product,spec_desc,name,goods_id} = res.data.data_detail;
                    _this.setData({product:{product,spec_desc,name,goods_id,tabindex},product_id})
                }
            })
        }
    },
    onLoad: function(options) {
        
    },
    evt_checkout: function() {
        if (JSON.stringify(this.data.selectData) == '{}') {
            console.log('111111')
            swan.showModal({
                title:'购买失败',
                content:'购物车中无商品',
                showCancel:false
            })
            return;
        }else{
            console.log('22222222')
          swan.navigateTo({
              url:'/pages/checkout/checkout'
          })  
        }
    },
    load_image_m: function(e) {
        // var image_id = e.currentTarget.dataset.ident;
        // util.loadImage(this,image_id,'m');
    }
});
