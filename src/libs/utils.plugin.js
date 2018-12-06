var CryptoJS = require("crypto-js");
var UtilsPlugin = {};

UtilsPlugin.install = function (Vue) {

  Vue.prototype.$utils = new function() {

    this.encrypt = function(str) {
      return CryptoJS.AES.encrypt(str, config.key).toString();
    };

    this.decrypt = function(str) {
      return CryptoJS.AES.decrypt(str.replace(/ /g, '+'), config.key).toString(CryptoJS.enc.Utf8);
    };

    this.formateDate = function (datetime, formate) {

      if(!formate) formate = "yyyy-MM-dd HH:mm:ss"
      if (!datetime) return "";

      datetime = new Date(datetime);

      var str = formate;
      var Week = ['日', '一', '二', '三', '四', '五', '六'];

      str = str.replace(/yyyy|YYYY/, datetime.getFullYear());
      str = str.replace(/yy|YY/, (datetime.getYear() % 100) > 9 ? (datetime.getYear() % 100).toString() : '0' + (datetime.getYear() % 100));

      str = str.replace(/MM/, (datetime.getMonth()+1) > 9 ? (datetime.getMonth()+1).toString() : '0' + (datetime.getMonth()+1));
      str = str.replace(/M/g, (datetime.getMonth()+1));

      str = str.replace(/w|W/g, Week[datetime.getDay()]);

      str = str.replace(/dd|DD/, datetime.getDate() > 9 ? datetime.getDate().toString() : '0' + datetime.getDate());
      str = str.replace(/d|D/g, datetime.getDate());

      str = str.replace(/hh|HH/, datetime.getHours() > 9 ? datetime.getHours().toString() : '0' + datetime.getHours());
      str = str.replace(/h|H/g, datetime.getHours());
      str = str.replace(/mm/, datetime.getMinutes() > 9 ? datetime.getMinutes().toString() : '0' + datetime.getMinutes());
      str = str.replace(/m/g, datetime.getMinutes());

      str = str.replace(/ss|SS/, datetime.getSeconds() > 9 ? datetime.getSeconds().toString() : '0' + datetime.getSeconds());
      str = str.replace(/s|S/g, datetime.getSeconds());

      return str;
    }

    this.unique = function(){
      return 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
    }

    this.formatNum = function(num, digit) {
      num = parseFloat(num);
      digit = digit || 2; 
      if (isNaN(num)) {
        return;
      } else {
        return num.toFixed(digit);
      }
    }
    
  }();
}

module.exports=UtilsPlugin;