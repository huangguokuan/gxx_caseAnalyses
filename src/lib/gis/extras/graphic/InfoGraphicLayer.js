
define([
    "dojo/_base/declare",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Point"
], function(
    declare,
    webMercatorUtils,
    Point
) {
    return declare(null, {
        constructor: function(options) {
            options = options || {};
            this._id = options.id || "";
            this._divId = options.divId;
            this._bindGraphicLayer = options.bindGraphicLayer || null;
            this.visible = true;
        },
        // 重构esri/layers/GraphicsLayer方法
        _setMap: function(map, surface) {
            // GraphicsLayer will add its own listener here
            var div = this.inherited(arguments);
            return div;
        },
        _unsetMap: function() {
            this.inherited(arguments);
        },
        hide: function() {
            this.visible = false;
            if(this.clickGraphic) {
                $("#div_" + this.clickGraphic.id).hide();
            }
            var _graphics = this.graphics;
            for(var i = 0, dl = _graphics.length; i < dl; i++) {
                _graphics[i].hide();
            }
        },
        show: function() {
            this.visible = true;
            if(this.clickGraphic) {
                $("#div_" + this.clickGraphic.id).show();
            }
            var _graphics = this.graphics;
            for(var i = 0, dl = _graphics.length; i < dl; i++) {
                _graphics[i].show();
            }
        },
        remove: function(graphic) {
            if(!this._map) {
                return;
            }
            this.inherited(arguments);
            /*var id =graphic.id;
            $("#div_"+id).hide();
            $("#div_"+id).remove();*/
        },
        _refresh: function(redrawFlag, zoomFlag) {
            if(!this.visible) return;

            var gs = this.graphics,
                _draw = this._draw;
            for(var i = 0; i < gs.length; i++) {
                _draw(gs[i], redrawFlag, zoomFlag);
            }
            this.show();
        },
        //拖拽
        _onPanStartHandler: function() {
            this.hide();
            this.inherited(arguments);
        },
        //缩放
        _onZoomStartHandler: function() {
            this.inherited(arguments);
        },

        _onExtentChangeHandler: function(delta, extent, levelChange, lod) {
            this._refresh(true, true);
            this.inherited(arguments);
        },
        _draw: function(graphic, redrawFlag, zoomFlag) {
            var dx, dy, screenPos, geometry, graphicShade, level;
            if(!this._map) return;
            this.inherited(arguments);
            if(graphic.staticMapGraphic) {
                level = this._map.getLevel();
                //graphic.symbol.width = 11;
                //graphic.symbol.height = 11;
            }
            if(this.clickGraphic && this.hasDialog) {
                geometry = graphic.geometry;
                var num = webMercatorUtils.xyToLngLat((geometry.xmin + geometry.xmax) / 2, (geometry.ymin + geometry.ymax) / 2);
                var dotgeometry = webMercatorUtils.geographicToWebMercator(new Point(num[0], num[1]));
                var screenXY = this._map.toScreen(dotgeometry);
                dx = screenXY.x - $('.ui-popup').width() / 2 + 240;
                dy = screenXY.y - $('.ui-popup').height() - 12;
                $('.ui-popup').css({
                    'left': dx,
                    'top': dy
                }).addClass('ui-popup-top');
            }

            // handle graphic point and cluster
            if(this.clickGraphic && this.clickGraphicPoint) {
                if(this.clickGraphic.id == graphic.id) { // 一般图元
                    geometry = graphic.geometry;
                }
                else if(graphic.attributes.isCluster) { // 聚合图元
                    var attrs = graphic.attributes;
                    for(var i = 0; i < attrs.clusterCount; i++) {
                        var clusterg = attrs.data[i];
                        if(this.clickGraphic.id == clusterg.id) {
                            geometry = graphic.geometry;
                            break;
                        }
                    }
                }
                if(!geometry) return;
                // 面
                if((geometry.type == "polygon" || geometry.type == "extent") && geometry['rings'].length) {
                    var extent = graphic._extent,
                        center,
                        screenPoint,
                        extentWidth = 0,
                        extentHeight = 0;

                    // Get Center Geometry
                    center = xyToLngLat((extent['xmin'] + extent['xmax']) / 2, (extent['ymin'] + extent['ymax']) / 2);
                    geometry = geographicToWebMercator(center[0], center[1]);

                    // Get Extent's Width And Height
                    var point1 = xyToLngLat(extent['xmin'], extent['ymin']),
                        point2 = xyToLngLat(extent['xmax'], extent['ymax']),
                        geometry1 = geographicToWebMercator(point1[0], point1[1]),
                        geometry2 = geographicToWebMercator(point2[0], point2[1]),
                        screenPos1 = this._map.toScreen(geometry1),
                        screenPos2 = this._map.toScreen(geometry2);
                    extentWidth = Math.abs(screenPos2.x - screenPos1.x);
                    extentHeight = Math.abs(screenPos2.y - screenPos1.y);
                }
                // 转为屏幕坐标
                screenPos = this._map.toScreen(geometry);
                // 获取图片大小
                graphicShade = graphic._shape ? graphic._shape.shape : {
                    width: extentWidth,
                    height: extentHeight
                };

                // // 获取地图区域与浏览器间的宽高差距
                var isIE89 = (!!navigator.userAgent.match(/MSIE 8.0/)) || (!!navigator.userAgent.match(/MSIE 9.0/)),
                    mapContainer = graphic.getLayer().map ? graphic.getLayer().map.container : graphic.getLayer()._map.container,
                    mapStyle = dojo.getStyle(mapContainer.id),
                    paddingTop = mapStyle && +mapStyle['paddingTop'].replace('px', ''),
                    paddingBottom = mapStyle && +mapStyle['paddingBottom'].replace('px', ''),
                    paddingLeft = mapStyle && +mapStyle['paddingLeft'].replace('px', ''),
                    paddingRight = mapStyle && +mapStyle['paddingRight'].replace('px', ''),
                    offsetTop = mapContainer.offsetTop || (paddingTop + paddingBottom) || 0,
                    offsetLeft = (document.documentElement.clientWidth - mapContainer.clientWidth);

                offsetLeft = offsetLeft ? (isIE89 ? offsetLeft - 5 : offsetLeft) : 0;
                offsetLeft = offsetLeft - paddingLeft - paddingRight;

                // Use this.map.position;
                //            var position = this._map.position;
                //            offsetTop = position.y;
                //            offsetLeft = position.x;

                // distinguish graphic type
                var graphicShadeWidth = graphicShade.type === "circle" ? (graphicShade.r || 0) * 2 : graphicShade.width || 0;
                var graphicShadeHeight = graphicShade.type === "circle" ? (graphicShade.r || 0) * 2 : graphicShade.height || 0;

                dx = screenPos.x - $('.ui-popup').width() / 2 + offsetLeft;
                dy = screenPos.y - $('.ui-popup').height() - graphicShadeHeight + offsetTop;
                $('.ui-popup').css({
                    'left': Math.abs(dx),
                    'top': Math.abs(dy)
                }).addClass('ui-popup-top');
            }

            function xyToLngLat(x, y) {
                return webMercatorUtils.xyToLngLat(x, y);
            }

            function xyToPoint(x, y) {
                return new Point(x, y);
            }

            function geographicToWebMercator(x, y) {
                return webMercatorUtils.geographicToWebMercator(xyToPoint(x, y));
            }
        }
    });
});


