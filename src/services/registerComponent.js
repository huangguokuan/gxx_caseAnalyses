import Vue from 'vue';

const requireComponent = require.context('../components', true, /\.vue$/);
requireComponent.keys().forEach(fileName => {
    const componentConfig = requireComponent(fileName);
    const componentName = fileName.slice(fileName.lastIndexOf('/') + 1, fileName.lastIndexOf('.vue'));
    componentConfig && Vue.component(componentName, componentConfig.default || componentConfig);
});
