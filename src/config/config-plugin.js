var ConfigPlugin = {};

ConfigPlugin.install = function (Vue) {

  Vue.prototype.$config = new function(){

    var config = {
      //登录
      loginBaseUrl: "http://192.168.3.18:9009",
      //煤矿
      commonBaseUrl: "http://192.168.3.18:9009",
      //图片
      imgBaseUrl:'http://192.168.3.254:7777',
      //密钥
      key: "zkkj",
    };

    if (window.service && window.service.loginBaseUrl) {
      config.loginBaseUrl = window.service.loginBaseUrl;
    }
    if (window.service && window.service.commonBaseUrl) {
      config.commonBaseUrl = window.service.commonBaseUrl;
    }
    if (window.service && window.service.imgBaseUrl) {
      config.imgBaseUrl = window.service.imgBaseUrl;
    }

    this.get = function(key){
      return config[key];
    }

    this.set = function(key,value){
      if(!config.hasOwnProperty(key)){
        console.log("设置ZK-API服务地址[" + key + "]失败！此服务未定义。");
        return false;
      }
      config[key] = value;
      return true;
    };

  }();
  
}

module.exports=ConfigPlugin;