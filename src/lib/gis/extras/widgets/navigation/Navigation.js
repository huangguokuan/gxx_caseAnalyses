/**
 * Created by K on 2017/7/31.
 */
/**
 * @fileOverview  地图导航组件
 * @module extras/widgets/navigation
 */

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/dom",
  "dojo/on",
  "dojo/dom-construct",
  "dojo/dom-style",
  "dojo/dnd/Source",
  "dojo/dnd/Moveable",
  "esri/domUtils",
  "esri/geometry/webMercatorUtils",
  "esri/geometry/Point",
  "esri/dijit/Scalebar"
], function(
  declare,
  lang,
  dom,
  on,
  domConstruct,
  domStyle,
  Source,
  Moveable,
  domUtils,
  webMercatorUtils,
  Point,
  Scalebar
) {
  return declare(null, {
    className: 'Navigation',
    /**
     * @constructs
     *
     */
    constructor: function(map) {
      this.map = map;

      this.navigation = null;
      this.coordinate = null;
      this.scalebar = null;

      this.currentZoom = this.map.getZoom();
      this.minZoom = this.map.getMinZoom();
      this.maxZoom = this.map.getMaxZoom();
    },
    /**
     * @description 添加工具条
     * @method addNavigationToolbar()
     * @memberOf module:extras/widgets/Navigation#
     *
     * @param {object} option 工具条参数
     * @param {object} option.circleL [圆盘距离地图左侧距离]
     * @param {object} option.circleT [圆盘距离地图顶部距离]
     * @param {object} option.circleW [圆盘宽度]
     * @param {object} option.circleH [圆盘高度]
     * @param {object} option.circleBg [圆盘背景色]
     * @param {object} option.arrowW [方向箭头尺寸]
     * @param {object} option.arrowColor [方向箭头颜色]
     * @param {object} option.extendT [缩放级别矩形容器距离圆盘顶部距离]
     * @param {object} option.extendW [缩放级别矩形容器宽度]
     * @param {object} option.extendH [缩放级别矩形容器高度]
     * @param {object} option.zoomFS [缩放按钮字体大小]
     * @param {object} option.zoomColor [缩放按钮字体颜色]
     * @param {object} option.sliderH [缩放小滑块高度]
     * @param {object} option.sliderMT [缩放小滑块高度距离缩放滑块容器顶部距离]
     * @param {type} option [description]
     *
     *
     * @example
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     navigation.addNavigationToolbar({
     *       circleL: 30,
     *       circleT: 30
     *     })
     *   })
     * </script>
     * 
     */
    addNavigationToolbar: function(option) {
      return this._createNavigationToolbar(option);
    },
    /**
     * @description 显示工具条
     * @method showNavigationToolbar()
     * @memberOf module:extras/widgets/Navigation#
     *
     * @param {type} option [description]
     *
     *
     * @example
     * <button id="btn">显示</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.showNavigationToolbar()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    showNavigationToolbar: function() {
      return this._showNavigationToolbar()
    },
    /**
     * @description 隐藏工具条
     * @method hideNavigationToolbar()
     * @memberOf module:extras/widgets/Navigation#
     *
     * @param {type} option [description]
     *
     *
     * @example
     * <button id="btn">隐藏</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.hideNavigationToolbar()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    hideNavigationToolbar: function() {
      return this._hideNavigationToolbar()
    },
    /**
     * @private
     * @description 显示工具条
     * @return {type} [description]
     */
    _showNavigationToolbar: function() {
      dojo.fadeIn({
        node: this.navigation
      }).play()
    },
    /**
     * @private
     * @description 隐藏工具条
     * @return {type} [description]
     */
    _hideNavigationToolbar: function() {
      dojo.fadeOut({
        node: this.navigation
      }).play()
    },
    /**
     * @private
     * @description 创建工具条节点
     * @param  {object} option [工具体节点参数]
     * @return {type} [HTMLObject]
     */
    _createNavigationToolbar: function(option) {
      var setting = {
        circleL: 20,
        circleT: 50,
        circleW: 56,
        circleH: 56,
        circleBg: "#FFF",
        arrowW: 8,
        arrowColor: "#0D83D8",
        extendT: 110,
        extendW: 16,
        extendH: 100,
        zoomFS: 16,
        zoomColor: "#0D83D8",
        sliderH: 6,
        sliderMT: 2
      };

      lang.mixin(setting, option);


      var defaultZoomSlider = dom.byId('mapDiv_zoom_slider');
      if (defaultZoomSlider) {
        domStyle.set(defaultZoomSlider, {
          "display": "none"
        });
      }

      this.navigation = domConstruct.create('div', {
        id: 'customNavigation'
      }, dom.byId(this.map.id));


      /**
       * 圆形结构
       * @type {[type]}
       */
      var circleContainer = domConstruct.create('div', {
        id: 'circle'
      }, this.navigation);

      domStyle.set(circleContainer, {
        "position": "absolute",
        "left": setting.circleL + "px",
        "top": setting.circleT + "px",
        "width": setting.circleW + "px",
        "height": setting.circleW + "px",
        "borderRadius": 50 + "%",
        "backgroundColor": setting.circleBg
      });
      /**
       * 方向箭头
       * @type {[type]}
       */
      var topArrow = domConstruct.create('div', {
        id: 'topArrow'
      }, circleContainer);

      var rightArrow = domConstruct.create('div', {
        id: 'rightArrow'
      }, circleContainer);

      var bottomArrow = domConstruct.create('div', {
        id: 'bottomArrow'
      }, circleContainer);

      var leftArrow = domConstruct.create('div', {
        id: 'leftArrow'
      }, circleContainer);

      /**
       * 方向箭头处理程序
       * @type {[type]}
       */
      dojo.connect(topArrow, 'click', lang.hitch(this, function(evt) {
        return this.panUp();
      }));

      dojo.connect(rightArrow, 'click', lang.hitch(this, function(evt) {
        return this.panRight();
      }));

      dojo.connect(bottomArrow, 'click', lang.hitch(this, function(evt) {
        return this.panDown();
      }));

      dojo.connect(leftArrow, 'click', lang.hitch(this, function(evt) {
        return this.panLeft();
      }));

      domStyle.set(topArrow, {
        "position": "absolute",
        "cursor": "pointer",
        "top": setting.arrowW + "px",
        "left": 50 + "%",
        "width": 0,
        "height": 0,
        "-ms-transform": "translateX(-50%)",
        "transform": "translateX(-50%)",
        "borderLeft": setting.arrowW + "px solid transparent",
        "borderRight": setting.arrowW + "px solid transparent",
        "borderBottom": (setting.arrowW - 2) + "px solid " + setting.arrowColor,
      });

      domStyle.set(rightArrow, {
        "position": "absolute",
        "cursor": "pointer",
        "top": 50 + "%",
        "right": ((setting.arrowW - 2) - setting.arrowW) + "px",
        "width": 0,
        "height": 0,
        "-ms-transform": "translateY(-50%)",
        "transform": "translateY(-50%)",
        "borderLeft": (setting.arrowW - 2) + "px solid " + setting.arrowColor,
        "borderRight": setting.arrowW + "px solid transparent",
        "borderTop": setting.arrowW + "px solid transparent",
        "borderBottom": setting.arrowW + "px solid transparent",
      });

      domStyle.set(bottomArrow, {
        "position": "absolute",
        "cursor": "pointer",
        "bottom": setting.arrowW + "px",
        "left": 50 + "%",
        "width": 0,
        "height": 0,
        "-ms-transform": "translateX(-50%)",
        "transform": "translateX(-50%)",
        "borderLeft": setting.arrowW + "px solid transparent",
        "borderRight": setting.arrowW + "px solid transparent",
        "borderTop": (setting.arrowW - 2) + "px solid " + setting.arrowColor,
      });

      domStyle.set(leftArrow, {
        "position": "absolute",
        "cursor": "pointer",
        "top": 50 + "%",
        "left": ((setting.arrowW - 2) - setting.arrowW) + "px",
        "width": 0,
        "height": 0,
        "-ms-transform": "translateY(-50%)",
        "transform": "translateY(-50%)",
        "borderLeft": setting.arrowW + "px solid transparent",
        "borderRight": (setting.arrowW - 2) + "px solid " + setting.arrowColor,
        "borderTop": setting.arrowW + "px solid transparent",
        "borderBottom": setting.arrowW + "px solid transparent",
      });

      /**
       * 垂直矩形dom
       * @type {[type]}
       */
      var extendContainer = domConstruct.create('div', {
        id: 'extend'
      }, this.navigation);
      /**
       * 放大按钮
       * @type {[type]}
       */
      var zoomIn = domConstruct.create('div', {
        id: 'zoomIn',
        innerHTML: '+'
      }, extendContainer);
      /**
       * 滑动条容器
       * @type {[type]}
       */
      var sliderContainer = domConstruct.create('div', {
        id: 'sliderContainer'
      }, extendContainer);
      /**
       * 缩小按钮
       * @type {[type]}
       */
      var zoomOut = domConstruct.create('div', {
        id: 'zoomOut',
        innerHTML: '-'
      }, extendContainer);


      var slider = domConstruct.create('div', {
        id: 'slider',
      }, sliderContainer);

      domStyle.set(extendContainer, {
        "position": "absolute",
        "left": (setting.circleL + (setting.circleW - setting.extendW) / 2) + "px",
        "top": setting.extendT + "px",
        "width": setting.extendW + "px",
        "height": setting.extendH + "px",
        "display": "-webkit-box",
        "display": "-ms-flexbox",
        "display": "flex",
        "WebkitBoxOrient": "vertical",
        "WebkitBoxDirection": "normal",
        "MsFlexDirection": "column",
        "flexDirection": "column",
        "WebkitBoxPack": "space-between",
        "MsFlexPack": "space-between",
        "justifyContent": "space-between",
        "WebkitBoxAlign": "center",
        "MsFlexAlign": "center",
        "alignItems": "center",
        "backgroundColor": "transparent"
      });

      domStyle.set(zoomIn, {
        "width": 100 + "%",
        "fontSize": setting.zoomFS + "px",
        "fontWeight": "bold",
        "textAlign": "center",
        "color": setting.zoomColor,
        "cursor": "pointer",
        "border": "2px solid " + setting.zoomColor,
        "borderRadius": "4px",
        "backgroundColor": setting.circleBg,
      });

      domStyle.set(zoomOut, {
        "width": 100 + "%",
        "fontSize": setting.zoomFS + "px",
        "fontWeight": "bold",
        "textAlign": "center",
        "color": setting.zoomColor,
        "cursor": "pointer",
        "border": "2px solid " + setting.zoomColor,
        "borderRadius": "4px",
        "backgroundColor": setting.circleBg,
      });

      domStyle.set(sliderContainer, {
        "position": "relative",
        "width": 50 + "%",
        "MozFlexGrow": 2,
        "WebkitFlexGrow": 2,
        "flexGrow": 2,
        "marginTop": setting.sliderMT + "px",
        "backgroundColor": setting.arrowColor,
      });

      var sildeHeight = dojo.getContentBox(sliderContainer).h - 10; // 10 = 6+4(height+ border)

      domStyle.set(slider, {
        "position": "absolute",
        "top": (sildeHeight * (1 - this.currentZoom / this.maxZoom)) + "px",
        "left": 2 - (setting.extendW / 2) + "px", // borderWidth - contentWidth/2
        "width": setting.extendW + "px",
        "height": setting.sliderH + "px",
        "cursor": "pointer",
        "border": "2px solid " + setting.arrowColor,
        "backgroundColor": setting.circleBg,
      });

      /**
       * 放缩处理程序
       * @return {[type]}      [description]
       */
      dojo.connect(zoomIn, 'click', lang.hitch(this, function(evt) {
        this.zoomIn();

        return this._updateSlider(slider, sildeHeight);
      }));

      dojo.connect(zoomOut, 'click', lang.hitch(this, function(evt) {
        this.zoomOut();

        return this._updateSlider(slider, sildeHeight);
      }));
    },

    /**
     * @private
     * @description 更新silder位置
     * @param  {HTMLObject Element} slider [节点参数]
     * @param  {number} sildeHeight [节点参数]
     * @return {type} [description]
     */
    _updateSlider: function(slider, sildeHeight) {
      domStyle.set(slider, {
        "top": (sildeHeight * (1 - this.currentZoom / this.maxZoom)) + "px",
      });
    },

    /**
     * @description 地图放大
     * @method zoomIn()
     * @memberOf module:extras/widgets/Navigation#
     *
     * @return {number} currentZoom [当前缩放级别]
     *
     *
     * @example
     * <button id="btn">+</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.zoomIn()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    zoomIn: function() {
      if (this.currentZoom != this.maxZoom) {
        this.map.setLevel(this.currentZoom + 1);
        this.currentZoom++
      } else {
        this.map.setLevel(this.maxZoom);
        this.currentZoom = this.maxZoom;
      }

      return this.currentZoom
    },

    /**
     * @description 地图缩小
     * @method zoomOut()
     * @memberOf module:extras/widgets/Navigation#
     *
     * @return {number} currentZoom [当前缩放级别]
     *
     *
     * @example
     * <button id="btn">-</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.zoomOut()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    zoomOut: function() {
      if (this.currentZoom != this.minZoom) {
        this.map.setLevel(this.currentZoom - 1);
        this.currentZoom--
      } else {
        this.map.setLevel(this.minZoom);
        this.currentZoom = this.minZoom;
      }

      return this.currentZoom
    },

    /**
     * @description 地图上移
     * @method panUp()
     * @memberOf module:extras/widgets/Navigation#
     *
     * @return {type}  [description]
     *
     *
     * @example
     * <button id="btn">上移</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.panUp()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    panUp: function() {
      return this.map.panUp();
    },

    /**
     * @description 地图右移
     * @method panRight()
     * @memberOf module:extras/widgets/Navigation#
     *
     * @return {type}  [description]
     *
     *
     * @example
     * <button id="btn">右移</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.panRight()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    panRight: function() {
      return this.map.panRight();
    },

    /**
     * @description 地图下移
     * @method panDown()
     * @memberOf module:extras/widgets/Navigation#
     *
     * @return {type}  [description]
     *
     *
     * @example
     * <button id="btn">下移</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.panDown()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    panDown: function() {
      return this.map.panDown();
    },

    /**
     * @description 地图左移
     * @method panLeft()
     * @memberOf module:extras/widgets/Navigation#
     *
     * @return {type}  [description]
     *
     *
     * @example
     * <button id="btn">左移</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.panLeft()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    panLeft: function() {
      return this.map.panLeft();
    },
    /**
     * @description 添加比例尺工具
     * @method addScalebar()
     * @memberOf module:extras/widgets/Navigation#
     * @param {object} option [比例尺样式参数]
     * @param {string} option.style [比例尺样式]
     * @param {string} option.attach [比例尺位置]
     * @param {string} option.unit [比例尺样单位]
     * @return {type}  [description]
     *
     *
     * @example
     * <button id="btn">添加比例尺</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.addScalebar()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    addScalebar: function(option) {
      var setting = {
        style: 'line',
        attach: 'top-left',
        unit: 'dual',
      };

      lang.mixin(setting, option);

      this.scalebar = new Scalebar({
        map: this.map,
        scalebarStyle: setting.style,
        attachTo: setting.attach,
        scalebarUnit: setting.unit
      });
    },
    /**
     * @description 显示比例尺工具
     * @method showScalebar()
     * @memberOf module:extras/widgets/Navigation#
     * @return {type}  [description]
     *
     *
     * @example
     * <button id="btn">显示比例尺</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.showScalebar()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    showScalebar: function() {
      return this.scalebar.show()
    },
    /**
     * @description 隐藏比例尺工具
     * @method hideScalebar()
     * @memberOf module:extras/widgets/Navigation#
     * @return {type}  [description]
     *
     *
     * @example
     * <button id="btn">隐藏比例尺</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.hideScalebar()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    hideScalebar: function() {
      return this.scalebar.hide()
    },
    /**
     * @description 添加坐标工具
     * @method addCoordinate()
     * @memberOf module:extras/widgets/Navigation#
     * @param {object} option [坐标工具样式参数]
     * @param {number} option.bottom [坐标工具距离底部距离]
     * @param {number} option.left [坐标工具距离左边距离]
     * @param {number} option.offset [坐标工具x、y数据容器间距]
     * @param {number} option.fontSize [坐标工具字体大小]
     * @return {type}  [description]
     *
     * 
     * @example
     * <button id="btn">添加坐标工具</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.addCoordinate()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    addCoordinate: function(option) {
      var mapContainer = dojo.byId(this.map.id);
      domStyle.set(mapContainer, {
        "position": "relative"
      });

      var coordinate = this._createCoordinate(option);

      var longText = dojo.query('.longText', coordinate)[0];
      var latText = dojo.query('.latText', coordinate)[0];
      var timer = null;

      dojo.connect(this.map, 'onMouseMove', function(evt) {
        clearTimeout(timer);
        timer = setTimeout(function() {
          var mapPoint = evt.mapPoint;
          var geometry = new webMercatorUtils.webMercatorToGeographic(new Point(mapPoint.x, mapPoint.y))

          longText.innerHTML = ('' + geometry.x).slice(0, option && option.decimal ? option.decimal : 9);
          latText.innerHTML = ('' + geometry.y).slice(0, option && option.decimal ? option.decimal : 9);
        }, 10);
      });
    },
    /**
     * @description 显示坐标工具
     * @method showCoordinate()
     * @memberOf module:extras/widgets/Navigation#
     * @return {type}  [description]
     *
     *
     * @example
     * <button id="btn">显示坐标工具</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.showCoordinate()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    showCoordinate: function() {
      return this._showCoordinate()
    },
    /**
     * @private
     * @description 显示坐标信息
     * @return {type} [description]
     */
    _showCoordinate: function() {
      dojo.fadeIn({
        node: this.coordinate
      }).play()
    },
    /**
     * @description 隐藏坐标工具
     * @method hideCoordinate()
     * @memberOf module:extras/widgets/Navigation#
     * @return {type}  [description]
     *
     *
     * @example
     * <button id="btn">隐藏坐标工具</button>
     * <script>
     *   require([
     *     "extras/MapInitObject",
     *     "extras/widgets/navigation/Navigation"
     *   ], function(
     *     MapInitObject,
     *     Navigation
     *   ) {
     *     var navigation = new Navigation();
     *     $('#btn').on('click', function(evt) {
     *       navigation.hideCoordinate()
     *     })
     *     
     *   })
     * </script>
     * 
     */
    hideCoordinate: function() {
      return this._hideCoordinate()
    },
    /**
     * @private
     * @description 隐藏坐标信息
     * @return {type} [description]
     */
    _hideCoordinate: function() {
      dojo.fadeOut({
        node: this.coordinate
      }).play()
    },
    /**
     * @private
     * @description 创建坐标信息工具dom容器
     * @param {object} option [坐标工具样式参数]
     * @return {type} [HTMLObject]
     */
    _createCoordinate: function(option) {
      var setting = {
        bottom: 10,
        left: 20,
        offset: 10,
        fontSize: 14
      };

      lang.mixin(setting, option);

      this.coordinate = domConstruct.create('div', {
        id: 'customCoordinate'
      }, dom.byId(this.map.id));

      var longContainer = domConstruct.create('p', {
        id: 'longitude',
        innerHTML: 'x：'
      }, this.coordinate);

      var coordinateX = domConstruct.create('span', {
        class: 'longText'
      }, longContainer);

      var latContainer = domConstruct.create('p', {
        id: 'latitude',
        innerHTML: 'y：'
      }, this.coordinate);

      var coordinateY = domConstruct.create('span', {
        class: 'latText'
      }, latContainer);

      domStyle.set(this.coordinate, {
        "position": "absolute",
        "bottom": setting.bottom + "px",
        "left": setting.left + "px",
        "zIndex": 2000,
        "fontSize": setting.fontSize + "px",
        "fontWeight": "bold"
      });

      domStyle.set(longContainer, {
        "display": "inline-block"
      });

      domStyle.set(latContainer, {
        "display": "inline-block",
        "marginLeft": setting.offset + "px"
      });

      return this.coordinate;
    }
  })
})
