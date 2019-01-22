(function (global) {

    // 字体宽度及高度
    var TextLine = function (font, text) {
        this.$ctx = document.createElement('canvas').getContext('2d');
        this.$ctx.font = font;
        this.text = text;
    };

    TextLine.prototype = {
        constructor: TextLine,
        getTextWidth: function () {
            return this.$ctx.measureText(this.text).width;
        },
        getTextHeight: function () {
            const width = this.$ctx.measureText('M').width;
            return width * 7 / 6;
        }
    };

    // 温度计
    var Meter = function (el, options) {
        options = options || {};
        var rect = el.getBoundingClientRect();
        this._ctx = el.getContext('2d');
        el.width = rect.width;
        el.height = rect.height;
        // 检查配置
        this.constructor.checkConf(options);
        // 初始化配置
        this._conf = this.constructor.extend(true, this.constructor.CONF, options);

        if (this._conf.maxTemp <= this._conf.minTemp) {
            throw new Error('[Meter] options property：maxTemp must gt minTemp');
        }

        if ((this._conf.maxTemp - this._conf.minTemp) % this._conf.scaleOffset !== 0) {
            throw new Error('[Meter] options property：scaleOffset must keep [(maxTemp - minTemp) % scaleOffset === 0]');
        }

        // 调整配置
        this._conf.tempCap = this._conf.tempCap === 'round' ? 'round' : 'butt';
        this._conf.ballRadius = Math.max(this._conf.ballRadius, this._conf.tempWidth / 2);
        this._conf.scalePlacement = this.constructor.oneOf(['both', 'left', 'right'], this._conf.scalePlacement) ? this._conf.scalePlacement : 'left';
        this._conf.tempVal = Math.max(this._conf.minTemp, Math.min(this._conf.tempVal, this._conf.maxTemp));

        // 温度计到球的衔接距离
        this._conf.extendOffset = this._conf.ballRadius - Math.sqrt(this._conf.ballRadius * this._conf.ballRadius - this._conf.tempWidth * this._conf.tempWidth / 4);

        // 标题字体
        // 标题高度
        this._conf._fontTitleHeight = this._conf.showLabel ? new TextLine(this._conf.titleFont + ' ' + this._conf.fontFamily, this._conf.tempTitle).getTextHeight() + this._conf.titleOffsetBottom : 0;
        // 温度计val字体高度
        this._conf._fontValHeight = new TextLine(this._conf.valFont + ' ' + this._conf.fontFamily, this._conf.tempTitle).getTextHeight() + this._conf.valOffsetTop;
        // 初始化动画
        var _this = this;
        this._count = new Count(this._conf.minTemp, this._conf.tempVal, this._conf.duration, function (val) {
            _this._conf.tempVal = val.toFixed(2);
            // 初始化
            _this._init();
        });

        this._count.start();
    };

    Meter.oneOf = function (list, attr) {
        return new RegExp('\\b' + attr + '\\b').test(list.join(','));
    };

    Meter.checkConf = function (options) {
        var CONF = this.CONF;
        Object.keys(CONF).forEach(function (item, key) {
            var type = typeof CONF[item];
            if (options[item] && typeof options[item] !== type) {
                throw new TypeError('[Meter] options property：' + item + ' is not a ' + type);
            }
        });
    };

    Meter.toNumber = function (n) {
        var val = parseFloat(n);
        return isNaN(val) ? n : val;
    };

    Meter.extend = function () {
        var j, resource, i = 0;
        var target = arguments[0];
        var argList = Array.prototype.slice.call(arguments, 1);
        var argLen = argList.length;
        target = typeof target === 'boolean' ? {} : target;
        while (i < argLen) {
            resource = argList[i++];
            for (j in resource) {
                if (resource.hasOwnProperty(j)) {
                    target[j] = resource[j];
                }
            }
        }
        return target;
    };

    Meter.CONF = {
        tempTitle: '温度计',                      // 温度计标题
        titleFont: '20px',                       // 标题文字
        titleOffsetBottom: 20,                   // 文字padding
        titleColor: '#000000',                   // 标题字体颜色
        margin: 20,                              // 温度计距离顶部及底部的margin距离，默认值为20
        offset: 5,                               // 温度计管距离刻度距离
        ballRadius: 20,                          // 底部温度球半径，默认值10，当showBall 为true，生效
        valFont: '20px',                         // 温度计变量字体
        valOffsetTop: 10,                        // 温度计变量字体距离温度计顶部高度
        tempVal: 26,                             // 默认的温度值，默认值为26
        tempWidth: 20,                           // 温度计管宽度，默认值为20
        maxTemp: 100,                            // 最大温度值，默认值为100
        minTemp: 0,                              // 最小温度值，默认值为0
        tempCap: 'butt',                         // 温度计头部样式，默认值为：butt
        tempBgColor: '#cccccc',                  // 温度计背景色，默认值为: #CCCCCC
        tempActiveBgColor: '#888888',            // 温度计活动背景色，默认值为：#888888
        scaleColor: '#888888',                   // 温度计刻度颜色
        scaleOffset: 10,                         // 温度计刻度跨度
        scaleFont: '14px',                       // 刻度字体大小
        fontFamily: 'Helvetica ',                // 字体样式
        scalePlacement: 'left',                  // 温度计指针位置，默认值：left,【left, right, both】
        cursorWidth: 30,                         // 游标宽度
        cursorHeight: 7,                         // 游标高度
        cursorBgColor: '#F08080',                // 游标背景色
        showLabel: true,                         // 是否显示温度标签，默认值为true
        showCursor: true,                        // 是否显示游标
        showBall: true                           // 是否显示底部温度球，默认值为true
    };

    Meter.prototype = {
        constructor: Meter,
        v: '0.0.1',
        _init: function () {
            this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
            this._ctx.save();
            this._ctx.beginPath();
            this._ctx.translate(this._ctx.canvas.width / 2, this._ctx.canvas.height - this._conf.margin);

            // 内容部分
            this._render();

            this._ctx.restore();
        },
        _render: function () {
            var i = 0;
            var signList = this._conf.scalePlacement === 'both'
                                ? [-1, 1]
                                : this._conf.scalePlacement === 'left' ? [-1] : [1];
            var ii = signList.length;

            // 绘制文字
            if (this._conf.showLabel) {
                this._drawTitleText();
            }
            // 画val
            this._drawValText();
            // 里面壳
            this._drawBaseShell(false);
            // 外面展示壳
            this._drawBaseShell(true);

            // 渲染刻度
            for (; i < ii; i++) {
                this._drawBaseScale(signList[i]);
            }

            if (!this._conf.showCursor) return;
            // 游标
            for (i = 0; i < ii; i++) {
                this._drawCursor(signList[i]);
            }
        },
        update: function (newVal) {
            newVal = Math.max(this._conf.minTemp, Math.min(newVal, this._conf.maxTemp));
            this._count.update(newVal);
        },
        // 绘制标题
        _drawTitleText: function () {
            this._ctx.save();
            this._ctx.beginPath();
            this._ctx.translate(0, this._conf.margin * 2 - this._ctx.canvas.height);
            this._ctx.font = this._conf.titleFont + ' ' + this._conf.fontFamily;
            this._ctx.fillStyle = this._conf.titleColor;
            this._ctx.textAlign = 'center';
            this._ctx.textBaseline = 'middle';
            this._ctx.fillText(this._conf.tempTitle, 0, 0);
            this._ctx.restore();
        },
        // 绘制val标题
        _drawValText: function () {
            this._ctx.save();
            this._ctx.beginPath();
            this._ctx.font = '24px ' + this._conf.fontFamily;
            // console.log(this._ctx.measureText(this._conf.tempVal));
            this._ctx.textAlign = 'center';
            this._ctx.textBaseline = 'middle';
            this._ctx.fillText(this._conf.tempVal, 0, 0);
            this._ctx.restore();
        },
        // 基准 bool false,外壳，bool true，内壳
        _drawBaseShell: function (bool) {
            var radius = this._conf.showBall ? this._conf.ballRadius : 0;
            var height = (this._conf.margin + radius) * 2 - this._ctx.canvas.height + this._conf._fontTitleHeight + this._conf._fontValHeight;
            var tempHeight = !bool ? height : (this._conf.tempVal - this._conf.minTemp) * height / (this._conf.maxTemp - this._conf.minTemp);
            this._ctx.save();
            this._ctx.translate(0, -radius * 2 - this._conf._fontValHeight);
            this._ctx.fillStyle = !bool ? this._conf.tempBgColor : this._conf.tempActiveBgColor;

            // 温度计管
            this._ctx.beginPath();
            if (this._conf.tempCap === 'butt') {
                this._ctx.fillRect(-this._conf.tempWidth / 2, 0, this._conf.tempWidth, tempHeight);
            } else {
                this._ctx.moveTo(-this._conf.tempWidth / 2, 0);
                this._ctx.arcTo(-this._conf.tempWidth / 2, tempHeight, this._conf.tempWidth / 2, tempHeight, this._conf.tempWidth / 2);
                this._ctx.arcTo(this._conf.tempWidth / 2, tempHeight, this._conf.tempWidth / 2, -radius, this._conf.tempWidth / 2);
                this._ctx.lineTo(this._conf.tempWidth / 2, 0);
                this._ctx.fill();
            }

            // 扩展球
            if (this._conf.showBall) {
                // 绘制扩展
                this._ctx.beginPath();
                this._ctx.fillRect(-this._conf.tempWidth / 2, 0, this._conf.tempWidth, this._conf.extendOffset);

                // 温度计底部球
                this._ctx.beginPath();
                this._ctx.arc(0, radius, radius, 0, 2 * Math.PI, false);
                this._ctx.fill();
            };

            this._ctx.restore();
        },
        // 刻度
        _drawBaseScale: function (n) {
            var total = this._conf.maxTemp - this._conf.minTemp;
            var radius = this._conf.showBall ? this._conf.ballRadius : 0;
            // +1的做法 就是防止渲染成2px像素的线段
            var tempHeight = (this._conf.margin + radius) * 2 - this._ctx.canvas.height + this._conf._fontTitleHeight + this._conf._fontValHeight + 1;
            this._ctx.save();
            this._ctx.translate((this._conf.tempWidth / 2 + this._conf.offset) * n, -radius * 2 - this._conf._fontValHeight);

            // 线段
            this._ctx.beginPath();
            this._ctx.strokeStyle = this._conf.scaleColor;
            this._ctx.lineWidth = 1;
            this._ctx.moveTo(n * 0.5, 0);
            this._ctx.lineTo(n * 0.5, tempHeight);
            this._ctx.stroke();

            // 刻度
            for (var i = 0; i <= total; i++) {
                this._ctx.save();
                this._ctx.beginPath();
                this._ctx.translate(0, i * tempHeight / total);
                this._ctx.strokeStyle = this._conf.scaleColor;
                this._ctx.moveTo(n * 0.5, -0.5);
                if (i % this._conf.scaleOffset === 0) {
                    this._ctx.lineTo(n * 10.5, -0.5);
                    this._ctx.font = this._conf.scaleFont + ' ' + this._conf.fontFamily;
                    this._ctx.fillStyle = this._conf.scaleColor;
                    this._ctx.textAlign = n === -1 ? 'right' : 'left';
                    this._ctx.textBaseline = 'middle';
                    this._ctx.fillText(i + this._conf.minTemp, n * 15.5, -0.5);
                } else {
                    this._ctx.lineTo(n * 5.5, -0.5);
                }
                this._ctx.stroke();
                this._ctx.restore();
            }

            this._ctx.restore();
        },
        // 游标
        _drawCursor: function (n) {
            var radius = this._conf.showBall ? this._conf.ballRadius : 0;
            var tempHeight = (this._conf.margin + radius) * 2 - this._ctx.canvas.height + this._conf._fontTitleHeight + this._conf._fontValHeight;
            var val = (this._conf.tempVal - this._conf.minTemp) * tempHeight / (this._conf.maxTemp - this._conf.minTemp);
            // 游标
            this._ctx.beginPath();
            this._ctx.save();
            this._ctx.translate(-(this._conf.tempWidth / 2 + this._conf.offset) * n, -radius * 2 + val - this._conf._fontValHeight);
            this._ctx.fillStyle = this._conf.cursorBgColor;
            this._ctx.moveTo(n * this._conf.offset / 2, 0);
            this._ctx.lineTo(-n * this._conf.cursorWidth / 3, -this._conf.cursorHeight / 2);
            this._ctx.lineTo(-n * this._conf.cursorWidth, -this._conf.cursorHeight / 2);
            this._ctx.lineTo(-n * this._conf.cursorWidth, this._conf.cursorHeight / 2);
            this._ctx.lineTo(-n * this._conf.cursorWidth / 3, this._conf.cursorHeight / 2);
            this._ctx.fill();
            this._ctx.restore();
        }
    };
    global.Meter = Meter;
} (window));
