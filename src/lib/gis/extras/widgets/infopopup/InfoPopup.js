/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a InfoPopup.
 * @module extras/InfoPopup
 *
 *
 * @requires dijit._Widget
 * @requires dijit._Templated
 */
define([
    "dojo/_base/declare",
    "dojo/on",
    "dojo/_base/lang",
    "esri/domUtils",
    "dijit/_Widget",
    "dijit/_Templated"
  ],
  function(
    declare,
    on,
    lang,
    domUtils,
    Widget,
    Templated
  ) {
    return declare([dijit._Widget, dijit._Templated],
      /**  @lends module:extras/InfoPopup */
      {
        className: 'InfoPopup',
        /** @member
        map */
        map: null,

        /** @member
        visible */
        visible: false,

        /** @member
        coords */
        coords: null,

        /** @member
        screenCoords */
        screenCoords: null,

        /** @member
        link */
        link: "",

        /** @member
        alignment */
        alignment: "",

        /**
         * @constructs
         * @param {object} params
         */
        constructor: function(params) {
          lang.mixin(this, params);
          this.templatePath = selfUrl + "/templates/InfoPopup.html";
          this.connects = [];
        },

        /**
         * @description postCreate 创建弹窗视图
         * @method
         * @memberOf module:extras/InfoPopup#
         *
         *
         * @example
         * <caption>Usage of postCreate</caption>
         * require(['extras/InfoPopup'],function(InfoPopup){
         *   var instance = new InfoPopup(params);
         *   instance.postCreate();
         * })
         *
         *
         *
         */
        postCreate: function() {
          if (this.map) {
            this.connects.push(dojo.connect(this.map, "onExtentChange", this, "extentChangeHandler"));
            this.connects.push(dojo.connect(this.map, "onPan", this, "panHandler"));
          }
          dojo.setSelectable(this.domNode, false);
          var boxContainerMargin = dojo.marginBox(this.containerNode);
          var boxPopupContent = dojo.contentBox(this.domNode);
          boxContainerMargin.w = boxPopupContent.w;

          dojo.style(this.domNode, {
            "width": 300 + "px",
            "height": "auto",
            "position": "absolute",
            "top": 0,
            "zIndex": 1001,
            "overflow": "hidden",
            "borderRadius": 8 + "px",
            "backgroundColor": "#FFF"
          });

          dojo.style(this.closeContainer, {
            "textAlign": "right",
            "backgroundColor": "#00A2F5"
          });

          dojo.style(this.closeButton, {
            "display": "inline-block",
            "textAlign": "center",
            "padding": 5 + "px",
            "color": "#FFF",
            "cursor": "pointer",
          });

          dojo.style(this.contentNode, {
            "padding": 10 + "px"
          });

          dojo.style(this.titleNode, {
            "padding": "10px 10px 0 10px"
          });

          dojo.style(this.linkNode, {
            "padding": "0 10px 10px 10px"
          });
          /**
           * 关闭按钮事件
           */
          on(this.closeButton, 'click', lang.hitch(this, function() {
            this.hide();
          }));
          /**
           * 隐藏弹窗
           */
          domUtils.hide(this.domNode);
          this.visible = false;
        },

        /**
         * @description uninitialize
         * @method
         * @memberOf module:extras/InfoPopup#
         *
         *
         * @example
         * <caption>Usage of uninitialize</caption>
         * require(['extras/InfoPopup'],function(InfoPopup){
         *   var instance = new InfoPopup(params);
         *   instance.uninitialize();
         * })
         *
         *
         *
         */
        uninitialize: function() {
          dojo.forEach(this.connects,
            function(x) {
              dojo.disconnect(x);
            })
        },

        /**
         * @description setInfo 设置弹窗内容
         * @method
         * @memberOf module:extras/InfoPopup#
         * @param {object}  params
         *
         * @example
         * <caption>Usage of setInfo</caption>
         * require(['extras/InfoPopup'],function(InfoPopup){
         *   var instance = new InfoPopup(params);
         *   instance.setInfo( params);
         * })
         *
         *
         *
         */
        setInfo: function(params) {
          if (params) {
            if (params.title) {
              this.titleNode.innerHTML = params.title;
            }
            if (params.content) {
              this.contentNode.innerHTML = params.content;
              if (dojo.isIE) {
                dojo.query("img", this.contentNode).forEach(function(img) {
                  img.parentNode.removeChild(img);
                });
              }
            }
            this.link = params.link;
            if (params.link) {
              dojo.style(this.linkNode, "display", "block");
              dojo.attr(this.linkNode, "title", this.link);
            } else {
              dojo.style(this.linkNode, "display", "none");
            }

            if (dojo.isIE) {
              dojo.style(this.closeButton, {
                left: "",
                right: "2px"
              });

              var contentBox = dojo.contentBox(this.containerNode);
              if (contentBox.h < 40) {
                dojo.style(this.containerNode, "height", "40px");
              } else {
                dojo.style(this.containerNode, "height", "");
              }
            }

            var b = dojo.coords(this.containerNode);
            var mTop = (b.h / 2) + "px";
            // dojo.style(this.domNode, "marginTop", "-" + mTop);
            // dojo.style(this.leaderNode, "marginTop", mTop);
          }
        },

        /**
         * @description setCoords 设置弹窗坐标
         * @method setCoords()
         * @memberOf module:extras/InfoPopup#
         * @param {string}  mapPoint
         *
         *
         *
         *
         * @example
         * <caption>setCoords 的用法</caption>
         * require(['extras/InfoPopup'],function(InfoPopup){
         *   var instance = new InfoPopup(params);
         *   instance.setCoords( mapPoint);
         * })
         *
         */
        setCoords: function(mapPoint) {
          if (mapPoint) {
            this.coords = mapPoint;
            this.screenCoords = this.map.toScreen(mapPoint);
            this._locate(this.screenCoords);
          }
        },

        /**
         * @description extentChangeHandler 鼠标联动
         * @method extentChangeHandler()
         * @memberOf module:extras/InfoPopup#
         * @param {number} extent
         * @param {string}  delta
         * @param {number}  levelChange
         * @param {string}  lod
         *
         *
         *
         * @example
         * <caption>extentChangeHandler() 的用法</caption>
         * require(['extras/InfoPopup'],function(InfoPopup){
         *   var instance = new InfoPopup(params);
         *   instance.extentChangeHandler(extent, delta, levelChange, lod);
         * })
         *
         */
        extentChangeHandler: function(extent, delta, levelChange, lod) {
          if (this.coords) {
            this.screenCoords = this.map.toScreen(this.coords);
          }
          this._locate(this.screenCoords);
        },

        /**
         * @description panHandler 鼠标拖动处理程序
         * @method panHandler
         * @memberOf module:extras/InfoPopup#
         * @param {number} extent
         * @param {string}  delta
         *
         * @example
         * <caption>panHandler() 的用法</caption>
         * require(['extras/InfoPopup'],function(InfoPopup){
         *   var instance = new InfoPopup(params);
         *   instance.panHandler(extent, delta);
         * })
         *
         *
         *
         */
        panHandler: function(extent, delta) {
          if (this.screenCoords) {
            var sp = new esri.geometry.Point();
            sp.x = this.screenCoords.x + delta.x;
            sp.y = this.screenCoords.y + delta.y;
          }
          this._locate(sp);
        },

        /**
         * @private
         * @description _locate 定位弹窗位置
         * @method
         * @memberOf module:extras/InfoPopup#
         * @param {string}  loc
         *
         *
         */
        _locate: function(loc) {
          try {
            if (loc) {

              var isLeft = (loc.x < this.map.width / 2);

              var isNeutral = Math.abs(loc.x - this.map.width / 2) < 5;

              if (isNeutral) {
                if (this.alignment === "") {
                  this.alignment = isLeft ? "left" : "right";
                }
              } else {
                this.alignment = isLeft ? "left" : "right";
              }

              if (this.alignment === "left") {

                dojo.style(this.domNode, {
                  top: loc.y + "px",
                  left: loc.x + "px",
                  right: ""
                });

                dojo.style(this.leaderNode, {
                  left: "1px",
                  right: ""
                });

                if (!dojo.isIE) {
                  dojo.style(this.closeButton, {
                    left: "",
                    right: "-22px"
                  });

                }
              } else {

                var x = this.map.width - loc.x;
                dojo.style(this.domNode, {
                  top: loc.y + "px",
                  right: x + "px",
                  left: ""
                });

                dojo.style(this.leaderNode, {
                  left: "",
                  right: "1px"
                });

                if (!dojo.isIE) {
                  dojo.style(this.closeButton, {
                    left: "-24px",
                    right: ""
                  });

                }
              }
            }
          } catch (err) {
            // console.error("Error locating infopopup:", err);
          }
        },


        /**
         * @description show 显示弹窗
         * @method show()
         * @memberOf module:extras/InfoPopup#
         *
         *
         * @example
         * <caption>show() 的用法</caption>
         * require(['extras/InfoPopup'],function(InfoPopup){
         *   var instance = new InfoPopup(params);
         *   instance.show();
         * })
         *
         *
         */
        show: function() {
          domUtils.show(this.domNode);
          dojo.fadeIn({
            node: this.domNode
          }).play();
          this.visible = true;
        },

        /**
         * @description hide 隐藏弹窗
         * @method
         * @memberOf module:extras/InfoPopup#
         *
         *
         *
         * @example
         * <caption>hide() 的用法</caption>
         * require(['extras/InfoPopup'],function(InfoPopup){
         *   var instance = new InfoPopup(params);
         *   instance.hide();
         * })
         *
         *
         */
        hide: function() {
          domUtils.hide(this.domNode);
          dojo.fadeOut({
            node: this.domNode
          }).play();
          this.visible = false;
        },

        /**
         * @description onFollowLink 新窗口中打开弹窗链接
         * @method onFollowLink()
         * @memberOf module:extras/InfoPopup#
         * @param {string} evt
         *
         *
         *
         * @example
         * <caption>onFollowLink() 的用法</caption>
         * require(['extras/InfoPopup'],function(InfoPopup){
         *   var instance = new InfoPopup(params);
         *   instance.onFollowLink(evt);
         * })
         *
         */
        onFollowLink: function(evt) {
          window.open(this.link);
        },

        /**
         * @description onClose 关闭销毁弹窗
         * @method
         * @memberOf module:extras/InfoPopup#
         * @param {string} evt
         *
         *
         * @example
         * <caption>Usage of onClose</caption>
         * require(['extras/InfoPopup'],function(InfoPopup){
         *   var instance = new InfoPopup(params);
         *   instance.onClose(evt);
         * })
         *
         */
        onClose: function(evt) {
          dojo.destroy(this.domNode);
          this.visible = false;
        },

        /**
         * @description onPin
         * @method
         * @memberOf module:extras/InfoPopup#
         * @param {string} evt
         *
         * @example
         * <caption>Usage of onPin</caption>
         * require(['extras/InfoPopup'],function(InfoPopup){
         *   var instance = new InfoPopup(params);
         *   instance.onPin(evt);
         * })
         *
         *
         *
         */
        onPin: function(evt) {

          dojo.fadeOut({
            node: this.pinButton
          }).play();
        },
        /**
         * @private
         * @description 修改弹框背景样式
         * @return {HTMLElement} [返回容器DOM]
         */
        _changeBackground: function(toCol) {
          if (this.mouseAnim) { this.mouseAnim.stop(); }

          // Set up the new animation
          this.mouseAnim = dojo.animateProperty({
            node: this.domNode,
            properties: {
              backgroundColor: toCol
            },
            onEnd: dojo.hitch(this, function() {
              // Clean up our mouseAnim property
              this.mouseAnim = null;
            })
          }).play();
        }
      })
  });
