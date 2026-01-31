import { createApp } from 'vue'
import './styles/main.css'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/controls/dist/style.css'
import App from './App.vue'
import router from './router'

createApp(App)
    .use(router)
    .mount('#app')
