// Page(require('_index.js'));
let visible = require('_index.js');
Page(Object.assign({},visible));
//TODO 存在微店标识,默认进入微店
// var vshop_id = swan.getStorageSync('_vshop_id');
// var show_default_index = swan.getStorageSync('show_default_index');
// if(vshop_id && !show_default_index){
//     //存在微店标识,优先进入微店主首页
//     Page(require('../vshop/home/_index.js'));
// }else{
//     if(show_default_index){
//          swan.removeStorageSync('show_default_index');
//     }
//     Page(require('_index.js'));
// }
