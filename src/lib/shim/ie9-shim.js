;
(function(window, undefined) {
    if(window.HTMLElement) {
        if(Object.getOwnPropertyNames(HTMLElement.prototype).indexOf('dataset') === -1) {
            Object.defineProperty(HTMLElement.prototype, 'dataset', {
                get: function() {
                    var attributes = this.attributes;
                    var name = [],
                        value = [];
                    var obj = {};
                    for(var i = 0; i < attributes.length; i++) {
                        if(attributes[i].nodeName.slice(0, 5) == 'data-') {
                            name.push(attributes[i].nodeName.slice(5));
                            value.push(attributes[i].nodeValue);
                        }
                    }
                    for(var j = 0; j < name.length; j++) {
                        obj[name[j]] = value[j];
                    }
                    return obj;
                }
            });
        }
    }
    if(window.performance && !window.performance.now) {
        window.performance.now = function() {
            return((+new Date()) - performance.timing.navigationStart);
        };
    }
    Number.parseInt=Number.parseInt || window.parseInt;
    Number.parseFloat=Number.parseFloat || window.parseFloat;

    (function() {
        let lastTime = 0,
            vendors = ['ms', 'moz', 'webkit', 'o'];
        for(let x = 0, len = vendors.length; !window.requestAnimationFrame && x < len; ++x) {
            window.requestAnimationFrame = window[`${vendors[x]}RequestAnimationFrame`];
            window.cancelAnimationFrame = window[`${vendors[x]}CancelAnimationFrame`] || window[`${vendors[x]}CancelRequestAnimationFrame`];
        }
        if(!window.requestAnimationFrame) {
            window.requestAnimationFrame = (callback, element) => {
                let currTime = new Date().getTime();
                let timeToCall = Math.max(0, 16 - (currTime - lastTime));
                let id = window.setTimeout(() => {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if(!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = id => {
                window.clearTimeout(id);
            };
        }
    })();
}(typeof window !== "undefined" ? window : this));
