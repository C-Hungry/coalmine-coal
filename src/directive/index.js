import Vue from 'vue';

// 注册一个全局自定义指令
Vue.directive('auth', {
  inserted: (el,binding,vnode)=>{
    try {
      if(vnode.context.$store.getters.permissions.some(item => item.permission == binding.value)) el.style.display = "";
      else el.style.display = "none";
    } catch (error) {
      
    }
  }
});