/**
 * @description print.js
 * @date 2017年4月1日
 * @time 下午4:34:15
 */
$(function(){
	var imgSrc = $.dialog.data('captureViewUrl');
	url = contextPath + "/content/jsp/client/gis/showCaptureImage.action?filepath=" + imgSrc;
	$('#map img').attr('src',url);
	
	Plugins.init();
	Tags.init();
	Maps.init();
	
	$('#printer').on('click',function(){
		Printer.print($('#printScan').html());
		
		// 删除临时保存的图片
		setTimeout(function(){
			$.post(contextPath + "/content/jsp/client/gis/deleteCaptureImage.action?filepath=" + imgSrc)
		},1000)
	})
})


var Printer = (function () {
    var hkey_root,hkey_path,hkey_key;

    hkey_root="HKEY_CURRENT_USER";
    hkey_path="\\Software\\Microsoft\\Internet Explorer\\PageSetup\\";

    return {
    	loadImage: function(callback){
    		var url = $.dialog.data('captureViewUrl');
    		url = contextPath + "/content/jsp/client/gis/showCaptureImage.action?filepath=" + url;
    		
    		new LoadImage({
	            url: url,
	            before: function(){
	                $('img',"#map").attr('src',url);
	                callback && callback();
	            },
	            success: function(){
	            	 $('img',"#map").attr('src',url);
	            	 callback && callback();
	            },
	            error: function(){
	            	 $('img',"#map").attr('src',url);
	            	 callback && callback();
	            }
	        })
    	},
        isIE: function () {
            return !!window.ActiveXObject || "ActiveXObject" in window
        },
        clearPage: function(){
            try {
                var RegWsh = new ActiveXObject("WScript.Shell");
                hkey_key = "header";
                RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "");
                hkey_key = "footer";
                RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "")
            } catch (e) {}
        },
        setPage: function () {
            try {
                var RegWsh = new ActiveXObject("WScript.Shell");
                hkey_key = "header";
                RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "&w&b页码，&p/&P");
                hkey_key = "footer";
                RegWsh.RegWrite(hkey_root + hkey_path + hkey_key, "&u&b&d")
            } catch (e) {}
        },
        /**
         * 打印图片
         * @param title     文档标题
         * @param imgSrc    图片链接（http或base64）
         * @param landscape
         */
        print: function (source) {
            this.isIE() && this.clearPage();
            var win = window.open();
            var doc = win.document;
            doc.title = '打印';

            var meta = doc.createElement('meta');
            meta.setAttribute('http-equiv','X-UA-Compatible');
            meta.setAttribute('content','IE=edge,chrome=1');
            var head = doc.getElementsByTagName("head")[0];
            head.appendChild(meta);

            var style = doc.createElement('style');
            style.setAttribute('type','text/css');
            style.setAttribute('media','print');
            head.appendChild(style);
            
            var wraper =  doc.createElement('div');
            wraper.style.width= '50%';
            wraper.style.border = "none";
            wraper.innerHTML = source;
           // doc.body.innerHTML = source;
            doc.body.appendChild(wraper);
            setTimeout(function () {
                doc.close();
                win.focus();
                win.print();
                win.close();
            },100);
        }
    };
})();

function LoadImage(setting) {
    this.settings = {
        url: '',
        errorUrl: '',
        before: null,
        success: null,
        error: null
    };
    $.extend({},this.settings,setting);

    var self = this;
    var img = new Image();
    this.settings.before && this.settings.before();
    // 加载
    img.onload = function () {
        img.onload = img.onerror = null;
        self.settings.success && self.settings.success();
        img = null;
    };
    img.src = this.settings.url;

    // 失败
    img.onerror = function () {
        img.onload = img.onerror = null;
        self.settings.error && self.settings.error();
        img = null;
    };

    this.createImage = function () {
        var img = new Image();
        return img;
    };
    this.onload = function (img) {
        var self = this;
        img.onload = function(){
            img.onload = img.onerror = null;
            self.settings.success && self.settings.success();
            img = null;
        };
        img.src = this.settings.url;
    };
    this.before = function () {
        this.settings.before && this.settings.before();
    };
    this.onerror = function (img) {
        var self = this;
        img.onerror = function () {
            img.onload = img.onerror = null;
            self.settings.error && self.settings.error();
            img = null;
        };
    };
    this.loadImage= function(){
        var img = this.createImage();
        this.before();
        try {
            this.onload(img);
        } catch (e) {
            this.onerror(img);
        }
        this.onerror(img);
        img = null;
    }
};

var Tags = {
	$wrap: $('#tagsWrapper'),
	init: function(){
		this.addTags();
		this.setFontColor();
		this.setFontFamily();
		this.setFontSize();
		this.setFontWeight();
	},
	addTags: function(){
		$('#addTags').on('click',function(){
			var tagValue = $(this).parents('.input-group').find('input').val();
			if(!tagValue) {
				$('.tips').text('标签不能为空');
				return;
			}
			var $tag = $('<span id="tag_" class="tag" style="display: inline-block; margin: 5px;padding:4px 12px; border-radius: 5px; border: 1px solid #ececec; color: #999;font-size: 12px;">标签</span>');
			$tag.css('fontFamily',"microsoft yahei");
			$tag.text(tagValue);
			Tags.$wrap.append($tag);
		})
	},
	setFontFamily: function(){
		$('.font-family').change(function(){
			var fontfamily = $(this).val();
			$('.tag').css('fontFamily',fontfamily);
		})
	},
	setFontColor: function(){
		Plugins.initColorPicker(".tag-color-picker",function(color){
			$('.tag').css('color',color.toHexString());
		})
	},
	setFontSize: function(){
		$('#tagMinus').click(function(){
			var $input = $(this).siblings('input');
			var val = +$input.val() - 2;
			$input.val(val);
			$('.tag').css('fontSize',val);
		})
		$('#tagPlus').click(function(){
			var $input = $(this).siblings('input');
			var val = +$input.val() + 2;
			$input.val(val);
			$('.tag').css('fontSize',val);
		})
		
		$('.font-size').change(function(){
			var val = +$(this).val();
			$('.tag').css('fontSize',val);
		})
		
	},
	setFontWeight: function(){
		$('.font-weight').change(function(){
			var fontWeight = $(this).val();
			$('.tag').css('fontWeight',fontWeight);
		})
	}
}
var Maps = {
	$map: $('#map').find('img'),
	init: function(){
		this.setBorder();
		this.setBorderColor();
		this.setMapScale();
	},
	setBorder: function(){
		$('#mapBorderMinus').click(function(){
			var $input = $(this).siblings('input');
			var val = +$input.val() - 1;
			$input.val(val);
			Maps.$map.css('borderWidth',val+ 'px');
		})
		$('#mapBorderPlus').click(function(){
			var $input = $(this).siblings('input');
			var val = +$input.val() + 1;
			$input.val(val);
			Maps.$map.css('borderWidth',val + 'px');
		})
		
		$('.border-width').change(function(){
			var val = +$(this).val();
			Maps.$map.css('borderWidth',val);
		})
	},
	setBorderColor: function(){
		Plugins.initColorPicker(".img-color-picker",function(color){
			Maps.$map.css('borderColor',color.toHexString());
		})
	},
	setMapScale: function(){
		$('.scaleSM').click(function(){
			var scale = Maps.$map.width() / Maps.$map.parent('#map').width() * 100; 
			scale -= 10;
			Maps.$map.css('width',scale + '%');
		})
		$('.scaleLG').click(function(){
			var scale = Maps.$map.width() / Maps.$map.parent('#map').width() * 100; 
			scale += 10;
			Maps.$map.css('width',scale + '%');
		})
		
	}
}

var Plugins = {
	init: function(){
		this.initSelect();
		//this.initColorPicker();
	},
	initSelect: function(){
		$(".select2").select2();
	},
	initColorPicker: function(target,callback){
		$(target).spectrum({
		    color: "#999",
		    change: function(color){
		    	callback && callback(color)
		    }
		});
	}
}
