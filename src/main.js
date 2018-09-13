import './style/variables.less';

import 'babel-polyfill';
import promise from 'es6-promise';
promise.polyfill();

import './lib/shim/ie9-shim';
// import './lib/shim/html5';
// import './lib/shim/es5-shim.js';

import Vue from 'vue';
Vue.config.productionTip = false;
Vue.config.devtools = true;

// import './services/registerComponent';

import { Button, Table, Input, Menu, MenuItem, Checkbox, CheckboxGroup, Icon, AutoComplete, DatePicker, Tree, Card, Modal, Collapse, Page, Spin, Panel, Message,Select,Option } from 'iview';
Vue.component('Button', Button);
Vue.component('Table', Table);
Vue.component('i-input', Input);
Vue.component('Menu', Menu);
Vue.component('MenuItem', MenuItem);
Vue.component('Checkbox', Checkbox);
Vue.component('CheckboxGroup', CheckboxGroup);
Vue.component('Icon', Icon);
Vue.component('AutoComplete', AutoComplete);
Vue.component('DatePicker', DatePicker);
Vue.component('Tree', Tree);
Vue.component('Card', Card);
Vue.component('Modal', Modal);
Vue.component('Collapse', Collapse);
Vue.component('Page', Page);
Vue.component('Spin', Spin);
Vue.component('Panel', Panel);
Vue.component('Select', Select);
Vue.component('Option', Option);
Vue.prototype.$Message = Message;

/* import eCharts from 'echarts/lib/echarts';
import "echarts/lib/chart/graph";
import "echarts/lib/chart/line";
import "echarts/lib/chart/bar";
import "echarts/lib/chart/pie";
import "echarts/lib/chart/map";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/visualMap";
import "echarts/lib/component/legendScroll";
Vue.prototype.$eCharts = eCharts; */

// import './services/mock';

import './services/transferDom';

import App from './App';
import router from './router';
// import store from './store';
//

new Vue({
  el: '#app',
  router,
  render: h => h('App'),
  // store,
  components: {
    App
  }
});

