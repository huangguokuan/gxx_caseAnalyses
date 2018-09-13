/*
 *  地图服务ip端口
 */
var mapServerUrl = 'http://172.16.16.109:8088';

var baseUrl = [location.protocol, "//", location.host, "/", location.pathname.split('/')[1],"/"].join('');
var dojoConfig = {
    url: mapServerUrl + "/jsapi/3.14/init.js",
    parseOnLoad: true,
    measureTotal: 0,
    modulePaths: {
        "extras": baseUrl + "src/lib/gis/extras"
    }
};

var gisConfig = {
    defaultCenter: {
        x: 12615151.657772028,
        y: 2645790.939302407
    },
    sourcePath: baseUrl + "src/lib/gis/",
    // 地图瓦片请求URL
    maptiledCacheUrl: mapServerUrl,
    // 地图图片资源路径
    mapImagesUrl: baseUrl + 'src/lib/gis/images',
    // 地图其他资源路径
    // mapResourcesUrl: baseUrl + 'src/lib/gis/resources',
    // 地图类型（1 -- 谷歌地图， 2 -- 天地图）
    mapType: 1
};
