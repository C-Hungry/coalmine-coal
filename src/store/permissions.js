

// initial state
const state = {
  data: []
}

// getters
const getters = {
  permissions(state){
    if(!state.data||state.data.length <= 0){
      var arr = JSON.parse(window.localStorage.getItem("permissions")) || [];
      state.data = arr;
      return arr;
    }
    return state.data;
  }
}

// actions
const actions = {
  loadPermissions({ commit }){
    return this._vm.$commonService.get("/menu/getCurrentMenu").then(res=>{
      res.data.sort(function(a,b){
        return a.sort - b.sort;
      });
      commit("loadPermissions",{
        permissions: res.data
      });
      window.localStorage.setItem("permissions", JSON.stringify(res.data));
    }).catch(err=>{
      console.log(err)
    });
  },
  clearPermissions({ commit }){
    commit("clearPermissions");
    window.localStorage.removeItem("permissions");
  },
}

// mutations
const mutations = {
  loadPermissions(state, payload) {
    state.data = payload.permissions;
  },
  clearPermissions(state){
    state.data = [];
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}