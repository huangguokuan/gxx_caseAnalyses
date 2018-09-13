/**
 * Created by K on 2017/7/31.
 */
/**
 * @fileOverview  地图类型切换组件
 * @module extras/widgets/basemap
 */

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "extras/basic/Radical",
  "dojo/domReady!"
], function(
  declare,
  lang,
  Radical
) {

  /**
   * @description 配置缩略图容器参数
   * @param {Object} setting 配置参数对象
   * @param {string} setting.containerId 配置外层容器ID
   * @param {string} setting.thumbId 配置缩略图容器ID
   * @param {number} setting.width 配置缩略图容器宽度
   * @param {number} setting.height 配置缩略图容器高度
   * @param {number} setting.top 配置缩略图顶部距离
   * @param {string *|| left || right} setting.position 配置缩略图定位位置(靠左\靠右)
   * @param {number} setting.offset 配置缩略图定位偏移量
   * @param {string} setting.baseType 配置基础地图类型（默认基础类型图为地形图）
   * @param {string} setting.switchToType 配置切换到地图类型（默认切换到的类型图为影像图）
   * @param {array} setting.baseThunb 配置基础缩略图背景图（缩略图默认背景图为地形图）
   * @param {array} setting.switchThunb 配置切换到的缩略图背景图（缩略图默认切换背景图为影像图）
   */
  var setting = {
    containerId: 'switchMapContainer',
    thumbId: 'thumbBox',
    width: 200,
    height: 100,
    top: 20,
    position: 'right',
    offset: 10,
    baseType: 'basemap',
    switchToType: 'satellitemap',
    baseThunb: gisConfig.mapImagesUrl + '/common/basemap_imagery.jpg',
    switchThunb: gisConfig.mapImagesUrl + '/common/basemap_streets.jpg',
  };
  return declare(Radical, {
    className: 'Basemap',
    /**
     * @constructs
     *
     */
    constructor: function(map, options) {
      this.map = map;
      lang.mixin(setting, options);
      this._init();
      this._clickHandle();
    },
    /**
     * @private
     * @description 初始化组件，并将缩略图组件插入至地图容器
     * @method
     * @memberOf module:extras/widgets/basemap/BaseMap#
     * @returns {HTMLElement}
     */
    _init: function() {
      dojo.place(this._createThumbContainer(), dojo.byId(this.map.map.id), "last");
    },
    /**
     * @private
     * @description 创建缩略图DOM容器
     * @return {HTMLElement} [返回容器DOM]
     */
    _createThumbContainer: function() {
      /**
       * 创建缩略图
       * @type {HTMLElement}
       */
      var thumbBox = dojo.create('div', {
        id: setting.thumbId,
        basetype: setting.baseType,
        switchtotype: setting.switchToType
      });
      /**
       * 设置缩略图样式
       */
      dojo.style(thumbBox, {
        'position': 'absolute',
        'zIndex': 1000,
        'width': setting.width + 'px',
        'height': setting.height + 'px',
        'top': setting.top + 'px',
        'backgroundImage': 'url(' + setting.baseThunb + ')'
      });
      /**
       * 缩略图定位样式
       * @param  {type} setting.position 缩略图定位位置
       * @return {type}                               [description]
       */
      switch (setting.position) {
        case 'left':
          dojo.style(thumbBox, {
            'left': setting.offset + 'px',
          })
          break;
        case 'right':
          dojo.style(thumbBox, {
            'right': setting.offset + 'px',
          })
          break;
        default:
          break;
      }
      /**
       * 创建缩略图外层包裹容器
       * @type {HTMLElement}
       */
      var thumbContainer = dojo.create('div', {
        id: setting.containerId
      });
      /**
       * 将缩略图插入外层包裹容器
       */
      dojo.place(thumbBox, thumbContainer, "first");


      /**
       * DOM节点动画
       * @type {type}
       */
      dojo.fadeIn({
        node: thumbContainer,
        duration: 500
      }).play();

      return thumbContainer;
    },
    /**
     * @description 显示缩略图
     * @method show()
     * @memberOf module:extras/widgets/baseMap/BaseMap#
     * 
     * @return {type} [description]
     *
     *
     * 
     * @example
     * <caption>show() 显示缩略图用法</caption>
     * require(["extras/MapInitObject","extras/widgets/basemap/BaseMap"],function(MapInitObject,BaseMap){
     *   var GISObject = new MapInitObject('mapDiv');
     *   var basemap = new BaseMap(GISObject, options);
     *   $('#showBtn').on('click', function() {
     *     basemap.show();
     *   })
     * })
     */
    show: function() {
      if (dojo.isIE) {
        dojo.style(dojo.byId(setting.containerId), 'display', 'block')
      } else {
        dojo.fadeIn({
          node: dojo.byId(setting.containerId),
          duration: 500
        }).play();
      }
    },
    /**
     * @description 隐藏缩略图
     * @method hide()
     * @memberOf module:extras/widgets/baseMap/BaseMap#
     * 
     * @return {type} [description]
     *
     *
     * 
     * @example
     * <caption>hide() 隐藏缩略图用法</caption>
     * require(["extras/MapInitObject","extras/widgets/basemap/BaseMap"],function(MapInitObject,BaseMap){
     *   var GISObject = new MapInitObject('mapDiv');
     *   var basemap = new BaseMap(GISObject, options);
     *   $('#hideBtn').on('click', function() {
     *     basemap.hide();
     *   })
     * })
     */
    hide: function() {
      if (dojo.isIE) {
        dojo.style(dojo.byId(setting.containerId), 'display', 'none')
      } else {
        dojo.fadeOut({
          node: dojo.byId(setting.containerId),
          duration: 500
        }).play();
      }
    },
    /**
     * @private
     * @description 点击缩略图容器处理程序
     * @return {type} [description]
     */
    _clickHandle: function() {
      var that = this;
      var thumbBox = dojo.byId(setting.thumbId);
      var typeObj = {};
      dojo.connect(thumbBox, 'onclick', function(evt) {
        typeObj.switchToType = dojo.getAttr(thumbBox, "switchtotype");
        typeObj.baseType = dojo.getAttr(thumbBox, "basetype");

        that._switchHandle(typeObj.switchToType);

        dojo.setAttr(thumbBox, "basetype", typeObj.switchToType);
        dojo.setAttr(thumbBox, "switchtotype", typeObj.baseType);
      });
    },
    /**
     * @private
     * @description 地图切换处理程序
     * @param  {string} type 切换地图类型
     * @return {type}      [description]
     */
    _switchHandle: function(type) {
      switch (type) {
        case 'satellitemap':
          this._switchSatelliteMap();
          break;
        case 'basemap':
          this._switchRoadMap();
          break;
        default:
          // statements_def
          break;
      }
    },
    /**
     * @private
     * @description 地图切换为地形图类型
     * @return {type} [description]
     */
    _switchRoadMap: function() {
      this.map.switchRoadMap();

      return this._switchRoadThunb();
    },
    /**
     * @private
     * @description 地图切换为影像类型
     * @return {type} [description]
     */
    _switchSatelliteMap: function() {
      this.map.switchSatelliteMap();

      return this._switchSatelliteThunb();
    },
    /**
     * @private
     * @description 缩略图切换为地形图类型
     * @return {type} [description]
     */
    _switchRoadThunb: function() {
      var thumbBox = dojo.byId(setting.thumbId);
      /**
       * 切换缩略图背景
       */
      dojo.style(thumbBox, 'backgroundImage', 'url(' + setting.baseThunb + ')');
    },
    /**
     * @private
     * @description 缩略图切换为影像图类型
     * @return {type} [description]
     */
    _switchSatelliteThunb: function() {
      var thumbBox = dojo.byId(setting.thumbId);
      /**
       * 切换缩略图背景
       */
      dojo.style(thumbBox, 'backgroundImage', 'url(' + setting.switchThunb + ')');
    },
  })
})
