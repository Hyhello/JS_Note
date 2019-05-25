/**
 * 作者：yeshengqiang
 * 时间：2019-05-06
 * 描述：bubble
 */

var Bubble = (function () {

    var
        // 类
        Class,

        hasOwn = Object.prototype.hasOwnProperty,

        slice = Array.prototype.slice,

        // 配置文件
        DEFAULTS = {
            duration: 3000,
            end: 100,
            top: 0,
            color: '#757575'
        };

    // 判断是否时element 元素
    function _isElement (node) {
        return typeof node === 'object' && node.nodeType === 1;
    };

    // 创建元素
    function _createElement (val, options) {
        if (!val) return;
        var oSpan = document.createElement('span');
        oSpan.innerHTML = val;
        oSpan.style.position = 'fixed';
        oSpan.style.color = options.color;
        return oSpan;
    };

    // 浏览器检测ie9以下，包括ie9,因为ie9 不支持 transform translate
    function _lte9 () {
        var userAgent, matchs, ieVersion;
        if (window.ActiveXObject || "ActiveXObject" in window) {
            userAgent = window.navigator.userAgent.toLowerCase();
            matchs = userAgent.match(/msie\s(\d+)/);
            ieVersion = matchs && matchs[1];
            return ieVersion && ieVersion <= 9;
        } else {
            return false;
        }
    }

    // aaa-bb -> aaaBb
    function cameline (str) {
        return str.replace(/-(\w)/g, function (_, $1) {
            return $1.toUpperCase();
        });
    }

    // style
    function _getStyle (el, attr) {
        try {
            return window.getComputedStyle(el, null).getPropertyValue(attr);
        } catch (e) {
            return el.currentStyle.getAttribute(cameline(attr));
        }
    }

    // toNumber
    function toNumber (n) {
        var val = parseFloat(n);
        return isNaN(val) ? n : val;
    }

    /**
     * @des 获取随机
     * @param { int } min
     * @param { int } max
     */
    function _getRandom (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 匀速运动
    function _linear (t, b, c, d) {
        return c * t / d + b;
    }

    // 获取最后一个值 兼容ie
    function _getData (ele) {
        var data = '';
        var cacheData = ele._prevValue_;
        if (ele.value && ele.value.length > cacheData.length) {
            data = ele.value.slice(ele.value.length - 1);
        } else {
            data = '';
        }
        cacheData = ele.value;
        return data;
    }

    // 检查属性
    function _checkOptions (options) {
        var i, source, type;
        for (i in DEFAULTS) {
            if (i && hasOwn.call(DEFAULTS, i)) {
                source = DEFAULTS[i];
                type = typeof source;
                if (options[i] && typeof options[i] !== type) {
                    throw new TypeError('[Bubble] options property：' + source + ' is not a ' + type);
                }
            }
        }
    };

    // copy
    function _extend (target, resource) {
        var i, len, args, resource;
        args = slice.call(arguments, 1);
        len = args.length;
        target = typeof target === 'boolean' ? {} : target;
        args.unshift(target);
        if (Object.assign) return Object.assign.apply(Object, args);
        while (len--) {
            resource = args[len];
            for (i in resource) {
                if (hasOwn.call(resource, i)) {
                    target[i] = resource[i];
                }
            }
        }
        return target;
    };

    // 获取el的getBoundingClientRect
    function _clientRect (el) {
        var rect = el.getBoundingClientRect();
        rect.width = rect.width || rect.right - rect.left;
        rect.height = rect.height || rect.bottom - rect.top;
        rect.x = rect.x || rect.left;
        rect.y = rect.y || rect.top;
        return rect;
    }

    // 绑定动画
    function _bindAnimate (el, start, end, cb, duration) {
        start = start || 0;
        var startTime = 0;
        var val;
        var step = function () {
            startTime += 1000 / 60;
            val = _linear(startTime, start, end - start, duration);
            if (startTime >= duration) {
                cb.call(el, end, true);
            } else {
                cb.call(el, val, false);
                window.requestAnimationFrame(step);
            }
        };
        step();
    };

    // bindEvent
    function bindEvent (el, type, cb) {
        if (el.addEventListener) {
            el.addEventListener(type, cb, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + type, cb);
        } else {
            el['on' + type] = cb;
        }
    };

    // unbindEvent
    function unbindEvent (el, type, cb) {
        if (el.removeEventListener) {
            el.removeEventListener(type, cb, false);
        } else if (el.detachEvent) {
            el.detachEvent('on' + type, cb);
        } else {
            el['on' + type] = null;
        }
    };

    function _removeElement (ele) {
        ele.parentNode.removeChild(ele);
    }


    // bubble 气泡
    Class = function (el, options) {
        return new Class.fn._init(el, options);
    };

    Class.fn = Class.prototype = {
        constructor: Class,
        _init: function (el, options) {
            // 缓冲数据 兼容ie
            options = options || {};
            this.$el = _isElement(el) ? el : document.getElementById(el);
            _checkOptions(options);
            var options = _extend(true, DEFAULTS, options);
            var offset = toNumber(_getStyle(this.$el, 'font-size')) / 2;
            this.$el._prevValue_ = '';
            this.$el.__outSideClick__ = function (ev) {
                var data = _getData(this);
                if (!data) return false;
                if (this.type === 'password') {
                    data = '*';
                }
                var oEle = _createElement(data, options);
                var rect = _clientRect(this);
                var oLeft = _getRandom(1, rect.width - 1) - offset;
                // 防止中文输入法下报错
                if (!oEle) return false;
                oEle.style.left = oLeft + rect.left + 'px';
                oEle.style.top = rect.top + 'px';
                this.parentNode.appendChild(oEle);
                _bindAnimate(oEle, -options.top, options.end, function (value, status) {
                    // 兼容ie9以下
                    if (_lte9()) {
                        this.style.top = -1 * value + rect.top + 'px';
                    } else {
                        this.style.transform = 'translate(0, ' + -1 * value + 'px)';
                    }
                    this.style.opacity = (options.end - value) / options.end;
                    if (status) {
                        _removeElement(this);
                    }
                }, options.duration);
            };
            bindEvent(this.$el, 'oninput' in this.$el ? 'input' : 'propertychange', this.$el.__outSideClick__);
            return this;
        },
        _destroy: function () {
            unbindEvent(this.$el, 'oninput' in this.$el ? 'input' : 'propertychange', this.$el.__outSideClick__);
            this.$el.__outSideClick__ = null;
            this.$el._prevValue_ = null;
        }
    };

    Class.fn._init.prototype = Class.prototype;

    return Class;

} ());
