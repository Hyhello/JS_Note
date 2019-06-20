/**
 * 作者：yeshengqiang
 * 时间：2019-06-19
 * 描述：球形进度条
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
	 * 计算信号衰减 (4K/(4K+x^4))^2K<=1 (x belong [-K,K]) 公式
	 * @param { int } x
	 * @param { int } k	// 衰减系数
	 */
	function calcAttenuation(x, k) {
		return Math.pow(4 * k / (4 * k + Math.pow(x, 4)), 2 * k);
	}

	function easureNumber (val) {
		return !isNaN(val) && typeof val === 'number';
	};

	/**
	 *
	 * @param { object | string } el
	 * @param { object } options
	 */
	function Ball (el, options) {
		var $dpr = window.devicePixelRatio || 1;
		this.$el = isElement(el) ? el : document.getElementById(el);
		var rect = this.$el.getBoundingClientRect();
		this.timer = null;

		if (!rect.height) {
			console.warn('parent box must has height');
			return;
		}

		options = options || {}; // 校验

		Ball._checkConf(options);

		// this.callback = callback || function () {};

		this._canvas = document.createElement('canvas');
		this._canvas.innerHTML = '您的浏览器版本不支持canvas';
		this.$el.appendChild(this._canvas);
		this.$ctx = this._canvas.getContext('2d'); // 配置

		this.$conf = Object.assign({}, Ball.defaults, options);
		this.$conf.iW = rect.width;
		this.$conf.iH = rect.height; // 配置宽高
		this.$conf.radius = (Math.min(rect.width, rect.height) - this.$conf.lineWidth) / 2;

		this._canvas.width = rect.width * $dpr;
		this._canvas.height = rect.height * $dpr;
		this._canvas.style.width = this.$conf.iW + 'px';
		this._canvas.style.height = this.$conf.iH + 'px';
		this.$ctx.scale($dpr, $dpr);

		// 开始绘制
		this.render();
	}

	// 配置文件
	Ball.defaults = {
		percentage: 0,						// 初始进度值
        borderStyle: 'blue',				// 外圆颜色
        waveStyle: '#000000',               // 水的颜色
        fontStyle: '#f6b71e',               // 字体颜色
        fontSize: '30px',                   // 字体大小 携带px
        fontFamily: 'Microsoft Yahei',      // 字体
        fontWeight: 'bold',                 // 字体宽窄
		lineWidth: 5,						// 外圆线宽
		radianStep: 0.06,					// 每帧增加的弧度[0,2PI](作用于sin曲线, 正值相当于原点右移, 曲线左移)
		frequency: 0.06,					// 角频率,即震动频率
		radianOffset: 0,					// 当前弧度的偏移
		amplitude: 5,						// 振幅
		halfWaveCount: 10,					// 半波长个数
		coefficient: 0.4					// 衰减系数(越大, 边缘衰减的就越多, 震动宽度相应也越窄)
	};

	// 检查配置
	Ball._checkConf = function (options) {
		var CONF = this.defaults;
		Object.keys(CONF).forEach(function (item, key) {
			var type = _typeof(CONF[item]); // eslint-disable-next-line valid-typeof
			if (options[item] && _typeof(options[item]) !== type) {
				throw new TypeError('[Ball] options property：' + item + ' is not a ' + type);
			}
		});
	};

	// 原型
	Ball.prototype = {
		constructor: Ball,
		clearRect () {
			this.$ctx.clearRect(0, 0, this.$conf.iW, this.$conf.iH);
		},
		// 销毁
		destroy () {
			this.clearWaveLoop();
			this.$ctx.clearRect(0, 0, this.$conf.iW, this.$conf.iH);
			this.$el.removeChild(this._canvas);
			this.$el = this.$ctx = this._canvas = null;
		},
		// 渲染部分
		render () {
			this.$conf.percentage = Math.round(Math.max(0, Math.min(this.$conf.percentage, 100)));
			// 清除圆
			this.clearRect();
			// 绘制外圆
			this.drawOutCircle();
			// 绘制波
			if (this.$conf.percentage === 0 || this.$conf.percentage === 100) {
				this.drawWave(0);
				this.drawText(this.$conf.percentage + '%');
			} else {
				this.waveLoop();
			}
		},
		update (val) {
			val = Number(val);
			if (!easureNumber(val)) {
				throw new Error('val is not a number');
			}
			this.$conf.percentage = val;
			this.render();
		},
		drawOutCircle () {
			this.$ctx.beginPath();
			this.$ctx.save();
			this.$ctx.translate(this.$conf.iW / 2, this.$conf.iH / 2);

			this.$ctx.lineWidth = this.$conf.lineWidth;
			this.$ctx.strokeStyle = this.$conf.borderStyle;
			this.$ctx.arc(0, 0, this.$conf.radius, 0, Math.PI * 2);
			this.$ctx.stroke();

			this.$ctx.restore();
		},
		drawText (text) {
			this.$ctx.beginPath();
			this.$ctx.save();
			this.$ctx.translate(this.$conf.iW / 2, this.$conf.iH / 2);
			this.$ctx.fillStyle = this.$conf.fontStyle;
			this.$ctx.font = this.$conf.fontWeight + ' ' + this.$conf.fontSize + ' ' + this.$conf.fontFamily;
			this.$ctx.textAlign = 'center';
			this.$ctx.textBaseline = 'middle';
			this.$ctx.fillText(text, 5, 5);

			this.$ctx.restore();
		},
		// 绘制波形
		drawWave (amplitude) {
			var x, y;
			var i = -this.$conf.coefficient;
			amplitude = amplitude === undefined ? this.$conf.amplitude : amplitude;
			this.$conf.radianOffset = (this.$conf.radianOffset + this.$conf.frequency) % (Math.PI * 2);
			this.clearWaveLoop();
			this.clipWave();
			this.clearRect();
			this.$ctx.beginPath();
			this.$ctx.save();
            this.$ctx.translate(this.$conf.iW / 2 - this.$conf.radius, this.$conf.iH / 2);
            this.$ctx.fillStyle = this.$conf.waveStyle;
			this.$ctx.moveTo(0, this.$conf.radius);
			// +0.01 为了保持平衡
			for (var i = -this.$conf.coefficient; i <= this.$conf.coefficient + 0.01; i += 0.01) {
                //i是当前位置相对于整个长度的比率( x=width*(i+K)/(2*K))
                x = this.$conf.radius * 2 * (i + this.$conf.coefficient) / (2 * this.$conf.coefficient);
                //加offset相当于把sin曲线向右平移
                y = this.$conf.radius - this.$conf.radius * 2 * this.$conf.percentage / 100 + amplitude * calcAttenuation(i, this.$conf.coefficient) *
                    Math.sin(this.$conf.halfWaveCount * i + this.$conf.radianOffset);
                this.$ctx.lineTo(x, y);
			}
			this.$ctx.lineTo(this.$conf.radius * 2, this.$conf.radius);
			this.$ctx.fill();
			this.$ctx.restore();
		},
		clearWaveLoop () {
			if (this.timer) {
				window.cancelAnimationFrame(this.timer);
				this.timer = null;
			}
		},
		waveLoop () {
			this.drawWave();// 绘制文字
			this.drawText(this.$conf.percentage + '%');
			this.timer = requestAnimationFrame(this.waveLoop.bind(this));
		},
		// 剪切波形
		clipWave () {
			this.$ctx.beginPath();
			this.$ctx.arc(this.$conf.iW / 2, this.$conf.iH / 2, this.$conf.radius - this.$conf.lineWidth / 2, 0, Math.PI * 2, false);
			this.$ctx.clip();
		}
	};

	global.Ball = Ball;

} ( window ));
