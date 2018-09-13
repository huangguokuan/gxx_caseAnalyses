/**
 * Created by K on 2017/8/3.
 */

/**
 * @fileOverview  地图联动组件
 * @module extras/widgets/linkage
 */
define([
  "dojo/_base/declare",
  "esri/layers/GraphicsLayer",
  "esri/graphic",
  "esri/symbols/SimpleMarkerSymbol"
], function(
  declare,
  GraphicsLayer,
  Graphic,
  SimpleMarkerSymbol
) {
  /**
   * 创建鼠标联动图层
   */
  var graphicLayer = new GraphicsLayer({ id: 'mapLinkagerLayer' });
  return declare(null, {
    className: 'LinkAge',
    /*地图集合*/
    _maps: null,
    /*地图联动集合*/
    _activeMapEventHandlers: null,
    /*鼠标联动集合*/
    _mapMouseOverEventHandlers: null,
    /*联动图层*/
    _mouseGraphicLayers: null,
    /*联动状态地图*/
    activeMap: null,
    /*鼠标样式*/
    mouseSymbol: null,
    _mouseGraphics: null,
    /**
     *
     * @constructor
     */
    constructor: function() {
      this._maps = [];
      this._activeMapEventHandlers = [];
      this._mapMouseOverEventHandlers = [];
      this._mouseGraphicLayers = [];

      this.mouseSymbol = new SimpleMarkerSymbol({
        "color": [255, 0, 0],
        "size": 10,
        "xoffset": 0,
        "yoffset": 0,
        "type": "esriSMS",
        "style": "esriSMSCircle",
        "outline": {
          "color": [255, 0, 0],
          "widht": 1,
          "type": "esriSLS",
          "style": "esriSLSSolid"
        }
      });

      this._mouseGraphics = [];
    },
    /**
     * @description 添加地图联动集合
     * @method addMap()
     * @memberOf module:extras/widgets/linkage/Linkage#
     *
     * @param {type} map 需要联动的地图
     * @return {type} [description]
     *
     *
     * 
     * @example
     * <caption>addMap() 添加地图联动的用法</caption>
     * require(["extras/MapInitObject","extras/widgets/linkage/Linkage"],function(MapInitObject,Linkage){
     *   var GISObject = new MapInitObject('mapDiv');
     *   var GISObject2 = new MapInitObject('mapDiv2');
     *   var linkAge = new Linkage();
     *   $('#add').on('click', function() {
     *     linkAge.addMap(GISObject.map);
     *   })
     * })
     */
    addMap: function(map) {
      var that = this;
      /**
       * 若地图已经处于联动地图集合，则无需将该地图添加至联动地图集
       */
      if (this._maps.indexOf(map) != -1) {
        return;
      }
      /**
       * 鼠标所在地图为激活状态地图
       */
      var mouseHandle = map.on('mouse-over', function(evt) {
        that.activeMap = map;

        /**
         * 移除上一个主地图的相关事件
         */
        that._clearActiveMapEvents();
        /**
         * 绑定当前地图进行事件
         */
        that._bindActiveMapEvents();
      });

      var graphic = new Graphic();
      graphic.setSymbol(this.mouseSymbol);
      map.addLayers(graphicLayer);
      graphicLayer.add(graphic);

      /**
       * 将地图添加至联动地图集合
       */
      this._maps.push(map);
      this._mapMouseOverEventHandlers.push(mouseHandle);
      this._mouseGraphicLayers.push(graphicLayer);
      this._mouseGraphics.push(graphic);
    },
    /**
     * @description 移除地图，取消联动
     * @method removeMap()
     * @memberOf module:extras/widgets/linkage/Linkage#
     *
     * @param {type} map 需要取消联动的地图
     * @return {type} [description]
     *
     *
     * 
     * @example
     * <caption>removeMap() 移除地图联动的用法</caption>
     * require(["extras/MapInitObject","extras/widgets/linkage/Linkage"],function(MapInitObject,Linkage){
     *   var GISObject = new MapInitObject('mapDiv');
     *   var GISObject2 = new MapInitObject('mapDiv2');
     *   var linkAge = new Linkage();
     *   $('#remove').on('click', function() {
     *     linkAge.removeMap(GISObject2.map);
     *   })
     * })
     */
    removeMap: function(map) {
      var index = this._maps.indexOf(map);
      this._maps.splice(index, 1);
      var graphicLayer = this._mouseGraphicLayers.splice(index, 1)[0];

      if (graphicLayer) {
        graphicLayer.clear();
        map.removeLayer(graphicLayer);

        if (this._mapMouseOverEventHandlers[index]) {
          this._mapMouseOverEventHandlers[index].remove();
          this._mapMouseOverEventHandlers.splice(index, 1);
        }

        this._mouseGraphics.splice(index, 1);
        this._clearActiveMapEvents();
      }
    },
    /**
     * @private
     * @description 清除当前地图联动事件
     * @return {description}
     */
    _clearActiveMapEvents: function() {
      this._activeMapEventHandlers.forEach(function(eventHandler) {
        eventHandler.remove();
      })
    },
    /**
     * @private
     * @description 为当前地图添加联动
     * @return {description}
     */
    _bindActiveMapEvents: function() {
      var that = this;

      this._activeMapEventHandlers.push(this.activeMap.on("zoom-end", function(evt) {
        that._maps.forEach(function(map) {
          if (map != that.activeMap) {
            map.setExtent(evt.extent);
          }
        });
      }));

      this._activeMapEventHandlers.push(this.activeMap.on("pan-end", function(evt) {
        that._maps.forEach(function(map) {
          if (map != that.activeMap) {
            map.setExtent(evt.extent);
          }
        });
      }));

      this._activeMapEventHandlers.push(this.activeMap.on("mouse-move", function(evt) {
        that._maps.forEach(function(map) {
          var index = that._maps.indexOf(map);
          var graphic = that._mouseGraphics[index];

          if (map != that.activeMap) {
            graphicLayer.show();
            graphic.setGeometry(evt.mapPoint);
          } else {
            graphicLayer.hide();
          }

        });
      }));
    }
  })
})
