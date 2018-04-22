(function($,win,undef){
    /* 申明一个插件对象 */
	var carouselPlugin = function(carousels, settings){
		var settings = $.extend({},carouselPlugin.defaults,settings);
		var brother = this;
		brother.settings = settings;
		brother.carousels = carousels;
		carousels.each(function(){ 
			carouselPlugin.util.init.call($(this),brother);
		});
	};

    carouselPlugin.defaults = {
		speed : '1000',
		delay : '2000',
		direction : 'right',
		eventType : 'click'
	};
    /* 内部调用方法 */
    carouselPlugin.util = {
    	isStop : true,	//判断轮播是否停止

        init: function(carousels) {
        	var obj = this;
        	obj.data({ 
        		index : 0, // 默认初始索引
				timer : null,  // 计数器句柄
				num : 0,	//图片数量
				slideCallback : function(){},	//滚动后触发回调函数
				slidCallback :function(){}	//滚动前触发回调函数
        	});
			carouselPlugin.util.copyIitems.call(obj);
			carouselPlugin.util.arrowBtnEvent.call(obj, carousels);
			carouselPlugin.util.imgIndexEvent.call(obj, carousels);
		},

		copyIitems: function() { // 复制图片结构
			var obj =  this,
				items = obj.find('.m-carousel-items'),
				imgs =  items.find('img'),
				imgWidth = imgs.eq(0).outerWidth(true),
				data = obj.data(),
				indicators = obj.find('.m-carousel-indicators li'); //圆点标志
			data.num = imgs.size();
			items.append(imgs.clone());
			
			/* 设置初始位置 */
			items.css('left', - data.num * imgWidth + 'px');
			indicators.removeClass('z-active').eq(data.index).addClass('z-active');
		},

		scrollDirection: function(dir) {  //切换图片滚动方向
			var obj = this,
				data = obj.data();
			switch(dir){ 
				case 'left' : data.index = (data.index - 1 < 0 ? -1 : data.index - 1);break;
				case 'right' : data.index = (data.index + 1 > data.num ? data.num : data.index + 1);break;
			}
		},

		arrowBtnEvent: function(carousels) { //箭头按钮事件
			var obj = this,
				data = obj.data();
			var prevBtn = obj.find('.m-carousel-prev'),	//向左滚动按钮
				nextBtn = obj.find('.m-carousel-next'); //向右滚动按钮
			prevBtn.click(function() { 
				carouselPlugin.util.scrollDirection.call(obj, 'left');
				carouselPlugin.util.imgScroll.call(obj, carousels);
			});
			nextBtn.click(function() { 
				carouselPlugin.util.scrollDirection.call(obj, 'right');
				carouselPlugin.util.imgScroll.call(obj, carousels);
			});

			//鼠标移入图片时显示箭头按钮
			obj.hover(carouselPlugin.util.arrowBtnShow,carouselPlugin.util.arrowBtnHide);
		},

		imgScroll: function(carousels) {
		 	var obj = this,
				data = obj.data(),
				items = obj.find('.m-carousel-items'),
				imgs =  obj.find('img'),
				imgWidth = imgs.eq(0).outerWidth(true),
				indicators = obj.find('.m-carousel-indicators li'); //圆点标志

			//切换图片时立刻触发回调函数
			if($.isFunction(data.slidCallback)){ 
				data.slidCallback();
			}

			if(data.index === data.num){ 
				items.css('left', - (data.num - 1) * imgWidth);
				items.stop(true,true).animate({ 
					'left' : - data.num * imgWidth
				}, carousels.settings.speed, function() { 
					if($.isFunction(data.slideCallback)){ 
						data.slideCallback();	//滚动图片时后触发回调函数
					}
				});
				data.index = 0;
			}else if(data.index === -1){ 
				items.stop(true,true).animate({ 
					'left' : - (data.num - 1) * imgWidth
				}, carousels.settings.speed, function(){ 
					items.css('left', - (2 * data.num - 1) * imgWidth);
					data.index = data.num - 1;
					if($.isFunction(data.slideCallback)){ 
						data.slideCallback();	//滚动图片时后触发回调函数
					}
				});
			}else{ 
				items.stop(true,true).animate({ 
					'left' : - (data.index + data.num) * imgWidth
				}, carousels.settings.speed, function(){ 
					if($.isFunction(data.slideCallback)){ 
						data.slideCallback();	//滚动图片时后触发回调函数
					}
				});
			}

			//显示图片相应序号
			indicators.removeClass('z-active').eq(data.index).addClass('z-active');
		},

		autoPlay: function(carousels) {  //自动播放
			var obj = this,
				data = obj.data();
			data.timer = setInterval(function() {
				carouselPlugin.util.scrollDirection.call(obj, carousels.settings.direction);
				carouselPlugin.util.imgScroll.call(obj, carousels);
			}, carousels.settings.delay);
		},

		mouseHoverEvent: function(carousels) {   //鼠标滑入图片停止播放事件
			var obj = this,
				data = obj.data();
			obj.hover(function() { 
				clearInterval(data.timer);
			},function() { 
				if(!carouselPlugin.util.isStop){ 
					carouselPlugin.util.autoPlay.call(obj, carousels);
				}
			});
		},

		arrowBtnShow: function(){ 
			$(this).find('.m-carousel-prev').show();
			$(this).find('.m-carousel-next').show(); 
		},

		arrowBtnHide: function(){
			$(this).find('.m-carousel-prev').hide();
			$(this).find('.m-carousel-next').hide(); 
		},

		imgIndexEvent: function(carousels) {	//序号按钮显示相应图片事件
			var obj = this,
				data = obj.data(),
				indicators = obj.find('.m-carousel-indicators li'); //圆点标志
			indicators.bind(carousels.settings.eventType, function() { 
				data.index = $(this).index();
				carouselPlugin.util.imgScroll.call(obj, carousels);
			});
		},

		start: function(carousels) { 	//开始自动轮播
			var obj = this;
			carouselPlugin.util.isStop = false;
   			carouselPlugin.util.autoPlay.call(this, carousels);
   			carouselPlugin.util.mouseHoverEvent.call(this, carousels);
		},

		stop: function() { 			//停止轮播
			var obj = this,
				data = obj.data();
			carouselPlugin.util.isStop = true;
			clearInterval(data.timer);

		}

	};

    /* 增加对象的原型方法 供外部调用 */

    carouselPlugin.prototype = {
        start: function() { 	
       		var obj = this;
       		obj.carousels.each(function(){ 
       			carouselPlugin.util.start.call($(this), obj);
       		});
       		return this;
        },

        stop: function() { 
       		var obj = this;
       		obj.carousels.each(function(){ 
       			carouselPlugin.util.stop.call($(this), obj);
       		});
       		return this;
       	},

       	on: function(isSlided, callback) {	//切换回调函数触发回调函数
       		if($.isFunction(callback)){ 
       			var obj = this; 
	       		obj.carousels.each(function(){ 
		       		if(isSlided === 'slide'){ //滚动后触发回调函数
	   					$(this).data().slideCallback = callback;
		       		}else if(isSlided === 'slid'){ //滚动前触发回调函数
		       			$(this).data().slidCallback = callback;
		       		}
		       	});
       		}
       	},

        update: function(options) { 
			var obj = this;
			var options = $.extend({}, obj.settings, options);
			return new carouselPlugin($(obj.carousels), options);
   		}
 	};

	$.fn.carouselPlugin = function(settings){
		return new carouselPlugin(this, settings);
	};

})(jQuery,window);

