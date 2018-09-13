define([
	"dojo/_base/declare",
	"dojo/on",
	"esri/graphic",
	"esri/SpatialReference",
	"esri/geometry/Point",
	"esri/geometry/Polyline",
	"esri/geometry/Polygon",
	"esri/geometry/Extent",
	"esri/geometry/Multipoint",
	"esri/geometry/webMercatorUtils",
	"esri/symbols/PictureMarkerSymbol",
	"esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
	"esri/layers/GraphicsLayer",
	"esri/dijit/PopupTemplate",
	"extras/graphic/InfoGraphicLayer",
	"extras/utils/GPSConvertor"
], function(
	declare,
	on,
	Graphic,
	SpatialReference,
	Point,
	Polyline,
	Polygon,
	Extent,
	Multipoint,
	webMercatorUtils,
	PictureMarkerSymbol,
	SimpleFillSymbol,
	SimpleLineSymbol,
	GraphicsLayer,
	PopupTemplate,
	InfoGraphicLayer,
	GPSConvertor
) {
	return declare(null, {
		constructor: function() {
			dojo.subscribe("toolBarLoadedEvent", this, "setToolbar");
			this.initLayer();
			this._infoTip = null;
			this._layerClickEvtHandle = null;
		},
		setToolbar: function(toolbar) {
			this.toolbar = toolbar;
			this.map = toolbar.map;
		},
		initLayer: function() {
			this.layerContainer = {};
		},
		addOneGraphicToMap: function(layerId, graphicObj, isClear) {
			if(typeof graphicObj == "string") {
				graphicObj = dojo.fromJson(graphicObj);
			}
			var layer = this.createLayerById(layerId, isClear);
			if(layer) {
				try {
					var idKey = graphicObj.id;
					var ptObj = graphicObj.geometry;
					var point = webMercatorUtils.geographicToWebMercator(new Point(ptObj.x, ptObj.y));
					var symbol = new PictureMarkerSymbol(graphicObj.symbol);
					var attributes = graphicObj.attributes;
					var graphic = new Graphic(point, symbol, attributes);
					graphic.id = idKey;
					layer.add(graphic);

					on(layer, "click", dojo.hitch(this, function(evt) {
						this.toolbar.showInfoWindow(evt.graphic);
					}));
				}
				catch(e) {

				}
			}
		},
		/**
		 * 删除所有图元
		 * layerId:图层id
		 * fn:回调函数
		 */
		removeAllGraphicFromMap: function(layerId, fn) {
			var layer = this.createLayerById(layerId, false);
			if(layer) {
				var code = 1;
				try {
					layer.clear();
				}
				catch(ex) {
					code = -1;
				}
				if(fn) {
					fn.apply(this, [{
						"code": code
					}]);
				}
			}
		},
		/**
		 * 删除gaphic
		 * layerId:图层id
		 * gId:graphic的唯一标识
		 * fn:回调函数
		 */
		removeGraphicFromMap: function(layerId, gId, fn) {
			var layer = this.createLayerById(layerId, false);
			if(layer) {
				var graphic = this.getGrahpicById(layer, gId);
				if(graphic) {
					var code = 1;
					try {
						layer.remove(graphic);
					}
					catch(ex) {
						code = -1;
					}

					if(fn) {
						fn.apply(this, [{
							"code": code
						}]);
					}
				}
			}
		},
		/**
		 * layerId:图层id
		 * graphicType:0:markger,1:polyline,2:polygon
		 * graphicObj:图形json对象
		 * isClear:是否需要先进行清洗数据
		 * fn:回调函数
		 */
		addGraphicToMap: function(layerId, graphicType, graphicObj, isClear, fn, fn1, fn2) {
			if(dojo.isString(graphicObj)) {
				graphicObj = dojo.fromJson(graphicObj);
			}
			var layer = this.createLayerById(layerId, isClear);
			this.addGraphic2Layer(layer, graphicObj, graphicType);
			if(fn) {
				this._layerClickEvtHandle = on(layer, "click", function(evt) {
					fn(evt);
				});
			}
			if(fn1) {
				this._layerMouseoverEvtHandle = on(layer, "mouse-over", function(evt) {
					fn1(evt);
				});
			}
			if(fn2) {
				this._layerMouseoutEvtHandle = on(layer, "mouse-out", function(evt) {
					fn2(evt);
				});
			}
		},
		createLayerById: function(layerId, isClear) {
			var layer = null;
			if(layerId) {
				layer = this.layerContainer[layerId];
				if(!layer) {
					try {
						layer = new InfoGraphicLayer({
							id: layerId
						});
					}
					catch(e) {
						layer = new GraphicsLayer({
							id: layerId
						});
					}
					//layer = new esri.layers.GraphicsLayer({id:layerId});
					this.map.addLayer(layer);
					this.layerContainer[layerId] = layer;

					on(layer, "click", function(evt) {
						try {
							graphicClickHandler(evt);
						}
						catch(e) {

						}
					});
				}
			}
			else {
				layer = this.map.graphics;
			}

			if(isClear) {
				layer.clear();
			}
			this.map.reorderLayer(layer, this.map._layers.length - 1);
			return layer;
		},
		/**
		 * @description 将图元添加到图层
		 * @param layer	图层
		 * @param graphicObj	图元配置项
		 * @param graphicType	图元类型	0:图标，1，2
		 */
		addGraphic2Layer: function(layer, graphicObj, graphicType) {
			var showpopuptype, graphicFeatureSet, attributes, geometry, symbol, infoTemplate, infoTemplateObj,idKey, orgId /**orgId -- 卡口ID*/ ;
			try {
				showpopuptype = graphicObj.showpopuptype; //默认0只显示文本，1显示图片，2显示视频，
				graphicFeatureSet = graphicObj.featureSet;
				if(!graphicFeatureSet) return;
				for(var i = 0, il = graphicFeatureSet.length; i < il; i++) {
					idKey = graphicFeatureSet[i].id;
					orgId = graphicFeatureSet[i].orgId;
					attributes = graphicFeatureSet[i].attributes;
					switch(graphicType) {
						case 0:
							var lon = parseFloat(graphicFeatureSet[i].geometry.x),
								lat = parseFloat(graphicFeatureSet[i].geometry.y);
							geometry = webMercatorUtils.geographicToWebMercator(new Point(lon, lat));
							symbol = new PictureMarkerSymbol(graphicFeatureSet[i].symbol);
							break;
						case 1:
							geometry = webMercatorUtils.geographicToWebMercator(new Polyline(graphicFeatureSet[i].paths));
							symbol = new SimpleLineSymbol(graphicFeatureSet[i].symbol);
							break;
						case 2:
							geometry = webMercatorUtils.geographicToWebMercator(new Polygon(graphicFeatureSet[i].rings));
							symbol = new SimpleFillSymbol(graphicFeatureSet[i].symbol);
							break;
					}
					var graphic = this.getGrahpicById(layer, idKey);
					if(graphic) {
						geometry && graphic.setGeometry(geometry);
						attributes && graphic.setAttributes(attributes);
						symbol && graphic.setSymbol(symbol);
						if(infoTemplate && infoTemplateObj) {
							if(showpopuptype == undefined) {
								//做其他处理
							}
							else if(showpopuptype == 0 || showpopuptype == 1) {
								this.map.infoWindow.resize(830, 430);
								infoTemplate = new PopupTemplate(infoTemplateObj);
								graphic.setInfoTemplate(infoTemplate);
							}
							else if(showpopuptype == 2) {}
							else if(showpopuptype == 3) {}
						}
					}
					else {
						graphic = new Graphic(geometry, symbol, attributes);
						graphic.id = idKey;
						graphic.orgId = orgId;
						if(infoTemplate && infoTemplateObj) {
							if(showpopuptype == undefined) {
								//做其他处理
							}
							else if(showpopuptype == 0 || showpopuptype == 1) {
								this.map.infoWindow.resize(630, 430);
								infoTemplate = new PopupTemplate(infoTemplateObj);
								graphic.setInfoTemplate(infoTemplate);
							}
							else if(showpopuptype == 2) {}
							else if(showpopuptype == 3) {}
						}
						layer.add(graphic);
					}
				}
			}
			catch(e) {
				throw new Error("图元添加到图层时错误!" + e);
			}
		},
		getGrahpicById: function(layer, idKey) {
			if(dojo.isString(layer)) {
				layer = this.map.getLayer(layer);
			}
			var graphicsArr = layer.graphics;
			for(var i = 0, il = graphicsArr.length; i < il; i++) {
				if(graphicsArr[i].id == idKey) {
					return graphicsArr[i];
				}
			}
			return null;
		},
		getLayerStyle: function() {

		},
		/**
		 * 获取图层
		 * @param
		 */
		getLayer: function(layerId) {
			return this.layerContainer[layerId];
		},
		/**
		 * 解绑图层点击事件
		 */
		offLayerClickEvt: function() {
			this._layerClickEvtHandle && this._layerClickEvtHandle.remove();
		},
		destroy: function() {
			for(var a in this.layerContainer) {
				this.layerContainer[a].destroy();
			}
			this.layerContainer = {};
		}
	});
});
