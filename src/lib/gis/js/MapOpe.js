/**
 * @author skz
 * @date 2016年4月15日
 * @time 下午4:32:47
 */

dojo.require('esri.graphic');
dojo.require('esri.Color');
dojo.require('esri.toolbars.draw');
dojo.require('esri.geometry.Point');
dojo.require('esri.geometry.Polyline');
dojo.require('esri.geometry.webMercatorUtils');
/* dojo.require('esri.geometry.mathUtils'); */
dojo.require('esri.symbols.PictureFillSymbol');
dojo.require('esri.symbols.PictureMarkerSymbol');
dojo.require('esri.symbols.SimpleLineSymbol');
dojo.require('esri.symbols.SimpleFillSymbol');
dojo.require('esri.symbols.SimpleMarkerSymbol');
dojo.require('extras.MapInitObject');
/* dojo.require('extras.symbol.ArrowLineSymbol'); */
dojo.require('extras.utils.GPSConvertor');
dojo.require('esri.dijit.OverviewMap');
dojo.require('esri.dijit.BasemapGallery');
dojo.require('esri.geometry.Circle');
dojo.require("esri.toolbars.edit");
dojo.require("esri.geometry.Extent");
dojo.require('extras.utils.MapCommonUtils');

var GisObject, plotDraw, plotEdit, editGraphic, markerSymbol, lineSymbol, fillSymbol;

/**
 * 统一管理常量、变量、URL等
 */
var Variables = {
	/**
	 * =================================== 常量
	 * ===================================
	 */
	symbol : {
		width : 16,
		height : 16,
		xoffset : 0,
		yoffset : 12
	},

	/**
	 * =================================== 变量 对象
	 * ===================================
	 */
	icons : {
		// 警力
		POLICE_ICON_URL : contextPath + '/images/gis/polic_icon.png',
		STATION_ICON_URL : contextPath + '/lib/gis/images/camera/mobile_icon.png'
	},
	// 网格防区
	grid : {
		FIND_ALL_GRIDINFO_URL : contextPath
				+ "/gisRegionInfo!findAllGisRegionInfo.action",
		ADD_GRIDINFO_URL : contextPath
				+ "/gisRegionInfo!saveGisRegionInfo.action",
		UPDATE_GRIDINFO_URL : contextPath
				+ "/gisRegionInfo!updateGisRegionInfo.action",
		DEL_GRIDINFO_URL : contextPath
				+ '/gisRegionInfo!deleteGisRegionInfoByID.action'
	},

	// 打印
	print : {
		PRINT_URL : contextPath + "/content/jsp/client/gis/print.action",
		UPLOAD_TEMP_PIC_URL : contextPath
				+ "/content/jsp/client/gis/uploadCaptureImageFile.action",
		DEL_TEMP_PIC_URL : contextPath
				+ "/content/jsp/client/gis/deleteCaptureImage.action?filepath=",
		PRINT_DESC : '打印设置',
		PRINT_WIDTH : 920,
		PRINT_HEIGHT : 455
	},
	// 图层
	layers : {
		// 查询图层
		QUERYRESULT_LAYER : 'GXX_GIS_QUERYRESULT_LAYER',
		CAMERA_LAYER_ID : 'cameraLayer',
		POLICE_LAYER_ID : 'policeLayer',
		POLICE_CAR_LAYER_ID : 'policeCarLayer',
		BAYONET_LAYER_ID : 'bayonetLayer',
		BASE_STATION_LAYER_ID : 'baseStationLayer',
		CASE_LAYER_ID : 'caseLayer',
		TRACE_LAYER_ID : 'traceLayer', // 轨迹追踪图元图层ID
		MARK_LAYER_ID : "POILayer_10",
		FACEFINDER_LAYER_ID:'faceFinderLayer',
		HIGH_POINT_LAYER_ID:'highPointLayer',
		SOCIAL_LAYER_ID:'socialResourceLayer'
	},
	// 空间查询
	SpaceSearch : {
		defaultRadius : 1000
	// （Meter）
	},
	/**
	 * =================================== 请求URL
	 * ===================================
	 */
	// 默认图元图片
	defaultMarkerImageUrl : contextPath + '/content/images/default.jpg',
	getAllBaseStationUrl : contextPath + '/workbench/baseStation!getAllInfo.action',
	getAllPoliceUrl : contextPath + '/workbench/policeForces!getAllInfo.action',
	getAllBayonetUrl : '/cbds/orgMgr/findOrgMgrTree.action?type=1',
	getAllFaceUrl : '/FaceFinder/device/showAllChannelTree.action?showCar=0',
	getAllPoliceCarUrl : '/mdcp/copCarInfo!getCopCarOrgTree.action'
};

/**
 * =================================== Space Search 空间查询
 * ===================================
 */
var SpaceSearch = {
	searchRes:[],
	// 拉框搜索
	pullBoxSearch : function() {
		GisOpe.clearDialog(Variables.chooseCameraDialog);
		GisObject.layerQuery.pullBoxSearch();
		var _this = this;
		dojo.subscribe("pullBoxSearchFinish", this, function(graphic) {
			var result=[];
			for(var i=0,len=GisOpe.allDefaultLayers.length;i<len;i++){
				result=result.concat(_this.getGraphicDataByGeometry(GisOpe.allDefaultLayers[i].layerId,graphic.geometry));
  		    }
			GisOpe.showChooseDialog(0, graphic, result);

		});
	},
	// 预案框选
	caseBoxSearch : function() {
		var options = {
			type : 'extent',
			subscribeHook : 'pullBoxSearchFinish'
		}
		GisObject.layerQuery.domainSearch(options);
		var _this = this;
		var handle = dojo.subscribe("pullBoxSearchFinish", this, function(graphic) {
			var result=[];
			for(var i=0,len=GisOpe.allDefaultLayers.length;i<len;i++){
				result=result.concat(_this.getGraphicDataByGeometry(GisOpe.allDefaultLayers[i].layerId,graphic.geometry));
  		    }
			Gsui.getCmp("pollingGroupPanel").getDevListByComDevIds(result);
			dojo.unsubscribe(handle);
		});

	},
	// 预案点选
	caseCircleSearch : function() {
		GisObject.layerQuery.circleSearch();
		var _this = this;
		dojo.subscribe("circleSearchFinish", this, function(graphic) {
			var result=[];
			for(var i=0,len=GisOpe.allDefaultLayers.length;i<len;i++){
				result=result.concat(_this.getGraphicDataByGeometry(GisOpe.allDefaultLayers[i].layerId,graphic.geometry));
  		    }
			this.addDataInTable(result);
		});
	},
	// 预案线选
	caseLineSearch : function() {
		GisObject.toolbar.indraw("polyline");
		var _this = this;
		dojo.subscribe("polylineSearchFinish", this, function(graphic) {
			var result=[];
			for(var i=0,len=GisOpe.allDefaultLayers.length;i<len;i++){
				result=result.concat(_this.getGraphicDataByGeometry(GisOpe.allDefaultLayers[i].layerId,graphic.geometry));
  		    }
			this.addDataInTable(result);
		});
	},
	// 绘制后在表格渲染
	addDataInTable : function(result) {
		var devIds = [];
		for (var i = 0; i < result.length; i++) {
			devIds.push(encodeURIComponent(result[i].id));
		}
		if (devIds.length == 0)
			return;
		devIds = devIds.join(",");
		drawCaseTable.devIds = devIds;
		drawCaseTable.refreshTb(drawCaseTable.devIds);
		$("#drawResNum").html("").html(result.length);
	},
	// 周边搜索
	circleSearch : function() {
		GisOpe.clearDialog(Variables.chooseCameraDialog);
		GisObject.layerQuery.circleSearch();
		var _this = this;
		dojo.subscribe("circleSearchFinish", this, function(graphic) {
			var result=[];
			for(var i=0,len=GisOpe.allDefaultLayers.length;i<len;i++){
				result=result.concat(_this.getGraphicDataByGeometry(GisOpe.allDefaultLayers[i].layerId,graphic.geometry));
  		    }
			GisOpe.showChooseDialog(0, graphic, result);
		});
	},
	// 线选搜索
	lineSearch : function() {
		GisOpe.clearDialog(Variables.chooseCameraDialog);
		GisObject.layerQuery.lineSearch();
		var _this = this;
		dojo.subscribe("lineSearchFinish", this, function(graphic) {
			var result=[];
			for(var i=0,len=GisOpe.allDefaultLayers.length;i<len;i++){
				result=result.concat(_this.getGraphicDataByGeometry(GisOpe.allDefaultLayers[i].layerId,graphic.geometry));
  		    }
			GisOpe.showChooseDialog(0, graphic, result);
		});
	},
	// 多边形搜索
	polygonSearch : function() {
		GisObject.layerQuery.polygonSearch();
		var _this = this;
		dojo.subscribe("polygonSearchFinish", this, function(graphic) {
			var result=[];
			for(var i=0,len=GisOpe.allDefaultLayers.length;i<len;i++){
				result=result.concat(_this.getGraphicDataByGeometry(GisOpe.allDefaultLayers[i].layerId,graphic.geometry));
  		    }
			GisOpe.clearDialog(Variables.chooseCameraDialog);
			GisOpe.showChooseDialog(0, graphic, result);
		});
	},
	// 框选
	boxSearch : function() {
		GisObject.layerQuery.pullBoxSearch();
		var _this = this;
		dojo.subscribe("boxSearchFinish", this, function(graphic) {
			var result=[];
			for(var i=0,len=GisOpe.allDefaultLayers.length;i<len;i++){
				result=result.concat(_this.getGraphicDataByGeometry(GisOpe.allDefaultLayers[i].layerId,graphic.geometry));
  		    }
			GisOpe.showChooseDialog(0, graphic, result);

		});
	},
	// 由于layerQuery.js 封装的是常规的搜索。暂不改变其内容,实现放在业务层,以后再整合进库里
	getGraphicDataByGeometry : function(layerId, geometry) {
		var graphicData = [];
		var layer = GisObject.map.getLayer(layerId);
		if (!layer || !geometry) {
			return [];
		}
		var allGraphic = layer.graphics;
		if (!allGraphic) {
			return [];
		}
		for (var i = 0, len = allGraphic.length; i < len; i++) {
			var g = allGraphic[i];
			if (g.attributes
					&& g.attributes.isCluster
					&& geometry.contains(GisOpe.webMercatorToGeographic(GisOpe
							.getGeometryPoint(g.attributes.x, g.attributes.y)))) {

				graphicData = graphicData.concat(g.attributes.data);
			} else if (geometry.contains(g.geometry)) {
				graphicData.push(g.attributes);
			}
		}

		return graphicData;
	},
	// 过滤数据
	filtData : function(res) {
		var arr = []; // 定义临时数组
		var arrIds = [];
		for (var i = 0; i < res.length; i++) {
			if (arrIds.indexOf(res[i].id) == -1) {
				arr.push(res[i]);
				arrIds.push(res[i].id);
			}
		}
		return arr;
	}
};

/**
 * =================================== Layer Control 图层控制
 * ===================================
 */
var LayerControl = {
	defaultLayerControl:function(usageType,isShow){
		var obj=GisOpe.allDefaultLayers[usageType-1];
		var layer = GisObject.map.getLayer(obj.layerId);
		if(isShow){
			!layer && obj.data && GisBusiness.loadDataToMap(obj.data,obj.layerId);
		}else{
			layer && GisObject.map.removeLayer(layer);
		}
	},
	// 基站控制
	baseStationLayerControl : function() {
		var layer = GisObject.map.getLayer(Variables.layers.BASE_STATION_LAYER_ID);
		if (layer) {
			if (layer.visible) {
				layer.hide();
			} else {
				layer.show();
			}
		}
	},
	// 警力图层控制
	policeLayerControl : function(isShow) {
		if(GisOpe.policeClusterData){
			if(isShow){
				GisBusiness.loadDataToMap(GisOpe.policeClusterData,Variables.layers.POLICE_LAYER_ID);
			}else{
				var layer = GisObject.map.getLayer(Variables.layers.POLICE_LAYER_ID);
				layer && GisObject.map.removeLayer(layer);
			}
		}
	},
	// 案件图层
	caseLayerControl : function() {
		var layer = GisObject.map.getLayer(Variables.layers.CASE_LAYER_ID);
		if (layer) {
			if (layer.visible) {
				layer.hide();
			} else {
				layer.show();
			}
		}
	}
};

/**
 * =================================== Plotting 态势标绘
 * ===================================
 */
// TODO 待优化
var plotDraw, plotEdit, editGraphic, markerSymbol, lineSymbol, fillSymbol;
var Toolbar = {
	init : function() {
		this.handlePlotTools();
		this.handleIndrawTools();
		this.handleToolbars();

		// TODO
		GridDefence.layerListener();
	},
	// 自定义工具操作等
	handleToolbars : function() {
		var that = this;
		$('.toolbar').on('click', '[data-widget]', function() {
			var type = $(this).attr('data-widget');
			switch (type) {
			case "pullBoxSearch":
				SpaceSearch.pullBoxSearch();
				break;
			case "lineSearch":
				SpaceSearch.lineSearch();
				break;
			case "circleSearch":
				SpaceSearch.circleSearch();
				break;
			case "polygonSearch":
				SpaceSearch.polygonSearch();
				break;
			case "cameraLayerControl":
				LayerControl.cameraLayerControl();
				break;
			case "baseStationLayerControl":
				LayerControl.baseStationLayerControl();
				break;
			case "bayonetLayerControl":
				LayerControl.bayonetLayerControl();
				break;
			case "policeLayerControl":
				LayerControl.policeLayerControl();
				break;
			case "caseLayerControl":
				LayerControl.caseLayerControl();
				break;
			case "lengthMeasure":
				Measure.lengthMeasure();
				break;
			case "areaMeasure":
				Measure.areaMeasure();
				break;
			case "fullscreen":
				that.handleFullScreen($('.stage_right'));
				break;
			case "clear":
				that.clear();
				break;
			case "capture":
				Capture.localCapture();
				break;
			case "print":
				that.print();
				break;
			case "gridDefenceArea":
				that.handleGridDefenceArea();
				break;
			case "loadDefenceArea":
				that.handleLoadDefenceArea($(this));
				break;
			}
		})
	},
	// 内置绘制工具
	handleIndrawTools : function() {
		$('.toolbar').on('click', '[data-action="in_draw"]', function() {
			var type = $(this).attr('data-type');
			type && GisObject.toolbar.indraw(type);
		})
	},
	// 态势绘制工具
	handlePlotTools : function() {
		var that = this;
		require([ 'dojo/dom', 'plot/PlotDraw', 'plot/PlotEdit' ], function(dom,
				PlotDraw, PlotEdit) {
			plotDraw = new PlotDraw(GisObject.map);
			plotDraw.on('draw-end', that.onDrawEnd);

			GisObject.map.on('click', function(e) {
				if (plotDraw.isDrawing)
					return;
				if (e.graphic && e.graphic.plot) {
					// 开始编辑
					editGraphic = e.graphic;
					// plotEdit.activate(editGraphic);
				} else {
					// 结束编辑
					editGraphic = null;
					// plotEdit.deactivate();
				}
			});

			$('.toolbar').on('click', '[data-action="draw"]', function() {
				var type = $(this).attr('data-type');
				type && that.activate(type);
			})
		})
	},
	// TODO 网格防区获取坐标
	handleGridDefenceArea : function() {
		GisObject.layerQuery.polygonSearchExt();
		dojo.subscribe("polygonSearchFinish", this, function(graphic) {
			GridDefence.handleGridArea(graphic);
		});
	},
	/**
	 * 加载所有网格防区
	 *
	 * @param {}
	 *            $target 操作对象
	 */
	handleLoadDefenceArea : function($target) {
		if ($target.data('loaded')) {// 清除图层
			$target.find('.action-name').text('显示所有防区');
			GisOpe.clearLayerById(Variables.layers.QUERYRESULT_LAYER);
			$target.data('loaded', false);
		} else {// 加载
			$target.find('.action-name').text('隐藏所有防区');
			GisOpe.clearLayerById(Variables.layers.QUERYRESULT_LAYER);
			GridDefence.fetchAndRenderGridArea();
			$target.data('loaded', true);
		}
	},
	onDrawEnd : function(evt) {
		require([ 'esri/graphic', 'esri/symbols/jsonUtils',
				'esri/geometry/Point', 'esri/geometry/Polyline',
				'esri/geometry/Polygon' ], function(Graphic, jsonUtils, Point,
				Polyline, Polygon) {
			markerSymbol = new esri.symbols.SimpleMarkerSymbol(
					esri.symbols.SimpleMarkerSymbol.STYLE_SQUARE, 8, null,
					new esri.Color('#FF0000'));
			lineSymbol = new esri.symbols.SimpleLineSymbol(
					esri.symbols.SimpleLineSymbol.STYLE_SOLID, new esri.Color(
							'#FF0000'), 2);
			fillSymbol = new esri.symbols.SimpleFillSymbol(
					esri.symbols.SimpleFillSymbol.STYLE_SOLID, this.lineSymbol,
					new esri.Color([ 255, 0, 0, 0.25 ]));

			var symbol;
			if (evt.geometry.isInstanceOf(Point)) {
				symbol = jsonUtils.fromJson(markerSymbol.toJson());
			} else if (evt.geometry.isInstanceOf(Polyline)) {
				symbol = jsonUtils.fromJson(lineSymbol.toJson());
			} else if (evt.geometry.isInstanceOf(Polygon)) {
				symbol = jsonUtils.fromJson(fillSymbol.toJson());
			}
			var graphic = new Graphic(evt.geometry, symbol);
			graphic.plot = evt.plot;
			// GisObject.map.graphics.add(graphic);
			GisObject.toolbar.drawLayer.add(graphic);
			// 开始编辑
			editGraphic = graphic;
			// plotEdit.activate(editGraphic);
		});
	},
	/**
	 * 激活态势绘制工具
	 *
	 * @param type
	 *            绘制类型
	 */
	activate : function(type) {
		// plotEdit.deactivate();
		plotDraw.activate(type);
	},
	onEditEnd : function(evt) {

	},
	// 打印
	print : function() {
		Print.init();
	},
	/**
	 * 全屏操作
	 *
	 * @param that
	 *            按钮对象
	 */
	handleFullScreen : function(that) {
		if (!that.attr('data-fullscreen')) {
			that.attr('data-fullscreen', true);
			Toolbar.handleRequestFullScreen();
		} else {
			that.removeAttr('data-fullscreen');
			Toolbar.handleExitFullScreen();
		}
	},
	// 全屏
	handleRequestFullScreen : function() {
		var de = document.documentElement;

		if (de.requestFullscreen) {
			de.requestFullscreen();
		} else if (de.mozRequestFullScreen) {
			de.mozRequestFullScreen();
		} else if (de.webkitRequestFullScreen) {
			de.webkitRequestFullScreen();
		}
	},
	// 退出全屏
	handleExitFullScreen : function() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	},
	// 清除图层
	clear : function() {
		GisOpe.clearLayer();
	}
}

/**
 * TODO 清除图层的处理 网格防区操作
 */
var GridDefence = {
	// 轮巡间隔
	pollingInterval : 1000,
	// 分屏数
	splitWnd : 4,

	gridPanelDialog : null,

	/**
	 * 划选网格区域处理
	 *
	 * @param graphic
	 */
	handleGridArea : function(graphic) {
		var polygon = graphic.geometry, geom, gridArea, cameraList, cameraSize, rings, finishPoint, interstPoint, commonUtils;

		commonUtils = new extras.utils.MapCommonUtils();
		// area of the polygon
		gridArea = commonUtils.measureOfarea(polygon);
		gridArea = commonUtils.convertUnits(gridArea, 'area');

		// WebMercator To Geographic
		geom = GisOpe.webMercatorToGeographic(graphic.geometry);
		// polygon rings
		rings = geom.rings && geom.rings[0];

		// Point Of Text
		interstPoint = this.getCenterPointOfExtent(graphic._extent);

		// list of cameras
		cameraList = this.getCameraList(graphic.geometry);
		cameraSize = cameraList.length;

		var textSymbol = {
			color : [ 51, 51, 51, 255 ],
			font : {
				size : 13,
				family : "微软雅黑",
				weight : "600"
			},
			yoffset : 5,
			text : gridArea + " ， \n" + "设备数：" + cameraSize + " （台）"
		};
		// Add Text
		// GisObject.layerDraw.addPointByText(interstPoint.x,interstPoint.y,textSymbol);
		// Submit And Save
		this.saveGridCoordinate(rings, gridArea, cameraSize, interstPoint,
				graphic);
	},
	/**
	 * TODO 存储网格防区坐标数据
	 *
	 * @param ringList
	 */
	saveGridCoordinate : function(ringList, gridArea, cameraCount, centerPoint,
			graphic) {
		var data = JSON.stringify(ringList), promise, params;
		params = {
			geoData : data,
			areaCount : gridArea,
			cameraCount : cameraCount,
			x : centerPoint.x,
			y : centerPoint.y
		};
		promise = $.post(Variables.grid.ADD_GRIDINFO_URL, {
			gisRegionInfoJson : JSON.stringify(params)
		});
		promise.success(function(res) {
			res = JSON.parse(res);
			// successBox(res.data ? '网格区域保存成功' : '网格区域保存失败');
			/*
			 * graphic.setAttributes({ type: 'search', id: res.data });
			 */
			graphic.id = res.data;
		}).error(function(res) {
			// errorBox('服务出错');
		})
	},
	/**
	 * 根据坐标获取设备列表
	 *
	 * @param {}
	 *            geometry
	 * @return {}
	 */
	getCameraList : function(geometry) {
		var geom = GisOpe.webMercatorToGeographic(geometry);
		var result=[];
		for(var i=0,len=GisOpe.allDefaultLayers.length;i<len;i++){
			result=result.concat(GisOpe.getGraphicByGeometry(GisOpe.allDefaultLayers[i].layerId,geom));
	    }
		return result;
	},
	/**
	 * 获取 extent 中心坐标
	 *
	 * @param {}
	 *            extent
	 * @return {}
	 */
	getCenterPointOfExtent : function(extent) {
		var center = esri.geometry.xyToLngLat(
				(extent['xmin'] + extent['xmax']) / 2,
				(extent['ymin'] + extent['ymax']) / 2);
		return new esri.geometry.Point(center[0], center[1]);
	},
	// 获取和渲染网格防区
	fetchAndRenderGridArea : function() {
		var that = this, promise = $.post(Variables.grid.FIND_ALL_GRIDINFO_URL);

		promise.success(function(res) {
			res = JSON.parse(res);
			res = res.data;
			$.each(res, function(index, item) {
				var geoData = JSON.parse(item.geoData)
				points = typeof geoData == "string" ? JSON.parse(geoData)
						: geoData, interstPoint = {
					x : item.x,
					y : item.y
				}, gridArea = item.careaCount || 0,
						cameraCount = item.cameraCount || 0, textSymbol = {
							color : [ 51, 51, 51, 255 ],
							font : {
								size : 13,
								family : "微软雅黑",
								weight : "600"
							},
							yoffset : 5,
							text : gridArea + " ， \n" + "设备数：" + cameraCount
									+ " （台）"
						};
				// Add Text
				// GisObject.layerDraw.addPointByText(interstPoint.x,interstPoint.y,textSymbol);
				// Add Polygon
				GisObject.mapCommonUtils.addPolygon(
						Variables.layers.QUERYRESULT_LAYER, points, null, {
							type : 'search',
							id : item.id
						});
			})
		});
	},
	/**
	 * 删除网格防区
	 *
	 * @param {}
	 *            id
	 * @return {}
	 */
	deleteGridArea : function(id) {
		return $.get(Variables.grid.DEL_GRIDINFO_URL + "?regionID=" + id);
	},
	/**
	 * 图层事件
	 */
	layerListener : function() {
		var that = this;
		GisObject.map.getLayer(Variables.layers.QUERYRESULT_LAYER).on('click',function(e) {
			var graphic = e.graphic, attributes = graphic['attributes'];
			type = attributes && attributes.type;

			// show dialog;
			if (type === "search") {
				that.gridPanelDialog = GisOpe.showDialog(graphic,{
					title : '网格防区操作',
					width : 240,
					clearLayer : {
						query : true
					},
					align : 'top',
					content : "<div class='grid-panel' style='padding: 10px;' id='"
							+ graphic['id']
							+ "'><button type='button' class='btn btn-default btn-slim margin-tiny' id='gridPlay'>轮巡播放</button><button type='button' class='btn btn-default btn-slim margin-tiny' id='gridDel'>删除防区</button></div>",
					onshow : function() {
						that.handleGridPanelAction(graphic);
					}
				})
			}
		})
	},
	/**
	 * 轮巡播放
	 *
	 * @param {}
	 *            graphic
	 */
	handlePlayVideo : function(graphic) {
		var that = this;
		$('#gridPlay').unbind('click').bind('click',function() {
			var cameraList = that.getCameraList(graphic.geometry),
			cameraParams = that.getPlayPreplanParams(cameraList);
			 $.getJSON(contextPath+ "/commonInfo!getPropValue.action", {
					"propKey" : "cecs.poll.play.url"
			 }).success(function(result) {
				if (!cameraList.length) {
					warningBox("该防区没有设备");
					return;
				}
				// 轮巡播放窗口
				openWinBox(result.data,{
					id : 'polling_play',
					title : '轮巡播放',
					lock : true,
					width : 800,
					height : 430,
					cancel : false,
					close : true,
					init : function() {
						var playWindow = this.iframe.contentWindow;
						playWindow&& playWindow.playPreplan(cameraParams,that.pollingInterval);
					}
				});
			});
		});
	},
	/**
	 * 获取轮巡播放设备信息
	 *
	 * @param {}
	 *            cameraList
	 * @return {}
	 */
	getPlayPreplanParams : function(cameraList) {
		var params = [];
		for (var i = 0, cameraSize = cameraList.length; i < cameraSize; i++) {
			var item = {
				szNodeId : cameraList[i].id,
				nStreamType : 0,
				bPreset : 1,
				nSpeed : 1,
				szPresetName : ''
			};
			params.push(item);
		}
		return params;
	},
	/**
	 * 删除网格防区事件
	 */
	handleDeleteGridArea : function() {
		var that = this;
		$('#gridDel').unbind('click').bind('click',function() {
			var id = $(this).closest('.grid-panel').attr('id');
			if (id == "undefined" || !id) return;
			confirmBox('确定删除网格防区？', function() {
				var graphic, layer, promise;
				// Delete Grid Record From Server
				promise = that.deleteGridArea(+id);
				// Hide Graphic Or Remove From Layer
				promise.success(function() {
					graphic = GisOpe.getGraphicById(id,Variables.layers.QUERYRESULT_LAYER);
					layer = graphic && graphic.getLayer();
					layer && layer.remove(graphic);
					that.gridPanelDialog && that.gridPanelDialog.close().remove();
				});
			});
		});
	},
	/**
	 * 网格防区面板操作
	 *
	 * @param {}
	 *            graphic
	 */
	handleGridPanelAction : function(graphic) {
		this.handlePlayVideo(graphic);
		this.handleDeleteGridArea();
	}
}
/**
 * =================================== 测量 ===================================
 */
var Measure = {
	// 长度测量
	lengthMeasure : function() {
		GisObject.toolbar.measureLength();
	},
	// 面积测量
	areaMeasure : function() {
		GisObject.toolbar.measureArea();
	}
};
/**
 * 地图打印
 *
 * @type
 */
var Print = {
	init : function() {
		// 截图
		Capture.snapShotScreen();
	},
	/**
	 * 上传图片
	 *
	 * @param base64
	 */
	proxyPrint : function(base64) {
		if (!base64)
			return;
		var promise = $.post(Variables.print.UPLOAD_TEMP_PIC_URL, {
			imgFileStr : base64,
			imgFileName : 'capture.jpg'
		});
		promise.success(function(res) {
			res = JSON.parse(res);
			// 传递地图截图访问URL到 打印页面
			$.dialog.data('captureViewUrl', res.data);

			var closeFunction = function() {
				var url = $.dialog.data('captureViewUrl');
				url && $.post(Variables.print.DEL_TEMP_PIC_URL + url)
			};
			// 打开窗口
			var printBox = openWin(Variables.print.PRINT_URL,
					Variables.print.PRINT_WIDTH, Variables.print.PRINT_HEIGHT,
					Variables.print.PRINT_DESC, null, null, closeFunction,
					'print');
		});
	}
}
/**
 * =================================== 截图 ===================================
 */
var Capture = {
	// 本地截图
	localCapture : function() {
		if (!ocxUtil)
			return;
		ocxUtil.captureScreen();
	},
	// 获取地图区域截图
	snapShotScreen : function() {
		if (!ocxUtil) return;
		var props = this.getCapturePos();
		ocxUtil.captureScreen(1, true, props.x, props.y, props.width,props.height);
	},
	// 获取截图坐标信息|用于打印
	getCapturePos : function() {
		var isIE89, $map = $('#flexMapContainer_gc'), map = $map[0], x, y;
		isIE89 = (!!navigator.userAgent.match(/MSIE 8.0/))
				|| (!!navigator.userAgent.match(/MSIE 9.0/));

		x = $(document).width() - $map.width();
		y = map.offsetTop || ($(document).height() - $map.height()) || 40;
		x = x ? (isIE89 ? x - 5 : x) : 0;
		y = y + 40/* tab */+ 65/* nav */;
		return {
			x : x,
			y : y,
			width : map.clientWidth,
			height : map.clientHeight - 40
		/* padding-top */
		};
	}
};

/**
 * Gis操作
 *
 * 接口仅提供外部使用（需调整拆分）
 */
var GisOpe = {
	drawType : "plot",// 标签绘图类型 plot 点 ；polygon 多边形
	isEditMode : false,// 地图标注是否处于编辑状态
	selectedGraphicId : null,
	panEndHandle:null,
	allDefaultLayers:[{
		layerId:Variables.layers.CAMERA_LAYER_ID,
		data:[]
	},{
		layerId:Variables.layers.HIGH_POINT_LAYER_ID,
		data:[]
	},{
		layerId:Variables.layers.FACEFINDER_LAYER_ID,
		data:[]
	},{
		layerId:Variables.layers.BAYONET_LAYER_ID,
		data:[]
	},{
		layerId:Variables.layers.POLICE_LAYER_ID,
		data:[]
	},{
		layerId:Variables.layers.POLICE_CAR_LAYER_ID,
		data:[]
	},{
		layerId:Variables.layers.SOCIAL_LAYER_ID,
		data:[]
	}],
	_mouseEvents : [],
	// 标注数组
	markMapList : [],
	// 右键菜单数组
	menuObjArr : {},
	// 右键菜单绑定的graphic
	contextMenuGraphic : null,
	getLayerInfoByUsageType:function(usageType){
		return this.allDefaultLayers[+usageType-1];
	},
	initMap : function(id, lon, lat) {
		var that=this;
		var deferred = $.Deferred();
		function afterMapOnload() {
			var oldMapGeo=null;
			var oldPoint=null;
			deferred.resolve();
			GisObject.map.centerAndZoom(esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon || longitude, lat || latitude)));
			GisOpe.disableContextMenu(id);
			var $ul=$('<ul id="POIContextMenu"><li onclick="layerBar.editPOILayerGraphic(event)">编辑</li><li onclick="layerBar.deletePOILayerGraphic(event)">删除</li></ul>');
			$ul.on('mousedown',function(e){
				e.stopPropagation();
			});
        	$('#'+GisObject.map.id).append($ul);
			$(document).on('mousedown',function(){
				$('#POIContextMenu').hide();
			});
			layerBar && layerBar.createLayerList();
			try{
				window.respond && respond.update();
			}catch(e){}
		}
		dojo.ready(function() {
			GisObject = new extras.MapInitObject(id || 'map');
			GisObject.setMapOptions({
				basemapToggle: true,
				coordinate: true,
				minZoom:1,
				nav : false
//				basemap:"osm"
			});
			GisObject.addDefaultLayers();
			GisObject.addScalebar();
			dojo.subscribe('mapLoadedEvent', GisObject.map, afterMapOnload);
		});
		return deferred.promise();
	},

	setLayerVisible: function(layerId,visible){
 		var layer = GisObject.map.getLayer(layerId);
 		layer && layer.setVisibility(visible);
 	},
	// 加载图层数据及初始化工具条
	initLayerDataAndToolbar : function() {
		Toolbar.init();
		GisObject.layerQuery.layerQueryLayer.on('dbl-click', function(evt) {
			var graphic = evt.graphic;
			if (graphic.id === 'editToolbarGraphic') {
				GisObject.toolbar.editToolbar.deactivate();
				var result = SpaceSearch.getGraphicDataByGeometry(graphic.attributes.byLayerId, graphic.geometry);
				GisOpe.showChooseDialog(1, graphic.attributes.byGraphic,result);
			}
		});
//		this.loadVideoAndStationAndPolicePOI();
	},
	// 加载视频、基站、警力数据
	loadVideoAndStationAndPolicePOI : function() {
		this.getAllVideoPOIDataAndLoadOnMap();
		this.getAllBaseStationPOIAndLoadOnMap();
		this.getAllPolicePowerPOIAndLoadOnMap();
	},
	/**
	 * =================================== 工具方法
	 * ===================================
	 */
	// 鹰眼
	showOverViewerMap : function() {
		var overview = new esri.dijit.OverviewMap({
			map : GisObject.map,
			baseLayer:GisObject.map.getLayer("800"),
			visible : true,
			attachTo : 'bottom-right',
			width : 150,
			height : 150,
			color : '#ff0000'
		});
		overview.startup();
		overview.show();
	},
	// basemap
	swicthBasemap : function() {
		var basemap = new esri.dijit.BasemapGallery({
			showArcGISBasemaps : false,
			map : GisObject.map
		}, 'gallery');
		basemap.startup();
	},

	// 构建图元结构
	buildGraphicFeatures : function(list, symbol) {
		var featureSet = [], self = this, commonUtils = new extras.utils.MapCommonUtils();
		$.each(list, function(idx, item) {
			var feature = {}, geometry;
			feature.id = item.id;

			// -- 地图坐标系转换开始
			var lon = item.x, lat = item.y;
			if (gisConfig.mapType == '1') {// google
				var GCJ = extras.utils.GPSConvertor.gcj_encrypt(parseFloat(lat), parseFloat(lon));
				feature.geometry = {
					x : GCJ.lon,
					y : GCJ.lat
				};
				lon = GCJ.lon;
				lat = GCJ.lat;
			} else {// 天地图等
				feature.geometry = {
					x : item.x,
					y : item.y
				};
			}

			geometry = self.getGeometryPoint(lon, lat);
			if (commonUtils.isWebMercator(geometry.spatialReference)) {
				geometry = self.webMercatorToGeographic(geometry);
			}
			feature.geometry = geometry;
			feature.symbol = dojo.mixin({
				url : item.url
			},Variables.symbol);
			feature.symbol.width=item.width;
			feature.symbol.height=item.height;
			feature.attributes = item;
			featureSet.push(feature);
		});
		return {
			'featureSet' : featureSet
		};
	},
	// 重置弹窗位置
	resizeDialogPosition : function(graphic, dom) {
		var screenPos, geometry = graphic.geometry, graphicShade, dx, dy, offset, center, extent = graphic._extent;
		// 针对polygon定位的处理
		if ((geometry.type == "polygon" || geometry.type == "extent")&& geometry['rings'].length) {
			center = esri.geometry.xyToLngLat(
					(extent['xmin'] + extent['xmax']) / 2,
					(extent['ymin'] + extent['ymax']) / 2);
			geometry = esri.geometry.geographicToWebMercator(new esri.geometry.Point(center[0],center[1]));
		}else if(geometry.type=="point"){
			geometry = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(geometry.x,geometry.y));
		}
		screenPos = GisObject.map.toScreen(geometry);// 将地图坐标转为屏幕坐标
		dx = screenPos.x - $('.ui-popup').width() / 2;
		dy = screenPos.y - $('.ui-popup').height();

		if (graphic._graphicsLayer.clickGraphicPoint) {
			offset = this.getClientOffset();
			dx = dx + offset.x;
			dy = dy + offset.y - 10;
		}
		$('.ui-popup').css({
			'left' : dx,
			'top' : dy
		}).addClass('ui-popup-top');

	},
	// 重置标注弹窗位置
	resizeMarkDialogPosition : function(graphic, dom) {
		var screenPos, geometry = graphic.geometry, graphicShade, dx, dy, offset, center, extent = graphic._extent;
		// 针对polygon定位的处理
		if ((geometry.type == "polygon" || geometry.type == "extent") && geometry['rings']) {
			center = GisObject.map.extent.getCenter();
			geometry = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(center.x,center.y));
		}
		screenPos = GisObject.map.toScreen(geometry);// 将地图坐标转为屏幕坐标
		dx = screenPos.x - $('.ui-popup').width() / 2;
		dy = screenPos.y - $('.ui-popup').height();

		if (graphic._graphicsLayer.clickGraphicPoint) {
			offset = this.getClientOffset();
			dx = dx + offset.x + 300;
			dy = dy + offset.y - 10 + 200;
		}
		dom.css({
			'left' : dx,
			'top' : dy
		}).addClass('ui-popup-top');

	},
	// 获取地图区域与浏览器间的宽高差距
	getClientOffset : function() {
		/*
		 * var isIE89 = (!!navigator.userAgent.match(/MSIE 8.0/)) ||
		 * (!!navigator.userAgent.match(/MSIE 9.0/)); var mapContainer =
		 * document.getElementById('map'); var $mapContainer = $('#map'), offset =
		 * $mapContainer.offset(), paddingTop =
		 * +$mapContainer.css('paddingTop').replace('px',''), paddingBottom =
		 * +$mapContainer.css('paddingBottom').replace('px',''), paddingLeft =
		 * +$mapContainer.css('paddingLeft').replace('px',''), paddingRight =
		 * +$mapContainer.css('paddingRight').replace('px',''), offsetTop =
		 * (offset.top + paddingTop + paddingBottom) || 0, offsetLeft =
		 * (document.documentElement.clientWidth - $mapContainer.width());
		 * offsetLeft = offsetLeft ? (isIE89 ? offsetLeft - 5 : offsetLeft) : 0;
		 * offsetLeft = offsetLeft - paddingLeft - paddingRight;
		 */
		var offset = {};
		if (GisObject.map) {
			offset = {
				y : GisObject.map.position.y,
				x : GisObject.map.position.x
			}
		}
		return offset;

	},
	addClusterLayerEvents : function() {
		var layer = this.getGraphicLayer();
		if (!layer) return;
		layer.on('mouse-over', this.onMouseOverCluster);
		layer.on('mouse-out', this.onMouseOutCluster);
	},
	onMouseOverCluster : function(e) {
		if (e.target.nodeName === 'circle') {
			var activeClusterElement = e.target;
			var graphic = e.graphic;
			var attributes = graphic.attributes;
			var result = SpaceSearch.getGraphicDataByGeometry(layerId,circle.geometry);
			this.showChooseDialog(1, selectedGraphic, result);
		}
	},
	onMouseOutCluster : function(e) {
/*		if (e.target.nodeName === 'circle') {

		}*/
	},
	/**
	 * 居中放大
	 *
	 * @param geometry
	 * @returns
	 */
	centerAndZoom : function(geometry, level, plus) {
		level = level || GisObject.map.getLevel();
		if (plus) {
			level += 2;
		}
		return GisObject.map.centerAndZoom(geometry, level);
	},
	/**
	 * 清除图层 或指定不清除某图层
	 *
	 * @param {}
	 *            options options.measure = true 不清除该图层
	 */
	clearLayer : function(options) {
		options = options || {};
		if ($.isEmptyObject(options)) {
			GisObject.toolbar.clearMeasureLayer();
			GisObject.toolbar.clearDrawLayer();
			GisObject.layerQuery.clearQueryLayer();
		} else {
			!options.measure && GisObject.toolbar.clearMeasureLayer();
			!options.draw && GisObject.toolbar.clearDrawLayer();
			!options.query && GisObject.layerQuery.clearQueryLayer();
		}
	},


	/**
	 * =================================== 通用业务操作
	 * ===================================
	 */

	/**
	 * 定位
	 *
	 * @param {}
	 *            graphicID
	 * @param {}
	 *            layerID
	 * @return {}
	 */
	locateByGraphicID : function(graphicID, layerID) {
		var findGraphic = GisObject.getGraphicByGraphicID(graphicID, layerID);
		if (findGraphic) {
			var geometry = findGraphic.geometry || esri.geometry.webMercatorToGeographic(new esri.geometry.Point(findGraphic.x, findGraphic.y));
			return GisObject.centerAndZoom(geometry, 13);
		}
	},
	locateFeatureById : function(graphicID) {
		var findGraphic,geometry;
		for(var i=0,len=this.allDefaultLayers.length;i<len;i++){
			findGraphic = GisObject.getGraphicByGraphicID(graphicID, this.allDefaultLayers[i].layerId);
			if(findGraphic){
				break;
			}
	    }
		if(findGraphic){
			geometry = findGraphic.geometry || esri.geometry.webMercatorToGeographic(new esri.geometry.Point(findGraphic.x, findGraphic.y));
			GisObject.centerAndZoom(geometry, 13);
		}
	},
	locateBayonetFeatureById : function(graphicID) {
		return this.locateByGraphicID(graphicID, Variables.layers.BAYONET_LAYER_ID);
	},
	locatePoliceCaseFeatureById : function(graphicID) {
		return this.locateByGraphicID(graphicID, Variables.layers.POLICE_LAYER_ID);
	},

	/**
	 * TODO 卡点周边查询
	 *
	 * @param pointX
	 * @param pointY
	 */
	spatialCircleQueryByBayonet : function(pointX, pointY) {

	},
	/**
	 * 获取摄像机,加载
	 */
	getAllVideoPOIDataAndLoadOnMap : function() {
		var _this = this;
		/* if(getCecsTreeError) return ; */
		$.getJSON(contextPath + '/commonInfo!getPropValue.action', {
			'propKey' : 'cecs.video.url'
		}, function(result) {
			var cecsTreeDataUrl = result.data;
			$.ajax({
				url : cecsTreeDataUrl,
				type : 'POST',
				success : function(result) {
					if (result != null) {
						var json = (new Function('return ' + result))();
						var data = TreeDataToList(json, []);
						_this.loadAllVideoPOIData(data);
					}
				},
				error : function() {
					errorBox('获取监控设备失败');
				}
			});
		});
	},


	/**
	 * 地图加载摄像机
	 *
	 * @param {}
	 *            data
	 */
	loadAllVideoPOIData : function(channelData) {
		var channelObj = {};
		var featureSet = [];
		var x, y, icon, symbol;

		// 落地数据
		for (var i = 0; i < channelData.length; i++) {
			var status = (channelData[i].Status == 'ONLINE' ? 1 : 0);
			var facade = channelData[i].Facade;
			icon = (status == 1 ? (facade == 1 ? 'ball_normal_icon.png'
					: 'camera_normal_icon.png')
					: (facade == 1 ? 'ball_error_icon.png'
							: 'camera_error_icon.png'));
			if (channelData[i].GPS_X  && channelData[i].GPS_Y) {
				var ptX = parseFloat(channelData[i].GPS_X);
				var ptY = parseFloat(channelData[i].GPS_Y);
				var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(ptX,ptY));
				featureSet.push({
					'id' : channelData[i].ID,
					'name' : channelData[i].Name,
					'icon' : contextPath + '/images/gis_js/camera/' + icon,
					'controlType' : channelData[i].ControlType,
					'defaultStream' : channelData[i].DefaultStream,
					'facade' : channelData[i].Facade,
					'nodeStatus' : status,
					'status' : (status == 1 ? 'ONLINE' : 'OFFLINE'),
					'type' : 'VIDEO_CHN',
					'x' : pt.x,
					'y' : pt.y,
					'lon' : ptX,
					'lat' : ptY,
					'clickEvent' : 'handleCameraClickEvent'
				});
			}
		}

		this.loadClusterLayer(Variables.layers.CAMERA_LAYER_ID, featureSet,
				'ball_normal_icon.png');
		// var layer=GisObject.map.getLayer(Variables.layers.CAMERA_LAYER_ID);
	},
	/**
	 * 获取基站数据并加载到地图
	 */
	showBaseStationLayer : function(isShow) {
		var _this = this;
		if(this.baseStationClusterData){
			if(isShow){
				this.loadClusterLayer(Variables.layers.BASE_STATION_LAYER_ID,this.baseStationClusterData, 'mobile_icon.png');
			}else{
				var layer = GisObject.map.getLayer(Variables.layers.BASE_STATION_LAYER_ID);
				layer && GisObject.map.removeLayer(layer);
			}
		}else{
			$.ajax({
				url : Variables.getAllBaseStationUrl,
				type : 'POST',
				dataType : 'json',
				success : function(result) {
					var data = result.data;
					if (data) {
						var baseData = [];
						for ( var i in data) {
							var ptX = parseFloat(data[i].lon);
							var ptY = parseFloat(data[i].lat);
							var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(ptX, ptY));
							var base = {
								icon : Variables.icons.STATION_ICON_URL,
								'id' : 'JZ_' + data[i].id,
								'name' : data[i].name,
								'type' : data[i].type,
								'operator' : data[i].operator,
								'address' : data[i].address,
								'LAC' : data[i].LAC,
								'CELL' : data[i].CELL,
								'x' : pt.x,
								'y' : pt.y,
								'lon' : ptX,
								'lat' : ptY,
								'clickEvent' : 'handleBaseStationClickEvent'
							};
							baseData.push(base);
						}
						_this.baseStationClusterData=baseData;
						isShow && _this.loadClusterLayer(Variables.layers.BASE_STATION_LAYER_ID,baseData, 'mobile_icon.png');
					}
				}
			});
		}
	},
	/**
	 * 获取警力并加载到地图
	 */
	showPoliceLayer : function(isShow) {
		var _this = this;
		if(this.policeClusterData){
			if(isShow){
				this.loadClusterLayer(Variables.layers.POLICE_LAYER_ID,this.policeClusterData, 'police.png');
			}else{
				var layer = GisObject.map.getLayer(Variables.layers.POLICE_LAYER_ID);
				layer && GisObject.map.removeLayer(layer);
			}
		}else{
			$.ajax({
				url : Variables.getAllPoliceUrl,
				type : 'POST',
				async : false,
				dataType : 'json',
				success : function(result) {
					var data = result.data;
					if (data) {
						var policeData = [];
						for ( var i =0,len=data.length;i<len;i++) {
							var item=data[i];
							var ptX = parseFloat(item.lon);
							var ptY = parseFloat(item.lat);
							var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(ptX, ptY));
							var police = {
								icon : Variables.icons.POLICE_ICON_URL,
								'id' : item.type == 'police' ? 'PNJY_'
										+ item.id : 'PNJC_' + item.id,
								'eventtype' : 'PolicePower',
								'name' : item.type == 'police' ? '警员 : '
										+ item.name : '警车 : '
										+ item.name,
								'type' : item.type,
								'info' : item.info,
								'outTime' : item.outTime,
								'call' : item.call,
								'x' : pt.x,
								'y' : pt.y,
								'lon' : ptX,
								'lat' : ptY,
								'clickEvent' : 'handlePolicePowerClickEvent'
							};
							if (item.type == 'police') {
								police.sex = item.sex;
							}
							policeData.push(police);
						}
						_this.policeClusterData=policeData;
						isShow && _this.loadClusterLayer(Variables.layers.POLICE_LAYER_ID,policeData, 'police.png');
					}
				}
			});
		}

	},
	/**
	 * 加载案件(数据在其他文件赋值）
	 */
	loadAllPoliceCasePOIOnMap : function(data) {
		this.loadClusterLayer(Variables.layers.CASE_LAYER_ID, data,'case_icon.png');
	},
	/**
	 * 加载卡口
	 *
	 */
	showBayonetLayer : function(isShow) {
		var that=this;
		if(this.bayonetClusterData){
			if(isShow){
				this.loadClusterLayer(Variables.layers.BAYONET_LAYER_ID,this.bayonetClusterData, 'bayonet.png');
			}else{
				var layer = GisObject.map.getLayer(Variables.layers.BAYONET_LAYER_ID);
				layer && GisObject.map.removeLayer(layer);
			}
		}else{
			$.ajax({
				url : Variables.getAllBayonetUrl,
				dataType : 'json',
				type : 'post',
				success : function(result) {
					if (result) {
						var data = that.handleBayonetData(result, []);
						//设置数据
						var arr=[];
						for ( var i = 0; i < data.length; i++) {
							var item=data[i];
							if (item.type == 2) {
								var ptX=+item.longitude;
					           	var ptY=+item.latitude;
					           	var pt=esri.geometry.geographicToWebMercator(new esri.geometry.Point(ptX,ptY));
								var obj={
									id:item.id,
									name:item.name,
									facilityType:item.name,
								    eventtype:'Bayonet',
								    icon:contextPath + '/lib/gis/images/camera/bayonet.png',
									x:pt.x,
									y:pt.y,
									lon: ptX,
									lat: ptY,
									parentId:item.parentId,
									type:item.type,
					                clickEvent:'handleBayentClickEvent',
					                deviceID:item.deviceID,
					                dockID:item.dockID
								};
								arr.push(obj);
							}
						}
						that.bayonetClusterData=arr;
						isShow && that.loadClusterLayer(Variables.layers.BAYONET_LAYER_ID, arr,'bayonet.png');
					}
				},
				error : function(e) {
					errorBox("获取卡口点失败");
				}
			});
		}
	},

	/**
	 * 加载聚合数据到地图
	 *
	 * @param {}
	 *            layerId
	 * @param {}
	 *            data
	 * @param {}
	 *            isClear
	 */
	loadClusterLayer : function(layerId, data, icon) {
		var clusterLayer = GisObject.map.getLayer(layerId);
		if (clusterLayer) {
			clusterLayer.clear();
		} else {
			var _this = this;
			clusterLayer = new extras.layer.FlareClusterLayer({
				id : layerId,
				spatialReference : new esri.SpatialReference({
					wkid : 102100
				}),
				subTypeFlareProperty : 'facilityType',
				singleFlareTooltipProperty : 'name',
				displaySubTypeFlares : false,
				displaySingleFlaresAtCount : 10,
				flareShowMode : 'mouse',
				preClustered : false,
				clusterRatio : 65,
				clusterAreaDisplay : null
			});
			this.createContextmenu(layerId,this.getGraphicContextmenu(layerId));
			clusterLayer.on('mouse-over', this.handleGraphicMouserOver);
			clusterLayer.on('mouse-out', this.handleGraphicMouserOut);
			var defaultSym = new esri.symbols.PictureMarkerSymbol({
				url : contextPath + '/lib/gis/images/camera/' + icon,
				width : 15,
				height : 15
			});
			var renderer = new esri.renderers.ClassBreaksRenderer(defaultSym,
					'clusterCount');
			var xlSymbol = new esri.symbols.SimpleMarkerSymbol(
					esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE, 32,
					new esri.symbols.SimpleLineSymbol(
							esri.symbols.SimpleLineSymbol.STYLE_SOLID,
							new dojo.Color([ 200, 52, 59, 0.8 ]), 1),
					new dojo.Color([ 250, 65, 74, 0.8 ]));
			var lgSymbol = new esri.symbols.SimpleMarkerSymbol(
					esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE, 28,
					new esri.symbols.SimpleLineSymbol(
							esri.symbols.SimpleLineSymbol.STYLE_SOLID,
							new dojo.Color([ 41, 163, 41, 0.8 ]), 1),
					new dojo.Color([ 51, 204, 51, 0.8 ]));
			var mdSymbol = new esri.symbols.SimpleMarkerSymbol(
					esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE, 24,
					new esri.symbols.SimpleLineSymbol(
							esri.symbols.SimpleLineSymbol.STYLE_SOLID,
							new dojo.Color([ 82, 163, 204, 0.8 ]), 1),
					new dojo.Color([ 102, 204, 255, 0.8 ]));
			var smSymbol = new esri.symbols.SimpleMarkerSymbol(
					esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE, 22,
					new esri.symbols.SimpleLineSymbol(
							esri.symbols.SimpleLineSymbol.STYLE_SOLID,
							new dojo.Color([ 230, 184, 92, 0.8 ]), 1),
					new dojo.Color([ 255, 204, 102, 0.8 ]));
			renderer.addBreak(0, 19, smSymbol);
			renderer.addBreak(20, 150, mdSymbol);
			renderer.addBreak(151, 1000, lgSymbol);
			renderer.addBreak(1001, Infinity, xlSymbol);
			clusterLayer.setRenderer(renderer);
			clusterLayer.infoTemplate = null;
			GisObject.map.addLayer(clusterLayer);
		}
		clusterLayer.addData(data);
		clusterLayer.on('click', this.handleClickGraphicEvent);
	},
	handleBayonetData:function(bayonetData, list){
		for ( var i = 0,len=bayonetData.length; i < len; i++) {
			var bayonet=bayonetData[i];
			if (bayonet.type == 2) {
				bayonet.value = bayonet.chlID;
				bayonet.index = i;
				bayonet.longitude=+bayonet.longitude+0.0000000001*i;
				bayonet.latitude=+bayonet.latitude+0.0000000001*i;
				list.push(bayonet);
			}
			if (bayonet.children) {
				this.handleBayonetData(bayonet.children, list);
			}
		}
		return list;
	},
	handleFaceData:function(faceData,list){
		for ( var i = 0,len=faceData.length; i < len; i++) {
			var face=faceData[i];
			if (face.channelID >0 && face.Type != "DOMAIN" && face.Type != "VIDEO_DEV") {
				face.id=face.channelID;
				list.push(face);
			}
			if (face.SubNode) {
				this.handleFaceData(face.SubNode, list);
			}
		}
		return list;
	},
	handlePoliceCarData:function(carData,list){
		for(var i =0,len=carData.length;i<len;i++){
			var car=carData[i];
			if(car.nodeType=='CopCar'){
				list.push(car);
			}
			if(car.children){
				this.handlePoliceCarData(car.children,list);
			}
		}
		return list;
	},
	/**
	 * 图层点击事件
	 */
	handleClickGraphicEvent : function(e) {
		var clickEvent = e.graphic.attributes.clickEvent;
		switch (clickEvent) {
		case 'handleCameraClickEvent':
			this.handleCameraClickEvent(e.graphic);
			break;
		case 'handleBaseStationClickEvent':
			this.handleBaseStationClickEvent(e.graphic.attributes);
			break;
		case 'handlePolicePowerClickEvent':
			this.handlePolicePowerClickEvent(e.graphic.attributes);
			break;
		}
		;
	},
	/**
	 * 摄像头点击事件
	 */
	handleCameraClickEvent : function(graphic) {
		var cameraItem = graphic.attributes;
		cameraItem.attributes = cameraItem;
		var treeObj = $.fn.zTree.getZTreeObj("deviceTree");
		var nodes = treeObj.getNodesByParam("ID", cameraItem.id, null);
		if (nodes.length > 0) {
			treeObj.selectNode(nodes[0]);
		}
		if (cameraItem.status == "OFFLINE") {
			warningBox("设备不在线，请点击其他设备");
			return;
		}
		// playVideo(cameraItem);
		VideoPatrol.showVideoPanel(graphic);
	},
	/**
	 * 基站点击事件
	 */
	handleBaseStationClickEvent : function(attributes) {
		var id = attributes['id'];
		var name = attributes['name'];
		// 根据透传--自定义展示详细信息窗口内容。
		var aa = getBaseDiv(attributes);
		artDialog({
			content : aa,
			id : id,
			title : name,
			lock : false,
			style : 'succeed noClose'
		});
	},
	/**
	 * 创建右键菜单
	 */
	createContextmenu : function(layerId,menuArr) {
		var _this = this;
		require([ "dijit/Menu", "dijit/MenuItem", "dijit/MenuSeparator" ],
				function(Menu, MenuItem, MenuSeparator) {
//					var menuArr = _this.getGraphicContextmenu(layerId);
					var ctxMenuForGraphics = new Menu({});
					for (var i = 0; i < menuArr.length; i++) {
						ctxMenuForGraphics.addChild(new MenuItem(menuArr[i]));
					}
					_this.menuObjArr[layerId] = ctxMenuForGraphics;
					ctxMenuForGraphics.startup();
				});

	},
	/**
	 * graphic 悬浮
	 *
	 * @param {}
	 *            e
	 */
	handleGraphicMouserOver : function(e) {
		if (!e.graphic.attributes.isCluster) {
			GisOpe.contextMenuGraphic = e.graphic;
			var layerId = e.currentTarget.id.substr(0, e.currentTarget.id.lastIndexOf('_'));
			GisOpe.menuObjArr[layerId].bindDomNode(e.graphic.getDojoShape().getNode());
		}
	},
	/**
	 * graphic 移出
	 *
	 * @param {}
	 *            e
	 */
	handleGraphicMouserOut : function(e) {
		if (!e.graphic.attributes.isCluster) {
			var layerId = e.currentTarget.id.substr(0, e.currentTarget.id.lastIndexOf('_'));
			GisOpe.menuObjArr[layerId].unBindDomNode(e.graphic.getDojoShape().getNode());
		}
	},
	/**
	 * 警力点击
	 *
	 * @param {}
	 *            attributes
	 */
	handlePolicePowerClickEvent : function(attributes) {
		var id = attributes['id'];
		var name = attributes['name'];
		// 根据透传--自定义展示详细信息窗口内容。
		var aa = getPoliceDiv(attributes);
		artDialog({
			content : aa,
			id : id,
			title : name,
			lock : false,
			style : 'succeed noClose'
		});
	},
	/*
	 * 选择弹窗 type: 类型（工具条搜索弹窗 0,右键搜索弹窗 1）
	 */
	showChooseDialog : function(type, graphic, result) {
		// js 创建dom并添加
		$("#cameraList").remove();
		var ul = document.createElement('ul');
		ul.setAttribute('id', 'cameraList');
		ul.setAttribute('checkedNum', '0');
		if (!graphic._graphicsLayer) {
			graphic._graphicsLayer = {};
		}
		graphic._graphicsLayer.clickGraphic = graphic;
		graphic._graphicsLayer.hasDialog = true;
		graphic._graphicsLayer.type = "fill";
		document.getElementById('chooseCameraDialog').appendChild(ul);
		if (result.length > 0) {
			$('.tip').show();
			$('#errorMsg').hide();
			for (var i = 0; i < result.length; i++) {
				var span = document.createElement('span');
				var input = document.createElement('input');
				input.setAttribute('class', 'cameraCheckBox');
				input.setAttribute('id', result[i].id);
				input.setAttribute('type', 'checkbox');
				var img = document.createElement('img');
				img.setAttribute('src', result[i].icon);
				img.setAttribute('class', 'cameraIcon');
				span.appendChild(input);
				span.appendChild(img);
				var lspan = document.createElement('span');
				lspan.innerHTML = result[i].name;
				span.appendChild(lspan);
				var li = document.createElement('li');
				li.appendChild(span);
				document.getElementById('cameraList').appendChild(li);
				$(input).change(function() {
					var num = parseInt($('#cameraList').attr('checkedNum'));
					if ($(this).is(':checked')) {
						if (num > 4) {
							$(this).removeAttr('checked');
						}
					} else {
						if (num > 0) {
							num--;
							$('#cameraList').attr('checedNum', num);
						}
					}
				});

			}
		} else {
			$('#errorMsg').show();
			$('.tip').hide();
		}
		var _this = this;
		Variables.chooseCameraDialog = mDialog.showDialog({
			title : '查询结果',
			width : 232,
			align : 'top',
			content : document.getElementById('chooseCameraDialog'),
			onshow : function() {
				var count = (result.length > 4 ? 4 : result.length);
				var szNodeIdArray = [];
				for (var i = 0; i < count; i++) {
					document.getElementById(result[i].id).setAttribute('checked', 'checked');
					szNodeIdArray.push(result[i].id);
				}
				if (szNodeIdArray.length > 0) {
					_this.startPlayVideo(szNodeIdArray);
				}
				GisOpe.resizeDialogPosition(graphic);
			},
			onclose : function() {
				if (type === 0) {
					_this.clearLayerById('GXX_GIS_QUERYRESULT_LAYER');
				}
			},
			okValue : '开始播放',
			ok : function() {
				var szNodeIdArray = [];
				var arry = $('.cameraCheckBox');
				for (var i = 0; i < arry.length; i++) {
					if (arry[i].checked) {
						var szNodeId = $(arry[i]).attr('id')
						szNodeIdArray.push(szNodeId);
					}
				}
				if (szNodeIdArray.length > 0) {
					_this.startPlayVideo(szNodeIdArray);
				}
			}
		});
		Variables.chooseCameraDialog.show();
	},
	/**
	 * 清除对话框
	 *
	 * @param {}
	 *            obj
	 */
	clearDialog : function(obj) {
		obj && obj.close().remove();
	},
	/**
	 * 清空layer
	 *
	 * @param {}
	 *            id
	 */
	clearLayerById : function(layerId) {
		var layer = GisObject.map.getLayer(layerId);
		layer && layer.clear();
	},
	/**
	 * 框选播放
	 */
	startPlayVideo : function(szNodeIdArr) {
		var url = contextPath+ "/workbench!index.action?pageType=playRealtimeVideo";
		var gis = this;
		var cancelFn = function() {
			this.iframe.contentWindow.cancelOcx();
			gis.clearLayerById('GXX_GIS_QUERYRESULT_LAYER');
		};
		$.dialog.data('type', 1);
		$.dialog.data('id', szNodeIdArr.join(","));
		openWin(url, 800, 530, '实时视频', null, null, cancelFn, 'playvideo');
		$('#win').window('close');
	},
	/**
	 * 右键菜单内容设置
	 *
	 * @param {}
	 *            layerId
	 * @return {}
	 */
	getGraphicContextmenu : function(layerId) {
		var result=[];
		var _this = this;
		switch (layerId) {
		case Variables.layers.BASE_STATION_LAYER_ID:
		case Variables.layers.POLICE_LAYER_ID:
		case Variables.layers.BAYONET_LAYER_ID:
		case Variables.layers.CASE_LAYER_ID:
			result = [{
						"label" : "查看周边视频",
						"onClick" : function() {
							_this.handleContextMenuClick(GisOpe.contextMenuGraphic,Variables.layers.CAMERA_LAYER_ID);
						}
					},{
						"label" : "查看周边基站",
						"onClick" : function(evt) {
							_this.handleContextMenuClick(GisOpe.contextMenuGraphic,Variables.layers.BASE_STATION_LAYER_ID);
						}
					},{
						"label" : "查看卡点过车",
						"onClick" : function(evt) {
							_this.handleContextMenuClick(GisOpe.contextMenuGraphic,Variables.layers.BAYONET_LAYER_ID);
						}
					} ];
			break;
		case Variables.layers.CAMERA_LAYER_ID:
			result = [{
						"label" : "查看周边视频",
						"onClick" : function(evt) {
							_this.handleContextMenuClick(GisOpe.contextMenuGraphic,Variables.layers.CAMERA_LAYER_ID);
						}
					},{
						"label" : "查看周边基站",
						"onClick" : function(evt) {
							_this.handleContextMenuClick(GisOpe.contextMenuGraphic,Variables.layers.BASE_STATION_LAYER_ID);
						}
					},{
						"label" : "查看卡点过车",
						"onClick" : function(evt) {
							_this.handleContextMenuClick(GisOpe.contextMenuGraphic,Variables.layers.BAYONET_LAYER_ID);
						}
					}, {
						"label" : "添加摘要任务",
						"onClick" : function(evt) {
							js_addVsas(GisOpe.contextMenuGraphic.attributes);
						}
					}, {
						"label" : "查看摘要结果",
						"onClick" : function(evt) {
							js_checkVsas(GisOpe.contextMenuGraphic.attributes);
						}
					} ];
			break;

		}
		return result;
	},

	/**
	 * 处理指定图层的右键事件
	 *
	 * @param {}
	 *            evt
	 * @param {}
	 *            layerId
	 */
	handleContextMenuClick : function(selectedGraphic, layerId) {
		var circleSymbol = new esri.symbols.SimpleFillSymbol(
				esri.symbols.SimpleFillSymbol.STYLE_SOLID,
				new esri.symbols.SimpleLineSymbol(
						esri.symbols.SimpleLineSymbol.STYLE_DOT,
						new esri.Color([ 151, 249, 0, 0.8 ]), 3),
				new esri.Color([ 151, 249, 0, 0.45 ]));

		var circle = new esri.geometry.Circle({
			center : selectedGraphic.geometry,
			radius : Variables.SpaceSearch.defaultRadius
		});
		GisObject.layerQuery.layerQueryLayer.clear();
		var graphic = new esri.graphic(circle, circleSymbol, {
			byLayerId : layerId,
			byGraphic : selectedGraphic
		});
		graphic.id = 'editToolbarGraphic';
		GisObject.layerQuery.layerQueryLayer.add(graphic);
		var extent = new esri.geometry.Extent(
				selectedGraphic.geometry.x - 5000,
				selectedGraphic.geometry.y - 5000,
				selectedGraphic.geometry.x + 5000,
				selectedGraphic.geometry.y + 5000, new esri.SpatialReference({
					wkid : 102100
				}));
		GisObject.map.setExtent(extent);
		GisObject.toolbar.editToolbar.activate(esri.toolbars.edit.SCALE,graphic);
		var result = SpaceSearch.getGraphicDataByGeometry(layerId,circle.geometry);
		this.showChooseDialog(1, selectedGraphic, result);
	},
	/**
	 * 弹窗(跟随处理)
	 *
	 * @param graphic
	 *            图元对象
	 * @param option
	 *            artDialog配置项
	 */
	showDialog : function(graphic, option) {
		this.clearDialog(this.dialogObj);
		if (!graphic) return;

		layer = graphic._layer;// 图元所属图层
		graphic._graphicsLayer.clickGraphic = graphic;// 记录当前点击的graphic图元
		graphic._graphicsLayer.clickGraphicPoint = true;

		// 弹窗默认配置
		var settings = $.extend({
			title : "监控",
			id : '_b_' + new Date().getTime(),
			width : 'initial',
			align : 'top',
			// anchor: graphic._shape.rawNode,
			onshow : function() {
				GisOpe.resizeDialogPosition(graphic);
			},
			onclose : function() {
				GisOpe.clearLayer(option.clearLayer);
				layer.clickGraphic = null;
				layer.clickGraphicPoint = false;
			}
		}, option);

		// loaded with iframe
		if (option.url && option.oniframeload) {
			settings.oniframeload = function() {
				GisOpe.resizeDialogPosition(graphic);
				option.oniframeload();
			}
		}
		// show option
		if (option.onshow) {
			settings.onshow = function() {
				GisOpe.resizeDialogPosition(graphic);
				option.onshow.call(this);
			}
		}
		// close option
		if (option.onclose) {
			settings.onclose = function() {
				GisOpe.clearLayer(option.clearLayer);
				layer.clickGraphic = null;
				layer.clickGraphicPoint = false;
				option.onclose.call(this);
			}
		}
		// Init Dialog
		this.dialogObj = mDialog.showDialog(settings);
		return this.dialogObj;
	},
	/**
	 * 对指定图元进行范围搜索
	 *
	 * @param targetGraphic
	 *            目标图元
	 * @param radius
	 *            所属范围半径
	 * @returns
	 */
	spatialCircleQuery : function(targetGraphic, radius) {
		var spatialSymbol, simpleLineSymbol, spatialCircle, center, radius;
		this.clearLayer();
		simpleLineSymbol = {
			type : "esriSFS",
			style : "esriSFSSolid",
			color : [ 0, 0, 0, 64 ],
			// color: [206,220,233,64],
			outline : {
				type : "esriSLS",
				style : "esriSLSSolid",
				width : 3,
				// color:[45,149,239,0.79]
				color : [ 206, 220, 233, .79 ]
			}
		};

		center = targetGraphic.geometry;
		if(targetGraphic.geometry.spatialReference.isWebMercator()){
			center = esri.geometry.webMercatorToGeographic(targetGraphic.geometry);
		}

		radius = radius || Variables.SpaceSearch.defaultRadius;

		GisObject.centerAt(center.x, center.y);

		spatialCircle = new esri.geometry.Circle({
			center : center,
			radius : radius
		});

		var circleGraphic = GisObject.layerDraw.addCircle(spatialCircle, simpleLineSymbol, targetGraphic.attributes);

		return GisOpe.getGraphicAtrributesByGraphic(targetGraphic._layer, circleGraphic);
	},
	/**
	 * 构建图元结构（针对Cluster）
	 *
	 * @param graph
	 * @returns {___anonymous55054_55055}
	 */
	buildGraphicStructForCluster : function(graph) {
		if (!graph) return;
		var feature = {}, geometry, lon, lat, commonUtils = new extras.utils.MapCommonUtils();
		feature.id = graph.id;
		// -- 地图坐标系转换开始
		lon = graph.x;
		lat = graph.y;
		if (gisConfig.mapType == '1') {// google
			var GCJ = extras.utils.GPSConvertor.gcj_encrypt(parseFloat(lat), parseFloat(lon));
			lon = GCJ.lon;
			lat = GCJ.lat;
		}
		geometry = this.getGeometryPoint(lon, lat);
		if (commonUtils.isWebMercator(geometry.spatialReference)) {
			geometry = this.webMercatorToGeographic(geometry);
		}
		dojo.mixin(feature, graph);
		feature.geometry = geometry;
		feature.attributes = graph;
		var usageType=graph.usageType || graph.UsageType || 1;
		feature._layer = GisObject.map.getLayer(this.allDefaultLayers[usageType-1].layerId);
		return feature;
	},
	/**
	 * 添加虚线
	 *
	 * @param points
	 *            [[],[]]
	 */
	addDashdotPolyline : function(points) {
		var dotSimpleLineSymbol = {
			type : "esriSLS",
			style : "esriSLSDashDotDot",
			width : 1,
			color : [ 31, 193, 43, 255 ]
		};
		GisObject.layerDraw.addPolyline(points, dotSimpleLineSymbol)
	},
	/**
	 * 添加实线
	 *
	 * @param points
	 *            [[x,y],[]]
	 */
	addSolidPolyline : function(points) {
		var solidSimpleLineSymbol = {
			type : "esriSLS",
			style : "esriSLSSolid",
			width : 1,
			color : [ 251, 60, 36, 255 ]
		};
		GisObject.layerDraw.addPolyline(points, solidSimpleLineSymbol)
	},
	/**
	 * 添加线
	 *
	 * @param points
	 *            线的点坐标 [[x,y],[]]
	 * @param lineType
	 *            线类型（dash，dashdot,dot,nul,solid）
	 */
	addPolyLine : function(points, lineType) {
		var lines = {
			dash : 'esriSLSDash',
			dashdot : 'esriSLSDashDotDot',
			dot : 'esriSLSDot',
			nul : 'esriSLSNull',
			solid : 'esriSLSSolid'
		}, simpleLineSymbol = {
			type : "esriSLS",
			style : lines[lineType] || "esriSLSSolid",
			width : 1,
			color : [ 251, 60, 36, 255 ]
		};
		GisObject.mapCommonUtils.addPolyline(Variables.layers.TRACE_LAYER_ID, points, simpleLineSymbol);
	},
	/**
	 * 墨卡托转为地图坐标
	 *
	 * @param {}
	 *            geometry
	 * @return {}
	 */
	webMercatorToGeographic : function(geometry) {
		return esri.geometry.webMercatorToGeographic(geometry);
	},
	/**
	 * 获取坐标
	 *
	 * @param x
	 * @param y
	 * @returns {esri.geometry.Point}
	 */
	getGeometryPoint : function(x, y) {
		return new esri.geometry.Point(x, y, GisObject.map.spatialReference);
	},
	xyToLngLat : function(x, y) {
		var center = esri.geometry.xyToLngLat(x, y);
		return {
			x : center[0],
			y : center[1]
		};
	},
	lngLatToXY : function(lng, lat) {
		var center = esri.geometry.lngLatToXY(lng, lat);
		return {
			x : center[0],
			y : center[1]
		};
	},
	getMapExtent: function(){
 		return GisObject.map.extent;
 	},
 	isMapExtentExistGeometry: function(geometry){
 		var extent = this.getMapExtent();
 		return extent.contains(geometry);
 	},
	// 获取图层级别
	getMapLevel : function() {
		return GisObject.map.getLevel();
	},
	// 放大
	setZoom : function(level) {
		GisObject.map.setZoom(level || 10);
	},
	/**
	 * 根据图元ID从指定图层中获取图元
	 *
	 * @param {}
	 *            graphicID 图元ID
	 * @param {}
	 *            layerID 图层ID 默认设备图层
	 */
	getGraphicById : function(graphicID, layerID) {
		if (!graphicID) return;
		var layerID = layerID || Variables.layers.CAMERA_LAYER_ID;
		return GisObject.layerQuery.getGraphicById(layerID, graphicID);
	},
	/**
	 * 根据图元ID从指定图层中获取图元(不对聚合做操作)
	 */
	getGraphicByIdNoCluster:function(graphicID, layerID){
		if (!graphicID) return;
		var layer = layerID || Variables.layers.CAMERA_LAYER_ID;
		return GisObject.layerQuery.getGraphicByIdNoCluster(layerID, graphicID);
	},
	/**
	 * 根据坐标系获取该坐标系范围内的图元
	 *
	 * @param {}
	 *            layer 图层对象或图层ID
	 * @param {}
	 *            geometry
	 * @return {}
	 */
	getGraphicByGeometry : function(layer, geometry) {
		var foundGraphics = [];
		if (layer && geometry) {
			if (typeof layer === "string") {
				layer = GisObject.map.getLayer(layer);
			}
			if(!layer) return foundGraphics;
			var allGraphic = layer.graphics;
			if (!allGraphic) return foundGraphics;
			for (var i = 0, len = allGraphic.length; i < len; i++) {
				var g = allGraphic[i];
				g.geom = this.webMercatorToGeographic(this.getGeometryPoint(g.geometry.x, g.geometry.y,g.geometry.spatialReference));
				g.szNodeId = g.id;
				if (g.attributes && g.attributes.isCluster && geometry.contains(this.webMercatorToGeographic(this.getGeometryPoint(g.attributes.x,g.attributes.y)))) {

					for (var k = 0; k < g.attributes.clusterCount; k++) {
						var tgraphic = g.attributes.data[k];
						tgraphic.geom = this.webMercatorToGeographic(this.getGeometryPoint(g.geometry.x, g.geometry.y,g.geometry.spatialReference));
						tgraphic.szNodeId = g.id;
						tgraphic.layerId = g.getLayer()._id;
						tgraphic.spatialReference = g.geometry && g.geometry.spatialReference;
						var graphic = GisOpe.buildGraphicStructForCluster(tgraphic);
						foundGraphics.push(graphic);
					}
				} else if (g.geometry && geometry.contains(g.geometry)) {
					foundGraphics.push(g);
				} else if (geometry.contains(this.webMercatorToGeographic(this.getGeometryPoint(g.x, g.y)))) {
					foundGraphics.push(g);
				}
			}
		}
		return foundGraphics;
	},
	/**
	 * 从图层中找到指定的图元 或 根据聚合图元，从图层中找到该聚合图元所有的包含数据信息(不包含指定图元本身)
	 *
	 * @param {}
	 *            layer 图层对象或图层ID
	 * @param {}
	 *            graphic
	 * @return {}
	 */
	getGraphicAtrributesByGraphic : function(layer, graphic) {
		var foundGraphics = [], geometry = graphic.geometry;
		if (layer && geometry) {
			if (typeof layer === "string") {
				layer = GisObject.map.getLayer(layer);
			}
			if(!layer) return foundGraphics;
			var allGraphic = layer.graphics;
			for (var i = 0, len = allGraphic.length; i < len; i++) {
				var g = allGraphic[i];
				var noTargetGraphic = [];
				if (g.attributes && g.attributes.isCluster && geometry.contains(this.webMercatorToGeographic(this.getGeometryPoint(g.attributes.x,g.attributes.y)))) {
					noTargetGraphic = g.attributes.data.concat([]);
					for (var k = 0; k < noTargetGraphic.length; k++) {
						if (graphic.attributes.id == noTargetGraphic[k].id) {
							noTargetGraphic.splice(k, 1);
							break;
						}
					}
					foundGraphics = foundGraphics.concat(noTargetGraphic);
				} else if (geometry.contains(g.geometry)) {
					if (graphic.attributes.id == g.attributes.id)
						continue;
					foundGraphics.push(g.attributes);
				}
			}
		}
		return foundGraphics;
	},
	/**
	 * 替换图元图片
	 *
	 * @param graphicID
	 *            图元ID
	 * @param imageSrc
	 *            图元图片链接
	 * @param width
	 *            图元图片宽度
	 * @param height
	 *            图元图片高度
	 */
	changeCameraMarkerImage : function(graphicID, imageSrc, width, height) {
		var graphic, symbol;
    	for(var i=0,len=this.allDefaultLayers.length;i<len;i++){
    		graphic = this.getGraphicById(graphicID,this.allDefaultLayers[i].layerId);
    		if(graphic){
    			break;
    		}
	    }
		if (!graphic) return;
		symbol = graphic.symbol || {};
		symbol.url = imageSrc;
		symbol.width = width || symbol.width || 16;
		symbol.height = height || symbol.height || 16;
		graphic.setSymbol(new esri.symbols.PictureMarkerSymbol(symbol));
	},
	/**
	 * 轨迹追踪设备图元状态图标
	 *
	 * @param {}
	 *            markerList
	 */
	addTracePictureMarker : function(markerList) {
		markerList = this.buildGraphicFeatures(markerList);
		GisObject.layerManager.addGraphicToMap(Variables.layers.TRACE_LAYER_ID, 0, markerList, true);
	},
	/**
	 * 清除轨迹追踪图元
	 */
	clearTraceLayer : function() {
		var traceLayer = GisObject.map.getLayer(Variables.layers.TRACE_LAYER_ID);
		traceLayer && traceLayer.clear();
	},
	disableContextMenu: function(id){
		$('#' + (id || 'map')).on('contextmenu',function(evt){
			evt.preventDefault();
			return false;
		})
	},
	/**
	 * 隐藏指定图层的图元
	 *
	 * @param {}
	 *            layer 图层id 或 图层对象
	 */
	hideGraphicsByLayer : function(layer) {
		var graphics = GisObject.layerQuery.getAllGraphic(layer);
		$.each(graphics, function(index, graphic) {
			graphic.hide();
		});
	},
	/**
	 * 显示指定图层的图元
	 *
	 * @param {}
	 *            layer 图层id 或 图层对象
	 */
	showGraphicsByLayer : function(layer) {
		var graphics = GisObject.layerQuery.getAllGraphic(layer);
		$.each(graphics, function(index, graphic) {
			graphic.show();
		});
	},
	setExtent: function(xmin, ymin, xmax, ymax, spatialReference){
		GisObject.map.setExtent(new esri.geometry.Extent(xmin, ymin, xmax, ymax, new esri.SpatialReference(spatialReference.wkid)));
	}
};
var Storage = {
	setItem : function(list) {
		window.localStorage.setItem("mapMark", list);
	},
	getItem : function() {
		return window.localStorage.getItem("mapMark");
		/*
		 * GisOpe.markMapList.push(JSON.parse(window.sessionStorage.getItem("mapMark")));
		 * Storage.setItem(GisOpe.markMapList);
		 */
	},
	showItem : function() {
		var markList = [];
		if (!Storage.getItem() == '') {
			markList = JSON.parse(Storage.getItem());
		}
		var markHtml = '';
		for (var i = 0; i < markList.length; i++) {
			var value = markList[i].markInfo;
			if (value == '')
				continue;
			markHtml += "<li onclick='GisOpe.showMapMark()' data-id="
					+ markList[i].id
					+ ">"
					+ value
					+ "<span class='delIcon' title='删除' onclick='GisOpe.delMapMark()'>×</span></li>";

		}
		$(".mapMarkList").empty();
		$(".mapMarkList").append(markHtml);
	}
};
