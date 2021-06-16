// vuex 状态管理
const sotre = {
  // 数据
  state() {
    return {
      token: null,
    }
  },
  // 获取
  getters: {
    getToken(state) {
      return state.token
    },
  },
  // 同步更新
  mutations: {
    setToken(state, token) {
      state.token = token
    },
  },
  // 异步更新
  actions: {
    setTokenAsync({ commit, state }, token) {
      commit('setToken', token)
      state.token = token
    },
  },
  // 模块
  modules: {},
}
export default sotre

// 获取
// this.$store.state.toekn
// this.$store.getters.getToken
// 同步更新
// this.$store.state.toekn = 'dudu'
// this.$store.commit('setToken', 'dudu')
// 异步更新
// await this.$store.dispatch('setTokenAsync', 'dudu')
