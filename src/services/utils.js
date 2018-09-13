Date.prototype.Format = function(fmt) {
    let o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for(let k in o)
        if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

Array.prototype.remove = function(item) {
    let index = this.indexOf(item);
    if(index > -1) {
        this.splice(index, 1);
    }
    return this;
};

let addEvent = (el, type, fn, capture = false) => {
    if(el.addEventListener) {
        addEvent = (el, type, fn, capture) => {
            el.addEventListener(type, fn, capture);
        };
    }
    else if(el.attachEvent) {
        addEvent = (el, type, fn) => {
            el.attachEvent(`on${type}`, fn);
        };
    }
    else {
        addEvent = (el, type, fn) => {
            el[`on${type}`] = fn;
        };
    }
    addEvent(el, type, fn, capture);
};

let removeEvent = (el, type, fn, capture = false) => {
    if(el.removeEventListener) {
        removeEvent = (el, type, fn, capture) => {
            el.removeEventListener(type, fn, capture);
        };
    }
    else if(el.attachEvent) {
        removeEvent = (el, type, fn) => {
            el.detachEvent(`on${type}`, fn);
        };
    }
    else {
        removeEvent = (el, type) => {
            el[`on${type}`] = null;
        };
    }
    removeEvent(el, type, fn, capture);
}

const serialize = (param, key, encode) => {
    if(!param) return '';
    let paramStr = '';
    let t = typeof(param);
    if(t == 'string' || t == 'number' || t == 'boolean') {
        paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
    }
    else {
        for(let i in param) {
            if(param.hasOwnProperty(i)) {
                let k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
                paramStr += serialize(param[i], k, encode);
            }
        }
    }
    return paramStr;
};

const getURLSearchParam=name=>{
    let searchArr=location.search.slice(1).split('&');
    for(let search of searchArr){
        let kv=search.split('=');
        if(kv[0]===name) return kv[1];
    }
    return '';
};

const deepCopy = source => {
    let sourceCopy;
    if(source instanceof Array) {
        sourceCopy = [];
    }
    else if (source instanceof Function || source instanceof Date){
        return source;
    }
    else if(source instanceof Object) {
        sourceCopy = {};
    }
    else {
        return source;
    }
    for(let i in source) {
        if(source.hasOwnProperty(i)) {
            let value=source[i];
            sourceCopy[i] = value instanceof Object ? deepCopy(value) : value;
        }
    }
    return sourceCopy;
};

const throttle=(fn,delay=200,mustRun=500)=>{
    let timeout=null,start=new Date();
    return function(){
        let now=new Date(),args=arguments,that=this;
        clearTimeout(timeout);
        if(now-start>=mustRun){
            fn.apply(that,args);
            start=now;
        }else{
            timeout=setTimeout(()=>{
                fn.apply(that,args);
            },delay);
        }
    }
};

const setStore = (name, content) => {
    if(!window.localStorage || !name) return;
    if(typeof content !== 'string') {
        content = JSON.stringify(content);
    }
    window.localStorage.setItem(name, content);
};

const getStore = name => {
    if(!window.localStorage || !name) return;
    return window.localStorage.getItem(name);
};

const removeStore = name => {
    return name && window.localStorage && window.localStorage.removeItem(name);
};

export {
    getURLSearchParam,
    throttle,
    serialize,
    deepCopy,
    setStore,
    getStore,
    removeStore,
    addEvent,
    removeEvent
};
