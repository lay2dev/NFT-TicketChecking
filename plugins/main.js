import Vue from 'vue'
import Clipboard from 'v-clipboard'
import Back from '~/components/back.vue'
// directive
// copy
Vue.use(Clipboard)
// components
Vue.component('Back', Back)
