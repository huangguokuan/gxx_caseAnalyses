define([
    "dojo/_base/declare",
    "esri/graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",
    "esri/toolbars/draw",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/dijit/PopupTemplate",
    "extras/graphic/InfoGraphicLayer",
    "extras/utils/MapCommonUtils"
], function(
    declare,
    Graphic,
    GraphicsLayer,
    Point,
    webMercatorUtils,
    Draw,
    PictureMarkerSymbol,
    SimpleLineSymbol,
    SimpleFillSymbol,
    PopupTemplate,
    InfoGraphicLayer,
    MapCommonUtils
) {
    var spatialQueryParam = function() {
        return {
            layerId: null, //工程图层ID
            geometry: null, //空间查询范围
            outFields: null, //返回字段
            where: null, //查询条件
            returnGeometry: true, //是否返回空间实体
            returnValues: true, //是否返回字段值信息
            returnAlias: true, //是否返回字段别名
            isReturnMis: true, //是否返回MIS关联信息,
            startRow: null, //分页起始记录数
            endRow: null, //分页终止记录数
            orderbyFields: null,
            groupbyFields: null,
            filtrateNum: 0,
            spatialRelationship: "ST_Intersects"
        };
    };
    return declare(null, {
        layerQueryLayer: null,
        constructor: function() {
            //发布toolBarLoadedEvent监听(用来获得MAP和Toolbar)
            dojo.subscribe("toolBarLoadedEvent", this, "initLayerQuery");

            //默认样式
            this.defaultSymbol = {
                "POINT": {
                    type: "esriSMS",
                    style: "esriSMSCircle",
                    angle: 0,
                    color: [255, 0, 0, 255],
                    outline: {
                        type: "esriSLS",
                        style: "esriSLSSolid",
                        width: 1.5,
                        color: [255, 255, 255]
                    },
                    size: 6.75,
                    xoffset: 0,
                    yoffset: 0
                },
                "IMAGE": {
                    type: "esriPMS",
                    angle: 0,
                    width: 32,
                    height: 32,
                    xoffset: 0,
                    yoffset: 0,
                    url: this.getRootPath() + "/themes/default/images/tt.png"
                },
                "TEXT": {
                    type: "esriTS",
                    angle: 0,
                    color: [51, 51, 51, 255],
                    font: {
                        family: "微软雅黑",
                        size: 9,
                        style: "normal",
                        variant: "normal",
                        weight: "normal"
                    },
                    horizontalAlignment: "center",
                    kerning: true,
                    rotated: false,
                    text: "默认文本",
                    xoffset: 0,
                    yoffset: 0
                },
                "LINE": {
                    type: "esriSLS",
                    style: "esriSLSSolid",
                    width: 1.5,
                    color: [255, 0, 0, 255]
                },
                "POLYLINE": {
                    type: "esriSLS",
                    style: "esriSLSSolid",
                    width: 1.5,
                    color: [255, 0, 0, 255]
                },
                "POLYGON": {
                    type: "esriSFS",
                    style: "esriSFSSolid",
                    color: [0, 0, 0, 64],
                    outline: {
                        type: "esriSLS",
                        style: "esriSLSSolid",
                        width: 1.5,
                        color: [255, 0, 0, 255]
                    }
                }
            };
            this.mapCommonUtils = new MapCommonUtils();
            this.layerQueryLayer = new InfoGraphicLayer({
                id: "GXX_GIS_QUERYRESULT_LAYER"
            });
        },
        initLayerQuery: function(toolbar) {
            this.toolbar = toolbar;
            this.map = this.toolbar.map;
            this.map.addLayer(this.layerQueryLayer);
        },
        /**
         * Add isClear by skz
         * @param {} type
         * @param {} sybmol
         * @param {} callBackFun
         * @param {} isNotClear 是否不清空图层(默认清空)
         */
        startDraw: function(type, sybmol, callBackFun, isNotClear) {
            !isNotClear && this.layerQueryLayer.clear();
            this.map.reorderLayer(this.layerQueryLayer, this.map._layers.length - 1);
            this.toolbar.draw(type, sybmol || this.defaultSymbol[type.toUpperCase()], dojo.hitch(this, function(graphic) {
                if(graphic) {
                    callBackFun(graphic);
                }
                else {
                    callBackFun(null);
                }
            }));
        },
        basicSearch: function(type, symbol, isNotClearLayer, callback) {
            var renderSymbol;
            symbol = symbol || {};
            switch(type) {
                case "point":
                case "multipoint":
                    //dojo.mixin({}, this.defaultSymbol.POINT,symbol);
                    break;
                case "polyline":
                case "freehandpolyline":
                    renderSymbol = new SimpleLineSymbol(dojo.mixin({}, this.defaultSymbol.LINE, symbol));
                    break;
                default:
                    renderSymbol = new SimpleFillSymbol(dojo.mixin({}, this.defaultSymbol.POLYGON, symbol));
                    break;
            }

            this.startDraw(type, renderSymbol, dojo.hitch(this, function(graphic) {
                callback && callback(graphic);
            }), isNotClearLayer);
        },
        /**
         *
         * @param {} options.type
         * @param {} options.symbol
         * @param {} options.isNotClearLayer
         * @param {} options.attributes
         */
        polygonSearchExt: function(options) {
            var that = this;
            options = options || {};
            this.basicSearch(options.type || Draw.POLYGON, options.symbol, options.isNotClearLayer || true, function(graphic) {
                graphic.attributes = options.attributes || {
                    type: 'search'
                };
                that.toolbar.drawLayer.clear();
                that.layerQueryLayer.add(graphic);
                dojo.publish('polygonSearchFinish', [graphic]);
            });
        },
        pullBoxSearch: function() {
            this.startDraw(Draw.EXTENT, new SimpleFillSymbol(this.defaultSymbol.POLYGON), dojo.hitch(this, function(graphic) {
                this.toolbar.drawLayer.clear();
                this.layerQueryLayer.add(graphic);
                dojo.publish('pullBoxSearchFinish', [graphic]);
            }));
        },
        polygonSearch: function() {
            this.startDraw(Draw.POLYGON, new SimpleFillSymbol(this.defaultSymbol.POLYGON), dojo.hitch(this, function(graphic) {
                this.toolbar.drawLayer.clear();
                this.layerQueryLayer.add(graphic);
                dojo.publish('polygonSearchFinish', [graphic]);
            }));
        },
        lineSearch: function() {
            this.startDraw(Draw.FREEHAND_POLYLINE, new SimpleLineSymbol(this.defaultSymbol.LINE), dojo.hitch(this, function(graphic) {
                this.toolbar.drawLayer.clear();
                this.layerQueryLayer.add(graphic);
                dojo.publish('lineSearchFinish', [graphic]);
            }));
        },
        circleSearch: function() {
            this.startDraw(Draw.CIRCLE, new SimpleFillSymbol(this.defaultSymbol.POLYGON), dojo.hitch(this, function(graphic) {
                this.toolbar.drawLayer.clear();
                this.layerQueryLayer.add(graphic);
                dojo.publish('circleSearchFinish', [graphic]);
            }));
        },
        /**
         *
         * @param {string} options.type                 图形类型（'polygon,polyline,extent,circle...'）
         * @param {object} options.symbol               图元样式
         * @param {boolean} options.isNotClearLayer     是否不清除图层  （默认不清除）
         * @param {object} options.attributes           图元属性
         * @param {string} options.subscribeHook        发布订阅监听钩子
         * @example <caption>Usage of </caption>
         * var options = {
         *   type: 'polygon',
         *   subscribeHook: 'pullCircleFinish'
         * }
         * GisObject.layerQuery.domainSearch(options);
         */
        domainSearch: function(options) {
            options = options || {};
            this.basicSearch(options.type || Draw.POLYGON, options.symbol, options.isNotClearLayer || true, dojo.hitch(this, function(graphic) {
                //graphic.attributes = options.attributes || {type: 'search'};
                dojo.mixin(graphic.attributes, options.attributes, {
                    type: 'search'
                });
                this.toolbar.drawLayer.clear();
                this.layerQueryLayer.add(graphic);
                dojo.publish(options.subscribeHook || 'polygonSearchFinishExt', [graphic]);
            }));
        },
        /**
         * 属性查询
         * @param {Object} id   工程图层ID
         * @param {Object} where    属性条件
         * @param {Object} sussFunction     成功返回调用函数，以字符串格式返回数据
         * @param {Object} errorFunction    失败返回调用函数,返回错误信息
         */
        queryByAttribute: function(layerId, attrName, attrValue, isLike) {
            var param = spatialQueryParam();
            param.layerId = layerId;
            param.attrName = attrName;
            param.attrValue = attrValue;
            param.isLike = isLike || true;
            return this.queryByLayerId(1, param);
        },
        /**
         * 空间查询
         * @param {Object} id
         * @param {Object} geometry
         * @param {Object} sussFunction
         * @param {Object} errorFunction
         */
        queryByGeometry: function(layerId, geometry) {
            var param = spatialQueryParam();
            param.layerId = layerId;
            param.geometry = geometry;
            return this.queryByLayerId(2, param);
        },
        /**
         * 综合查询
         * @param {Object} params
         * @param {Object} sussFunction
         * @param {Object} errorFunction
         */
        queryByAttrAndGeo: function(layerId, geometry, attrName, attrValue, isLike) {
            var param = spatialQueryParam();
            param.layerId = layerId;
            param.geometry = geometry;
            param.attrName = attrName;
            param.attrValue = attrValue;
            return this.queryByLayerId(3, param);
        },
        queryByLayerId: function(type, param) {
            var layerId = param.layerId;
            var attrName = param.attrName;
            var attrValue = param.attrValue;
            var geometry = param.geometry || null;
            var isLike = param.isLike || true; //默认是模糊查询
            var layer = this.map.getLayer(layerId);
            var resultData = null;
            if(layer) {
                if(type == 1) { // 属性是查询
                    resultData = this.getGraphicByAttribute(layer, attrName, attrValue, isLike);
                }
                else if(type == 2) { //空间查询
                    resultData = this.getGraphicByGeometry(layer, geometry);
                }
                else if(type == 3) { //属性空间联合查询
                    resultData = this.getGraphicByAttributeAndGeometry(layer, geometry, attrName, attrValue, isLike);
                }
            }
            return resultData;
        },
        queryDynamic: function(type, param) {
            var layerId = param.layerId;
            var attrName = param.attrName;
            var attrValue = param.attrValue;
            var geometry = param.geometry || null;
            var isLike = param.isLike || true; //默认是模糊查询
            var isAll = param.isAll || true;
            var layer = this.map.getLayer(layerId);
            var resultData = null;
            if(layer) {
                if(type == 1) { // 属性是查询
                    resultData = this.getGraphicByAttributeDynamic(layer, attrName, attrValue, isLike, isAll);
                }
                else if(type == 2) { //空间查询
                    resultData = this.getGraphicByGeometry(layer, geometry);
                }
                else if(type == 3) { //属性空间联合查询
                    resultData = this.getGraphicByAttributeAndGeometry(layer, geometry, attrName, attrValue, isLike);
                }
            }
            return resultData;
        },
        getGraphicBy: function(layer, property, value) {
            var feature = null;
            layer = typeof layer === "string" ? this.map.getLayer(layer) : (layer && layer.id ? layer : null);
            if(layer) {
                var graphics = layer.graphics;
                if(!graphics || !graphics.length) return null;

                for(var i = 0, len = graphics.length; i < len; ++i) {
                    var graphic = graphics[i];
                    // Handle For Cluster Graphic
                    if(graphic[property] == undefined && graphic['attributes'] && graphic['attributes']['clusterCount']) {
                        for(var k = 0; k < graphic.attributes.clusterCount; k++) {
                            if(graphic.attributes.data[k][property] == value) {
                                //feature = graphics[i];
                                // Add At 2017/04/25 处理智能追踪时，设备聚合情况下，获取不了图元得问题
                                var tgraphic = graphic.attributes.data[k];
                                tgraphic.layerId = graphic.getLayer()._id;
                                //tgraphic.rawNode = graphic.getShape().rawNode;
                                tgraphic.spatialReferenceWkid = graphic.geometry && graphic.geometry.spatialReference && graphic.geometry.spatialReference.wkid;
                                feature = this.mapCommonUtils.buildClusterGraphic(tgraphic);
                                break;
                            }
                        }
                    }
                    else if(graphics[i][property] == value) {
                        feature = graphics[i];
                        break;
                    }
                }
            }
            return feature;
        },
        getGraphicByNoCluster: function(layer, property, value) {
            var feature = null;
            layer = typeof layer === "string" ? this.map.getLayer(layer) : (layer && layer.id ? layer : null);
            if(layer) {
                var graphics = layer.graphics;
                if(!graphics || !graphics.length) return null;

                for(var i = 0, len = graphics.length; i < len; ++i) {
                    var graphic = graphics[i];
                    // Handle For Cluster Graphic
                    if(graphics[i][property] == value) {
                        feature = graphics[i];
                        break;
                    }
                }
            }
            return feature;
        },
        getGraphicById: function(layer, idKey) {
            return this.getGraphicBy(layer, 'id', idKey);
        },
        /**
         * 根据图元ID从指定图层中获取图元(不对聚合做操作)
         */
        getGraphicByIdNoCluster: function(layer, idKey) {
            return this.getGraphicByNoCluster(layer, 'id', idKey);
        },
        getAllGraphic: function(layer) {
            if(typeof layer === "string") {
                layer = this.map.getLayer(layer);
            }
            return layer.graphics;
        },
        getGraphicByAttributeAndGeometry: function(layer, geometry, attrName, attrValue, isLike) {
            var foundGraphics = null;
            var resultData = this.getGraphicByAttribute(layer, attrName, attrValue, isLike);
            if(resultData && resultData.lenght > 0) {
                foundGraphics = [];
                dojo.forEach(resultData, function(graphic, index) {
                    if(geometry.contains(graphic.geometry)) {
                        foundGraphics.push(graphic);
                    }
                });
            }
            return foundGraphics;
        },
        getGraphicByGeometry: function(layer, geometry) {
            var foundGraphics = null;
            if(layer && geometry) {
                foundGraphics = [];
                var allGraphic = this.getAllGraphic(layer);
                for(var i = 0, len = allGraphic.length; i < len; i++) {
                    var g = allGraphic[i];
                    if(geometry.contains(g.geometry)) {
                        foundGraphics.push(g);
                    }
                }
            }
            return foundGraphics;
        },
        getGraphicByAttribute: function(layer, attrName, attrValue, isLike) {
            var foundGraphics = null;
            if(layer) {
                var feature = null;
                foundGraphics = [];
                var graphics = layer.graphics;
                if(!graphics || !graphics.length) return null;

                for(var i = 0, len = graphics.length; i < len; i++) {
                    feature = graphics[i];

                    if(feature && feature.attributes) {
                        if(feature['attributes']['clusterCount']) {
                            for(var k = 0; k < feature.attributes.clusterCount; k++) {
                                var graphic = feature.attributes.data[k];
                                graphic.layerId = feature.getLayer()._id;
                                graphic.spatialReferenceWkid = feature.geometry && feature.geometry.spatialReference && feature.geometry.spatialReference.wkid;

                                if(!isLike && (graphic[attrName] == attrValue)) {
                                    graphic = this.mapCommonUtils.buildClusterGraphic(graphic);
                                    foundGraphics.push(graphic);
                                }
                                else if(graphic[attrName].indexOf(attrValue) != -1) {
                                    graphic = this.mapCommonUtils.buildClusterGraphic(graphic);
                                    foundGraphics.push(graphic);
                                }
                            }
                        }
                        else if(!isLike && (feature.attributes[attrName] == attrValue)) {
                            foundGraphics.push(feature);
                        }
                        else if(feature.attributes[attrName].indexOf(attrValue) != -1) {
                            foundGraphics.push(feature);
                        }
                    }
                    /*if(feature && feature.attributes) {
                           if(!isLike){
                               if (feature.attributes[attrName] == attrValue) {
                                   foundGraphics.push(feature);
                               }
                           }else{
                               if (feature.attributes[attrName].indexOf(attrValue) != -1){
                                   foundGraphics.push(feature);
                               }
                           }
                       }*/
                }
            }
            return foundGraphics;
        },
        getGraphicByAttributeDynamic: function(layer, attrName, attrValue, isLike, isAll) {
            var foundGraphics = null;
            if(layer) {
                var feature = null;
                foundGraphics = [];
                var graphics = isAll ? layer.allData : layer.graphics;
                if(!graphics || !graphics.length) return null;

                for(var i = 0, len = graphics.length; i < len; i++) {
                    var graphic = graphics[i];

                    if(graphic && isAll) {
                        if(!isLike && (graphic[attrName] == attrValue)) {
                            graphic = this.mapCommonUtils.buildClusterGraphic(graphic);
                            foundGraphics.push(graphic);
                        }
                        else if(graphic[attrName].indexOf(attrValue) != -1) {
                            graphic = this.mapCommonUtils.buildClusterGraphic(graphic);
                            foundGraphics.push(graphic);
                        }
                    }

                }
            }
            return foundGraphics;
        },
        getRootPath: function() {
            return [location.protocol, "//", location.host, "/", location.pathname.split('/')[1]].join('');
        },
        clearQueryLayer: function() {
            this.layerQueryLayer && this.layerQueryLayer.clear();
        }
    });
});

/*SpatialQueryParam.WFS_QUERY_TYPE_LIKE = "Like";
SpatialQueryParam.WFS_QUERY_TYPE_GREATERTHAN = "GreaterThan";
SpatialQueryParam.WFS_QUERY_TYPE_LESSTHANEQUALTO = "LessThanEqualTo";
SpatialQueryParam.WFS_QUERY_TYPE_GREATERTHANEQUALTO = "GreaterThanEqualTo";
SpatialQueryParam.WFS_QUERY_TYPE_EQUALTO = "EqualTo";
SpatialQueryParam.WFS_QUERY_TYPE_NOTEQUALTO = "NotEqualTo";
SpatialQueryParam.WFS_QUERY_TYPE_BETWEEN = "Between";
SpatialQueryParam.WFS_QUERY_TYPE_NULLCHECK = "NullCheck";


SpatialQueryParam.SPATIAL_REL_CONTAINS = "ST_Contains";// 第二个几何完全被第一个几何包含
SpatialQueryParam.SPATIAL_REL_CROSSES = "ST_Crosses";// 两个几何相交 只适用于一部分实体判断
SpatialQueryParam.SPATIAL_REL_EQUALS = "ST_Equals";// 两个几何类型相同，并且坐标序列相同
SpatialQueryParam.SPATIAL_REL_INTERSECTS = "ST_Intersects";// 两个几何相交
SpatialQueryParam.SPATIAL_REL_OVERLAPS = "ST_Overlaps";// 比较的2个几何维数相同并且相交
SpatialQueryParam.SPATIAL_REL_TOUCHES = "ST_Touches";// 两个几何相交的部分都不在两个几何的内部(接触)
SpatialQueryParam.SPATIAL_REL_WITHIN = "ST_Within";// 第一个几何完全在第二个几何内部
SpatialQueryParam.SPATIAL_REL_DISJOINT = "ST_Disjoint";// 两个几何不相交*/
