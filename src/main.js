import { createApp } from 'vue'
import App from './App.vue'

import PrimeVue from 'primevue/config'

import 'primevue/resources/themes/md-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'; 
import TabView from 'primevue/tabview'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'

let app = createApp(App)
app.config.lang = 'da';
app.use(PrimeVue)
app.component('TabView', TabView);
app.component('InputText',InputText);
app.component('v-dropdown', Dropdown);
app.component('v-button',Button)
app.mount('#app')
