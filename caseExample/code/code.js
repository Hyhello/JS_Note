(function (global) {
    // 验证码
    function Code (el, options = {}) {
        this.$ctx = el.getContext('2d');
        // 校验
        this.constructor.checkConf(options);
        this.$opt = this.constructor.extend(true, this.constructor.CONF, options);
        this.$dpr = this.constructor.getPixelRatio(this.$ctx);
        el.width = this.$opt.width *= this.$dpr;
        el.height = this.$opt.height *= this.$dpr;
        console.log(this.$opt);
        this._refresh();
    };

    Code.getPixelRatio = function (context) {
        var backingStore = context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
        return (window.devicePixelRatio || 1) / backingStore;
    };

    // 配置
    Code.CONF = {
        width: 300,                                             // 画布宽度
        height: 150,                                            // 画布高度
        clipWidth: 45,                                          // 剪切宽度
        clipHeight: 45	                                        // 剪切高度
        // imgSrcList: ['./img/code1.jpg', './img/', '', '', '']
    };

    Code.checkConf = function (options) {
        var CONF = this.CONF;
        Object.keys(CONF).forEach(function (item, key) {
            var type = typeof CONF[item];
            if (options[item] && typeof options[item] !== type) {
                throw new TypeError('[Code] options property：' + item + ' is not a ' + type);
            }
        });
    };


    Code.extend = function () {
        var target = arguments[0];
        var argList = Array.prototype.slice.call(arguments, 1);
        var argLen = argList.length;
        target = typeof target === 'boolean' ? {} : target;
        while (argLen--) {
            var resource = argList[argLen];
            for (var i in resource) {
                if (resource.hasOwnProperty(i)) {
                    target[i] = resource[i];
                }
            }
        }
        return target;
    };

    Code.loadImg = function (src, callback) {
        var img = new Image();
        img.onload = function () {
            callback(img);
        };
        img.onerror = function () {
            throw new Error('[Code] load image fail');
        };
        img.src = src;
    };

    Code.prototype = {
        // 版本
        versoin: '0.0.1',

        constructor: Code,

        // 刷新
        _refresh () {
            var _this = this;
            this.$ctx.clearRect(0, 0, this.$ctx.canvas.width, this.$ctx.canvas.height);
            this.constructor.loadImg('./img/code3.jpg', function (data) {
                _this._init(data);
            });
        },

        // 初始化
        _init: function (data) {
            this.$ctx.drawImage(data, 0, 0);
            this._clipShell();
        },

        // 剪切壳子
        _clipShell () {
            this.$ctx.save();
            this.$ctx.translate(this.$ctx.canvas.width / 2, this.$ctx.canvas.height / 2);

            // 正方形
            this.$ctx.beginPath();
            // this.$ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.$ctx.strokeStyle = '#FFFFFF';
            this.$ctx.rect(-this.$opt.clipWidth / 2, -this.$opt.clipHeight / 2, this.$opt.clipWidth, this.$opt.clipHeight);
            this.$ctx.fill();
            this.$ctx.stroke();

            this.$ctx.beginPath();
            this.$ctx.globalCompositeOperation = 'destination-out';
            this.$ctx.arc(0, 15, this.$opt.clipWidth / 5, 0, Math.PI * 2, false);

            this.$ctx.fill();

            this.$ctx.restore();
        }
    };

    global.Code = Code;
} ( window ));
