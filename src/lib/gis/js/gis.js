/**
 * @author skz
 * @date 2016年4月15日
 * @time 下午4:32:47
 */

dojo.require("esri.graphic");
dojo.require("esri.Color");
dojo.require("esri.toolbars.draw");
dojo.require("esri.geometry.Point");
dojo.require("esri.geometry.Polyline");
dojo.require("esri.geometry.webMercatorUtils");
dojo.require("esri.geometry.mathUtils");
dojo.require("esri.symbols.PictureFillSymbol");
dojo.require("esri.symbols.PictureMarkerSymbol");
dojo.require("esri.symbols.SimpleLineSymbol");
dojo.require("esri.symbols.SimpleFillSymbol");
dojo.require("esri.symbols.SimpleMarkerSymbol");
dojo.require("extras.MapInitObject");
dojo.require("extras.symbol.ArrowLineSymbol");
dojo.require("extras.utils.GPSConvertor");

var GisObject;
dojo.ready(function(){
	GisObject = new extras.MapInitObject("map");
	GisObject.setMapOptions({
		logo:false,
		extent : "12557877.595482401,2596928.9267310356,12723134.450635016,2688653.360673282",
		sliderPosition: 'bottom-right',
		center:null
	});
	GisObject.addDefaultLayers();
	/*setTimeout(function(){
		Gis.mapLoadedCompeleteHandler();
	},1000)*/
});

var defaults = {
	timePicker : null,
	interval: 10000,		// 	弹窗弹出起始时间
	intervalSecond: 5,		//  0 ~ 5 内随机定时弹窗
	hidePopupDelay: 11000,	//	隐藏 弹窗时间
	defaultImg: Constants.CONTEXT_PATH + '/content/images/default.jpg'
};

var Gis = {
	defaultParams : {
		dialogObj: null,
		LAYER_ID: {							//图层ID
			layerID: 'Gxx_gis_bayonet',
			drawLayerID: 'GXX_GIS_DRAW_LAYER'
		}
	},
	mapLoadedCompeleteHandler : function(){
		var geometry,point;
		if(longitude && latitude ){
			point = new esri.geometry.Point(longitude,latitude);
			this.centerAndZoom(point);
		}
		return ;
		this.loadRoadGraphics();
		this.intervalPopup();
		this.drawDomain();
	},
	// 加载路段图元
	loadRoadGraphics : function(){
		var that = this;
		maAjax.getJson(Constants.CONTEXT_PATH + "/locationMgr/findAllLocations.action",{},function(d){
			var feats = that.buildGraphicFeatures(d);
			var c = feats.featureSet[6].geometry;
			that.centerAndZoomByCoord(c.x,c.y);
			that.loadGraphics(feats);
			that.addClusterLayerEvents();
		})
		
		GisObject.map.on('click', function () {
			that.clearDialog();
	    });
	},
	// 循环弹出弹窗
	intervalPopup : function(time){
		var that = this;
		var cTimePicker = null;
		cTimePicker = setInterval(function(){
			
			if(defaults.timePicker){
				clearInterval(defaults.timePicker);
				defaults.timePicker = null;
				var n = Math.floor(Math.random() * defaults.intervalSecond);
				var t = defaults.interval * ( n <= 0 ? 1 : n);
				that.intervalPopup(t);
			}else{
				defaults.timePicker = cTimePicker;
				that.alertTipPanel();
			}
		},time || defaults.interval);
	},
	// 绘制区域图
	drawDomain : function(lineSymbol){
		var sysProp = {
			type:"esriSLS",
	        style:"esriSLSSolid",
	        width:2,
	        color:[188,212,110,255]	
		};
		var defaultLineSymbol = $.extend(true,sysProp,lineSymbol || {});
		var points;
		var color;
		
		$.each(domain,function(index,item){
			points = item.path;
			color = item.color;
			
			// add polyline
			defaultLineSymbol.color = new esri.Color(color);
			GisObject.layerDraw.addPolyline(points,defaultLineSymbol);
		});
	},
	// 构建图元结构
	buildGraphicFeatures : function(traceList){
		var featureSet = [],self=this;
		$.each(traceList,function(idx,traceItem){
			var feature = {};
			feature.id = traceItem.id;
			feature.orgId = traceItem.locationNo;
		
			// -- 地图坐标系转换开始
			var lon = traceItem.longitude,
				lat = traceItem.latitude;
			if(gisConfig.mapType == "1"){//google
				var GCJ = extras.utils.GPSConvertor.gcj_encrypt(parseFloat(lat),parseFloat(lon));
				feature.geometry = {x: GCJ.lon,y: GCJ.lat};
			}else{//天地图等
				feature.geometry = {x:traceItem.lon,y:traceItem.lat};
			}
			
			// 当前违法总数
			var vioCount = traceItem.todayVioNum;
			// sizeRange 从配置文件获取
			var vioRange = JSON.parse(sizeRange);
			//上一值域
			var prevRange = 0;
			var sysSize = 10;
			$.each(vioRange,function(size,range){
				if(vioCount >= prevRange && vioCount <= range){
					sysSize = size;
					return false;
				}else{
					prevRange = range;
				}
			});
			var sys = self.getRoadSymbol(sysSize,1);
			
			feature.symbol = sys;
			feature.attributes = traceItem;
			featureSet.push(feature);
		});
		return {
			'featureSet': featureSet
		};
	},
	// 获取图元样式
	getRoadSymbol : function(circleSize,outlineSize){
		return new esri.symbols.SimpleMarkerSymbol("circle", circleSize || 10,
	            new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new esri.Color([231,164,150,0.5]), outlineSize || 15),
	            new esri.Color([219,92,66,0.75]));
	},
	// 图元绘制操作
	loadGraphics : function(graphicFeatureObj){
		GisObject.layerManager.addGraphicToMap(this.defaultParams.LAYER_ID.layerID,0,graphicFeatureObj,true);
	},
	// 弹窗实现
	showAlarmTips : function(graphic,imgUrl){
		var geometry = graphic.geometry;
		var attributes = graphic.attributes;
		var that = this;
		
		that.clearDialog(graphic._layer);
		
		layer = graphic._layer;//图元所属图层
		screenPos = GisObject.map.toScreen(geometry);//将地图坐标转为屏幕坐标
		graphic._graphicsLayer.clickGraphic = graphic;//记录当前点击的graphic图元
		
		that.defaultParams.dialogObj = mDialog.showDialog({
			content : $('#panel'),
			title: false,
			id: '_b_',
			width: 180,
			align: 'top',
			onshow: function(){
				$('#panel').show();
				$('#roadName').text('');
				$('#count').text('');
				
				var picUrl = imgUrl || attributes.picUrl;
				
				Gis.resizeDialogPosition(graphic);
				$('#vioImage').find('img').attr('src',picUrl || defaults.defaultImg);
				$('#roadName').text(attributes.locationName);
				$('#count').text(attributes.todayVioNum);
			},
			onclose : function() {
				$('#panel').hide();
				$('#vioImage').find('img').attr('src',defaults.defaultImg);
				$('#roadName').text('');
				$('#count').text('');
				layer.clickGraphic = null;
			}
		});
	},
	// 违法提示
	alertTipPanel : function(){
		var that = this;
		maAjax.getJson(Constants.CONTEXT_PATH + "/locationMgr/randamFindOneLocation.action",{},function(item){
			if(!item) return ;
			var id = item.id;
			that.locateGraphicByIdKey(id,function(graphic){
				Gis.showAlarmTips(graphic,item.picUrl);
				
				setTimeout(function(){
					Gis.clearDialog();
				},defaults.hidePopupDelay);
			})
		})
	},
	resizeDialogPosition : function(graphic){
		var screenPos,geometry = graphic.geometry,graphicShade,dx,dy;
		screenPos = GisObject.map.toScreen(geometry);//将地图坐标转为屏幕坐标
		graphicShade = graphic._shape.shape;//图元图片
		dx = screenPos.x - $('.ui-popup').width()/2;
		dy = screenPos.y - $('.ui-popup').height() - parseInt(graphicShade.r)/2 - 5;
		$('.ui-popup').css({'left':dx,'top':dy}).addClass('ui-popup-top');
	},
	addClusterLayerEvents : function(){
		var layer = this.getGraphicLayer();
		if(!layer) return;
		layer.on("mouse-over", this.onMouseOverCluster);
		layer.on("mouse-out", this.onMouseOutCluster);
	},
	onMouseOverCluster: function(e){
		if (e.target.nodeName === "circle") {
			var activeClusterElement = e.target;
			var graphic = e.graphic;
			var attributes = graphic.attributes;
			Gis.setActiveClusterOpacity(activeClusterElement, 1, 1);
			Gis.showAlarmTips(graphic);
		}
	},
	onMouseOutCluster: function(e){
		if (e.target.nodeName === "circle") {
			var activeClusterElement = e.target;
			Gis.setActiveClusterOpacity(activeClusterElement, 0.75, 0.5);
			Gis.clearDialog();
		}
	},
	setActiveClusterOpacity: function(elem, fillOpacity, strokeOpacity) {
	    if (elem) {
	        elem.setAttribute("fill-opacity", fillOpacity);
	        elem.setAttribute("stroke-opacity", strokeOpacity);
	    }
	},
	centerAndZoom: function(geometry){
		return GisObject.map.centerAndZoom(geometry);
	},
	centerAndZoomByCoord : function(x,y){
		var point = new esri.geometry.Point(x,y);
		return GisObject.map.centerAndZoom(point);
	},
	clearDialog : function(layer){
		this.defaultParams.dialogObj && mDialog.closeDialog(this.defaultParams.dialogObj);
	},
	locateGraphicByIdKey: function(idKey,fn){
		var findGraphic = this.getGraphicByIdKey(idKey);
		if(findGraphic && fn){
			fn(findGraphic);
		}else if(findGraphic){
			
		}
	},
	getGraphicByIdKey : function(idKey){
		var layer = this.getGraphicLayer();
		var findGraphic;
		var grpahics;
		
		if(!layer) return null;
		grpahics = layer.graphics;
		$.each(grpahics,function(idx,grpahic){
			if(grpahic.id == idKey){
				findGraphic = grpahic;
				return false;
			}
		})
		return findGraphic;
	},
	getGraphicLayer : function(){
		return GisObject.map.getLayer(this.defaultParams.LAYER_ID.layerID);
	}
};