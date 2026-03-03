import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.prototype.$axios = axios

// 配置Axios基础路径
axios.defaults.baseURL = '/api'
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

// 路由守卫：未登录拦截
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('ims_token')
    token ? next() : next('/login')
  } else {
    next()
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')