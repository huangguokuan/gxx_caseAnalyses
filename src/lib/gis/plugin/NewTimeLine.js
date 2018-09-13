(function(win) { // yansunrong
    /* 使用方法  

    new TimeLine(id,{

        onChanging:fn
        onChanged:fn

    }})
    */

    //时间轴对象
    win.TimeLine = function(conainer, options) {
        this.options = options || {};
        this.timeline = $("#" + conainer);
        this.marker = $(".marker", this.timeline);
        this.playBtn = $(".playBtn", this.timeline);
        this.lineInner = $(".lineInner", this.timeline);
        this.currentTime = $(".currentTime", this.timeline);
        this.leftTime = $(".leftTime", this.timeline);
        this.rightTime = $(".rightTime", this.timeline);

        
        this.maxCount = options.maxCount || 10;
        this.minCount = options.minCount || 0; 
        var startTime = options.startTime || new Date().getTime();
        var endTime = options.endTime || new Date().getTime();
        
        var currentDate = this.currentDate = new Date();
        var timeStr = currentDate.Format("yyyy-MM-dd hh:mm:ss");
        this.leftTime.html("起始时间：" + startTime);//timeStr
        this.rightTime.html("结束时间：" + endTime);
        //this.currentTime.html(timeStr);
        this.init();
        this.bind();
    }
    TimeLine.prototype = {
        init : function(){
            this.dragging = false;
            this.animateFlag = false; //是否在动画
            this.count = 0; //记录百分比
            this.timePicker;
            this.offsetLeft = this.timeline.offset().left;
            this.width = this.timeline.width();
            this.animate();
        },
        bind: function() {
            var me = this;
            this.marker.on("mousedown", function(e) {
                me.stop();
                me.dragging = true;
                this.preCount = this.count;
                e.preventDefault();
            })
            
            this.timeline.on("mousemove", function(e) {
                if (me.dragging) {
                    me.playBtn.removeClass('playBtn_stop');
                    me.animateFlag = false;
                    var num = e.pageX - me.offsetLeft;
                    var count = ~~ ((num) / me.width * me.maxCount);
                    me.setCount(count);
                }
            }).on("mouseup", function(e) {
                if (me.dragging && me.options.onChanged) {
                    me.options.onChanged(parseInt(me.count-1));
                    
                }
                me.dragging = false;
                
            });
            $(window).on("resize", function() {
                me.init();
            })
            this.playBtn.on("click", function(e){
                if (me.animateFlag) {
                    me.playBtn.removeClass('playBtn_stop');
                    me.animateFlag = false;
                } else {
                    me.playBtn.addClass('playBtn_stop');
                    me.animateFlag = true;
                    if (me.options.onStrart) {
                        me.options.onStrart();
                    }
                }
            });
        },
        setCount: function(count) {
            var me = this;
            me.count = count;
            if (me.count > me.maxCount) {
                me.count = me.maxCount;
            }
            
            if(me.count == me.maxCount){
            	me.count == 0;
            	me.playBtn.removeClass('playBtn_stop');
            	me.animateFlag = false;
            	if (me.options.onEnd) {
                    window.setTimeout(function(){
                    	me.options.onEnd();
                    },0)
                }
            }
            if (me.count < 0) {
                me.count = 0;
            }
            this.markerTime = new Date(me.currentDate.getTime() - 24 * 3600 * 1000 * (100 - me.count) / 100);
            var positon = parseFloat(me.count/me.maxCount) * 100;
            
            
            me.lineInner.css("width",  positon+ "% ");
            me.marker.css("left", positon + "% ");
            //me.currentTime.html("" + this.markerTime.Format("yyyy-MM-dd hh:mm:ss"));
            if (me.options.onChanging) {
                me.options.onChanging(parseInt(this.count-1));
            }
        },
        setTips:function(markerTime){
        	var me = this;
        	me.currentTime.html("" + new Date(markerTime).Format("yyyy-MM-dd hh:mm:ss"));
        },
        getTime: function() {
            return new Date(this.currentDate.getTime() - 24 * 3600 * 1000 * (100 - this.count) / 100);
        },
        animate: function() {
            var me = this;
            var count = me.count;
            count+= 1;
            if (count > me.maxCount) {
                count = 0;
            }
            if (this.animateFlag) {
                this.setCount(count);
                me.options.animateCbk && me.options.animateCbk(parseInt(this.count-1));
            }
            this.timePicker = setTimeout(function(){
                me.animate();
            }, 1000);
        },
        start: function() {
            this.animateFlag = true;
        },
        stop: function() {
            this.animateFlag = false;
        },
        destroy: function(){
        	this.playBtn.removeClass('playBtn_stop');
        	this.setCount(0);
        	this.stop();
        	this.timePicker && clearTimeout(this.timePicker);
        }
    }

    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
    // 例子： 
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
    Date.prototype.Format = function(fmt) { //author: meizz 
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

})(window);
