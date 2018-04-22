;(function(factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        factory(require('js/jquery'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory(window.jQuery));
    } else {
        factory(window.jQuery);
    }
}(function ($) {
    var pluginName = 'slider';
    var defaults = {
        speed : '1000', // 轮播速度
        delay : '2000', // 延迟时间
        direction : 'right', // 轮播方向
        sliderCallback: null // 切换图片的回调函数
    };
    var plugin = function (obj, settings) {
        var self = this;

        self.index = 0; // 默认初始索引
        self.timer = null;  // 计数器句柄

        self.settings = $.extend({}, defaults, settings);
        self.obj = obj;
        self.container = self.obj.find('.m-carousel-items');
        self.$imgs =  self.container.find('img');
        self.number = self.$imgs.length; // 图片数量
        self.imgWidth = self.$imgs.eq(0).outerWidth(true);
        self.prevBtn = self.obj.find('.m-carousel-prev'),	//向左滚动按钮
        self.nextBtn = self.obj.find('.m-carousel-next'); //向右滚动按钮
        self.$indicators = self.obj.find('.m-carousel-indicators'); //圆点标志
        self.isPlay = true; // 是否播放中

        obj.each(function () {
            self.init();
        });
    };

    plugin.prototype = {
        init: function() {
            this.build();
            this.autoPlay();
            this.imgIndexEvent();
            this.arrowEvnet();
            this.mouseHoverEvent();
        },
        // 处理ui结构
        build: function() {
            // 复制全部图片添加到容器
            this.container.append(this.$imgs.clone());

            var $indicatorsWrap = this.obj.find('.m-carousel-indicators');
            $indicatorsWrap.append('<li></li>'.repeat(this.number));
            this.$indicators = $indicatorsWrap.find('li');

            /* 设置初始位置 */
            this.container.css('left', - this.number * this.imgWidth + 'px');
            this.$indicators.removeClass('z-active').eq(this.index).addClass('z-active');
        },
        // 图片轮播
        imgScroll: function () {
            var self = this;

            if(self.index === self.number){// 最后一张图片向后滚动
                self.container.css('left', - (self.number - 1) * self.imgWidth);
                self.animate(- self.number * self.imgWidth);
                self.index = 0;
            } else if (self.index === -1) { // 第一张图片向前滚动
                self.animate(- (self.number - 1) * self.imgWidth, function () {
                    self.container.css('left', - (self.number * 2 - 1) * self.imgWidth);
                });
                self.index = self.number - 1;
            } else {
                self.animate(- (self.index + self.number) * self.imgWidth);
            }

            //显示图片相应序号
            self.$indicators.removeClass('z-active').eq(self.index).addClass('z-active');
        },
        animate: function(left, callback){
            var self = this;
            self.container.stop(true,true).animate({
                'left' : left
            }, self.settings.speed, function() {
                callback && callback();
                self.settings.sliderCallback();
            });
        },
        //自动播放
        autoPlay: function() {
            var self = this;

            self.timer = setInterval(function() {
                self.scrollDirection(self.settings.direction);
                self.imgScroll();
            }, self.settings.delay);
        },
        //切换图片滚动方向
        scrollDirection: function(dir) {
            var self = this;
            switch(dir){
                case 'left' : self.index -= 1;break;
                case 'right' : self.index += 1;break;
            }
        },
        //序号按钮显示相应图片事件
        imgIndexEvent: function() {
            var self = this;

            self.$indicators.on('click', function() {
                self.index = $(this).index();
                self.imgScroll();
            });
        },
        // 处理箭头点击事件
        arrowEvnet: function () {
            var self = this;

            self.prevBtn.on('click', function () {
                self.scrollDirection('left');
                self.imgScroll();
            });
            self.nextBtn.on('click', function () {
                self.scrollDirection('right');
                self.imgScroll();
            });
        },
        // 鼠标移入事件
        mouseHoverEvent: function(){
            var self = this;

            this.obj.hover(function () {
                clearInterval(self.timer);
            }, function () {
                self.isPlay && self.autoPlay();;
            });
        },
        start: function () {
            this.isPlay = true;
            this.autoPlay();
        },
        stop: function () {
            this.isPlay = false;
            clearInterval(this.timer);
        }
    };

    $.fn[pluginName] = function(settings){
        return new plugin(this, settings);
    };
}));