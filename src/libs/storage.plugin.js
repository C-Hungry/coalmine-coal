var StoragePlugin = {};

StoragePlugin.install = function (Vue) {

  Vue.prototype.$storage = new function() {

    /**
     * 存储用户信息
     */
    this.saveUserInfo = function(content) {
      if (typeof content !== 'string') {
        content = JSON.stringify(content);
      }
      window.localStorage.setItem("userInfo", content);
    }

    /**
     * 获取用户信息
     */
    this.getUserInfo = function() {
      return JSON.parse(window.localStorage.getItem("userInfo"));
    }

    /**
     * 删除用户信息
     */
    this.removeUserInfo = function() {
      window.localStorage.removeItem("userInfo");
    }

    /**
     * 保存TOKEN
     */
    this.saveToken = function(str) {
      window.localStorage.setItem("token", str);
    }

    /**
     * 删除TOKEN
     */
    this.removeToken = function() {
      window.localStorage.removeItem("token");
    }

    /**
     * 获取TOKEN
     */
    this.getToken = function() {
      return window.localStorage.getItem("token");
    }

  }();
}

module.exports=StoragePlugin;