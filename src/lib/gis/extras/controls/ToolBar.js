define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/on",

    "esri/layers/GraphicsLayer",
    "esri/toolbars/navigation",
    "esri/toolbars/draw",
    "esri/toolbars/edit",
    "esri/graphic",
    "extras/tools/MeasureDrawTool",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/Font",
    "esri/symbols/TextSymbol",
    "esri/toolbars/edit",
], function(
    declare,
    lang,
    array,
    on,

    GraphicsLayer,
    Navigation,
    Draw,
    Edit,
    Graphic,
    MeasureDrawTool,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    PictureMarkerSymbol,
    Font,
    TextSymbol,
    edit
) {
    var defaultPointSymbol=new SimpleMarkerSymbol({
        "color": [255, 255, 255, 64],
        "size": 24,
        "angle": -30,
        "xoffset": 0,
        "yoffset": 0,
        "type": "esriSMS",
        "style": "esriSMSCircle",
        "outline": {
            "color": [255, 0, 0, 255],
            "width": 3,
            "type": "esriSLS",
            "style": "esriSLSSolid"
        }
    });
    var defaultLineSymbol=new SimpleLineSymbol({
        type: "esriSLS",
        style: "esriSLSSolid",
        width: 2,
        color: [255, 0, 0, 255]
    });
    var defaultFillSymbol=new SimpleFillSymbol({
        type: "esriSFS",
        style: "esriSFSSolid",
        color: [0, 0, 0, 64],
        outline: {
            type: "esriSLS",
            style: "esriSLSSolid",
            width: 1.5,
            color: [255, 0, 0, 255]
        }
    });
    var baseUrl=[location.protocol, "//", location.host, "/", location.pathname.split('/')[1]].join('');
    return declare(null, {
        gisObject: null,
        map: null,
        constructor: function(gisObject) {
            this.gisObject = gisObject;

            //发布mapLoadedEvent监听
            dojo.subscribe("mapLoadedEvent", this, "initToolbar");
        },
        initToolbar: function(map) {
            this.map = map;
            try {
                this.navToolbar = new Navigation(this.map);
                this.drawToolbar = new Draw(this.map);
                this.editToolbar = new Edit(this.map);
                this.measureToolbar = new MeasureDrawTool(this.map);
                this.drawLayer = new GraphicsLayer({
                    id: "GXX_GIS_DRAW_LAYER"
                });
                this.trackLayer = new GraphicsLayer({
                    id: "GXX_GIS_ALL_TRACK_LAYER"
                });
                this.tmpTrackLayer = new GraphicsLayer({
                    id: "GXX_GIS_TEMP_TRACK_LAYER"
                });
                this.map.addLayer(this.drawLayer);
                this.map.addLayer(this.trackLayer);
                this.map.addLayer(this.tmpTrackLayer);
                this.pan();
            }
            catch(e) {

            }

            dojo.publish("toolBarLoadedEvent", [this]);
        },
        setMouseCursor: function(type) {
            var cur = baseUrl + '/themes/cursor/pan.ani';
            switch(+type) {
                case 1:
                    cur = baseUrl + '/themes/cursor/pan.ani';
                    break;
                case 2:
                    cur = baseUrl + '/themes/cursor/zoomin.ani';
                    break;
                case 3:
                    cur = baseUrl + '/themes/cursor/zoomout.ani';
                    break;
                case 4:
                    cur = baseUrl + '/themes/cursor/select_poly.ani';
                    break;
                case 5:
                    cur = baseUrl + '/themes/cursor/select_polyline.ani';
                    break;
                case 6:
                    cur = baseUrl + '/themes/cursor/select_polyline.ani';
                    break;
                case 7:
                    cur = baseUrl + '/themes/cursor/click.ani';
                    break;
                case 8:
                    cur = baseUrl + '/themes/cursor/Hand.cur';
                    break;
                case 9:
                    cur = baseUrl + '/themes/cursor/select_extent.ani';
                    break;
                case 10:
                    cur = baseUrl + '/themes/cursor/SunPositionTool.ani';
                    break;
            }
            //this.map.setMapCursor(cur);
            //dojo.byId(this.map.id).style.cursor = "url(" + cur + ")";
        },
        removeDrawGraphic: function(graphic) {
            if(graphic) {
                this.drawLayer.remove(graphic);
            }
        },
        draw: function(type, symbol, handler, handler_before, idKey) {
            var that = this;
            this.deactivateToolbar();
            this.map && this.map.disableMapNavigation();
            switch(type) {
                case Draw.POINT:
                case Draw.MULTI_POINT:
                    this.drawToolbar.setMarkerSymbol(symbol || defaultPointSymbol);
                    break;
                case Draw.POLYLINE:
                    this.drawToolbar.setLineSymbol(symbol || defaultLineSymbol);
                    break;
                case Draw.ARROW:
                    this.drawToolbar.setFillSymbol(symbol || defaultFillSymbol);
                    break;
                case Draw.POLYGON:
                    this.drawToolbar.setFillSymbol(symbol || defaultFillSymbol);
                    break;
                case Draw.CIRCLE:
                    this.drawToolbar.setFillSymbol(symbol || defaultFillSymbol);
                    break;
                case Draw.EXTENT:
                    this.drawToolbar.setFillSymbol(symbol || defaultFillSymbol);
                    break;
                default:
                    this.drawToolbar.setFillSymbol(symbol || defaultFillSymbol);
                    break;
            }
            this.drawEndHandler && this.drawEndHandler.remove();
            this.drawEndHandler = on(this.drawToolbar, "draw-end", dojo.hitch(this, function(geometry) {
                this.drawToolbar.deactivate();
                this.drawToolbar.drawing = false;
                this.map && this.map.enableMapNavigation();

                var graphic = new Graphic(geometry, symbol);
                idKey && (graphic.id = idKey);
                this.drawLayer.add(graphic);
                this.drawEndHandler && this.drawEndHandler.remove();
                if(handler) {
                    handler(graphic);
                }
            }));
            this.drawToolbar.activate(type);
            this.drawToolbar.drawing = true;
        },
        indraw: function(type, symbol, handler, handler_before, idKey) {
            var that = this;
            type = type.toLowerCase().replace(/_/g, "");

            this.deactivateToolbar();
            this.map && this.map.disableMapNavigation();

            this.drawToolbar.activate(type);
            var renderSymbol = symbol;
            switch(type) {
                case "point":
                case "multipoint":
                    renderSymbol = symbol || defaultPointSymbol;
                    this.drawToolbar.setMarkerSymbol(renderSymbol);
                    break;
                case "polyline":
                case "freehandpolyline":
                    renderSymbol = symbol || defaultLineSymbol;
                    this.drawToolbar.setLineSymbol(renderSymbol);
                    break;
                default:
                    renderSymbol = symbol || defaultFillSymbol;
                    this.drawToolbar.setFillSymbol(renderSymbol);
                    break;
            }

            this.indrawEndHandler && this.indrawEndHandler.remove();
            this.indrawEndHandler = on(this.drawToolbar, "draw-end", dojo.hitch(this, function(geometry) {
                this.drawToolbar.deactivate();
                this.map && this.map.enableMapNavigation();
                handler_before && handler_before();
                var graphic = new Graphic(geometry, renderSymbol);
                idKey && (graphic.id = idKey);
                this.drawLayer.add(graphic);
                this.indrawEndHandler && this.indrawEndHandler.remove();
                if(handler) {
                    handler(graphic);
                }
            }));


        },
        deactivateToolbar: function() {
            this.navToolbar.deactivate();
            this.drawToolbar.deactivate();
            this.measureToolbar.deactivate();
        },
        zoomIn: function() {
            this.setMouseCursor(2);
            this.deactivateToolbar();
            this.navToolbar.activate(Navigation.ZOOM_IN);
        },
        zoomOut: function() {
            this.setMouseCursor(3);
            this.deactivateToolbar();
            this.navToolbar.activate(Navigation.ZOOM_OUT);
        },
        pan: function() {
            this.setMouseCursor(1);
            this.deactivateToolbar();
            this.navToolbar.activate(Navigation.PAN);
        },
        fullExtent: function() {
            this.navToolbar.zoomToFullExtent();
        },
        previous: function() {
            this.navToolbar.zoomToPrevExtent();
        },
        next: function() {
            this.navToolbar.zoomToNextExtent();
        },
        measureLength: function() {
            this.deactivateToolbar();
            this.measureToolbar.activate(Draw.POLYLINE);
        },
        measureArea: function() {
            this.deactivateToolbar();
            this.measureToolbar.activate(Draw.POLYGON);
        },
        clearDrawLayer: function() {
            this.drawLayer && this.drawLayer.clear();
        },
        clearTrackLayer: function() {
            this.trackLayer && this.trackLayer.clear();
        },
        clearTmptrackLayer: function() {
            this.tmpTrackLayer && this.tmpTrackLayer.clear();
        },
        clearMeasureLayer: function() {
            this.measureToolbar.clearAll();
        },
        clear: function() {
            this.setMouseCursor(1);
            if(this.measureToolbar) {
                this.measureToolbar.clearAll();
            }
            if(this.map) {
                this.map.graphics.clear();
            }
            this.pan();
        },
        print: function() {

        },
        showMessageWidget: function() {

        },
        destroy: function() {
            this.clear();
            this.navToolbar = null;
            this.drawToolbar = null;
            this.measureToolbar = null;
            this.map = null;
            this.gisObject = null;
        },
        setCenter: function(x, y, zoom) {
            this.map.centerAtZoom();
        },
        getCenter: function() {
            return this.map.center;
        },
        getExtent: function() {
            return this.map.extent;
        },
        getScale: function() {
            return this.map.getScale();
        },
        zoomToExtent: function() {

        },
        getLayerByName: function(layerName) {

        },
        getLayerById: function(layerId) {
            this.map.getLayer(layerId);
        },
        bindMapEvents: function(evtName, bindFunction) {

        },
        showInfoWindow: function(geometry) {
            this.gisObject.layerLocate.unHightlightOnMap();
            //this.gisObject.layerLocate.locateByGeometry(geometry,null,true,true);
            //this.pan();
        }
    });
});


