/**
 * @author skz
 * 2017年6月13日下午2:03:41
 */
 var Bookmark = {
 	bookmarkKey: 'bookmark',
 	
 	showBookMarkPanel: function(){
 		var that = this;
 		var settings = {
			title : "书签",
			id : 'bookmark',
			content : $("#bookmark"),
			width : '300',
			height : '200',
			align : 'top',
			close : true,
			onshow : function() {
				if (!that.hasBookmark()) {
					that.showAddMarkPanel();
					return;
				} else {
					that.detailAllMark();
					that.showMarkList();
				}
			}
		};
		var dialogObj = mDialog.showDialog(settings);
 	},
 	showMarkList: function(){
 		var bookmarkList = this.getBookmarks();
 		var markHtml = '';
		for (var i = 0; i < bookmarkList.length; i++) {
			var bookmark = bookmarkList[i];
			if(!this.isEmptyEntity(bookmark)){
				markHtml += "<li class='bookmark-item' onclick='Bookmark.chooseMark(this)' data-check='false' data-extent='"+ bookmark.extent +"' data-id='"+ bookmark.id+ "'>"
					+ bookmark.name
					+ "<span class='delIcon' onclick='Bookmark.delMark(this);return false;'>×</span></li>";
			}
		}
		$(".bookMarkList").empty();
		$(".bookMarkList").append(markHtml);
 	},
 	/**
	 * 显示添加书签面板
	 * 
	 * @param {}
	 */
	showAddMarkPanel : function() {
		$(".bookMarkList").css("display", "none");
		$(".addMarkPanel").css("display", "block");
	},
	/**
	 * 查看全部书签
	 * 
	 * @param {}
	 */
	detailAllMark : function() {
		$(".bookMarkList").css("display", "block");
		$(".addMarkPanel").css("display", "none");
	},
	/**
	 * 保存书签
	 * 
	 * @param {}
	 */
	saveBookMark : function() {
		var bookmarkName = $("input[name='markName']").val(), storageArr = [], storage = window.localStorage, storageList = [];
		var extent = JSON.stringify(GisObject.map.extent.toJson());
		var that = Bookmark;
		if(!bookmarkName) {
			$('.addMarkPanel').append('<p class="tagNameTips" style="margin: 10px;color: red;font-size: 12px;">标签名不能为空!</p>')
			$("input[name='markName']").focus();
			return;
		}else{
			$('.tagNameTips').remove();
		}
		that.setBookmark(that.createBookmarkBean(bookmarkName,extent));
		that.detailAllMark();
		that.showMarkList();
		$("input[name='markName']").val('');
	},
	/**
	 * 选中书签
	 * 
	 * @param {}
	 */
	chooseMark : function(self) {
		var $bookmarkLi = $(self);
		var extent = $bookmarkLi.attr('data-extent');
		extent = JSON.parse(extent == 'undefined' ? '{}' : extent);
		GisOpe.setExtent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, extent.spatialReference);
		$('.bookMarkList>li').css("background-color", "#fff");
		$bookmarkLi.css("background-color", "#eee");
	},
	/**
	 * 删除书签
	 * 
	 * @param {}
	 */
	delMark : function(self) {
		window.event && (window.event.returnValue = false);
		var $bookmarkDelBtn = $(self);
		confirmBox("确定要删除？", '提示',function() {
			var $li = $bookmarkDelBtn.parent('li');
			var id = $li.attr('data-id');
			id == 'undefined' && $lli.remove();
			Bookmark.removeBookmark(id);
			Bookmark.showMarkList();
		})
	},
	delMark2: function(){
		$('.bookMarkList').on('click','.delIcon',function(e){
			e && e.preventDefault ? e.preventDefault() : (window.event.returnValue = false);
			var $bookmarkDelBtn = $(this);
			confirmBox("确定要删除？", '提示',function() {
				var $li = $bookmarkDelBtn.parent('li');
				var id = $li.attr('data-id');
				id == 'undefined' && $lli.remove();
				Bookmark.removeBookmark(id);
				Bookmark.showMarkList();
			})
		})
	},
	initStorage: function(){
		try{
			window.localStorage.setItem(this.bookmarkKey,JSON.stringify([]));
		}catch(e){}
	},
	setBookmarks: function(bookmarks){
		try{
			window.localStorage.setItem(this.bookmarkKey,JSON.stringify(bookmarks || []));
		}catch(e){}
	},
	getBookmarks: function(){
		try{
			var bookmarks = window.localStorage.getItem(this.bookmarkKey);
			!bookmarks && this.initStorage();
			return JSON.parse(window.localStorage.getItem(this.bookmarkKey));
		}catch(e){}
	},
	setBookmark: function(item){
		if(this.isEmptyEntity(item)) return;
		var bookmarkList = this.getBookmarks();
		bookmarkList.push(item);
		try{
			window.localStorage.setItem(this.bookmarkKey,JSON.stringify(bookmarkList));
		}catch(e){}
	},
	removeBookmark: function(id){
		var bookmarks = this.getBookmarks();
		var deletedBM;
		$.each(bookmarks,function(index,bookmark){
			if(bookmark.id == id){
				deletedBM = bookmarks.splice(index,1);
				return false;
			}
		})
		this.setBookmarks(bookmarks);
		return deletedBM;
	},
	hasBookmark: function(){
		return !!this.getBookmarks().length;
	},
	isEmptyEntity: function(bookmark){
		return $.isEmptyObject(bookmark);
	},
	createBookmarkBean: function(name,extent){
		return {
			id: new Date().getTime(),
			name: name || '',
			extent: extent || ''
		}
	}
 }