// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import { sync } from 'vuex-router-sync'
import router from './router/index'
import store from './store'
import * as filters from './filters'
import mixins from './mixins'
import iView from 'iview'
import utils from './utils/index'
// import codemirror from 'codemirror/lib/codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/fold/foldgutter.css'
import './assets/css/codemirror/themes/zenburn.css'
import './assets/css/codemirror/themes/dracula.css'
import 'iview/dist/styles/iview.css'
import './assets/css/animate.css/animate.min.css'

sync(store, router)

Vue.config.productionTip = false

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// register global mixins.
Vue.mixin(mixins)

Vue.use(iView)

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  const _state = router.app.$options.store.state
  let _localUserInfo = utils.storage.getItem(_state.localStorageKeys.userInfo)
  console.log('...', to, _localUserInfo, (String(to.meta.role) !== String(_localUserInfo.role)))

  if (to.meta && to.meta.title) {
    utils.kit.title(to.meta.title)
  }

  if (to.meta && to.meta.role && String(to.meta.role) !== String(_localUserInfo.role)) {
    next({
      replace: true,
      name: 'NotFound'
    })
  } else {
    if (utils.isEmptyObj(_localUserInfo)) {
      if (_state.needlessLogin.indexOf(to.name) === -1) {
        next({
          replace: true,
          name: 'Login'
        })
      }
    } else {
      if ((new Date()).getTime() - _localUserInfo.loginDate > _state.loginInfo.expireTime) {
        // 登录信息已经过期，需要重新登录
        if (_state.needlessLogin.indexOf(to.name) === -1) {
          router.app.$Message.info('登录信息已经过期，请重新登录')
          router.replace('/Login')
        }
      } else {
        if (_state.needlessLogin.indexOf(to.name) > -1) {
          router.replace('/')
        }
      }
    }
    next()
  }
})

router.afterEach(to => {
  iView.LoadingBar.finish()
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
  // template: '<App/>',
  // components: { App }
})
