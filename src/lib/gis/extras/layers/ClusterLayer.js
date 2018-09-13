/**
 *
 * @authors Ou Yuan (ouyuan@gosuncn.com)
 * @date    2017-10-30 12:22:36
 * @version $1.0$
 */

define([
  "dojo/_base/declare",
  "dojo/_base/array",
  "esri/Color",
  "dojo/_base/connect",

  "esri/SpatialReference",
  "esri/geometry/Point",
  "esri/graphic",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/TextSymbol",

  "esri/dijit/PopupTemplate",
  "esri/layers/GraphicsLayer"
], function(
  declare,
  arrayUtils,
  Color,
  connect,
  SpatialReference,
  Point,
  Graphic,
  SimpleMarkerSymbol,
  TextSymbol,
  PopupTemplate,
  GraphicsLayer
) {
  return declare([GraphicsLayer], {
    constructor: function(options) {
      // options:
      //   data:  Object[]
      //   data：绑定聚合数据源，数据必须是一个包含x、y坐标数值以及attributes属性对象的数组对象
      //   distance:  Number?
      //   distance：设置聚合距离，根据地图分辨率来设置合适的值，默认是50
      //   labelColor:  String?
      //   labelColor：图标字体颜色值，白色字体
      //   labelOffset:  String?
      //   labelOffset：字体偏移位置
      //   resolution:  Number
      //   resolution：计算当前地图的分辨率，公式为map.extent.getWidth() / map.width
      //   showSingles:  Boolean?
      //   showSingles：当单击聚合点图形时，是否显示图形。默认显示。
      //   singleSymbol:  MarkerSymbol?
      //   singleSymbol：聚合点样式为图片或者简单符号样式，默认为灰色的简单符号样式
      //   singleTemplate:  PopupTemplate?
      //   singleTemplate：聚合点弹窗模型，默认为气泡弹窗用于格式化图元属性，属性默认为键值对
      //   maxSingles:  Number?
      //   maxSingles：是否为集群中的点显示图形的阈值。默认是1000。
      //   webmap:  Boolean?
      //   webmap：地图来源是否为ArcGIS，默认为否
      //   spatialReference:  SpatialReference?
      //   SpatialReference：参考坐标系

      this._clusterTolerance = options.distance || 50;
      this._clusterData = options.data || [];
      this._clusters = [];
      this._clusterLabelColor = options.labelColor || "#000";
      // 字体偏移量可以为零
      this._clusterLabelOffset = (options.hasOwnProperty("labelOffset")) ? options.labelOffset : -5;
      // 表示单个点的图形
      this._singles = []; // 被点击的单个点填充至数组
      this._showSingles = options.hasOwnProperty("showSingles") ? options.showSingles : true;
      // 单个点的符号样式
      var SMS = SimpleMarkerSymbol;
      this._singleSym = options.singleSymbol || new SMS("circle", 6, null, new Color("#888"));
      this._singleTemplate = options.singleTemplate || new PopupTemplate({ "title": "", "description": "{*}" });
      this._maxSingles = options.maxSingles || 1000;

      this._webmap = options.hasOwnProperty("webmap") ? options.webmap : false;

      this._sr = options.spatialReference || new SpatialReference({ "wkid": 102100 });

      this._zoomEnd = null;
    },
    /**
     * @private
     * @description 设置聚合地图 继承esri/layers/GraphicsLayer methods
     * @param  {map} map 地图对象
     * @param  {type} surface 图层
     * @return {type} [description]
     */
    _setMap: function(map, surface) {
      /**
       * 计算并地图解析分辨率
       */
      this._clusterResolution = map.extent.getWidth() / map.width; // probably a bad default...
      this._clusterGraphics();

      /**
       * 鼠标联动
       */
      this._zoomEnd = connect.connect(map, "onZoomEnd", this, function() {
        /**
         * 更新地图分辨率
         */
        this._clusterResolution = this._map.extent.getWidth() / this._map.width;
        this.clear();
        this._clusterGraphics();
      });

      /**
       * 继承父类GraphicsLayer订阅的方法
       */
      var div = this.inherited(arguments);
      return div;
    },

    _unsetMap: function() {
      this.inherited(arguments);
      connect.disconnect(this._zoomEnd);
    },

    /**
     * 添加并发布ClusterLayer的方法
     * @param {type} point [description]
     */
    add: function(point) {
      if (point.declaredClass) {
        this.inherited(arguments);
        return;
      }

      /**
       * 添加聚合数据到图层
       */
      this._clusterData.push(point);
      var clustered = false;
      for (var i = 0; i < this._clusters.length; i++) {
        var cluster = this._clusters[i];
        if (this._clusterTest(point, cluster)) {
          this._clusterAddPoint(point, cluster);
          this._updateClusterGeometry(cluster);
          this._updateLabel(cluster);
          clustered = true;
          break;
        }
      }

      if (!clustered) {
        this._clusterCreate(p);
        point.attributes.clusterCount = 1;
        this._showCluster(point);
      }
    },
    /**
     * 清除聚合图层数据
     * @return {[type]} [description]
     */
    clear: function() {
      this.inherited(arguments);
      this._clusters.length = 0;
    },
    /**
     * 清除某一点功能
     * @param  {type} singles [description]
     * @return {type}         [description]
     */
    clearSingles: function(singles) {
      var single = singles || this._singles;
      arrayUtils.forEach(single, function(graphic) {
        this.remove(graphic);
      }, this);
      this._singles.length = 0;
    },
    /**
     * 点击处理程序
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    onClick: function(evt) {
      /**
       * 移除此前所有的功能
       */
      this.clearSingles(this._singles);
      /**
       * 查询被点击的图元
       * @type {Array}
       */
      var singles = [];
      for (var i = 0, il = this._clusterData.length; i < il; i++) {
        if (evt.graphic.attributes.clusterId == this._clusterData[i].attributes.clusterId) {
          singles.push(this._clusterData[i]);
        }
      }
      if (singles.length > this._maxSingles) {
        alert("Sorry, that cluster contains more than " + this._maxSingles + " points. Zoom in for more detail.");
        return;
      } else {
        /**
         * 停止冒泡
         */
        evt.stopPropagation();
        this._map.infoWindow.show(evt.graphic.geometry);
        this._addSingles(singles);
      }
    },

    /**
     * @private
     * @description 聚合图元 继承esri/layers/GraphicsLayer methods
     * @return {type} [description]
     */
    _clusterGraphics: function() {
      for (var j = 0, jl = this._clusterData.length; j < jl; j++) {
        var point = this._clusterData[j];
        var clustered = false;
        var numClusters = this._clusters.length;
        for (var i = 0; i < this._clusters.length; i++) {
          var cluster = this._clusters[i];
          if (this._clusterTest(point, cluster)) {
            this._clusterAddPoint(point, cluster);
            clustered = true;
            break;
          }
        }

        if (!clustered) {
          this._clusterCreate(point);
        }
      }
      this._showAllClusters();
    },

    _clusterTest: function(point, cluster) {
      var distance = (
        Math.sqrt(
          Math.pow((cluster.x - point.x), 2) + Math.pow((cluster.y - point.y), 2)
        ) / this._clusterResolution
      );
      return (distance <= this._clusterTolerance);
    },
    /**
     * @private
     * @description 添加点到聚合图层并设置一个clusterId
     * @param  {type} cluster [description]
     * @return {type} [description]
     */
    _clusterAddPoint: function(point, cluster) {
      var count, x, y;
      count = cluster.attributes.clusterCount;
      x = (point.x + (cluster.x * count)) / (count + 1);
      y = (point.y + (cluster.y * count)) / (count + 1);
      cluster.x = x;
      cluster.y = y;

      /**
       * 生成包含点的区域
       * @return {[type]}     [description]
       */
      if (point.x < cluster.attributes.extent[0]) {
        cluster.attributes.extent[0] = point.x;
      } else if (point.x > cluster.attributes.extent[2]) {
        cluster.attributes.extent[2] = point.x;
      }
      if (point.y < cluster.attributes.extent[1]) {
        cluster.attributes.extent[1] = point.y;
      } else if (point.y > cluster.attributes.extent[3]) {
        cluster.attributes.extent[3] = point.y;
      }

      cluster.attributes.clusterCount++;
      if (!point.hasOwnProperty("attributes")) {
        point.attributes = {};
      }
      point.attributes.clusterId = cluster.attributes.clusterId;
    },
    /**
     * @private
     * @description 通过clusterCreate创建的点不在聚合图层内，则心创建一个聚合
     * @param  {type} cluster [description]
     * @return {type} [description]
     */
    _clusterCreate: function(point) {
      var clusterId = this._clusters.length + 1;
      if (!point.attributes) {
        point.attributes = {};
      }
      point.attributes.clusterId = clusterId;
      var cluster = {
        "x": point.x,
        "y": point.y,
        "attributes": {
          "clusterCount": 1,
          "clusterId": clusterId,
          "extent": [point.x, point.y, point.x, point.y]
        }
      };
      this._clusters.push(cluster);
    },
    /**
     * @private
     * @description 显示所有聚合
     * @return {type} [description]
     */
    _showAllClusters: function() {
      for (var i = 0, il = this._clusters.length; i < il; i++) {
        var cluster = this._clusters[i];
        this._showCluster(cluster);
      }
    },
    /**
     * @private
     * @description 显示聚合单个点
     * @return {type} [description]
     */
    _showCluster: function(cluster) {
      var point = new Point(cluster.x, cluster.y, this._sr);
      this.add(
        new Graphic(
          point,
          null,
          cluster.attributes
        )
      );
      if (cluster.attributes.clusterCount == 1) {
        return;
      }
      var label = new TextSymbol(cluster.attributes.clusterCount.toString())
        .setColor(new Color(this._clusterLabelColor))
        .setOffset(0, this._clusterLabelOffset);
      this.add(
        new Graphic(
          point,
          label,
          cluster.attributes
        )
      );
    },
    /**
     * @private
     * @description 添加图元
     * @return {type} [description]
     */
    _addSingles: function(singles) {
      arrayUtils.forEach(singles, function(point) {
        var graphic = new Graphic(
          new Point(point.x, point.y, this._sr),
          this._singleSym,
          point.attributes,
          this._singleTemplate
        );
        this._singles.push(graphic);
        if (this._showSingles) {
          this.add(graphic);
        }
      }, this);
      this._map.infoWindow.setFeatures(this._singles);
    },
    /**
     * @private
     * @description 更新聚合坐标
     * @return {type} [description]
     */
    _updateClusterGeometry: function(cluster) {
      var clusterGraphic = arrayUtils.filter(this.graphics, function(graphic) {
        return !graphic.symbol &&
          graphic.attributes.clusterId == cluster.attributes.clusterId;
      });
      if (clusterGraphic.length == 1) {
        clusterGraphic[0].geometry.update(cluster.x, cluster.y);
      } else {
        // console.log("didn't find exactly one cluster geometry to update: ", clusterGraphic);
      }
    },
    /**
     * @private
     * @description 更新聚合标签
     * @return {type} [description]
     */
    _updateLabel: function(cluster) {
      var label = arrayUtils.filter(this.graphics, function(graphic) {
        return graphic.symbol &&
          graphic.symbol.declaredClass == "esri.symbol.TextSymbol" &&
          graphic.attributes.clusterId == cluster.attributes.clusterId;
      });
      if (label.length == 1) {
        this.remove(label[0]);
        var newLabel = new TextSymbol(cluster.attributes.clusterCount)
          .setColor(new Color(this._clusterLabelColor))
          .setOffset(0, this._clusterLabelOffset);
        this.add(
          new Graphic(
            new Point(cluster.x, cluster.y, this._sr),
            newLabel,
            cluster.attributes
          )
        );
      } else {
        // console.log("didn't find exactly one label: ", label);
      }
    },
    /**
     * @private
     * @description 聚合标签
     * @return {type} [description]
     */
    _clusterMeta: function() {
      // console.log("Total:  ", this._clusterData.length);

      var count = 0;
      arrayUtils.forEach(this._clusters, function(cluster) {
        count += cluster.attributes.clusterCount;
      });
      // console.log("In clusters:  ", count);
    }
  });
});
