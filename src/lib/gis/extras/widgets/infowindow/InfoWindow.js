/**
 * 
 * @authors Ou Yuan (ouyuan@gosuncn.com)
 * @date    2017-10-26 09:31:10
 * @version $Id$
 */

define([
  "dojo/_base/declare",
  "dojo/Evented",
  "dojo/parser",
  "dojo/on",
  "dojo/_base/declare",
  "dojo/dom-construct",
  "dojo/_base/array",
  "dojo/dom-style",
  "dojo/_base/lang",
  "dojo/dom-class",
  "dojo/fx",
  "dojo/Deferred",
  "esri/domUtils",
  "esri/InfoWindowBase"
], function(
  declare,
  Evented,
  parser,
  on,
  declare,
  domConstruct,
  array,
  domStyle,
  lang,
  domClass,
  coreFx,
  Deferred,
  domUtils,
  InfoWindowBase
) {

  /**
   * @description 配置信息窗口容器参数
   * @param {Object} setting.setting 配置信息窗口参数对象
   * @param {number} setting.width 配置信息窗口宽度
   * @param {number} setting.height 配置信息窗口高度
   * @param {number} setting.radius 配置信息窗口圆角半径
   * @param {string} setting.BgColor 配置信息窗口背景色
   * @param {number} setting.closePad 配置信息窗口关闭按钮内边距
   * @param {string} setting.closeColor 配置信息窗口关闭按钮字体颜色
   * @param {number} setting.titHeight 配置信息窗口标题高度
   * @param {number} setting.titPad 配置信息窗口标题内边距
   * @param {number} setting.titSize 配置信息窗口标题字体大小
   * @param {string} setting.titAlign 配置信息窗口标题文字对齐方式
   * @param {string} setting.titColor 配置信息窗口标题字体颜色
   * @param {string} setting.titBgColor 配置信息窗口标题背景色
   * @param {number} setting.contentPad 配置信息窗口内容内边距
   * @param {number} setting.contentSize 配置信息窗口内容字体大小
   * @param {string} setting.contentAlign 配置信息窗口内容文字对齐方式
   * @param {string} setting.contentColor 配置信息窗口内容字体颜色
   * @param {string} setting.contentBgColor 配置信息窗口内容背景色
   */
  var setting = {
    width: 300,
    height: 200,
    radius: 8,
    BgColor: '#FFF',
    closePad: 10,
    closeColor: '#FFF',
    titHeight: 20,
    titPad: 10,
    titSize: 18,
    titAlign: 'left',
    titColor: '#FFF',
    titBgColor: '#00A2F5',
    contentPad: 10,
    contentSize: 12,
    contentAlign: 'left',
    contentColor: 'inherited',
    contentBgColor: '#FFF'
  };
  /*信息窗口在地图中的位置*/
  var showMapPoint = null,
    /*信息窗口在屏幕中的位置*/
    showScreenPoint = null,
    /*初始化地图中心点*/
    initMapCenter = null,
    /*初始化屏幕*/
    initScreenCenter = null;

  return declare([InfoWindowBase, Evented], {
    className: 'InfoWindow',
    /**
     * @constructs
     *
     */
    constructor: function(parameters) {
      /**
       * 扩展实例参数对象
       */
      lang.mixin(this, lang.mixin(setting, parameters));
      /**
       * 创建InfoWindow容器
       */
      this._createInfoWindow();
    },
    /**
     * @private
     * @description 创建infoWindow容器并渲染样式
     * @return {HTMLElement} [返回容器DOM]
     */
    _createInfoWindow: function() {
      /**
       * 设置InfoWindow的属性
       */
      dojo.setAttr(this.domNode, 'id', 'myInfoWindow');
      domStyle.set(this.domNode, {
        "position": "absolute",
        // "-ms-transition": "all .5s linear",
        // "transition": "all .5s linear",
        "zIndex": 2000,
        "width": this.width + "px",
        "height": this.height + "px",
        "borderRadius": this.radius + "px",
        "backgroundColor": this.BgColor
      });
      /**
       * 创建关闭按钮
       */
      this._closeButton = domConstruct.create('div', {
        class: 'close',
        id: 'closet',
        innerHTML: "X",
        title: '关闭'
      }, this.domNode);
      /**
       * 设置关闭按钮样式
       */
      domStyle.set(this._closeButton, {
        "float": "right",
        "color": this.closeColor,
        "padding": this.closePad + "px",
        "lineHeight": 100 + "%",
        "textAlign": "center",
        "verticalAlign": "middle",
        "cursor": "pointer"
      });
      /**
       * 创建标题容器
       */
      this._title = domConstruct.create('div', {
        class: 'title',
        innerHTML: '',
        id: 'title'
      }, this.domNode);
      /**
       * 设置标题样式
       */
      domStyle.set(this._title, {
        "height": this.titHeight + "px",
        "lineHeight": this.titHeight + "px",
        "fontSize": this.titSize + "px",
        "color": this.titColor,
        "padding": this.titPad + "px",
        "textAlign": this.titAlign,
        "verticalAlign": "middle",
        "borderTopLeftRadius": this.radius + "px",
        "borderTopRightRadius": this.radius + "px",
        "backgroundColor": this.titBgColor
      });
      /**
       * 创建内容容器
       */
      this._content = domConstruct.create('div', {
        class: 'content',
        innerHTML: '',
        id: 'content'
      }, this.domNode);
      /**
       * 设置内容样式
       */
      domStyle.set(this._content, {
        "color": this.contentColor,
        "padding": this.contentPad + "px",
        "fontSize": this.contentSize + "px",
        "textAlign": this.contentAlign,
        "backgroundColor": this.contentBgColor,
      });
      /**
       * 创建三角形容器
       */
      this._arrow = domConstruct.create('div', {
        class: 'arrow',
        id: 'arrow'
      }, this.domNode);
      /**
       * 设置三角形样式
       */
      domStyle.set(this._arrow, {
        "position": "absolute",
        "top": 100 + "%",
        "left": 50 + "%",
        "width": 0,
        "height": 0,
        "-ms-transform": "translateX(-50%)",
        "transform": "translateX(-50%)",
        "borderLeft": "20px solid transparent",
        "borderRight": "20px solid transparent",
        "borderTop": "45px solid #FFF",
      });
      /**
       * 点击关闭按钮事件
       */
      on(this._closeButton, 'click', lang.hitch(this, function() {
        this.hide();
      }));

      /**
       * 窗口默认不显示 创建窗口后隐藏
       */
      domUtils.hide(this.domNode);
      /**
       * 窗口显示状态标识
       */
      this.isShowing = false;
    },
    /**
     * @description 设置使用信息窗口的地图，继承至esri/InfoWindowBase
     * @method setMap()
     * @memberOf module:extras/widgets/infowindow/InfoWindow#
     *
     * @param {object} map 使用InfoWindow组件的地图对象
     * @return {type} [description]
     *
     */
    setMap: function(map) {
      this.inherited(arguments);
      /**
       *  绑定地图拖动事件与InfoWindow联动
       */
      map.on("pan", lang.hitch(this, function(pan) {
        var movePoint = pan.delta;
        if (this.isShowing) {
          if (showScreenPoint != null) {
            this._showInfoWindow(showScreenPoint.x + movePoint.x, showScreenPoint.y + movePoint.y);
          }
        }
      }));

      map.on("pan-end", lang.hitch(this, function(panend) {
        var movedelta = panend.delta;
        if (this.isShowing) {
          showScreenPoint.x = showScreenPoint.x + movedelta.x;
          showScreenPoint.y = showScreenPoint.y + movedelta.y;
        }
      }));
      /**
       * 绑定地图滚轮缩放事件与InfoWindow联动
       */
      map.on("zoom-start", lang.hitch(this, function() {

      }));

      map.on("zoom-end", lang.hitch(this, function() {
        if (this.isShowing) {
          showScreenPoint = this.map.toScreen(showMapPoint);
          this._showInfoWindow(showScreenPoint.x, showScreenPoint.y);
        }
      }));
    },
    /**
     * @description 设置标题内容
     * @method setTitle()
     * @memberOf module:extras/widgets/infowindow/InfoWindow#
     *
     * @param {type} title 传入替换的标题内容
     * @return {type} [HTMLElement]
     *
     *
     * 
     * @example
     * <caption>setTitle() 设置标题内容的用法</caption>
     * require(["extras/MapInitObject","extras/widgets/infowindow/InfoWindow"],function(MapInitObject,InfoWindow){
     *   var GISObject = new MapInitObject('mapDiv');
     *   var infoWindow = new InfoWindow(GISObject, options);
     *   infoWindow.setTitle('标题')
     * })
     */
    setTitle: function(title) {
      this.place(title, this._title);
    },
    /**
     * @description 设置窗口内容
     * @method setContent()
     * @memberOf module:extras/widgets/infowindow/InfoWindow#
     *
     * @param {type} title 传入替换的窗口内容
     * @return {type} [HTMLElement]
     *
     *
     * 
     * @example
     * <caption>setContent() 设置窗口内容的用法</caption>
     * require(["extras/MapInitObject","extras/widgets/infowindow/InfoWindow"],function(MapInitObject,InfoWindow){
     *   var GISObject = new MapInitObject('mapDiv');
     *   var infoWindow = new InfoWindow(GISObject, options);
     *   infoWindow.setContent('数据内容')
     * })
     */
    setContent: function(content) {
      this.place(content, this._content);
    },
    /**
     * @private
     * @description 控制infoWindow与地图的联动并显示地图
     * @return {HTMLElement} [返回容器DOM]
     */
    _showInfoWindow: function(x, y) {
      domStyle.set(this.domNode, {
        "left": x - this.width / 2 + "px",
        "top": y - this.height - 50 + "px"
      });
      domUtils.show(this.domNode);
      /**
       * 添加过度效果
       */
      /**
       * coreFx.slideTo({
       * node: this.domNode,
       * left: x - this.params.winWidth / 2 + 15,
       * top: y - this.params.winHeight - 50
       * }).play();
       * domUtils.show(this.domNode);
       */
    },
    /**
     * @description 隐藏信息窗口组件
     * @method hide()
     * @memberOf module:extras/widgets/infowindow/InfoWindow#
     *
     * @param {type} title 传入替换的窗口内容
     * @return {type} [HTMLElement]
     *
     *
     * 
     * @example
     * <caption>hide() 隐藏信息窗口组件的用法</caption>
     * require(["extras/MapInitObject","extras/widgets/infowindow/InfoWindow"],function(MapInitObject,InfoWindow){
     *   var GISObject = new MapInitObject('mapDiv');
     *   var infoWindow = new InfoWindow(GISObject, options);
     *   $('#btn').on('click', function() {
     *     infoWindow.hide()
     *   })
     * })
     */
    hide: function() {
      domUtils.hide(this.domNode);
      this.isShowing = false;
    },
    /**
     * @description 显示信息窗口组件
     * @method show()
     * @memberOf module:extras/widgets/infowindow/InfoWindow#
     *
     * @param {type} title 传入替换的窗口内容
     * @return {type} [HTMLElement]
     *
     *
     *
     * 
     * @example
     * <caption>show() 显示信息窗口组件的用法</caption>
     * require(["extras/MapInitObject","extras/widgets/infowindow/InfoWindow"],function(MapInitObject,InfoWindow){
     *   var GISObject = new MapInitObject('mapDiv');
     *   var infoWindow = new InfoWindow(GISObject, options);
     *   $('#btn').on('click', function() {
     *     infoWindow.show()
     *   })
     * })
     */
    show: function(location) {
      showMapPoint = location;
      initMapCenter = this.map.extent.getCenter();
      initScreenCenter = this.map.toScreen(initMapCenter);

      if (location.spatialReference) {
        location = this.map.toScreen(location);
      }

      var left = location.x - this.width / 2,
        top = location.y - this.height - 50;

      showScreenPoint = location;
      if (top < 5) {
        initScreenCenter.y = initScreenCenter.y + top - 5;
      }
      if (left < 5) {
        initScreenCenter.x = initScreenCenter.x + left - 5;
      }
      this._showInfoWindow(showScreenPoint.x, showScreenPoint.y);
      initMapCenter = this.map.toMap(initScreenCenter);
      this.map.centerAt(initMapCenter);
      this.isShowing = true;
    },
  })
})
