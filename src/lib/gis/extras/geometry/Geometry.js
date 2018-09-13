define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/json",
  "dojo/dom",
  "dojo/on",
  "dojo/dom-construct",
  "dojo/dom-style",
  "esri/domUtils",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/geometry/Point",
  "esri/graphic",
  "esri/geometry/normalizeUtils",
  "esri/tasks/GeometryService",
  "esri/tasks/AreasAndLengthsParameters",
  "esri/tasks/LengthsParameters",
  "esri/tasks/BufferParameters",
  "dojo/colors",
  "extras/controls/ToolBar"
], function(
  declare,
  lang,
  array,
  json,
  dom,
  on,
  domConstruct,
  domStyle,
  domUtils,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  SimpleFillSymbol,
  Point,
  Graphic,
  normalizeUtils,
  GeometryService,
  AreasAndLengthsParameters,
  LengthsParameters,
  BufferParameters,
  Color,
  ToolBar
) {
  var setting = {

  };
  var geometryService = null;
  var toolbar = null;
  return declare(null, {
    className: 'Geometry',

    constructor: function(map, params) {
      this.map = map;
      lang.mixin(this, lang.mixin(setting, params));
      this.symbolLine = SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0, 0.65]), 2);
      this.symbolPolygon = SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0, 0.65]), 2), new Color([0, 0, 0, 0.25]));
      this.geometryService = new GeometryService(this.url);
      this.geometryService.on("lengths-complete", lang.hitch(this, this._measureLength));
      this.geometryService.on("areas-and-lengths-complete", lang.hitch(this, this._measureArea));
    },
    // measure: function(option) {
    //   toolbar && toolbar.deactivateDraw();
    //   toolbar = new ToolBar(this.map);
    //   toolbar.draw(option);
    //   toolbar.drawToolbar.on('draw-end', dojo.hitch(this, this._addGrahpicsToMap));
    // },
    /**
     * @description 测量长度
     * @method measureLength()
     * @memberOf module:extras/geometry/Geometry#
     *
     * @param {type} option [description]
     *
     *
     * @example
     * <button id="btn">测量长度</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/geometry/Geometry"
     *   ], function(
     *     MapInitObject,
     *     Geometry
     *   ) {
     *     var GisObject = new MapInitObject('map',{
     *       zoom: 9
     *     })
     *     var geometry = new Geometry(GisObject.map);
     *     $('#btn').on('click', function(evt) {
     *       geometry.measureLength()
     *     })
     *
     *   })
     * </script>
     *
     */
    measureLength: function() {
      toolbar && toolbar.deactivateDraw();
      toolbar = new ToolBar(this.map)
      toolbar.draw({
        type: 'polyline',
        symbol: this.symbolLine
      });
      toolbar.drawToolbar.on('draw-end', dojo.hitch(this, this._addGrahpicsToMap));
    },
    /**
     * @description 测量面积
     * @method measureLength()
     * @memberOf module:extras/geometry/Geometry#
     *
     * @param {type} option [description]
     *
     *
     * @example
     * <button id="btn">测量面积</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/geometry/Geometry"
     *   ], function(
     *     MapInitObject,
     *     Geometry
     *   ) {
     *     var GisObject = new MapInitObject('map',{
     *       zoom: 9
     *     })
     *     var geometry = new Geometry(GisObject.map);
     *     $('#btn').on('click', function(evt) {
     *       geometry.measureLength()
     *     })
     *
     *   })
     * </script>
     *
     */
    measureArea: function() {
      toolbar && toolbar.deactivateDraw();
      toolbar = new ToolBar(this.map)
      toolbar.draw({
        type: 'polygon',
        symbol: this.symbolPolygon
      });
      toolbar.drawToolbar.on('draw-end', dojo.hitch(this, this._addGrahpicsToMap));
    },

    /**
     * @description 缓冲分析
     * @method measureLength()
     * @memberOf module:extras/geometry/Geometry#
     *
     * @param {type} option 缓冲分析参数
     * @param {type} option.type 缓冲区域几何类型
     * @param {type} option.unit 缓冲单位
     * @param {type} option.distances 缓冲距离
     * @param {type} option.callback 回调函数
     *
     * @example
     * <button id="btn">缓冲分析</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/geometry/Geometry"
     *   ], function(
     *     MapInitObject,
     *     Geometry
     *   ) {
     *     var GisObject = new MapInitObject('map',{
     *       zoom: 9
     *     })
     *     var geometry = new Geometry(GisObject.map);
     *     $('#btn').on('click', function(evt) {
     *       geometry.buffer({
     *         type: type,
     *         unit: unit,
     *         distances: distance,
     *         callback: callbackHandle
     *       })
     *     })
     *
     *   })
     * </script>
     *
     */
    buffer: function(option) {
      toolbar && toolbar.deactivateDraw();
      toolbar = new ToolBar(this.map)
      toolbar.draw(option);
      toolbar.drawToolbar.on('draw-end', dojo.hitch(this, function(evt) {
        this._addBufferGrahpicsToMap(evt, option);
        if (option.callback) {
          return option.callback.apply(null, arguments);
        }
      }));
    },
    /**
     * @description 选择图元
     * @param  {type} option [description]
     * @return {[ype}        [description]
     */
    selectedGrahpic: function(option) {

    },
    /**
     * @description 编辑图元
     * @param  {type} option [description]
     * @return {[ype}        [description]
     */
    editGrahpic: function(option) {

    },
    /**
     * @description 清除图元
     * @param  {type} option [description]
     * @return {[ype}        [description]
     */
    clearGrahpics: function(option) {

    },
    /**
     * @private
     * @description 测量长度
     * @return {array} 返回测量数据
     */
    _measureLength: function(evt) {
      var result = evt.result;
      var data = result.lengths[0].toFixed(3);
      this._showMessage(data);
      return data;
    },
    /**
     * @private
     * @description 测量面积
     * @return {array} 返回测量数据
     */
    _measureArea: function(evt) {
      var result = evt.result;
      // var length = result.lengths[0].toFixed(3);
      var ares = result.areas[0].toFixed(3);
      // var data = [length, ares];
      this._showMessage(ares);
      return ares
    },
    /**
     * @private
     * @description 添加图元至地图
     * @return {type} [description]
     */
    _addGrahpicsToMap: function(evt) {
      var map = this.map;
      var that = this;
      var geometry = evt.geometry;
      var symbol;
      toolbar && toolbar.deactivateDraw();
      switch (geometry.type) {
        case 'polyline':
          {
            var length = geometry.paths[0].length;
            var lengthParams = new LengthsParameters();
            lengthParams.lengthUnit = GeometryService.UNIT_KILOMETER;
            lengthParams.polylines = [geometry];
            this.geometryService.lengths(lengthParams);
            symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0, 0.65]), 2);

            break;
          }
        case "polygon":
          {
            var areasAndLengthParams = new AreasAndLengthsParameters();
            areasAndLengthParams.lengthUnit = GeometryService.UNIT_KILOMETER;
            areasAndLengthParams.areaUnit = GeometryService.UNIT_SQUARE_KILOMETERS;
            this.geometryService.simplify([geometry], function(simplifiedGeometries) {
              areasAndLengthParams.polygons = simplifiedGeometries;
              that.geometryService.areasAndLengths(areasAndLengthParams);
            });
            symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0, 0.65]), 2), new Color([0, 0, 0, 0.25]));

            break;
          }
      }

      var graphic = new Graphic(geometry, symbol);
      map.graphics.add(graphic);
    },
    /**
     * @private
     * @description 添加缓冲区域至地图
     * @return {type} [description]
     */
    _addBufferGrahpicsToMap: function(evt, option) {
      var map = this.map;
      var that = this;
      var geometry = evt.geometry;
      var symbol;

      switch (geometry.type) {
        case "point":
          symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]));
          break;
        case "polyline":
          symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2);
          break;
        case "polygon":
          symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NONE, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));
          break;
      }

      var graphic = new Graphic(geometry, symbol);
      map.graphics.add(graphic);


      var params = new BufferParameters();
      /**
       * 单位
       * @param  {string} option.unit 缓冲距离单位
       * @return {type}             [description]
       */
      switch (option.unit) {
        case 'mile':
          params.unit = GeometryService['UNIT_STATUTE_MILE'];
          break;
        case 'feet':
          params.unit = GeometryService['UNIT_FOOT'];
          break;
        case 'kilometer':
          params.unit = GeometryService['UNIT_KILOMETER'];
          break;
        case 'meter':
          params.unit = GeometryService['UNIT_METER'];
          break;
        case 'nautical_mile':
          params.unit = GeometryService['UNIT_NAUTICAL_MILE'];
          break;
        case 'us_nautical_mile':
          params.unit = GeometryService['UNIT_US_NAUTICAL_MILE'];
          break;
        default:
        case 'meter':
          params.unit = GeometryService['UNIT_METER'];
          break;
      }
      params.distances = [option.distances];
      params.outSpatialReference = map.spatialReference;

      normalizeUtils.normalizeCentralMeridian([geometry]).then(function(normalizedGeometries) {
        var normalizedGeometry = normalizedGeometries[0];

        if (normalizedGeometry.type === "polygon") {

          that.geometryService.simplify([normalizedGeometry], function(geometries) {
            params.geometries = geometries;
            that.geometryService.buffer(params, showBuffer);
          });

        } else {

          params.geometries = [normalizedGeometry];
          that.geometryService.buffer(params, showBuffer);

        }

      });

      function showBuffer(bufferedGeometries) {
        var symbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([255, 0, 0, 0.65]), 2
          ),
          new Color([255, 0, 0, 0.35])
        );

        array.forEach(bufferedGeometries, function(geometry) {
          var graphic = new Graphic(geometry, symbol);
          map.graphics.add(graphic);
        });
      }
    },
    /**
     * @private
     * @description 显示测量数据
     * @return {type} [description]
     */
    _showMessage: function(msg) {
      // do
      // console.log(msg)
    }
  })
})
