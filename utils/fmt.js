export default {
    region: function(region_str) {
        if(!region_str)return region_str;
        var region_arr = region_str.split(':');
        if (!region_arr.length || !region_arr[1]) return region_str;
        return region_arr[1].split('/').join('-');
    },
    price: function(price) {
        var _price = parseFloat(price);
        if (isNaN(_price)) return price;
        if (_price === 0) return '0.00';
        _price = Math.round(_price * 100) / 100;
        var _price_str = _price.toString();
        var rs = _price_str.indexOf('.');
        if (rs < 0) {
            rs = _price_str.length;
            _price_str += '.';
        }
        while (_price_str.length <= rs + 2) {
            _price_str += '0';
        }
        return _price_str;
    },
    split:function(str,spliter){
        if(!str)return '';
        if(!spliter)return str;
        return str.split(spliter);
    },
    slice:function(str,s1,s2){
        if(!str)return '';
        str = str.toString();
        if(s1 == 'undefined')return str;
        if(s2 == 'undefined')return str.slice(s1);
        return str.slice(s1,s2);
    },
    fiximageurl:function(url_str){
        if (url_str && url_str.slice(0,4) == 'http') {
            return url_str;
        }
        console.log(111111111);
        return 'https:' + url_str;
    },
    pass:function(str){
      var temp = "";
      if (str.length > 2) {
        for (var i = 0; i < str.length; i++) {
          if (i == 0 || i == str.length - 1) {
            temp = temp + str.substring(i, i + 1);
          }
          else {
            temp = temp + "*";
          }
        }
        
      } else if (str.length == 2){
        temp = str.substring(0, 1) + "*";
      }else{
        temp = str;
      }
      return temp;
    }
};
