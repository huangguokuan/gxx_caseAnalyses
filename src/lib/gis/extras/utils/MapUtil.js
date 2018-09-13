/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a MapUtil.
 * @module extras/utils/MapUtil
 *
 * @requires dojo._base.declare
 */
define([
        "dojo/_base/declare",
        "esri/geometry/Circle",
        "esri/geometry/Point",
        "esri/geometry/Extent",
        "esri/geometry/Polyline",
        "esri/geometry/Polygon",
        "esri/SpatialReference"
    ],
    function(
        declare,
        Circle,
        Point,
        Extent,
        Polyline,
        Polygon,
        SpatialReference
    ) {
        return declare(null, /**  @lends module:extras/utils/MapUtil */ {

            /**
             * @constructs
             *
             */
            constructor: function() {

            },
            getProjectName: function() {
                return location.pathname.split('/')[1];
            },
            getRootPath: function() {
                return [location.protocol, '//', location.host, '/', this.getProjectName()].join('');
            },
            /**
             * @description 获取路径
             * @method
             * @memberOf module:extras/utils/MapUtil#
             * @param basicPath
             * @returns {string}
             */
            getBasicPath: function(basicPath) {
                if(!basicPath) {
                    this.logger(basicPath, ' is not defined');
                    return;
                }
                return !this.hasLastSlash(basicPath) ? basicPath + '/' : basicPath;
            },
            /**
             * @private
             * @params {array} arguments
             * @returns {string}
             */
            getBasicAbsPath: function() {
                var path = '';
                for(var i = 1; i < arguments.length; i++) {
                    path += '/' + arguments[i];
                }
                return this.getBasicPath(arguments[0]) + path.slice(1);
            },
            /**
             * @description 路径最后是否包含斜杠'/',绝对路径也返回true
             * @method
             * @memberOf module:extras/utils/MapUtil#
             * @param {string} path
             * @returns {boolean}
             */
            hasLastSlash: function(path) {
                var lastSeparator = path.split('/')[path.length - 1];
                // an absolute path acts as a path with last slash
                return !!lastSeparator || (lastSeparator && lastSeparator.indexOf('.') != -1);
            },
            getImageBasicPath: function() {
                return this.getBasicPath(gisConfig.mapImagesUrl);
            },
            getImageAbsPath: function() {
                [].unshift.call(arguments, gisConfig.mapImagesUrl);
                return this.getBasicAbsPath.apply(this, arguments);
            },
            getResourceBasicPath: function() {
                return this.getBasicPath(gisConfig.mapResourcesUrl);
            },
            getResourceAbsPath: function() {
                [].unshift.call(arguments, gisConfig.mapResourcesUrl);
                return this.getBasicAbsPath.apply(this, arguments);
            },
            logger: function() {
                // window.console && window.console.log("Info: \n\t" + arguments[0], [].slice.call(arguments, 1).join('\n\t'));
            },

            /**
             * @description getMouseEvent
             * @method
             * @memberOf module:extras/utils/MapUtil#
             * @param {string} e
             * @param {string} d
             * @param {string} c
             * @param {string} a
             *
             * @example
             * <caption>Usage of getMouseEvent</caption>
             * require(['extras/utils/MapUtil'],function(MapUtil){
             *   var instance = new MapUtil();
             *   instance.getMouseEvent(e,d,c,a);
             * })
             */
            getMouseEvent: function(e, d, c, a) {
                if(dojo.isIE) {
                    e.onmouseenter = function() {
                        if(c) {
                            c();
                        }
                    };
                    e.onmouseleave = function() {
                        if(a) {
                            a();
                        }
                    };
                }
                else {
                    var b = false;
                    e.onmouseover = function() {
                        if(!b) {
                            b = true;
                            if(c) {
                                c();
                            }
                        }
                    };
                    e.onmouseout = function() {
                        var i = dojo.coords(e);
                        var h = this,
                            k = window.event || k,
                            f = document.body.scrollLeft + k.clientX,
                            l = document.body.scrollTop + k.clientY;
                        var g = $y = 0;
                        do {
                            g += h.offsetLeft;
                            $y += h.offsetTop;
                        } while ((h = h.offsetParent) && h.tagName != "BODY");
                        var j = {
                            x: g,
                            y: $y
                        };
                        if(f <= j.x || f >= (j.x + i.w) || l <= j.y || l >= (j.y + i.h)) {
                            b = false;
                            if(a) {
                                a();
                            }
                        }
                    };
                }
            },

            /**
             * @description getMouseEvents
             * @method
             * @memberOf module:extras/utils/MapUtil#
             * @param {string} d
             * @param {string} c
             * @param {string} a
             *
             * @example
             * <caption>Usage of getMouseEvents</caption>
             * require(['extras/utils/MapUtil'],function(MapUtil){
             *   var instance = new MapUtil();
             *   instance.getMouseEvents(d,c,a);
             * })
             *
             *
             *
             */
            getMouseEvents: function(d, c, a) {
                if(dojo.isIE) {
                    d.onmouseenter = function() {
                        if(c) {
                            c()
                        }
                    };
                    d.onmouseleave = function() {
                        if(a) {
                            a()
                        }
                    }
                }
                else {
                    var b = false;
                    d.onmouseover = function() {
                        if(!b) {
                            b = true;
                            if(c) {
                                c()
                            }
                        }
                    };
                    d.onmouseout = function() {
                        var i = dojo.coords(d);
                        var h = this,
                            k = window.event || k,
                            f = document.body.scrollLeft + k.clientX,
                            l = document.body.scrollTop + k.clientY;
                        var g = $y = 0;
                        do {
                            g += h.offsetLeft;
                            $y += h.offsetTop
                        } while ((h = h.offsetParent) && h.tagName != "BODY");
                        var j = {
                            x: g,
                            y: $y
                        };
                        if(f <= j.x || f >= (j.x + i.w) || l <= j.y || l >= (j.y + i.h)) {
                            b = false;
                            if(a) {
                                a()
                            }
                        }
                    }
                }
            },

            /**
             * @description scrollObjectUp
             * @method
             * @memberOf module:extras/utils/MapUtil#
             * @param {string} c
             * @param {string} a
             *
             * @example
             * <caption>Usage of scrollObjectUp</caption>
             * require(['extras/utils/MapUtil'],function(MapUtil){
             *   var instance = new MapUtil();
             *   instance.scrollObjectUp(c,a);
             * })
             *
             *
             * @returns string
             */
            scrollObjectUp: function(c, a) {
                if(!c) {
                    return
                }
                var b = this.clearScrollInterval(c);
                this.scrollUp = window.setInterval(dojo.hitch(this,
                    function() {
                        if(this.scrollStep > 0) {
                            c.scrollTop = this.scrollStep - 1;
                            this.scrollStep = this.scrollStep - 1
                        }
                        else {
                            this.clearScrollInterval();
                            this.scrollStep = c.scrollTop
                        }
                    }), a == null ? 10 : parseInt(a))
            },

            /**
             * @description scrollObjectNextUp
             * @method
             * @memberOf module:extras/utils/MapUtil#
             * @param {string} c
             *
             * @example
             * <caption>Usage of scrollObjectNextUp</caption>
             * require(['extras/utils/MapUtil'],function(MapUtil){
             *   var instance = new MapUtil();
             *   instance.scrollObjectNextUp(c);
             * })
             *
             *
             * @returns string
             */
            scrollObjectNextUp: function(c) {
                if(!c) {
                    return
                }
                var b = this.clearScrollInterval(c);
                var a = c.scrollTop - b;
                this.scrollStep = c.scrollTop = a > 0 ? a : 0
            },

            /**
             * @description scrollObjectDown
             * @method
             * @memberOf module:extras/utils/MapUtil#
             * @param {string} c
             * @param {string} a
             *
             * @example
             * <caption>Usage of scrollObjectDown</caption>
             * require(['extras/utils/MapUtil'],function(MapUtil){
             *   var instance = new MapUtil();
             *   instance.scrollObjectDown(c,a);
             * })
             *
             *
             * @returns string
             */
            scrollObjectDown: function(c, a) {
                if(!c) {
                    return
                }
                var b = this.clearScrollInterval(c);
                this.scrollDown = window.setInterval(dojo.hitch(this,
                    function() {
                        if(this.scrollStep < b) {
                            c.scrollTop = this.scrollStep + 1;
                            this.scrollStep = this.scrollStep + 1
                        }
                        else {
                            this.scrollStep = c.scrollTop
                        }
                    }), a == null ? 10 : parseInt(a))
            },

            /**
             * @description scrollObjectNextDown
             * @method
             * @memberOf module:extras/utils/MapUtil#
             * @param {string} c
             *
             * @example
             * <caption>Usage of scrollObjectNextDown</caption>
             * require(['extras/utils/MapUtil'],function(MapUtil){
             *   var instance = new MapUtil();
             *   instance.scrollObjectNextDown(c);
             * })
             *
             *
             * @returns string
             */
            scrollObjectNextDown: function(c) {
                if(!c) {
                    return
                }
                var b = this.clearScrollInterval(c);
                var a = c.scrollTop + b;
                this.scrollStep = c.scrollTop = dojo.coords(c).h < a ? dojo.coords(c).h : a
            },

            /**
             * @description clearScrollInterval
             * @method
             * @memberOf module:extras/utils/MapUtil#
             * @param {string} c
             *
             * @example
             * <caption>Usage of clearScrollInterval</caption>
             * require(['extras/utils/MapUtil'],function(MapUtil){
             *   var instance = new MapUtil();
             *   instance.clearScrollInterval(c);
             * })
             *
             *
             * @returns {*}
             */
            clearScrollInterval: function(c) {
                if(this.scrollUp) {
                    window.clearInterval(this.scrollUp);
                    this.scrollUp = null;
                }
                if(this.scrollDown) {
                    window.clearInterval(this.scrollDown);
                    this.scrollDown = null;
                }
                if(c) {
                    var a = dojo.coords(c).h;
                    var b = c.scrollHeight - a;
                    return b;
                }
            }
        });


        /*dojo.mixin(extras.utils.MapUtil, (function() {
            var q = 6378137,
                m = 3.141592653589793,
                l = 57.29577951308232,
                d = 0.017453292519943,
                n = Math.floor,
                g = Math.log,
                a = Math.sin,
                h = Math.exp,
                f = Math.atan;

            function c(s) {
                return s * l
            }

            function e(s) {
                return s * d
            }

            function k(s, u) {
                var t = e(u);
                return [e(s) * q, q / 2 * g((1 + a(t)) / (1 - a(t)))]
            }

            function b(s, v, u) {
                var t = c(s / q);
                if(u) {
                    return [t, c((m / 2) - (2 * f(h(-1 * v / q))))]
                }
                return [t - (n((t + 180) / 360) * 360), c((m / 2) - (2 * f(h(-1 * v / q))))]
            }

            function i(A, x, t, v) {
                if(A instanceof Point) {
                    var D = x(A.x, A.y, v);
                    return new Point(D[0], D[1], new SpatialReference(t))
                }
                else {
                    if(A instanceof Extent) {
                        var y = x(A.xmin, A.ymin, v),
                            B = x(A.xmax, A.ymax, v);
                        return new Extent(y[0], y[1], B[0], B[1], new SpatialReference(t))
                    }
                    else {
                        if(A instanceof Polyline || A instanceof Polygon) {
                            var w = A instanceof Polyline,
                                C = w ? A.paths : A.rings,
                                z = [],
                                s;
                            dojo.forEach(C,
                                function(E) {
                                    z.push(s = []);
                                    dojo.forEach(E,
                                        function(F) {
                                            s.push(x(F[0], F[1], v))
                                        })
                                });
                            if(w) {
                                return new Polyline({
                                    paths: z,
                                    spatialReference: t
                                })
                            }
                            else {
                                return new Polygon({
                                    rings: z,
                                    spatialReference: t
                                })
                            }
                        }
                        else {
                            if(A instanceof Multipoint) {
                                var u = [];
                                dojo.forEach(A.points,
                                    function(E) {
                                        u.push(x(E[0], E[1], v))
                                    });
                                return new Multipoint({
                                    points: u,
                                    spatialReference: t
                                })
                            }
                        }
                    }
                }
            }

            var r = 39.37,
                o = 20015077 / 180,
                j = esri.config.defaults,
                p = esri.WKIDUnitConversion;
            return {

                geographicToWebMercator: function(s) {
                    return i(s, k, {
                        wkid: 102100
                    })
                },

                webMercatorToGeographic: function(s, t) {
                    return i(s, b, {
                            wkid: 4326
                        },
                        t)
                },


                getScale: function(z) {
                    var v, u, x, w;
                    if(arguments.length > 1) {
                        v = arguments[0];
                        u = arguments[1];
                        x = arguments[2];
                    }
                    else {
                        v = z.extent;
                        u = z.width;
                        var t = z.spatialReference;
                        if(t) {
                            x = t.wkid;
                            w = t.wkt
                        }
                    }
                    var y;
                    if(x) {
                        y = p.values[p[x]]
                    }
                    else {
                        if(w && (w.search(/^PROJCS/i) !== -1)) {
                            var s = /UNIT\[([^\]]+)\]\]$/i.exec(w);
                            if(s && s[1]) {
                                y = parseFloat(s[1].split(",")[1]);
                            }
                        }
                    }
                    return esri.geometry._getScale(v, u, y);
                },


                _getScale: function(s, u, t) {
                    return(s.getWidth() / u) * (t || o) * r * j.screenDPI
                },


                getExtentForScale: function(x, y) {
                    var v, u, t = x.spatialReference;
                    if(t) {
                        v = t.wkid;
                        u = t.wkt
                    }
                    var w;
                    if(v) {
                        w = p.values[p[v]]
                    }
                    else {
                        if(u && (u.search(/^PROJCS/i) !== -1)) {
                            var s = /UNIT\[([^\]]+)\]\]$/i.exec(u);
                            if(s && s[1]) {
                                w = parseFloat(s[1].split(",")[1])
                            }
                        }
                    }
                    return esri.geometry._getExtentForScale(x.extent, x.width, w, y, true)
                },


                _getExtentForScale: function(s, x, t, w, u) {
                    var v;
                    if(u) {
                        v = t;
                    }
                    else {
                        v = p.values[p[t]];
                    }
                    return s.expand(((w * x) / ((v || o) * r * j.screenDPI)) / s.getWidth())
                }
            };
        }()), {});*/
    });
