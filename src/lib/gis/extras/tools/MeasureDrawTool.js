/**
 * 测量工具类
 */


define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/_base/event",
	//"dojo/_base/color",
	"esri/toolbars/draw",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleFillSymbol",
	"esri/symbols/PictureMarkerSymbol",
	"esri/symbols/Font",
	"esri/symbols/TextSymbol",
	"esri/layers/GraphicsLayer",
	"esri/graphic",
	"esri/Color",
	"esri/units",
	"esri/geometry/geodesicUtils",
	"esri/geometry/Extent",
	"esri/geometry/webMercatorUtils"
], function(
	declare,
	on,
	event,
	//dojoColor,
	Draw,
	SimpleMarkerSymbol,
	SimpleLineSymbol,
	SimpleFillSymbol,
	PictureMarkerSymbol,
	Font,
	TextSymbol,
	GraphicsLayer,
	Graphic,
	Color,
	units,
	geodesicUtils,
	Extent,
	webMercatorUtils
) {
	var measureTotal=0;
	return declare([Draw], {
		DISTANCE: "distance",
		AREA: "area",
		AREARPRE: "measure_area_",
		DISTANCEPRE: "measure_distance_",
		drawType: null,
		points: [],
		latestEndPoint: null,
		lastClickPoint: null,
		isRunning: false,
		lineSymbol: null,
		fillSymbol: null,
		measureLayer: null,
		constructor: function(map, options) {
			this.inherited(arguments);
			this.points = [];
			this._onMapClickHandler = dojo.hitch(this, this._onMapClickHandler);
			//this._onMapDoubleClickHandler = dojo.hitch(this, this._onMapDoubleClickHandler);
			this._onDrawEndHandler = dojo.hitch(this, this._onDrawEndHandler);
			this._closeGraphicHandler = dojo.hitch(this, this._closeGraphicHandler);
			this.measureLayer = new GraphicsLayer({
				id: "GXX_GIS_MEAREALAYER_RESULT"
			});
			if(this.map) {
				this.map.addLayer(this.measureLayer);
			}
			//this.lineSymbol = new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleFillSymbol.STYLE_SOLID,"#FF7839",1,2);
			//this.fillSymbol = new esri.symbols.SimpleFillSymbol(esri.symbols.SimpleFillSymbol.STYLE_SOLID,"#FF372D",0.39,new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID,"#FF7839",1,2));
		},
		activate: function(geometryType, options) {
			var that = this;
			this.panning = false;
			this.map.disablePan();
			this.inherited(arguments);
			this.drawType = geometryType;
			var map = this.map;
			map.reorderLayer(this.measureLayer, map._layers.length - 1);

			this._onMapClickHandler_connect = on(map, "click", this._onMapClickHandler);
			this._onMoveHandler_connect = on(map, "mouse-move", this.throttle(this._onMoveHandler, 100, 200));
			//this._onMapDoubleClickHandler_connect = on(map,"onDblClick", this._onMapDoubleClickHandler);
			this._onDrawEndHandler_connect = on(this, "draw-end", this._onDrawEndHandler);
			this.points = [];
			this.isRunning = true;
			this.setTipsText("单击开始测量");
		},
		deactivate: function() {
			this.inherited(arguments);
			this.map.enablePan();
			clearInterval(this.interval);
			this._onMapClickHandler_connect && this._onMapClickHandler_connect.remove();
			this._onMoveHandler_connect && this._onMoveHandler_connect.remove();
			this._onMapDoubleClickHandler_connect && this._onMapDoubleClickHandler_connect.remove();
			this._onDrawEndHandler_connect && this._onDrawEndHandler_connect.remove();

			if(this.isRunning) {
				var suffix = this.drawType = Draw.POLYGON ? this.AREARPRE : this.DISTANCEPRE;
				var tmpId = suffix + measureTotal;
				this.deleteGraphicById(tmpId);
				this.isRunning = false;
			}
		},
		_onMapClickHandler: function(evt) {
			var endPoint = evt.mapPoint;
			this.lastClickPoint = endPoint;
			this.points.push(this.lastClickPoint);

			var num = 0;
			if(this.drawType == Draw.POLYGON) {
				this.updateMeasureArea();
				num = 2;
			}
			else if(this.drawType == Draw.POLYLINE) {
				this.updateMeasureDistance();
				num = 1;
			}

			if(this.points.length >= num) {
				this.setTipsText("双击结束测量");
			}
			else {
				this.setTipsText("单击继续绘制");
			}
		},
		throttle: function(func, wait, mustRun) {
			var that = this;
			var start = new Date().getTime();
			var timeout = null;
			return function() {
				clearTimeout(timeout);
				var now = new Date().getTime();
				if(now - start >= mustRun) {
					start = now;
					func.apply(that, arguments);
				}
				else {
					timeout = setTimeout(function() {
						func.apply(that, arguments);
					}, wait);
				}
			};
		},
		_onMoveHandler: function(e) {
			var that = this,
				extent;
			if(e) {
				clearInterval(this.interval);
				if(e.screenPoint.x <= 10) {
					this.interval = setInterval(function() {
						if(!that.panning) {
							extent = that.map.extent;
							that.panning = true;
							that.map.setExtent(new Extent(extent.xmin - 1500, extent.ymin, extent.xmax - 1500, extent.ymax, extent.spatialReference)).then(function() {
								that.panning = false;
							});
						}
					}, 100);
				}
				else if(e.screenPoint.y <= 10) {
					this.interval = setInterval(function() {
						if(!that.panning) {
							extent = that.map.extent;
							that.panning = true;
							that.map.setExtent(new Extent(extent.xmin, extent.ymin + 1500, extent.xmax, extent.ymax + 1500, extent.spatialReference)).then(function() {
								that.panning = false;
							});
						}
					}, 100);
				}
				else if(e.screenPoint.x >= this.map.width - 10) {
					this.interval = setInterval(function() {
						if(!that.panning) {
							extent = that.map.extent;
							that.panning = true;
							that.map.setExtent(new Extent(extent.xmin + 1500, extent.ymin, extent.xmax + 1500, extent.ymax, extent.spatialReference)).then(function() {
								that.panning = false;
							});
						}
					}, 100);
				}
				else if(e.screenPoint.y >= this.map.height - 10) {
					this.interval = setInterval(function() {
						if(!that.panning) {
							extent = that.map.extent;
							that.panning = true;
							that.map.setExtent(new Extent(extent.xmin, extent.ymin - 1500, extent.xmax, extent.ymax - 1500, extent.spatialReference)).then(function() {
								that.panning = false;
							});
						}
					}, 100);
				}
			}
		},
		_onMapDoubleClickHandler: function(evt) {
			this.points.pop();
			if(this.drawType == Draw.POLYGON && this.points.length < 3) {
				this.onDrawEnd();
			}
		},
		_onDrawEndHandler: function(geometry) {
			var deleteTimer = null;
			var deleftTimerEndHandler = null;
			if(this.drawType == Draw.POLYGON) {
				if(this.points.length < 3) {
					deleftTimerEndHandler = dojo.hitch(this, function() {
						var tmpId = this.AREARPRE + measureTotal;
						this.deleteGraphicById(tmpId);
						clearInterval(deleteTimer);
						deleteTimer = null;
					});
					alert("无法测量面积，请重新绘制");
					this.points = [];
					deleteTimer = setInterval(deleftTimerEndHandler, 200);
					return;
				}
				this.finishMeasureArea(new Graphic(geometry));
				this._onMapClickHandler_connect && this._onMapClickHandler_connect.remove();
			}
			else if(this.drawType == Draw.POLYLINE) {
				this.finishMeasureDistance(new Graphic(geometry));
				this._onMapClickHandler_connect && this._onMapClickHandler_connect.remove();
				this.map.enablePan();
			}
			this.points = [];
		},
		updateMeasureArea: function() {
			var point = this.points[this.points.length - 1];
			this.drawMarker(point, this.AREA);
		},
		updateMeasureDistance: function() {
			var pt = null;
			var tmpGraphic = null;
			var atrributes = {};
			atrributes.id = this.DISTANCEPRE + measureTotal;
			var textsym = new TextSymbol();
			var font = new Font();
			font.setSize("12px");
			font.setFamily("微软雅黑");
			textsym.setFont(font);
			textsym.setColor(new Color("#000000"));
			textsym.setOffset(40, -5);

			if(this.points.length == 1) {
				pt = this.points[this.points.length - 1];
				this.drawMarker(pt, this.DISTANCE);
				textsym.setOffset(20, -10);
				textsym.setText("起点");
				tmpGraphic = new Graphic(pt, textsym, atrributes);
				this.measureLayer.add(tmpGraphic);
			}
			else {
				pt = this.points[this.points.length - 1];
				this.drawMarker(pt, this.DISTANCE);
			}
		},
		finishMeasureArea: function(graphic) {
			var tmpId = this.AREARPRE + measureTotal;
			var attributes = {};
			attributes.id = tmpId;
			graphic.attributes = attributes;
			var transferPolygon = null;
			var resultArray = null;
			graphic.setSymbol(this.fillSymbol);
			this.measureLayer.add(graphic);
			this.latestEndPoint = this.points[this.points.length - 1];
			var polygon = graphic.geometry;

			if(!this.isWebMercator(polygon.spatialReference)) {
				resultArray = geodesicUtils.geodesicAreas([polygon], units.SQUARE_METERS);
			}
			else {
				transferPolygon = webMercatorUtils.webMercatorToGeographic(polygon);
				resultArray = geodesicUtils.geodesicAreas([transferPolygon], units.SQUARE_METERS);
			}

			var resultTxt = resultArray[0];
			this.drawResult(this.latestEndPoint, resultTxt, this.AREA);
			this.points = [];
		},
		finishMeasureDistance: function(graphic) {
			var transferPolyline = null;
			var tmpId = this.DISTANCEPRE + measureTotal;
			var attr = {};
			attr.id = tmpId;
			graphic.attributes = attr;

			graphic.setSymbol(this.lineSymbol);
			this.measureLayer.add(graphic);
			this.latestEndPoint = this.points[this.points.length - 1];
			var resultArray = null;
			var polyline = graphic.geometry;
			if(!this.isWebMercator(polyline.spatialReference)) {
				resultArray = geodesicUtils.geodesicLengths([polyline], units.METERS);
			}
			else {
				transferPolyline = webMercatorUtils.webMercatorToGeographic(polyline);
				resultArray = geodesicUtils.geodesicLengths([transferPolyline], units.METERS);
			}
			var resultTxt = resultArray[0];
			this.drawMarker(this.latestEndPoint, this.DISTANCE);
			this.drawResult(this.latestEndPoint, resultTxt, this.DISTANCE);
			this.measureLengthsCount = 0;
			this.points = [];
		},
		isWebMercator: function(reference) {
			var resultFlag = false;

			switch(reference.wkid) {
				case 100112:
					{
						resultFlag = true;
						break;
					}
				case 102113:
					{
						resultFlag = true;
						break;
					}
				case 102100:
					{
						resultFlag = true;
						break;
					}
				case 3857:
					{
						resultFlag = true;
						break;
					}
				case 3785:
					{
						resultFlag = true;
						break;
					}
			}
			return resultFlag;
		},
		drawCircle: function(centerPt, type) {
			var circle = null;
			var timer;
			var timerEndHandler = null;
			var point = centerPt;

			var circleSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 9, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 128, 255]), 2), new dojo.Color([255, 255, 255, 1]));
			//var circleSymbol = new esri.symbols.SimpleMarkerSymbol(esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE,9,new esri.Color("#FFFFFF"),1,0,0,0,new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID,0xFF0000,1,2));
			circle = new Graphic(point, circleSymbol);
			var attr = {};
			if(type == this.DISTANCE) {
				attr.id = this.DISTANCEPRE + measureTotal;
				circle.attributes = attr;
				this.measureLayer.add(circle);
			}
			else {
				timerEndHandler = dojo.hitch(this, function() {
					this.measureLayer.add(circle);
					clearInterval(timer);
					timer = null;
				});
				attr.id = this.AREARPRE + measureTotal;
				dojo.hitch(this, timerEndHandler);
				timer = setInterval(timerEndHandler, 200);
				circle.attributes = attr;
			}
		},
		//替换drawCircle 的样式
		drawMarker: function(centerPt, type) {
			var circle = null;
			var timer;
			var timerEndHandler = null;
			var point = centerPt;
			//var path=document.location.href.substring(0,document.location.href.lastIndexOf("/"));
			var path = this.getRootPath();

			var greenPinSymbol = new PictureMarkerSymbol({
				url: path + 'src/lib/gis/images/green-pin.png',
				width: 10,
				height: 10,
				xoffset: 4,
				yoffset: 4
			});
			circle = new Graphic(point, greenPinSymbol);
			var attr = {};
			if(type == this.DISTANCE) {
				attr.id = this.DISTANCEPRE + measureTotal;
				circle.attributes = attr;
				this.measureLayer.add(circle);
			}
			else {
				timerEndHandler = dojo.hitch(this, function() {
					this.measureLayer.add(circle);
					clearInterval(timer);
					timer = null;
				});
				attr.id = this.AREARPRE + measureTotal;
				dojo.hitch(this, timerEndHandler);
				timer = setInterval(timerEndHandler, 200);
				circle.attributes = attr;
			}
		},
		drawResult: function(pt, result, type) {
			var resultText = this.getResultText(result, type);
			var textSymbol = new TextSymbol();
			//var path=document.location.href.substring(0,document.location.href.lastIndexOf("/"));
			var path = this.getRootPath();
			var p_close = path + "src/lib/gis/images/close-btn.png";
			var closeMarkSymbol = new PictureMarkerSymbol(p_close, 12, 12);
			closeMarkSymbol.setOffset(13, 0);
			var textsym = new TextSymbol();
			var font = new Font();
			font.setSize("12px");
			font.setFamily("微软雅黑");
			textsym.setFont(font);
			textsym.setColor(new Color("#ff0000"));
			textsym.setOffset(50, -20);
			textsym.setText(resultText);


			var txtGraphic = new Graphic(pt, textsym);
			var closeGraphic = new Graphic(pt, closeMarkSymbol);

			var attr = {};
			if(type == this.DISTANCE) {
				attr.id = this.DISTANCEPRE + measureTotal;
			}
			else {
				attr.id = this.AREARPRE + measureTotal;
			}
			txtGraphic.attributes = attr;
			closeGraphic.attributes = attr;
			closeGraphic.close = true;

			on(this.measureLayer, "click", this._closeGraphicHandler);

			this.measureLayer.add(txtGraphic);
			this.measureLayer.add(closeGraphic);

			var node = txtGraphic.getNode();
			//console.log(node);
			//closeGraphic.addEventListener(MouseEvent.CLICK,this.closeGraphicHandler);
			measureTotal++;
			this.isRunning = false;
			this.deactivate();
		},
		_closeGraphicHandler: function(evt) {
			event.stop(evt);
			var closeGraphic = evt.graphic;
			if(closeGraphic && closeGraphic.close) {
				var id = closeGraphic.attributes.id;
				this.deleteGraphicById(id);
				measureTotal--;
			}
		},
		deleteGraphicById: function(id) {
			var graphicProvider = this.measureLayer.graphics;
			for(var i = graphicProvider.length - 1; i >= 0; i--) {
				var graphic = graphicProvider[i];
				if(graphic && graphic.attributes) {
					if(id == graphic.attributes.id) {
						this.measureLayer.remove(graphic);
					}
				}
			}
		},
		getResultText: function(result, type) {
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
		clearAll: function() {
			var keyword = "measure_";
			var graphicProvider = this.measureLayer.graphics;
			for(var i = graphicProvider.length - 1; i >= 0; i--) {
				var graphic = graphicProvider[i];
				if(graphic.attributes && graphic.attributes.id) {
					if(graphic.attributes.id.indexOf(keyword) > -1) {
						this.measureLayer.remove(graphic);
					}
				}
			}
			measureTotal = 0;
		},
		setTipsText: function(message) {
			var tooltip = this._tooltip;
			if(!tooltip) {
				return;
			}
			tooltip.innerHTML = message;
		},
		/**
		 * 获取项目根路径
		 */
		getRootPath: function() {
			return [location.protocol, "//", location.host, "/", location.pathname.split('/')[1]].join('');
		}
	});
});

