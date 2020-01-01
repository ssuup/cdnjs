var feifei = {
'nav': {//导航
	'active': function($id){
		$('#nav-'+$id).addClass("active");
	}
},
'alert':{
	'success':function($id, $tips){
		$($id).html('<div class="alert alert-success fade in"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>成功！</strong>'+$tips+'</label>');
	},
	'warning':function($id, $tips){
		$($id).html('<div class="alert alert-warning fade in"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>警告！</strong>'+$tips+'</label>');
	}
},
'page': {//分页
	'more': function(){
		$('body').on('click', '.ff-page-more', function(){
			$this = $(this);
			$page = $(this).attr('data-page')*1+1;
			$id = $this.attr('data-id');
			$.get($(this).attr('data-url')+$page, function(data){
				if(data){
					$("#"+$id).append(data);
					$this.attr('data-page',$page);
				}else{
					$("#ff-page-more").hide();
					$(this).unbind("click");
				}
			},'html');
		});
	}
},
'search': {//搜索
	'submit': function(){
		$("#ff-search button").on("click", function(){
			$action = $(this).attr('data-action');
			if($action){
				$("#ff-search").attr('action', $action);
			}
		});
		$("#ff-search").on("submit", function(){
			$action = $(this).attr('action');
			if(!$action){
				$action = cms.root+'index.php?s=vod-search';
			}
			$wd = $('#ff-search #ff-wd').val();
			if($wd){
				location.href = $action.replace('FFWD',encodeURIComponent($wd));
			}else{
				$("#ff-wd").focus();
				$("#ff-wd").attr('data-toggle','tooltip').attr('data-placement','bottom').attr('title','请输入关键字').tooltip('show');
			}
			return false;
		});
	},
	'keydown': function(){//回车
		$("#ff-search input").keyup(function(event){
			if(event.keyCode == 13){
				location.href = cms.root+'index.php?s=vod-search-wd-'+encodeURIComponent($('#ff-search #ff-wd').val())+'-p-1.html';
			}
		});
	},
	'autocomplete': function(){
		$.ajaxSetup({ 
			cache: true 
		});
		$.getScript("/style/js/jquery.autocomplete.min.js", function(response, status) {
			$('#ff-wd').autocomplete({
				serviceUrl : cms.root+'index.php?s=search-vod',
				params: {'limit': 10},
				paramName: 'wd',
				maxHeight: 400,
				transformResult: function(response) {
					var obj = $.parseJSON(response);
					return {
						suggestions: $.map(obj.data, function(dataItem) {
								return { value: dataItem.vod_name, data: dataItem.vod_link };
						})
					};
				},
				onSelect: function (suggestion) {
					location.href = suggestion.data;
					//alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
				}
			});
		});
	}
},
'browser':{
	'url': document.URL,
	'domain': document.domain,
	'title': document.title,
	'language': (navigator.browserLanguage || navigator.language).toLowerCase(),//zh-tw|zh-hk|zh-cn
	'canvas' : function(){
		return !!document.createElement('canvas').getContext;
	}(),
},
'image': {//图片
	'vcode':function(){//安全码
		return '<label><img class="ff-vcode-img" src="'+cms.root+'index.php?s=Vcode-Index"></label>';
	},
	'loading':function() {
			$(".lazy").lazyload({
				effect : "fadeIn",
				failurelimit: 15
			}); 
	},
	'qrcode': function(){//生成二维码

			$("#qrcode").append('<img src="http://s.jiathis.com/qrcode.php?url= '+encodeURIComponent(feifei.browser.url)+'" />');

	}
},
'vcode': {//验证码
	'load': function(){
		feifei.vcode.focus();
		feifei.vcode.click();
	},
	'focus': function(){//验证码框焦点
		$('body').on("focus", ".ff-vcode", function(){
			$(this).removeClass('ff-vcode').parent().after(feifei.image.vcode());
			$(this).unbind();
		});
	},
	'click': function(){//点击刷新
		$('body').on('click', 'img.ff-vcode-img', function(){
			$(this).attr('src', cms.root+'index.php?s=Vcode-Index');
		});
	}
},
'updown': {//顶踩
	'click': function(){
		$('body').on('click', 'a.ff-updown', function(e){
			var $this = $(this);
			if($(this).attr("data-id")){
				$.ajax({
					url: cms.root+'index.php?s=updown-'+$(this).attr("data-module")+'-id-'+$(this).attr("data-id")+'-type-'+$(this).attr("data-type"),
					cache: false,
					dataType: 'json',
					success: function(json){
						$this.addClass('disabled');
						if(json.status == 1){
							if($this.attr("data-type")=='up'){
								$this.find('.ff-updown-tips').html(json.data.up);
							}else{
								$this.find('.ff-updown-tips').html(json.data.down);
							}
						}else{
							$this.attr('title', json.info);
							$this.tooltip('show');
						}
					}
				});
			}
		});
	}
},
'forum': {//讨论模块功能
	'load': function(){
		if($('.ff-forum-reload').html()){
			feifei.forum.reload();
		}else{
			feifei.forum.comment();
		}
	},
	'reload': function(){//发表后刷新网页 留言本特殊版块 sid=5
		feifei.forum.form();//回复表单框
		feifei.forum.report();//举报事件
		$("body").on("submit", '.form-forum', function(){ //表单提交
			feifei.forum.submit($(this), 'guestbook', false);
			return false;
		});
	},		
	'comment': function(){//评论发表后 容器AJAX功能
		$cid = $("#ff-forum").attr('data-id');
		$sid = $("#ff-forum").attr('data-sid');
		if($cid && $sid){
			$.ajax({
				type: 'get',
				url: cms.root+'index.php?s=forum-config-sid-'+$sid+'-cid-'+$cid,
				timeout: 3000,
				dataType:'json',
				error: function(){
					$("#ff-forum").html('评论加载失败');
				},
				success:function(json){
					if(json.data.forum_type == 'uyan'){
						feifei.forum.uyan(json.data.uyan_uid);
					}else if(json.data.forum_type == 'changyan'){
						feifei.forum.changyan($sid+'-'+$cid, json.data.changyan_appid, json.data.changyan_appconf);
					}else{
						feifei.forum.show($cid, $sid, json.data.forum_module+'_ajax', 1);//ajax加载
						feifei.forum.form();//回复表单框
						feifei.forum.report();//举报事件
						$("body").on("submit", '.form-forum', function(){
							feifei.forum.submit($(this), json.data.forum_module+'_ajax', 3000);
							return false;
						});
					}
				}
			});
		}
	},
	'show': function($cid, $sid, $module, $page){//AJAX加载系统评论
		$.ajax({
			type: 'get',
			url: cms.root+'index.php?s=forum-'+$module+'-sid-'+$sid+'-cid-'+$cid+'-p-'+$page,
			timeout: 3000,
			error: function(){
				$("#ff-forum").html('评论加载失败，请刷新...');
			},
			success:function($html){
				$("#ff-forum").html($html);
			}
		});
	},
	'report':function(){//举报
		$('body').on('mouseenter', '#ff-forum-item .forum-title', function(){
			$(this).find('.ff-report').fadeIn();
		});
		$('body').on('mouseleave', '#ff-forum-item .forum-title', function(){
			$(this).find('.ff-report').fadeOut();
		});
		$('body').on('click', 'a.ff-report', function(){
			var $id = $(this).attr("data-id");
			if($id){
				$.ajax({
					type: 'get',
					url: cms.root+'index.php?s=forum-report-id-'+$id,
					timeout: 3000,
					dataType:'json',
					success:function(json){
						feifei.alert.success($('.form-forum').eq(0).find('.ff-alert'), json.info);
					}
				});
			}
		});
	},
	'reply': function($id){//更新回复数及显示回复链接
		$.ajax({
			type: 'get',
			url: cms.root+'index.php?s=forum-reply-id-'+$id,
			timeout: 3000,
			dataType:'json',
			success:function(json){
				if(json.status==200){
					$('#ff-reply-'+$id).find('.ff-reply-tips').html(json.data);//更新回复数
					$('#ff-reply-'+$id).parent().find('.ff-reply-read').fadeIn();//显示查看回复链接
				}
			}
		});
	},
	'form' : function(){ //回复表单加载
		$('body').on('click', 'a.ff-reply', function(){
			var $id = $(this).attr("data-id");
			if($id){
				//$(this).removeClass('ff-vcode');
				var $form = $($(".form-forum").eq(0).parent().html());
				$form.find("input[name='forum_pid']").val($id);
				$('#forum-reply-'+$id).html($form);
			}
		});
	},
	'submit': function($this, $module, $timeout){//发布
		$.post($this.attr('action'), $this.serialize(), function(json){
			if(json.status >= 200){
				feifei.alert.success($this.find('.ff-alert'), json.info);//发布成功提示
				//$this.find("button[type='submit']").addClass('disabled');//禁止再次提交
				if(json.data.forum_pid){
					//该讨论为回复时不需要全局刷新或重加载
					feifei.forum.reply(json.data.forum_pid);//更新回复数及显示回复链接按钮
					setTimeout(function(){$('#forum-reply-'+json.data.forum_pid).fadeOut('slow')}, 2000);//移除回复表单容器
				}else{
					//不需要审核的情况才更新列表或刷新 201为需要审核
					if(json.status == 200){
						if($timeout){
							setTimeout(function(){feifei.forum.show(json.data.forum_cid, json.data.forum_sid, $module, 1)}, $timeout);
						}else{
							location.reload();//刷新网页
						}
					}
				}
			}else{
				feifei.alert.warning($this.find('.ff-alert'), json.info);
			}
		 },'json');
	},
	'uyan': function($uid){
		$("#ff-forum").html('<div id="uyan_frame"></div>');
		$.getScript("http://v2.uyan.cc/code/uyan.js?uid="+$uid);
	},
	'changyan': function($sourceid, $appid, $conf){
		var width = window.innerWidth || document.documentElement.clientWidth;
		if (width < 768) { 
			$("#ff-forum").html('<div id="SOHUCS" sid="'+$sourceid+'"></div><script charset="utf-8" id="changyan_mobile_js" src="https://changyan.sohu.com/upload/mobile/wap-js/changyan_mobile.js?client_id='+$appid+'&conf=prod_'+$conf+'"><\/script>');
		}else{
			$("#ff-forum").html('<div id="SOHUCS" sid="'+$sourceid+'"></div>');
			$.getScript("https://changyan.sohu.com/upload/changyan.js",function(){
				window.changyan.api.config({
					appid: $appid,
					conf: 'prod_'+$conf
				});
			});
		}
	}
}
//end
};
$(document).ready(function(){
	feifei.image.loading();
	feifei.search.submit();
	feifei.search.keydown();
	feifei.search.autocomplete();
	feifei.updown.click();	
	feifei.page.more();
	feifei.forum.load();
	feifei.vcode.load();
	feifei.image.qrcode();
});
var haojutvcom = null;
  function time() {
    var a = new Date,
    b = (10 > a.getHours() ? "0": "") + a.getHours(),
    c = (10 > a.getMinutes() ? "0": "") + a.getMinutes(),
    a = (10 > a.getSeconds() ? "0": "") + a.getSeconds();
    document.getElementById("shijian").innerHTML = "" + b + ":" + c + ":" + a + "";
    haojutvcom = setTimeout(time, 1E3)
  }
  window.onload = function() {
    time()
  };
