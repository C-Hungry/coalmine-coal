import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import permissions from './permissions'

export default new Vuex.Store({
  modules: {
    permissions: permissions
  }
})