/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a ArrowLineSymbol.
 * @module extras/symbols/ArrowLineSymbol
 *
 *
 * @requires dojo._base.declare
 * @requires dojo._base.lang
 * @requires dojo.query
 * @requires dojo.dom
 * @requires dojo.dom-construct
 * @requires dojo.dom-style
 * @requires dojox.gfx
 * @requires esri.geometry.screenUtils
 * @requires esri.symbols.SimpleLineSymbol
 * @requires esri.symbols.SimpleMarkerSymbol
 * @requires esri.symbols.PictureMarkerSymbol
 * @requires esri.graphic
 * @requires esri.geometry.Point
 * @requires esri.geometry.ScreenPoint
 * @requires dojo._base.fx
 * @requires dojo.fx
 * @requires dojo.on
 */
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/query",
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/dom-style",
  "dojox/gfx",
  "esri/geometry/screenUtils",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/PictureMarkerSymbol",
  "esri/graphic",
  "esri/geometry/Point",
  "esri/geometry/ScreenPoint",
  "dojo/_base/fx",
  "dojo/fx",
  "dojo/on"
],
  function (
    declare,
    lang,
    query,
    dom,
    construct,
    style,
    gfx,
    screenUtils,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    PictureMarkerSymbol,
    graphic,
    Point,
    ScreenPoint,
    basefx,
    dojofx,
    on
  ) {
    return declare([SimpleLineSymbol], /**  @lends module:extras/symbols/ArrowLineSymbol */ {
        /**
         * @constructs
         *
         */
        constructor: function (options) {

          this.inherited(arguments);

          this.setStyle(options.style);
          this.setColor(options.color);
          this.setWidth(options.width);

          this.directionSymbols = {
            arrow1: "m0.5,50.5c0,0 99.5,-41 99.5,-41c0,0 0.5,81.5 0.5,81.5c0,0 -100,-40.5 -100,-40.5z",
            arrow2: "M1,50l99.5,-50c0,0 -40,49.5 -40,49.5c0,0 39.5,50 39.5,50c0,0 -99,-49.5 -99,-49.5z",
            arrow3: "m0.5,50.5l90,-50l9,9.5l-79.5,40.5l80,39.5l-10,10.5l-89.5,-50z",
            arrow4: "m55.4605,51.5754l43.0685,-48.2908l-43.3797,48.2908l43.8197,44.8899l-43.5085,-44.8899zm-6.0505,42.3899l-0.44,-88.1807l-43.37967,45.7908l43.81967,42.3899z"
          };

          this.directionColor = options.directionColor || this.color;

          this.directionSize = options.directionSize || 12;
          this.directionPixelBuffer = options.directionPixelBuffer || 40;
          this.animationRepeat = options.animationRepeat;
          this.animationDuration = options.animationDuration || 350;

          this.directionSymbol = options.directionSymbol || "arrow1";

          this.graphics = [];

          this.drawGraphicDirection = this._drawDirection;
          this.type = "ArrowLineSymbol";
        },

        /**
         * @description getStroke
         * @method
         * @memberOf module:extras/symbols/ArrowLineSymbol#
         *
         * @example
         * <caption>Usage of getStroke</caption>
         * var instance = new ArrowLineSymbol();
         * instance.getStroke();
         *
         * @returns string
         */
        getStroke: function () {

          var graphic = arguments.callee.caller.arguments.length > 0 ? arguments.callee.caller.arguments[4] : arguments.callee.caller.caller.arguments[4];
          if (!graphic) {
            return this.inherited(arguments);
          }

          if (graphic.dlsSymbolGroup) {
            return this.inherited(arguments);
          }

          this.graphics.push(graphic);

          var layer = graphic.getLayer();
          var map = layer.getMap();

          graphic.dlsSymbolGroup = layer._div.createGroup();

          this._drawDirection(graphic, layer, map);

          if (!layer.dlsGraphicRemove) {
            layer.dlsGraphicRemove = layer.on("graphic-remove",function (e) {
                if (e.graphic.dlsSymbolGroup) {
                  query(".dls-symbol", e.graphic.dlsSymbolGroup.rawNode).forEach(dojo.destroy);
                  dojo.destroy(e.graphic.dlsSymbolGroup.rawNode);
                  e.graphic.dlsSymbolGroup = null;
                }
              });
          }

          if (!map.graphics.dlsGraphicDraw) {
            map.graphics.dlsGraphicDraw = map.graphics.on("graphic-draw", function (e) {
                if (e.graphic.dlsSymbolGroup) {
                  var g = e.graphic;
                  var sym = g.symbol.type === "ArrowLineSymbol" ? g.symbol : g.symbol.outline && g.symbol.outline.type === "ArrowLineSymbol" ? g.symbol.outline : null;
                  if (sym) {
                    sym.drawGraphicDirection(g, this, this.getMap());
                  }
                }
              });
          }

          if (!map.dlsExtChanged) {
            map.dlsExtChanged = map.on("extent-change", function (e) {
                for (var i = 0, len = this.graphics.graphics.length; i < len; i++) {
                  var g = this.graphics.graphics[i];
                  if (!g.symbol) continue;

                  if (g.attributes && g.attributes.isDirectionalGraphic) {
                    layer.remove(g);
                    j--;
                    jLen--;
                    continue;
                  }
                  var sym = g.symbol.type === "ArrowLineSymbol" ? g.symbol : g.symbol.outline && g.symbol.outline.type === "ArrowLineSymbol" ? g.symbol.outline : null;
                  if (sym) {
                    sym.drawGraphicDirection(g, layer, this);
                  }
                }

                for (var i = 0, len = this.graphicsLayerIds.length; i < len; i++) {
                  var layer = this.getLayer(this.graphicsLayerIds[i]);
                  if (!layer.dlsGraphicRemove) continue;
                  for (var j = 0, jLen = layer.graphics.length; j < jLen; j++) {
                    var g = layer.graphics[j];
                    if (!g.symbol) continue;
                    if (g.attributes && g.attributes.isDirectionalGraphic) {
                      layer.remove(g);
                      j--;
                      jLen--;
                      continue;
                    }

                    var sym = g.symbol.type === "ArrowLineSymbol" ? g.symbol : g.symbol.outline && g.symbol.outline.type === "ArrowLineSymbol" ? g.symbol.outline : null;
                    if (sym) {
                      sym.drawGraphicDirection(g, layer, this);
                    }
                  }
                }
              });
          }
          return this.inherited(arguments);
        },

        /**
         * @private
         * @description _drawDirection
         * @method
         * @memberOf module:extras/symbols/ArrowLineSymbol#
         *
         * @example
         * <caption>Usage of _drawDirection</caption>
         * var instance = new ArrowLineSymbol();
         * instance._drawDirection();
         *
         * @returns {*}
         */
        _drawDirection: function (graphic, graphicsLayer, map) {

          if (!graphic.dlsSymbolGroup) {
            return;
          }

          var group = graphic.dlsSymbolGroup;
          var geometry = graphic.geometry;

          if (geometry.spatialReference.wkid !== map.spatialReference.wkid) {
            if (!esri.geometry.canProject(geometry, map)) {
              // console.error("Can't project geometry wkid - " + geometry.spatialReference.wkid + " to map wkid " + map.spatialReference.wkid);
            }
            else {
              geometry = esri.geometry.project(geometry, map);
            }
          }

          graphic.directions = [];
          query(".dls-symbol", graphic.dlsSymbolGroup.rawNode).forEach(dojo.destroy);

          var screenGeo = screenUtils.toScreenGeometry(map.extent, map.width, map.height, geometry);
          var screenExtent = screenUtils.toScreenGeometry(map.extent, map.width, map.height, map.extent);

          var layerTrans = graphicsLayer._div.getTransform();
          var outerArray = geometry.type === "polyline" ? screenGeo.paths : screenGeo.rings;
          if (!outerArray) {
            // console.error("Can't apply ArrowLineSymbol to geometry " + geometry.type);
            return;
          }

          for (var i = 0, iLen = outerArray.length; i < iLen; i++) {
            var line = outerArray[i];
            for (var j = 0, jLen = line.length - 1; j < jLen; j++) {
              if (j === line.length) {
                continue;
              }

              var pt1 = line[j];
              var pt2 = line[j + 1];

              var angle = ((180 / Math.PI) * Math.atan2(pt2[1] - pt1[1], pt2[0] - pt1[0])) - 180;
              var directionPoints = this._getDirectionPoints(pt1, pt2, screenExtent);

              for (var x = 0, xLen = directionPoints.length; x < xLen; x++) {
                var sym;
                if (this.directionSymbol.type === "simplemarkersymbol" || this.directionSymbol.type === "picturemarkersymbol") {
                  sym = lang.clone(this.directionSymbol);
                } else if (typeof this.directionSymbol === "string") {
                  sym = new SimpleMarkerSymbol();
                  sym.setSize(this.directionSize).setPath(this.directionSymbols[this.directionSymbol] ? this.directionSymbols[this.directionSymbol] : this.directionSymbol).setOutline(null).setColor(this.directionColor)
                } else {
                  // console.error("directionSymbol must be set to one of the pre-defined strings {'arrow1', 'arrow2', 'arrow3', 'arrow4'}, or a SimpleMarkerSymbol or PictureMarkerSymbol.");
                }

                sym.setAngle(angle);
                var g = new Graphic();
                g.setSymbol(sym);
                g.attributes = {
                  isDirectionalGraphic: true
                };
                var sp = new ScreenPoint(directionPoints[x][0], directionPoints[x][1]);
                var mp = map.toMap(sp);
                g.geometry = mp;
                graphicsLayer.add(g);

                var s = g.getShape();
                group.add(s);
                g.attr("class", "dls-symbol");
                graphic.directions.push(g);
                if (!graphic.visible) g.hide();

                g.origJson = g.toJson();
                g.toJson = this.directionGraphicToJson;
              }
            }
          }

          if (graphic.dlsAnimationRepeat && (graphic.dlsAnimationRepeat > 1 || graphic.dlsAnimationRepeat === Infinity)) {
            this._animateGraphic(graphic, graphic.dlsAnimationRepeat);
          }

        },

        /**
         * @private
         * @description _getDirectionPoints
         * @method
         * @memberOf module:extras/symbols/ArrowLineSymbol#
         *
         * @example
         * <caption>Usage of _getDirectionPoints</caption>
         * var instance = new ArrowLineSymbol();
         * instance._getDirectionPoints();
         *
         * @returns {*}
         */
        _getDirectionPoints: function (pt1, pt2, screenExtent) {
          var points = [];

          var xmin = pt1[0] < pt2[0] ? pt1[0] : pt2[0],
            xmax = pt1[0] > pt2[0] ? pt1[0] : pt2[0],
            ymin = pt1[1] < pt2[1] ? pt1[1] : pt2[1],
            ymax = pt1[1] > pt2[1] ? pt1[1] : pt2[1];

          var exmin = screenExtent.xmin < screenExtent.xmax ? screenExtent.xmin : screenExtent.xmax,
            exmax = screenExtent.xmin > screenExtent.xmax ? screenExtent.xmin : screenExtent.xmax,
            eymin = screenExtent.ymin < screenExtent.ymax ? screenExtent.ymin : screenExtent.ymax,
            eymax = screenExtent.ymin > screenExtent.ymax ? screenExtent.ymin : screenExtent.ymax;

          var vector = [pt2[0] - pt1[0], pt2[1] - pt1[1]];

          var length = Math.sqrt((vector[0] * vector[0]) + (vector[1] * vector[1]));
          if (length < this.directionPixelBuffer) {
            return points;
          }

          vector[0] = (vector[0] / length) * this.directionPixelBuffer;
          vector[1] = (vector[1] / length) * this.directionPixelBuffer;

          var tp = [pt1[0] + vector[0], pt1[1] + vector[1]];

          while (tp[0] >= xmin && tp[0] <= xmax && tp[1] >= ymin && tp[1] <= ymax) {

            if (tp[0] >= exmin && tp[0] <= exmax && tp[1] >= eymin && tp[1] <= eymax) {
              points.push([tp[0], tp[1]]);
            }

            tp = [tp[0] + vector[0], tp[1] + vector[1]];
          }

          return points;
        },

        /**
         * @description get
         * @method
         * @memberOf module:extras/symbols/ArrowLineSymbol#
         *
         *
         * @example
         * <caption>Usage of get</caption>
         * var instance = new ArrowLineSymbol();
         * instance.get();
         *
         * @returns {*}
         */
        get: function (property) {
          if (this[property]) {
            return this[property];
          }
          return null;
        },

        /**
         * @description setDirectionSymbol
         * @method
         * @memberOf module:extras/symbols/ArrowLineSymbol#
         *
         *
         * @example
         * <caption>Usage of setDirectionSymbol</caption>
         * var instance = new ArrowLineSymbol();
         * instance.setDirectionSymbol();
         */
        setDirectionSymbol: function (symbol) {
          this.directionSymbol = symbol;
          this._drawDirection();
        },

        /**
         * @description animateDirection
         * @method
         * @memberOf module:extras/symbols/ArrowLineSymbol#
         *
         *
         * @example
         * <caption>Usage of animateDirection</caption>
         * var instance = new ArrowLineSymbol();
         * instance.animateDirection();
         *
         * @returns {*}
         */
        animateDirection: function (repeat, duration) {

          if (repeat) {
            var rpt = parseInt(repeat);
            if (isNaN(rpt)) {
              rpt = Infinity;
            }
            this.animationRepeat = rpt;
          }

          if (!this.animationRepeat || this.animationRepeat < 1) {
            this.stopAnimation();
            return;
          }

          if (duration) this.animationDuration = duration;

          this.animationChain = null;
          if (this.animationEnd) {
            this.animationEnd.remove();
          }

          var dur = this.animationDuration;
          for (var i = 0, len = this.graphics.length; i < len; i++) {
            var g = this.graphics[i];
            if (!g.dlsSymbolGroup) continue;
            this._animateGraphic(g, this.animationRepeat);
          }
        },

        /**
         * @private
         * @description _animateGraphic
         * @method
         * @memberOf module:extras/symbols/ArrowLineSymbol#
         *
         * @example
         * <caption>Usage of _animateGraphic</caption>
         * var instance = new ArrowLineSymbol();
         * instance._animateGraphic();
         */
        _animateGraphic: function (g, repeat) {
          var anims = [];
          var dur = this.animationDuration;

          if (g.dlsAnimationChain) {
            g.dlsAnimationChain.stop();
          }

          query(".dls-symbol", g.dlsSymbolGroup.rawNode).forEach(function (path) {
            basefx.fadeOut({
              node: path,
              duration: 10
            }).play();
            var fi = basefx.fadeIn({
              node: path,
              duration: dur
            });
            anims.push(fi);
          });

          g.dlsAnimationRepeat = repeat;
          g.dlsAnimationChain = dojofx.chain(anims);
          g.dlsAnimationEnd = dojo.on(g.dlsAnimationChain, "End", dojo._base.lang.hitch(this,
            function () {
              if (!isNaN(repeat) && repeat > 1) {
                repeat--;
                this._animateGraphic(g, repeat);
              }
              else if (repeat === Infinity) {
                this._animateGraphic(g, repeat);
              }
            }));

          try {
            g.dlsAnimationChain.play();
          } catch (err) {

          }
        },

        /**
         * @description stopAnimation
         * @method
         * @memberOf module:extras/symbols/ArrowLineSymbol#
         *
         * @example
         * <caption>Usage of stopAnimation</caption>
         * var instance = new ArrowLineSymbol();
         * instance.stopAnimation();
         */
        stopAnimation: function () {

          for (var i = 0, len = this.graphics.length; i < len; i++) {
            var g = this.graphics[i];
            if (g.dlsSymbolGroup) {
              query(".dls-symbol", g.dlsSymbolGroup.rawNode).forEach(function (path) {
                basefx.fadeIn({
                  node: path,
                  duration: 10
                }).play();
              });

              g.dlsAnimationRepeat = 0;
              if (g.dlsAnimationChain) g.dlsAnimationChain.stop();
              if (g.dlsAnimationEnd) g.dlsAnimationEnd.remove();

            }
          }
        },

        /**
         * @description toJson
         * @method
         * @memberOf module:extras/symbols/ArrowLineSymbol#
         *
         * @example
         * <caption>Usage of toJson</caption>
         * var instance = new ArrowLineSymbol();
         * instance.toJson();
         *
         * @returns {*}
         */
        toJson: function () {
          var json = this.inherited(arguments);
          var rgba = this.color.toRgba();
          rgba[3] = rgba[3] * 255;
          json.color = rgba;
          return json;
        },

        /**
         * @description directionGraphicToJson
         * @method
         * @memberOf module:extras/symbols/ArrowLineSymbol#
         *
         * @example
         * <caption>Usage of directionGraphicToJson</caption>
         * var instance = new ArrowLineSymbol();
         * instance.directionGraphicToJson();
         *
         * @returns {*}
         */
        directionGraphicToJson: function () {
          if (this.jsonUpdated || !this.origJson.symbol || !this.origJson.symbol.angle) return this.origJson;
          this.origJson.symbol.angle = this.origJson.symbol.angle * -1;
          this.jsonUpdated = true;
          return this.origJson;
        }

      })
  });
