/**
 * 
 */



dojo.provide("extras.layer.TianDiTuTiledMap");
dojo.require("esri.layers.TiledMapServiceLayer");

dojo.declare("extras.layer.TianDiTuTiledMap",[esri.layers.TiledMapServiceLayer],{
	constructor:function(options){
		this.spatialReference = new esri.SpatialReference({ wkid:102113 }); 
  		this.fullExtent = new esri.geometry.Extent(-20037508.3427892,-20037508.3427892, 20037508.3427892,20037508.3427892, this.spatialReference);  
        this.initialExtent = new esri.geometry.Extent(8397502.3, 2660018.1, 15003861.0, 5509344.0,this.spatialReference);
  		this.online = options.online ||false;
  		this.mapStyle = options.mapStyle ||"roadmap";
  		this.mapStyle = this.mapStyle.toLowerCase();
  		this.layerId = options.layerId;
        this.suffix = options.suffix || ".png";
        this.tile_url = options.tile_url;
        
		this.tileInfo = new esri.layers.TileInfo({ 
			"rows" : 256, 
			"cols" : 256, 
			"compressionQuality" : 0, 
			"origin" : { 
				"x" : -20037508.3427892, 
  				"y" : 20037508.3427892 
			}, 
			"spatialReference" : { 
			"wkid" : 102113 
			}, 
			"lods" : [
  			          {"level" : 1 ,"resolution" :78271.51696402048, "scale" :2.958293554545656E8},                                    
  			          {"level" : 2 ,"resolution" :39135.75848201024, "scale" :1.479146777272828E8},    
  		              {"level" : 3 ,"resolution" :19567.87924100512, "scale" :7.39573388636414E7},     
  		              {"level" : 4 ,"resolution" :9783.93962050256, "scale" :3.69786694318207E7},     
  		              {"level" : 5 ,"resolution" :4891.96981025128, "scale" :1.848933471591035E7},    
  		              {"level" : 6 ,"resolution" :2445.98490512564, "scale" :9244667.357955175},      
  		              {"level" : 7 ,"resolution" :1222.99245256282, "scale" :4622333.678977588},      
  		              {"level" : 8 ,"resolution" :611.49622628141, "scale" :2311166.839488794},      
  		              {"level" : 9 ,"resolution" :305.748113140705, "scale" :1155583.419744397},      
  		              {"level" : 10,"resolution" :152.8740565703525, "scale" :577791.7098721985},      
  		              {"level" : 11, "resolution" :76.43702828517625, "scale" :288895.85493609926},    
  		              {"level" : 12, "resolution" :38.21851414258813, "scale" :144447.92746804963},    
  		              {"level" : 13, "resolution" :19.109257071294063, "scale" :72223.96373402482},     
  		              {"level" : 14, "resolution" :9.554628535647032, "scale" :36111.98186701241},     
  		              {"level" : 15, "resolution" :4.777314267823516, "scale" :18055.990933506204},    
  		              {"level" : 16, "resolution" :2.388657133911758, "scale" :9027.995466753102},     
  		              {"level" : 17, "resolution" :1.194328566955879, "scale" :4513.997733376551},     
  		              {"level" : 18, "resolution" :0.5971642834779395, "scale" :2256.998866688275}
  			] 
		}); 

		this.loaded = true; 
		this.onLoad(this); 
	},
	getTileUrl: function(level, row, col) { 
		var url;
  		if(this.online){
  			url = "http://t"+col%8+".tianditu.com";
  			var _layerId="";
  			if(this.mapStyle == "image"){//获取影像地图（底图）
                  _layerId = "img_w";
              }
              else if(this.mapStyle == "image_anno"){//获取影像地图（中文注记）
                  _layerId = "cia_w";
              }
              else if(this.mapStyle == "image_anno_en"){//获取影像地图（英文注记）
                  _layerId = "eia_w";
              }
              else if(this.mapStyle == "terrain"){//获取地形图（底图）
                  _layerId = "ter_w";
              }
              else if(this.mapStyle == "terrain_anno"){//获取地形图（中文注记）
                  _layerId = "cta_w";
              }
              else if(this.mapStyle == "terrain_anno_en"){//获取地形图（英文注记）
                  //暂无
              }
              else if(this.mapStyle == "roadmap"){//获取矢量图（底图）
                  _layerId = "vec_w";
              }
              else if(this.mapStyle == "anno"){//获取矢量图（中文注记）
                  _layerId = "cva_w";
              }
              else if(this.mapStyle == "anno_en"){//获取矢量图（英文注记）
                  _layerId = "eva_w";
              }
  			url = url+"/DataServer?T="+_layerId+"&x="+col+"&y="+row+"&l="+level; 
  		}else{
  			if(this.mapStyle === "roadmap"){
          		url = this.tile_url+"/roadmap/"+level+"/"+col+"/"+ row+"."+this.suffix; 
              }else if(this.mapStyle === "image"){
              	url = this.tile_url+"/satellite/"+level+"/"+col+"/"+ row+"."+this.suffix;
              }else if(this.mapStyle === "image_anno"){
            	  url = this.tile_url+"/overlay_s/"+level+"/"+col+"/"+ row+"."+this.suffix;
              }else if(this.mapStyle === "poi"){
              	url = this.tile_url+"/overlay/"+level+"/"+col+"/"+ row+"."+this.suffix;
              }else if(this.mapStyle==="anno"){
              	url = this.tile_url+"/overlay_r/"+level+"/"+col+"/"+ row+"."+this.suffix;
              }
  		}
  		return url;
	} 
});