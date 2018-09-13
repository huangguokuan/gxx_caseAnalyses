define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/on",

    "esri/map",
    "esri/graphic",
    "esri/Color",
    "esri/SpatialReference",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/Extent",
    "esri/geometry/webMercatorUtils",
    "esri/symbols/PictureFillSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/renderers/ClassBreaksRenderer",
    "esri/dijit/PopupTemplate",

    "extras/controls/ToolBar",
    "extras/controls/LayerLocate",
    "extras/controls/LayerDraw",
    "extras/controls/MapControl",
    "extras/controls/LayerManager",
    "extras/controls/LayerQuery",
    "extras/InfoWindow",
    "extras/utils/MapUtil",
    "extras/utils/GPSConvertor",
    "extras/utils/MapCommonUtils",
    "extras/layer/FlareClusterLayer",
    "extras/symbol/ArrowLineSymbol"
], function(
    declare,
    lang,
    array,
    on,

    Map,
    Graphic,
    Color,
    SpatialReference,
    Point,
    Polyline,
    Extent,
    webMercatorUtils,
    PictureFillSymbol,
    SimpleFillSymbol,
    PictureMarkerSymbol,
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    ClassBreaksRenderer,
    PopupTemplate,

    ToolBar,
    LayerLocate,
    LayerDraw,
    MapControl,
    LayerManager,
    LayerQuery,
    InfoWindow,
    MapUtil,
    GPSConvertor,
    MapCommonUtils,
    FlareClusterLayer,
    ArrowLineSymbol
) {
    return declare(null, {
        mapId: null,
        map: null,
        mapParam: null,
        curLayer: {}, //当前加载图层
        baseLayer: [], //电子地图栅格图层
        imageLayer: [], //影像栅格图层
        currentOptions: null, //地图初始化参数
        displaySingleFlaresAtCount: 10,
        preClustered: false,
        areaDisplayMode: null,
        constructor: function(divId, options) {
            if(!dojo.byId(divId)) return;
            dojo.byId(divId).onselectstart = dojo.byId(divId).ondrag = function() {
                return false;
            }; //IE下去掉DIV选中状态(其他浏览器的通过样式-moz-user-select : none取消了)
            this.mapId = divId;

            //发布mapLoadedEvent监听
            dojo.subscribe("mapLoadedEvent", this, "loadMapCompelete");

            this.spatialReference = new SpatialReference({
                wkid: 102100
            });
            //图层树控制类
            this.layerManager = new LayerManager();
            //图层查询控制类
            this.layerQuery = new LayerQuery();
            //地图定位类
            this.layerLocate = new LayerLocate();
            //地图工具类
            this.toolbar = new ToolBar(this);
            //地图常用方法
            this.baseUtil = new MapUtil();
            //地图矢量图层操作
            this.layerDraw = new LayerDraw();
            //地图控件操作
            this.mapcontrol = new MapControl(this);

            this.mapCommonUtils = new MapCommonUtils();

            this.bms = {
                ip: null,
                port: null,
                userName: null,
                password: null
            };

            if(options) {
                this.setMapOptions(options);
            }
        },
        setMapOptions: function(mapParam) {
            this.currentOptions = {
                logo: false,
                slider: true,
                basemapToggle: false,
                coordinate: false,
                //extent: new esri.geometry.Extent({xmin:12557877.595482401,ymin:2596928.9267310356,xmax:12723134.450635016,ymax:2688653.360673282,spatialReference:this.spatialReference}),
                center: new Point(12615151.657772028, 2645790.939302407, this.spatialReference),
                //level: 10,
                zoom: 10
                //maxScale: 18,
                //maxZoom: 18
            };
            dojo.mixin(this.currentOptions, mapParam || {});
            if(this.map) {
                dojo.mixin(this.map, this.currentOptions);
            }
            else {
                this.map = new Map(this.mapId, this.currentOptions);
                this.map.spatialReference = new SpatialReference({
                    wkid: 102113
                });
                //this.map.setInfoWindow(infoWindow);
                var mapLoadHandle = on(this.map, "load", dojo.hitch(this, function(map) {
                    setTimeout(dojo.hitch(this, function() {
                        if(this.currentOptions.center) {
                            if(this.map.center !== this.currentOptions.center) {
                                //this.map.setExtent(params.extent);
                                // this.map.centerAndZoom(this.currentOptions.center, this.currentOptions.zoom || 10);
                            }
                        }
                        dojo.publish("mapLoadedEvent", [this.map]);
                    }), 1000);

                    if(this.currentOptions.basemapToggle) {
                        this.activeBasemapToggle();
                    }
                    if(this.currentOptions.coordinate) {
                        this.activeCoordianteTool();
                    }
                    mapLoadHandle.remove();
                }));
            }

            this.removeCurLayers();
        },
        addDefaultLayers: function() {
            var layerProp = [];
            if(gisConfig.mapType == "1") { // google map
                layerProp = [{
                    "id": "100",
                    "layerId": "GXX_XXXXX",
                    "online": false,
                    "name": "谷歌电子地图",
                    "suffix": "png",
                    "tileSize": "256",
                    "tileType": "googlemap",
                    "mapStyle": "roadmap",
                    "tile_url": gisConfig.maptiledCacheUrl
                }, {
                    "id": "101",
                    "layerId": "GXX_SATELLITE",
                    "online": false,
                    "visible": false,
                    "name": "谷歌电子地图",
                    "suffix": "jpg",
                    "tileSize": "256",
                    "featureType": 7,
                    "tileType": "googlemap",
                    "mapStyle": "Image",
                    "tile_url": gisConfig.maptiledCacheUrl
                }];
            }
            else if(gisConfig.mapType == "2") {
                layerProp = [{
                    "id": "800",
                    "layerId": 1307,
                    "online": false,
                    "name": "天地电子地图",
                    "suffix": "png",
                    "tileSize": "256",
                    "tileType": "tianditu",
                    "mapStyle": "roadmap",
                    "tile_url": gisConfig.maptiledCacheUrl
                }, {
                    "id": "900",
                    "layerId": 1308,
                    "online": false,
                    "name": "天地电子地图",
                    "suffix": "png",
                    "tileSize": "256",
                    "tileType": "tianditu",
                    "mapStyle": "image",
                    "visible": false,
                    "featureType": 7,
                    "tile_url": gisConfig.maptiledCacheUrl
                }, {
                    "id": "901",
                    "layerId": 1309,
                    "online": false,
                    "name": "电子地图",
                    "suffix": "png",
                    "tileSize": "256",
                    "tileType": "tianditu",
                    "mapStyle": "image_anno",
                    "visible": false,
                    "featureType": 7,
                    "tile_url": gisConfig.maptiledCacheUrl
                }, {
                    "id": "902",
                    "layerId": 1310,
                    "online": false,
                    "name": "电子地图",
                    "suffix": "png",
                    "tileSize": "256",
                    "tileType": "tianditu",
                    "mapStyle": "anno",
                    "tile_url": gisConfig.maptiledCacheUrl
                }];
            }

            this.addLayers(layerProp);
        },
        /**
         * 添加地图图层
         * @param {Object} layers
         */
        addLayers: function(layers) {
            if(!(layers instanceof Array)) {
                layers = [layers];
            }

            dojo.forEach(layers, dojo.hitch(this, function(layerObj, index) {
                var layer = this.createLayer(layerObj);
                if(layer) {
                    this.map.addLayer(layer);
                    //判断是电子地图还是影像图
                    if(layerObj.featureType == "7") {
                        this.imageLayer.push(layer); //影像图
                    }
                    else {
                        this.baseLayer.push(layer); //电子地图
                    }
                    this.curLayer[layerObj.name + "_" + layerObj.id] = layer;
                }
            }));
        },
        createLayer: function(layerObj) {
            var layerType = layerObj.tileType.toLowerCase();
            if(layerType == "tiled") {
                return this.createTiledLayer(layerObj);
            }
            else if(layerType == "dynamic") {
                return this.createDynamicLayer(layerObj);
            }
            else if(layerType == "graphiclayer") {
                return this.createGraphicLayer(layerObj);
            }
            else if(layerType == "feature") {
                return this.createFeatureLayer(layerObj);
            }
            else if(layerType == "image") {
                return this.createImageLayer(layerObj);
            }
            else if(layerType == "wms") {
                return this.createWMSLayer(layerObj);
            }
            else if(layerType == "wfs") {
                return this.createWFSLayer(layerObj);
            }
            else if(layerType == "googlemap") {
                return this.createGoogleMapLayer(layerObj);
            }
            else if(layerType == "baidumap") {
                return this.createBaiDuMapLayer(layerObj);
            }
            else if(layerType == "tianditu") {
                return this.createTianDiTuLayer(layerObj);
            }
        },
        activeBasemapToggle: function() {
            var that = this,
                mapDiv, $CustomBasemapToggle = dojo.byId("CustomBasemapToggle");
            if(!$CustomBasemapToggle) {
                mapDiv = dojo.byId(this.map.id);
                dojo.style(mapDiv, 'position', 'relative');
                mapDiv.appendChild(this.createSwitchMapPanel());
                $CustomBasemapToggle = dojo.byId("CustomBasemapToggle");
            }
            on($CustomBasemapToggle, 'click', function() {
                var basemapBG = dojo.query('.basemapBG', this)[0],
                    basemapTitle = dojo.query('.basemapTitle', this)[0];
                if(dojo.attr(basemapBG, 'title') == '地形图') {
                    dojo.attr(basemapBG, 'title', '影像图');
                    dojo.attr(basemapTitle, 'title', '影像图');
                    dojo.style(basemapBG, 'backgroundImage', 'url(' + gisConfig.sourcePath + 'images/basemap/satellite.jpg)')
                    basemapTitle.innerText = '影像图';

                    that.switchSatelliteMap();
                }
                else {
                    dojo.attr(basemapBG, 'title', '地形图');
                    dojo.attr(basemapTitle, 'title', '地形图');
                    dojo.style(basemapBG, 'backgroundImage', 'url(' + gisConfig.sourcePath + 'images/basemap/topo.jpg)');
                    basemapTitle.innerText = '地形图';

                    that.switchRoadMap();
                }
            });
        },
        createSwitchMapPanel: function() {
            var position = this.map.position,
                basemapToggle = '<div class="BasemapToggle" role="presentation" style="display: block;position: absolute; z-index: 0;" id="CustomBasemapToggle">'
                + '<div class="basemapContainer">'
                + '<div title="切换底图" role="button" class="toggleButton topo" tabindex="0">'
                + '<div class="basemapImageContainer">'
                + '<div class="basemapImage">'
                + '<div class="basemapBG" style="background-image:url(' + gisConfig.sourcePath + 'images/basemap/topo.jpg)" title="地形图"></div>'
                + '</div>'
                + '<div title="地形图" class="basemapTitle">地形图</div>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>';
            basemapToggle = dojo._toDom(basemapToggle);
            dojo.style(basemapToggle, {
                'top': '10px', //( (position.y || 0) + 10 )+'px'
                'right': 10 + 'px'
            });
            return basemapToggle;
        },
        switchRoadMap: function() {
            dojo.forEach(this.imageLayer, function(layerObj, index) {
                layerObj.setVisibility(false);
            });

            dojo.forEach(this.baseLayer, function(layerObj, index) {
                layerObj.setVisibility(true);
            });
        },
        switchSatelliteMap: function() {
            dojo.forEach(this.baseLayer, function(layerObj, index) {
                layerObj.setVisibility(false);
            });

            dojo.forEach(this.imageLayer, function(layerObj, index) {
                layerObj.setVisibility(true);
            });
        },
        setInitCenter: function(x, y, zoom) {
            var xys = webMercatorUtils.lngLatToXY(x, y);
            var centerPt = new Point(xys[0], xys[1], this.spatialReference);
            if(this.map) {
                this.map.centerAndZoom(centerPt, parseInt(zoom) || 10);
            }
        },
        addZoomBar: function() {
            if(!this.zoomBar) {
                this.zoomBar = "";
            }
            return this.zoomBar;
        },
        activeCoordianteTool: function() {
            var that = this,
                mapDiv, $CustomCoordinate = dojo.byId("CustomCoordinate");
            if(!$CustomCoordinate) {
                mapDiv = dojo.byId(this.map.id);
                dojo.style(mapDiv, 'position', 'relative');
                mapDiv.appendChild(this.createCoordinate());
                $CustomCoordinate = dojo.byId("CustomCoordinate");
            }
            var lnglat = dojo.query('span', $CustomCoordinate)[0];
            var longitude = dojo.query('.longitude', $CustomCoordinate)[0],
                latitude = dojo.query('.latitude', $CustomCoordinate)[0],
                longitudeText = dojo.query('span', longitude)[0],
                latitudeText = dojo.query('span', latitude)[0];
            /**
             * [solve IE8鼠标移动拾取坐标与滚轮事件冲突]
             * @param  {[type]} timer [新增节流函数，解决在IE8下mouseMove与mouseWheel同时触发的冲突]
             * @param  {[type]} innerHTML [将原EXT的textContent改为innerHTML以兼容IE8]
             * @return {[type]}        [setTimeout节流函数约定在时间间隔内可触发，节省性能开销]
             */
            var timer = null;
            on(this.map, 'mousemove', function(evt) {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    var mapPoint = evt.mapPoint;
                    var mapGoemetry = webMercatorUtils.webMercatorToGeographic(new Point(mapPoint.x, mapPoint.y));
                    longitudeText.innerHTML = ('' + mapGoemetry.x).slice(0, 9);
                    latitudeText.innerHTML = ('' + mapGoemetry.y).slice(0, 9);
                }, 50);
            });
        },
        createCoordinate: function() {
            var coorHtml = '<div id="CustomCoordinate" style="position: absolute;font-size: 12px; font-weight: bold;">' +
                '<p class="longitude" style="margin-bottom: 0; display: inline-block;"><label>x: </label><span></span></p>' +
                '<p class="latitude" style="margin-bottom: 0; display: inline-block;margin-left: 5px;"><label>y: </label><span></span></p>' +
                '</div>';
            coorHtml = dojo._toDom(coorHtml);
            dojo.style(coorHtml, {
                'bottom': '2px',
                'left': '10px'
            });
            return coorHtml;
        },
        addCoordinate: function() {
            if(!this.mousePosition) {

            }
            return addCoordinate;
        },
        /**
         * TODO 需要baseLayer
         * @param {} params
         * @param {} srcNodeRef
         * @return {}
         */
        addOverViewerMap: function(params, srcNodeRef) {
            var that = this;
            if(!this.omap) {
                require(["esri/dijit/OverviewMap"], function(OverviewMap) {
                    var settings = {
                        map: that.map,
                        color: "#D84E13",
                        visible: true,
                        attachTo: 'bottom-right'
                    };
                    lang.mixin(settings, params || {});
                    that.omap = new OverviewMap(settings, srcNodeRef && dojo.byId(srcNodeRef));
                });
                /*dojo.require("esri.dijit.OverviewMap");
                var settings = {
                    map: this.map,
                    color: "#D84E13",`
                    visible: true,
                    attachTo: 'bottom-right'
                };
                dojo._base.lang.mixin(settings, params || {});
                this.omap = new esri.dijit.OverviewMap(settings, srcNodeRef && dojo.byId(srcNodeRef));
                this.omap.startup();*/
            }
            return this.omap;
        },
        loadMapCompelete: function(map) {
            var that = this;
            require(["extras/widget/ToolPanelWidget"], function(ToolPanelWidget) {
                var theDiv = document.createElement("div");
                var mapDiv = dojo.byId(that.map.id);
                mapDiv.appendChild(theDiv);
            });
            /*dojo.require("extras.widget.ToolPanelWidget");
            var theDiv = document.createElement("div");
            var mapDiv = dojo.byId(this.map.id);
            mapDiv.appendChild(theDiv);*/

        },
        addToolPanel: function() {
            var that = this;
            if(!this.toolPanel) {
                require(["extras/widget/ToolPanelWidget"], function(ToolPanelWidget) {
                    that.toolPanel = new ToolPanelWidget(that);
                    that.toolPanel.startup();
                });
                /*dojo.require("extras.widget.ToolPanelWidget");
                this.toolPanel = new extras.widget.ToolPanelWidget(this);
                this.toolPanel.startup();*/
            }
            return this.toolPanel;
        },
        /**
         * 添加比例尺
         * @param {object} params
         * @param {object} params.map
         * @param {string} params.attachTo
         * @param {string} params.scalebarUnit
         * @param {object} srcNodeRef
         * @return {}
         */
        addScalebar: function(params, srcNodeRef) {
            var that = this;
            if(!this.scalebar) {
                require(["esri/dijit/Scalebar"], function(Scalebar) {
                    var scaleSettings = {
                        map: that.map,
                        scalebarStyle: 'line',
                        scalebarUnit: "metric"
                    };
                    lang.mixin(scaleSettings, params || {});
                    that.scalebar = new Scalebar(scaleSettings, srcNodeRef && dojo.byId(srcNodeRef));
                });
                /*dojo.require("esri.dijit.Scalebar");
                var scaleSettings = {
                    map: this.map,
                    scalebarStyle: 'line',
                    scalebarUnit: "metric"
                };
                dojo._base.lang.mixin(scaleSettings, params || {});
                this.scalebar = new esri.dijit.Scalebar(scaleSettings, srcNodeRef && dojo.byId(srcNodeRef));*/
            }
            return this.scalebar;
        },
        addRightMenu: function() {
            if(!this.rightMenu) {

            }
            else {

            }
            return this.rightMenu;
        },
        addLayerLabel: function() {
            if(!this.label) {

            }
            return this.label;
        },
        createTiledLayer: function(layerObj) {
            var layer;
            require(["esri/layers/ArcGISTiledMapServiceLayer"], function(ArcGISTiledMapServiceLayer) {
                layer = new ArcGISTiledMapServiceLayer(layerObj);
            });
            return layer;
            /*dojo.require("esri.layers.ArcGISTiledMapServiceLayer");
            var layer = new esri.layers.ArcGISTiledMapServiceLayer(layerObj);
            return layer;*/
        },
        createGraphicLayer: function(layerObj) {
            var layer;
            require(["esri/layers/GraphicsLayer"], function(GraphicsLayer) {
                layer = new GraphicsLayer(layerObj);
            });
            return layer;
            /*dojo.require("esri.layers.GraphicsLayer");
            var layer = new esri.layers.GraphicsLayer(layerObj);
            return layer;*/
        },
        createDynamicLayer: function(layerObj) {
            var layer;
            require(["esri/layers/ArcGISDynamicMapServiceLayer"], function(ArcGISDynamicMapServiceLayer) {
                layer = new ArcGISDynamicMapServiceLayer(layerObj);
            });
            return layer;
            /*dojo.require("esri.layers.ArcGISDynamicMapServiceLayer");
            var layer = new esri.layers.ArcGISDynamicMapServiceLayer(layerObj);
            return layer;*/
        },
        createFeatureLayer: function(layerObj) {
            var layer;
            require(["esri/layers/FeatureLayer"], function(FeatureLayer) {
                layer = new FeatureLayer(layerObj);
            });
            return layer;
        },
        createImageLayer: function(layerObj) {
            var layer;
            require(["esri/layers/ArcGISImageServiceLayer"], function(ArcGISImageServiceLayer) {
                layer = new ArcGISImageServiceLayer(layerObj);
            });
            return layer;
            /*dojo.require("esri.layers.ArcGISImageServiceLayer");
            var layer = new esri.layers.ArcGISImageServiceLayer(layerObj);
            return layer;*/
        },
        createWMSLayer: function(layerObj) {
            var layer;
            require(["esri/layers/WMSLayer"], function(WMSLayer) {
                layer = new WMSLayer(layerObj);
            });
            return layer;
            /*dojo.require("esri.layers.WMSLayer");
            var layer = new esri.layers.WMSLayer(layerObj);
            return layer;*/
        },
        createWFSLayer: function(layerObj) {
            var layer;
            require(["esri/layers/WFSLayer"], function(WFSLayer) {
                layer = new WFSLayer(layerObj);
            });
            return layer;
            /* dojo.require("esri.layers.WFSLayer");
             var layer = new esri.layers.WFSLayer(layerObj);
             return layer;*/
        },
        createGoogleMapLayer: function(layerObj) {
            var layer;
            require(["extras/layer/GoogleTiledMap"], function(GoogleTiledMap) {
                layer = new GoogleTiledMap(layerObj);
            });
            return layer;
            /*dojo.require("extras.layer.GoogleTiledMap");
            var layer = new extras.layer.GoogleTiledMap(layerObj);
            return layer;*/
        },
        createBaiDuMapLayer: function(layerObj) {
            var layer;
            require(["extras/layer/BaiduTiledMap"], function(BaiduTiledMap) {
                layer = new BaiduTiledMap(layerObj);
            });
            return layer;
            /*var layer = new extras.layer.BaiduTiledMap(layerObj);
            return layer;*/
        },
        createTianDiTuLayer: function(layerObj) {
            var layer;
            require(["extras/layer/TianDiTuTiledMap"], function(TianDiTuTiledMap) {
                layer = new TianDiTuTiledMap(layerObj);
            });
            return layer;
            /*dojo.require("extras.layer.TianDiTuTiledMap");
            var layer = new extras.layer.TianDiTuTiledMap(layerObj);
            return layer;*/
        },
        removeCurLayers: function() {
            this.curLayer = {};
            this.baseLayer = [];
            this.imageLayer = [];
        },
        destroy: function() {
            if(this.mapcontrol) {
                this.mapcontrol.destroy();
            }
            this.infoCloseHandle && this.infoCloseHandle.remove();
            /*if(this.infoCloseHandle) {
                dojo.disconnect(this._infoCloseHandle);
            }*/
            if(this.zoomBar) {
                this.zoomBar.destroy();
                this.zoomBar = null;
            }
            if(this.omap) {
                this.omap.destroy();
                this.omap = null;
            }
            if(this.scalebar) {
                this.scalebar.destroy();
                this.scalebar = null;
            }
            if(this.rightMenu) {
                this.rightMenu.clearBufferResult();
            }
            if(this.label) {
                this.label.destroy();
                this.label = null;
            }
            if(this.toolbar) {
                this.toolbar.destroy();
            }

            if(this.map != null) {
                /*if(this.map.layers){
                    for(var i = 0,il = this.map.layers.length;i < il; ++i){
                        if(this.map.layers[i].CLASS_NAME == "AG.MicMap.Layer.Vector"){
                            this.map.layers[i].removeAllFeatures();
                        }
                    }
                }*/
                this.map.destroy();
                this.map = null;
            }
        },
        drawDefaultTrack: function() {
            var picSymbol = new PictureMarkerSymbol();
            picSymbol.setUrl(selfUrl + "/themes/default/img/filled-arrow.png");
            picSymbol.setHeight(12);
            picSymbol.setWidth(12);


            /*var basicOptions = {
                    style: esri.symbols.SimpleLineSymbol.STYLE_DASH,
                    color: new esri.Color([51, 102, 255]),
                    width: 2,
                    directionSymbol: "arrow1",
                    directionPixelBuffer: 60,
                    directionColor: new esri.Color([204, 51, 0]),
                    directionSize: 14
            };*/

            var pgOptions = {
                style: SimpleLineSymbol.STYLE_SOLID,
                color: new Color([255, 0, 0]),
                width: 3,
                directionSymbol: "arrow3",
                directionPixelBuffer: 80,
                directionColor: new Color([255, 0, 0]),
                directionSize: 16,
                directionScale: 1
            };

            var basicSymbol = new ArrowLineSymbol(pgOptions);
            var points = [
                [113.316, 23.12],
                [113.3474, 23.1315],
                [113.3655, 23.11393]
            ];
            var basicPolyline = webMercatorUtils.geographicToWebMercator(new Polyline(points));
            var bg = new Graphic(basicPolyline, basicSymbol, {}, null);
            //graphicsLayer.add(bg);
            if(this.toolbar.drawLayer) {
                this.toolbar.drawLayer.add(bg);
            }

            basicSymbol.stopAnimation();
            basicSymbol.animateDirection(20, 350);
        },
        loadDefaultCluster: function() {
            var clusterLayer = new FlareClusterLayer({
                id: "flare-cluster-layer",
                spatialReference: this.spatialReference,
                subTypeFlareProperty: "facilityType",
                singleFlareTooltipProperty: "name",
                displaySubTypeFlares: true,
                displaySingleFlaresAtCount: this.displaySingleFlaresAtCount,
                flareShowMode: "mouse",
                preClustered: this.preClustered,
                clusterRatio: 65,
                clusterAreaDisplay: this.areaDisplayMode,
                clusteringBegin: function() {
                    // console.log("clustering begin");
                },
                clusteringComplete: function() {
                    // console.log("clustering complete");
                }
            });

            var defaultSym = new SimpleMarkerSymbol().setSize(6).setColor("#FF0000").setOutline(null);
            var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");
            var xlSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 32, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([200, 52, 59, 0.8]), 1), new dojo.Color([250, 65, 74, 0.8]));
            var lgSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 28, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([41, 163, 41, 0.8]), 1), new dojo.Color([51, 204, 51, 0.8]));
            var mdSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 24, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([82, 163, 204, 0.8]), 1), new dojo.Color([102, 204, 255, 0.8]));
            var smSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 22, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([230, 184, 92, 0.8]), 1), new dojo.Color([255, 204, 102, 0.8]));
            renderer.addBreak(0, 19, smSymbol);
            renderer.addBreak(20, 150, mdSymbol);
            renderer.addBreak(151, 1000, lgSymbol);
            renderer.addBreak(1001, Infinity, xlSymbol);


            if(this.areaDisplayMode) {
                //if area display mode is set. Create a renderer to display cluster areas. Use SimpleFillSymbols as the areas are polygons
                var defaultAreaSym = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_SOLID).setColor(new dojo.Color([0, 0, 0, 0.2])).setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0, 0.3]), 1));
                var areaRenderer = new ClassBreaksRenderer(defaultAreaSym, "clusterCount");
                var xlAreaSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([200, 52, 59, 0.8]), 1), new dojo.Color([250, 65, 74, 0.8]));
                var lgAreaSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([41, 163, 41, 0.8]), 1), new dojo.Color([51, 204, 51, 0.8]));
                var mdAreaSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([82, 163, 204, 0.8]), 1), new dojo.Color([102, 204, 255, 0.8]));
                var smAreaSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([230, 184, 92, 0.8]), 1), new dojo.Color([255, 204, 102, 0.8]));

                areaRenderer.addBreak(0, 19, smAreaSymbol);
                areaRenderer.addBreak(20, 150, mdAreaSymbol);
                areaRenderer.addBreak(151, 1000, lgAreaSymbol);
                areaRenderer.addBreak(1001, Infinity, xlAreaSymbol);

                //use the custom overload of setRenderer to include the renderer for areas.
                clusterLayer.setRenderer(renderer, areaRenderer);
            }
            else {
                clusterLayer.setRenderer(renderer); //use standard setRenderer.
            }

            //set up a popup template
            var template = new PopupTemplate({
                title: "{name}",
                fieldInfos: [{
                        fieldName: "facilityType",
                        label: "Facility Type",
                        visible: true
                    },
                    {
                        fieldName: "postcode",
                        label: "Post Code",
                        visible: true
                    },
                    {
                        fieldName: "isOpen",
                        label: "Opening Hours",
                        visible: true
                    }
                ]
            });
            clusterLayer.infoTemplate = template;
            this.map.infoWindow.titleInBody = false;
            this.map.addLayer(clusterLayer);

            var data = [];
            for(var i = 0, il = 5000; i < il; i++) {
                var aa = webMercatorUtils.xyToLngLat(12557877.595482401, 2596928.9267310356, true);
                var bb = webMercatorUtils.xyToLngLat(12723134.450635016, 2688653.360673282, true);
                var ptX = this.getRandom(aa[0], bb[0]);
                var ptY = this.getRandom(aa[1], bb[1]);

                var pt = webMercatorUtils.geographicToWebMercator(new Point(ptX, ptY));

                data.push({
                    "name": "cluster_" + i,
                    "facilityType": "Gxx_" + (i % 10),
                    "x": pt.x,
                    "y": pt.y
                });
            }

            clusterLayer.addData(data);
            //clusterLayer.refresh();
        },
        /**
         *
         * @param {object} options
         * @param {string} options.layerId
         *
         * @param {object} options.defaultSym
         * @param {string} options.title
         * @param {array} options.fieldInfos
         *
         * @param {object} options.popupTemplate
         * @param {array} options.data
         * @return {}
         */
        loadCluster: function(options) {
            options = options || {};
            var clusterLayer = this.map.getLayer(options.layerId || "flare-cluster-layer"),
                defaultSym;
            if(clusterLayer) {
                clusterLayer.refresh();
                //            clusterLayer.clear();
            }
            else {
                clusterLayer = new FlareClusterLayer({
                        id: options.layerId || "flare-cluster-layer",
                        spatialReference: this.spatialReference,
                        subTypeFlareProperty: "facilityType",
                        singleFlareTooltipProperty: "name",
                        displaySubTypeFlares: true,
                        displaySingleFlaresAtCount: this.displaySingleFlaresAtCount,
                        flareShowMode: "mouse",
                        preClustered: this.preClustered,
                        clusterRatio: 65,
                        clusterAreaDisplay: this.areaDisplayMode,
                        clusteringBegin: function() {
                            //                   window.console && console.log("clustering begin");
                        },
                        clusteringComplete: function() {
                            //                   window.console && console.log("clustering complete");
                        }
                    }),
                    defaultSym = new SimpleMarkerSymbol().setSize(6).setColor("#FF0000").setOutline(null);

                if(options.defaultSym && options.defaultSym.url) {
                    if(options.defaultSym.url.indexOf(this.mapCommonUtils.getProjectName()) === -1) {
                        options.defaultSym.url = this.mapCommonUtils.getImagePath() + options.defaultSym.url;
                    }
                    var sym = dojo.mixin({
                        url: this.mapCommonUtils.getImagePath() + "/camera/camera_normal_icon.png",
                        width: 15,
                        height: 15
                    }, options.defaultSym);
                    defaultSym = new PictureMarkerSymbol(sym);
                }

                // Render Symbol Of Cluster Points
                var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount"),
                    xlSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 32, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([200, 52, 59, 0.8]), 1), new dojo.Color([250, 65, 74, 0.8])),
                    lgSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 28, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([41, 163, 41, 0.8]), 1), new dojo.Color([51, 204, 51, 0.8])),
                    mdSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 24, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([82, 163, 204, 0.8]), 1), new dojo.Color([102, 204, 255, 0.8])),
                    smSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 22, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([230, 184, 92, 0.8]), 1), new dojo.Color([255, 204, 102, 0.8]));

                renderer.addBreak(0, 19, smSymbol);
                renderer.addBreak(20, 150, mdSymbol);
                renderer.addBreak(151, 1000, lgSymbol);
                renderer.addBreak(1001, Infinity, xlSymbol);

                clusterLayer.setRenderer(renderer);

                //set up a popup template
                if(options.popupTemplate && typeof options.popupTemplate == 'object') {
                    clusterLayer.infoTemplate = new PopupTemplate(options.popupTemplate);
                    this.map.infoWindow.titleInBody = false;
                }
                else {
                    clusterLayer.infoTemplate = null;
                }
                // Add Cluster Layer To Map
                this.map.addLayer(clusterLayer);
            }
            // Add Data Which Will Be Renderred
            clusterLayer.addData(options.data);
            options.eventsHandler && clusterLayer.on('click', dojo.hitch(this, function(e) {
                this.map.enablePan();
                options.eventsHandler(e);
            }));
            clusterLayer.on('mouse-down', dojo.hitch(this, function() {
                this.map.disablePan();
            }));
            clusterLayer.on('mouse-up', dojo.hitch(this, function() {
                this.map.enablePan();
            }));
            clusterLayer.on('mouse-drag', dojo.hitch(this, function() {
                this.map.enablePan();
            }));
            return clusterLayer;
        },

        getRandom: function(max, min) {
            return min + Math.random() * (max - min);
        },

        //  ======  Added 2017/3/23

        getLayerByLayerID: function(layerID) {
            return layerID ? this.map.getLayer(layerID) : null;
        },
        // TODO just for cluster layer
        getGraphicByGraphicID: function(graphicID, layerID) {
            if(!(graphicID && layerID)) return;
            var layer = this.getLayerByLayerID(layerID);
            if(!layer) return null;

            var graphics = layer.allData, //layer.graphics.length ? layer.graphics : layer.allData
                findGraphic = null;

            dojo.forEach(graphics, function(graphic, index) {
                if(graphic.id === graphicID) {
                    findGraphic = graphic;
                    return false;
                }
            });
            return findGraphic;
        },
        centerAndZoom: function(geometry) {
            geometry = arguments.length === 2 ? new Point(arguments[0], arguments[1]) : arguments[0];
            var level = arguments[1] || (this.map.getMaxZoom());
            return this.map.centerAndZoom(geometry, level);
            //return this.map.centerAndZoom(geometry);
        },
        centerAt: function(geometry) {
            geometry = arguments.length === 2 ? new Point(arguments[0], arguments[1]) : arguments[0];
            return this.map.centerAt(geometry);
        },
        isWebMercator: function(reference) {
            var resultFlag = false;
            var refs = {
                100112: true,
                102113: true,
                102100: true,
                3857: true,
                3785: true
            };
            return !!refs[reference.wkid];

        },
        /**
         * 获取点或者面中心Point
         * @param graphic
         * @returns Point
         */
        getCenterPoint: function(graphic) {
            //点
            if(graphic.geometry.type == 'point') {
                return graphic.geometry;
            }
            //面
            else if(graphic.geometry.type == 'polygon') {
                return graphic.getCentroid();
            }
        },
        test: function(x, y) {

            var pointObj = GPSConvertor.transferWgs84ToBaidu(x, y);

            var pt01 = webMercatorUtils.geographicToWebMercator(new Point(pointObj.lon, pointObj.lat));
            var pt02 = MapUtil.geographicToWebMercator(new Point(x, y));
        }
    });
});
