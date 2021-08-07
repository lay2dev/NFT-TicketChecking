import Vue from 'vue'
import Clipboard from 'v-clipboard'
import Back from '~/components/back.vue'
import Imgs from '~/components/imgs.vue'
// directive
// copy
Vue.use(Clipboard)
// components
Vue.component('Back', Back)
Vue.component('Imgs', Imgs)
