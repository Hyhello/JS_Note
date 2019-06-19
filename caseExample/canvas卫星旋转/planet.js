/**
 * 作者：yeshengqiang
 * 时间：2019-06-18
 * 描述：星球js
 */

;(function (global, undefined) { 'use strict';

	/**
	 * 判断是否是一个元素
	 * @param {*} el
	 * @return { Boolean }
	 */
	function isElement (el) {
		return typeof el === 'object' && el.nodeTpye === 1;
	};

	/**
	 * 角度转弧度
	 * @param { int } angle
	 * @return { * }
	 */
	function angleToRadians (angle) {
		return angle * Math.PI / 180;
	}

	/**
	 * 判断类型
	 * @param { any } type
	 * @return { string }
	 */
	function _typeof (type) {
		return ({}).toString.call(type).replace(/^\[object\s+(\w+?)]$/, '$1').toLowerCase();
	};

	/**
	 *
	 * @param { object } ctx	// canvas 上下文
	 * @param { int } x 		// 绘图中心x
	 * @param { int } y  		// 绘图中心y
	 * @param { int } a 		// 绘图椭圆长的一半
	 * @param { int } b 		// 绘图椭圆高的一半
	 */
	function drawEllipse(ctx, x, y, a, b) {
		var step = (a > b) ? 1 / a : 1 / b;
		ctx.beginPath();
		ctx.moveTo(x + a, y); //从椭圆的左端点开始绘制
		for (var i = 0; i < 2 * Math.PI; i += step) {
			ctx.lineTo(x + a * Math.cos(i), y + b * Math.sin(i));
		}
		ctx.closePath();
		ctx.stroke();
	}

    // toRgba
    function toRgba (str, alpha) {
		alpha = alpha || 1;
        return str.replace(/^#(\w{2})(\w{2})(\w{2})$/, function (_, $1, $2, $3) {
            return 'rgba(' + [parseInt($1, 16), parseInt($2, 16), parseInt($3, 16), alpha].join(',') + ')';
        });
    };

	// 视角远近
	function perspective (radian, min, max) {
		return (Math.sin(radian) + 1) / 2 * (max - min) + min;
	}

	/**
	 *
	 * @param { object | string } el
	 * @param { object } options
	 */
	function Class (el, options) {
		var $dpr = window.devicePixelRatio || 1;
		this.$el = isElement(el) ? el : document.getElementById(el);
		var rect = this.$el.getBoundingClientRect();

		if (!rect.height) {
			console.warn('parent box must has height');
			return;
		}

		options = options || {}; // 校验

		Class._checkConf(options);

		// this.callback = callback || function () {};

		this._canvas = document.createElement('canvas');
		this._canvas.innerHTML = '您的浏览器版本不支持canvas';
		this.$el.appendChild(this._canvas);
		this.$ctx = this._canvas.getContext('2d'); // 配置

		this.$conf = Object.assign({}, Class.defaults, options);
		this.$conf.iW = rect.width;
		this.$conf.iH = rect.height; // 配置宽高
		// 配置padding
		this.$conf.rect = {
			t: 10,
			r: 50,
			b: 30,
			l: 50
		};
		// 配置外椭圆 属性
		this.$conf.outEllipseProp = {
			centerX: 0,
			centerY: 0,
			width: this.$conf.iW / 2 - this.$conf.ballOutRadius,
			height: this.$conf.iH / 2 - this.$conf.ballOutRadius
		};
		// 配置内椭圆 属性
		this.$conf.insetEllipseProp = {
			centerX: this.$conf.rect.l - this.$conf.rect.r,
			centerY: this.$conf.rect.t - this.$conf.rect.b,
			width: this.$conf.iW / 2 - (this.$conf.rect.l + this.$conf.rect.r) - this.$conf.ballInsetRadius,
			height: this.$conf.iH / 2 - (this.$conf.rect.t + this.$conf.rect.b) - this.$conf.ballInsetRadius
		};

		this._canvas.width = rect.width * $dpr;
		this._canvas.height = rect.height * $dpr;
		this._canvas.style.width = this.$conf.iW + 'px';
		this._canvas.style.height = this.$conf.iH + 'px';
		this.$ctx.scale($dpr, $dpr);

		// 开始绘制
		this._drawEllipse();
		// 绘制中心点
		this._drawCenterPoint();
		// 绘制椭圆
		this._drawBall(0);
	}

	// 配置文件
	Class.defaults = {
		outEllipseStyle: '#436EEE',				// 外椭圆边框颜色
		insetEllipseStyle: '#8B0000',			// 内椭圆边框颜色
		padding: '50px',					// 内圆挤兑，用法类似 css padding，不支持百分比，只支持px
        ballCenterRadius: 25,               // 中部球的半径
		ballOutRadius: 25,					// 外部球的半径
        ballInsetRadius: 20,                // 内部球的半径
		ballColor: 'green',					// 球的颜色
		hasAlpha: false						// 运动的球是否有透明效果
	};

	// 检查配置
	Class._checkConf = function (options) {
		var CONF = this.defaults;
		Object.keys(CONF).forEach(function (item, key) {
			var type = _typeof(CONF[item]); // eslint-disable-next-line valid-typeof
			if (options[item] && _typeof(options[item]) !== type) {
				throw new TypeError('[Class] options property：' + item + ' is not a ' + type);
			}
		});
	};

	// 原型
	Class.prototype = {
		constructor: Class,
		clearRect () {
			this.$ctx.clearRect(0, 0, this.$conf.iW, this.$conf.iH);
		},
		// 销毁
		destroy () {
			this.$ctx.clearRect(0, 0, this.$conf.iW, this.$conf.iH);
			this.$el.removeChild(this._canvas);
			this.$el = this.$ctx = this._canvas = null;
		},
		// 绘制椭圆
		_drawEllipse () {
			this.$ctx.beginPath();
			this.$ctx.save();
			this.$ctx.translate(this.$conf.iW / 2, this.$conf.iH / 2);

			// 绘制外椭圆
			this.$ctx.beginPath();
            // 阴影
            // 绘制渐变
            var outGradient = this.$ctx.createLinearGradient(0, -(this.$conf.outEllipseProp.height + this.$conf.outEllipseProp.centerY), 0, this.$conf.outEllipseProp.height + this.$conf.outEllipseProp.centerY);
			outGradient.addColorStop(0, toRgba(this.$conf.outEllipseStyle, 0.35));
			outGradient.addColorStop(1, toRgba(this.$conf.outEllipseStyle, 1));
            this.$ctx.shadowColor = this.$conf.outEllipseStyle;
            this.$ctx.shadowBlur = 10;
            this.$ctx.shadowOffsetX = -5;
            this.$ctx.shadowOffsetY = 5;
			this.$ctx.strokeStyle = outGradient;
			drawEllipse(this.$ctx, this.$conf.outEllipseProp.centerX, this.$conf.outEllipseProp.centerY, this.$conf.outEllipseProp.width, this.$conf.outEllipseProp.height);

			// 绘制内椭圆
			this.$ctx.beginPath();
			var insetGradient = this.$ctx.createLinearGradient(0, -(this.$conf.insetEllipseProp.height + this.$conf.insetEllipseProp.centerY), 0, this.$conf.insetEllipseProp.height + this.$conf.insetEllipseProp.centerY);
			insetGradient.addColorStop(0, toRgba(this.$conf.insetEllipseStyle, 0.35));
			insetGradient.addColorStop(1, toRgba(this.$conf.insetEllipseStyle, 1));
			this.$ctx.strokeStyle = insetGradient;
			drawEllipse(this.$ctx, this.$conf.insetEllipseProp.centerX, this.$conf.insetEllipseProp.centerY, this.$conf.insetEllipseProp.width, this.$conf.insetEllipseProp.height);
			this.$ctx.restore();
		},
		// 绘制中心点
		_drawCenterPoint () {
			this.$ctx.beginPath();
			this.$ctx.save();
			this.$ctx.translate(this.$conf.iW / 2, this.$conf.iH / 2);

			this.$ctx.arc(this.$conf.insetEllipseProp.centerX, this.$conf.insetEllipseProp.centerY, this.$conf.ballCenterRadius, 0, Math.PI * 2);
			this.$ctx.fill();

			this.$ctx.restore();
		},
		// 绘制 ball
		/**
		 *
		 * // 绘制ball
		 * @param { int } angle	// 位置角度
		 * @param { boolean } bool	// 确定当前是内圆 还是外圆球
		 */
		_drawBall (angle, bool) {
			var radian = angleToRadians(angle);
			var num = perspective(radian, 0.55, 1);
			var centerX = bool ? this.$conf.insetEllipseProp.width * Math.cos(radian) : this.$conf.outEllipseProp.width * Math.cos(radian);
			var centerY = bool ? this.$conf.insetEllipseProp.height * Math.sin(radian) : this.$conf.outEllipseProp.height * Math.sin(radian);
            var translateX = this.$conf.iW / 2 + (bool ? this.$conf.insetEllipseProp.centerX : this.$conf.outEllipseProp.centerX);
            var translateY = this.$conf.iH / 2 + (bool ? this.$conf.insetEllipseProp.centerY : this.$conf.outEllipseProp.centerY);
            var radius = bool ? this.$conf.ballInsetRadius : this.$conf.ballOutRadius;
			this.$ctx.beginPath();
			this.$ctx.save();
			this.$ctx.translate(translateX, translateY);
			if (this.$conf.hasAlpha) {
				this.$ctx.globalAlpha = num;
			}

            this.$ctx.beginPath();
			this.$ctx.fillStyle = this.$conf.ballColor;
			this.$ctx.arc(centerX, centerY, radius * num, 0 , 2 * Math.PI, true);
			this.$ctx.fill();

            this.$ctx.beginPath();
            this.$ctx.font = 15 * num + 'px Microsoft JhengHei';
            this.$ctx.fillStyle = 'tomato';
            this.$ctx.textAlign = 'center';
            this.$ctx.textBaseline = 'middle';
            this.$ctx.fillText('张三', centerX, centerY);

			this.$ctx.restore();
		}
	};

	global.Planet = Class;

} ( window ));

