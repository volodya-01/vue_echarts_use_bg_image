import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import echarts from 'echarts'
import vuescroll from 'vuescroll';

Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.prototype.$echarts = echarts
    // 你可以在这里设置全局配置
Vue.use(vuescroll, {
    ops: {
        vuescroll: {
            mode: "native",
            sizeStrategy: "percent",
            detectResize: true
        },
        scrollPanel: {
            initialScrollY: false,
            initialScrollX: false,
            scrollingX: false,
            scrollingY: true,
            speed: 300,
            easing: undefined,
            verticalNativeBarPos: "right"
        },
        rail: {
            background: "#01a99a",
            opacity: 0,
            size: "6px",
            specifyBorderRadius: false,
            gutterOfEnds: null,
            gutterOfSide: "2px",
            keepShow: false
        },
        bar: {
            showDelay: 500,
            onlyShowBarOnScroll: false,
            keepShow: true,
            background: "#c1c1c1",
            opacity: 1,
            hoverStyle: false,
            specifyBorderRadius: false,
            minSize: false,
            size: "6px",
            disable: false
        }
    }, // 在这里设置全局默认配置
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')