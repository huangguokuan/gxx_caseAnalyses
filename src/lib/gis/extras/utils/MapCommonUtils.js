

define([
    "dojo/_base/declare",
    "dojo/on",
    "extras/utils/MapCommonUtils",
    "esri/units",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/geometry/geodesicUtils",
    "esri/graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/Polygon",
    "esri/geometry/webMercatorUtils",
    "extras/utils/GPSConvertor",
    "esri/SpatialReference"
], function(
    declare,
    on,
    MapCommonUtils,
    units,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    PictureMarkerSymbol,
    geodesicUtils,
    Graphic,
    GraphicsLayer,
    Point,
    Polyline,
    Polygon,
    webMercatorUtils,
    GPSConvertor,
    SpatialReference
) {
    var baseUrl=[location.protocol, "//", location.host, "/", location.pathname.split('/')[1]].join('');
    return declare(null, {
        DISTANCE: "distance",
        AREA: "area",
        map: null,
        defaultSymbol: {
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
        },
        constructor: function(map, options) {
            dojo.subscribe("mapLoadedEvent", this, "initMapCommonUtils");
        },
        initMapCommonUtils: function(map) {
            this.map = map;
        },
        /**
         * 是否墨卡托坐标系
         * @param reference 坐标参数系
         */
        isWebMercator: function(reference) {
            var resultFlag = false;
            var refs = {
                100112: true,
                102113: true,
                102100: true,
                3857: true,
                3785: true,
                54004: true,
                41001: true //,
                //4326: true            // 非墨卡托wkid
            };
            return !!refs[reference.wkid];
        },
        /**
         * 单位换算
         * @param result 待换算数值
         * @param type  换算类型（面积：area； 距离： distance）
         */
        convertUnits: function(result, type) {
            var resultTxt = "";
            var allTxt = "";
            var unitTxt = "";
            if(type == this.DISTANCE) {
                allTxt = "总长：";
                unitTxt = " 米";
                if(result > 1000) {
                    unitTxt = " 公里";
                    result = result / 1000;
                }
                result = Math.floor(result * 100) / 100;
            }
            else {
                allTxt = "面积： ";
                unitTxt = "平方米";
                if(result > 1000000) {
                    result = result / 1000000;
                    unitTxt = " 平方公里";
                }
                result = Math.floor(result * 100) / 100;
            }

            result = result < 0 ? (0) : result;
            resultTxt = result.toFixed(2);
            //resultTxt = allTxt +"<font color='#ff372d'><B>"+ resultTxt +"</B></font>"+ unitTxt;
            resultTxt = allTxt + resultTxt + unitTxt;
            return resultTxt;
        },
        /**
         * 测量polygon闭合曲线面积
         * @param polygon
         */
        measureOfarea: function(polygon) {
            var resultArray,transferPolygon;
            if(!this.isWebMercator(polygon.spatialReference)) {
                resultArray = geodesicUtils.geodesicAreas([polygon], units.SQUARE_METERS);
            }
            else {
                transferPolygon = webMercatorUtils.webMercatorToGeographic(polygon);
                resultArray = geodesicUtils.geodesicAreas([transferPolygon], units.SQUARE_METERS);
            }
            return resultArray;
        },
        createCustomLayer: function(layerID) {
            if(this.map.getLayer(layerID)) return this.map.getLayer(layerID);
            this.drawLayer = new GraphicsLayer({
                id: layerID || "CUSTOM_GIS_DRAW_LAYER"
            });
            this.map.addLayer(this.drawLayer);
            return this.drawLayer;
        },
        addPolyline: function(layerID, points, lineSymbol, attributes) {
            var pt = webMercatorUtils.geographicToWebMercator(new Polyline(points));
            var symbol = new SimpleLineSymbol(lineSymbol || this.defaultSymbol.Line);
            var graphic = new Graphic(pt, symbol, attributes);
            attributes && attributes['id'] && (graphic.id = attributes['id']);
            this.createCustomLayer(layerID).add(graphic);
            return graphic;
        },
        addPolygon: function(layerID, points, fillSymbol, attributes) {
            var pt = webMercatorUtils.geographicToWebMercator(new Polygon(points));
            var symbol = new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon);
            var graphic = new Graphic(pt, symbol, attributes);
            attributes && attributes['id'] && (graphic.id = attributes['id']);
            this.createCustomLayer(layerID).add(graphic);
            return graphic;
        },
        addPointByImage: function(layerID, x, y, symbol, attributes) {
            var pt = webMercatorUtils.geographicToWebMercator(new Point(parseFloat(x), parseFloat(y)));
            var pictureSymbol = new PictureMarkerSymbol(dojo.mixin({}, this.defaultSymbol.Image, symbol));
            var graphic = new Graphic(pt, pictureSymbol, attributes);
            attributes && attributes['id'] && (graphic.id = attributes['id']);
            this.createCustomLayer(layerID).add(graphic);
            return graphic;
        },
        buildClusterGraphic: function(graphic) {
            if(!graphic) return;
            var feature = {},
                geometry, lon, lat;

            // -- 地图坐标系转换开始
            lon = graphic.x;
            lat = graphic.y;
            /*if(gisConfig.mapType == '1'){//google
                var GCJ = extras.utils.GPSConvertor.gcj_encrypt(parseFloat(lat),parseFloat(lon));
                lon = GCJ.lon;
                lat = GCJ.lat;
            }*/
            geometry = new Point(lon, lat, new SpatialReference(graphic.spatialReferenceWkid || this.map.spatialReference.wkid));
            if(this.isWebMercator(geometry.spatialReference)) {
                geometry = webMercatorUtils.webMercatorToGeographic(geometry);
            }
            feature = dojo.mixin({}, graphic);
            feature.id = graphic.id;
            feature.geometry = geometry;
            feature.attributes = dojo.mixin({}, graphic);
            feature.attributes.x = geometry.x;
            feature.attributes.y = geometry.y;
            feature._layer = graphic.layer || (graphic.layerId && this.map.getLayer(graphic.layerId)) || {};
            feature._graphicsLayer = feature._layer;
            return feature;
        },
        getProjectName: function() {
            return location.pathname.split('/')[1];
        },
        getImagePath: function(icon) {
            return baseUrl + "/lib/gis/images/camera/" + (icon ? icon : '');
        }
    });
});

