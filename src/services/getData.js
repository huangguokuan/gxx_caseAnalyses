import {
    serialize,
    getURLSearchParam
}
from './utils';
import axios from 'axios';
axios.defaults.baseURL = '/api';
axios.defaults.timeout = 100000;
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest';

axios.interceptors.request.use(config => {
    /* config.params = config.params || {};
    let token = getURLSearchParam('token');
    if (token && config.url.indexOf('exportWordData') < 0) {
        config.params.token = token;
        config.params.fv = getURLSearchParam('fv');
    } */
    return config;
}, err => Promise.reject(err));

axios.interceptors.response.use(response => {
    /* const res=response.data;
    if(res){
        const {code,ret,redirectURL}=res;
        if((code==11111 || ret==10002) && redirectURL){
            location.replace(redirectURL);
        }
    } */
    return response;
}, err => Promise.reject(err));


const $http = promise => promise.then(res => res.data).catch(err => console.error(err));



export {


};
