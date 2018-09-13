/**
 * 图层绘制类
 */

define([
    "dojo/_base/declare",
    "esri/graphic",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Circle",
    "esri/geometry/Point",
    "esri/geometry/Extent",
    "esri/geometry/Polyline",
    "esri/geometry/Polygon",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/PictureFillSymbol",
    "esri/symbols/Font",
    "esri/symbols/TextSymbol",
    "esri/toolbars/draw"
], function(
    declare,
    Graphic,
    webMercatorUtils,
    Circle,
    Point,
    Extent,
    Polyline,
    Polygon,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    PictureMarkerSymbol,
    PictureFillSymbol,
    Font,
    TextSymbol,
    Draw
) {
    var baseUrl=[location.protocol,"//",location.host,"/",location.pathname.split('/')[1]].join('');
    return declare(null, {
        constructor: function(map) {
            //发布toolBarLoadedEvent监听
            dojo.subscribe("toolBarLoadedEvent", this, "initLayerDraw");

            //默认样式
            this.defaultSymbol = {
                "Point": {
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
                "Image": {
                    type: "esriPMS",
                    angle: 0,
                    width: 32,
                    height: 32,
                    xoffset: 0,
                    yoffset: 0,
                    url: baseUrl + "/themes/default/img/tt.png"
                },
                "Text": {
                    type: "esriTS",
                    angle: 0,
                    color: [51, 51, 51, 255],
                    font: {
                        family: "微软雅黑",
                        size: 12,
                        style: "normal",
                        variant: "normal",
                        weight: "normal"
                    },
                    horizontalAlignment: "center",
                    kerning: true,
                    rotated: false,
                    text: "添加默认文本",
                    xoffset: 0,
                    yoffset: 0
                },
                "Line": {
                    type: "esriSLS",
                    style: "esriSLSSolid",
                    width: 3,
                    color: [255, 0, 0, 255]
                },
                "Polygon": {
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
        },
        initLayerDraw: function(toolbar) {
            this.toolbar = toolbar;
        },
        addPictureFill: function() {
            var ext = webMercatorUtils.geographicToWebMercator(new Extent(60.568, 13.978, 67.668, 32.678));
            var pictureFillSymbol = new PictureFillSymbol({
                "url": baseUrl + "/themes/default/images/tt2.jpg",
                "height": 900,
                "width": 1200,
                "type": "esriPMS"
            });

            pictureFillSymbol.setYScale(1);
            var attributs = {};
            var graphic = new Graphic(ext, pictureFillSymbol, attributs);
            this.toolbar.drawLayer.add(graphic);
            return graphic;
        },
        addPointByImage: function(x, y, symbol, attributs) {
            var pt = webMercatorUtils.geographicToWebMercator(new Point(parseFloat(x), parseFloat(y)));
            //var pictureSymbol = new esri.symbols.PictureMarkerSymbol(symbol|| this.defaultSymbol.Image);
            var pictureSymbol = new PictureMarkerSymbol(dojo.mixin({}, this.defaultSymbol.Image, symbol));
            var graphic = new Graphic(pt, pictureSymbol, attributs);
            this.toolbar.drawLayer.add(graphic);
            return graphic;
        },
        addPointByText: function(x, y, textSymbol, attributes) {
            var pt = webMercatorUtils.geographicToWebMercator(new Point(parseFloat(x), parseFloat(y)));
            var textsym = new TextSymbol(dojo.mixin({}, this.defaultSymbol.Text, textSymbol));
            var graphic = new Graphic(pt, textsym, attributes);
            this.toolbar.drawLayer.add(graphic);
            //graphic.node.style.textShadow = "1px 1px 1px red, 1px -1px 1px red, -1px 1px 1px red, -1px -1px 1px red";
            return graphic;
        },
        /**
         * 添加线
         * @param {Object} points   坐标数组
         * @param {Object} style    线样式
         */
        addPolyline: function(points, lineSymbol, attributs) {
            var pt = webMercatorUtils.geographicToWebMercator(new Polyline(points));
            var textsym = new SimpleLineSymbol(lineSymbol || this.defaultSymbol.Line);
            var graphic = new Graphic(pt, textsym, attributs);
            this.toolbar.drawLayer.add(graphic);
            return graphic;
        },
        /**
         * 添加面
         * @param {Object} points   坐标数组
         * @param {Object} style    面样式
         */
        addPolygon: function(points, fillSymbol, attributs) {
            var pt = webMercatorUtils.geographicToWebMercator(new Polygon(points));
            var textsym = new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon);
            var graphic = new Graphic(pt, textsym, attributs);
            this.toolbar.drawLayer.add(graphic);
            return graphic;
        },
        /**
         * @description 地图上画圆
         * @param {Object} params           圆的参数属性
         * @param {Point|number[]} params.center 圆心
         * @param {number} params.radius         半径等等
         * @param {Object} fillSymbol       圆的外观样式
         * @param {Object} [attributs]      图元的属性信息
         */
        addCircle: function(params, fillSymbol, attributes) {
            var point, symbol;

            point = new Circle(params);
            if(fillSymbol && fillSymbol.isInstanceOf && fillSymbol.isInstanceOf(SimpleLineSymbol)) {
                symbol = fillSymbol;
            }
            else {
                symbol = new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon);
            }
            var graphic = new Graphic(point, symbol, attributes);
            this.toolbar.drawLayer.add(graphic);
            return graphic;
        },
        /**
         * 图上添加矩形
         * @param {Object} style    矩形样式
         * @param {String} id       图元id
         * @param {Object} fillSymbol   symbol
         */
        addExtent: function(params, id, fillSymbol) {
            var pt = new Extent(params);
            var textsym = new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon);
            var graphic = new Graphic(pt, textsym, null);
            id && (graphic.id = id);
            this.toolbar.drawLayer.add(graphic);
        },
        drawPointByMark: function(symbol, returnFunction) {
            this.toolbar.draw(Draw.POINT, new SimpleMarkerSymbol(symbol || this.defaultSymbol.Point), returnFunction);
        },
        /**
         * 图上画点
         * @param {Object} style    点样式
         * @param {Object} returnFunction   返回点实体函数
         */
        drawPointByImage: function(symbol, returnFunction) {
            this.toolbar.draw(Draw.POINT, new PictureMarkerSymbol(symbol || this.defaultSymbol.Image), returnFunction);
        },
        /**
         * 图上画文字
         * @param {Object} style    点样式
         * @param {Object} returnFunction   返回点实体函数
         */
        drawPointByText: function(textSymbol, returnFunction) {
            this.toolbar.draw(Draw.POINT, new TextSymbol(textSymbol || this.defaultSymbol.Text), returnFunction);
        },
        /**
         * 图上画线
         * @param {Object} style    线样式
         * @param {Object} returnFunction   返回线实体函数
         */
        drawPolyline: function(lineSymbol, returnFunction) {
            this.toolbar.draw(Draw.POLYLINE, new SimpleLineSymbol(lineSymbol || this.defaultSymbol.Line), returnFunction);
        },
        /**
         * 图上画面
         * @param {Object} style    面样式
         * @param {Object} returnFunction   返回面实体函数
         */
        drawPolygon: function(fillSymbol, returnFunction) {
            this.toolbar.draw(Draw.POLYGON, new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon), returnFunction);
        },
        /**
         * 图上画圆
         * @param {Object} style    圆样式
         * @param {Object} returnFunction   返回圆实体函数
         */
        drawCircle: function(fillSymbol, returnFunction) {
            this.toolbar.draw(Draw.CIRCLE, new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon), returnFunction);
        },
        /**
         * 图上画矩形
         * @param {Object} style    矩形样式
         * @param {Object} returnFunction   返回矩形实体函数
         */
        drawExtent: function(fillSymbol, returnFunction) {
            this.toolbar.draw(Draw.EXTENT, new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon), returnFunction);
        },
        /**
         * 清除画图操作
         */
        endDraw: function() {
            this.toolbar.deactivateToolbar();
        },
        clear: function() {
            this.toolbar.drawLayer.clear();
        }
    });
});

