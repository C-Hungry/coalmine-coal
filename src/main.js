import Vue from 'vue';
import VueRouter from 'vue-router';
import Routers from './router/router';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import ZkTableTree from 'vue-table-with-tree-grid';
import ConfigPlugin from './config/config-plugin';
import ServicePlugin from './libs/service.plugin';
import StoragePlugin from './libs/storage.plugin';
import UtilsPlugin from './libs/utils.plugin';
import store from "./store/index";
import "./directive/index.js";
import App from './app.vue';
// import "./mock/index.js";

Vue.use(ConfigPlugin);
Vue.use(ServicePlugin);
Vue.use(StoragePlugin);
Vue.use(UtilsPlugin);
Vue.use(VueRouter);
Vue.use(iView);
Vue.use(ZkTableTree); // 表格树组建

// 路由配置
const RouterConfig = {
    mode: 'hash',
    routes: Routers
};
const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    next();
});

router.afterEach((to, from, next) => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

window.VueRootInstance = new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});
