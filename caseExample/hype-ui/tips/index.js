/**
 * 作者：yeshengqiang
 * 时间：2018-12-26
 * 描述：hype-ui-tips
 */

( function( global, factory ) { "use strict";
    if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = global.document
            ? factory( global, true )
            : function( w ) {
				if ( !w.document ) {
					throw new Error( "hype requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) { "use strict";

    var
        body = document.body,

        version = '0.0.1',

        hasOwn = Object.prototype.hasOwnProperty,

        noop = function () {},

        OPTIONS = {
            type: 1,
            message: '测试',            // 内容信息
            onClose: noop,              // 关闭回调
            skin: 'default',            // 皮肤
            shade: true,                // 遮罩
            duration: 30000,            // 持续时间 default: 3000ms
            showClose: false	        // 是否展示关闭按钮
        },

        getKeys = function (obj) {
            var i, keys = [];
            if (Object.keys) return Object.keys(obj);
            for (var i in obj) {
                if (hasOwn.call(obj, i)) {
                    keys.push(i);
                }
            }
            return keys;
        },

        checkConf = function (opt) {
            getKeys(OPTIONS).forEach(function (item) {
                var type = typeof OPTIONS[item];
                if (opt[item] && typeof opt[item] !== type) {
                    throw new TypeError('[Tip] options property：' + item + ' is not a ' + type);
                }
            });
        },

        extend = function () {
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
        },

        hype = {};

        hype.version = version;

        // 提示
        hype.open = function (options) {
            options = options || {};
            checkConf(options);
            this.$opt = extend(true, OPTIONS, options);
            console.log(this.$opt);
            this.render();
        };

        hype.close = function () {};

        hype.render = function () {
            this.times = 0;
            if (this.$opt.shade) {
                if (!this.shade) {
                    this.shade = createElement('div', {
                        'class': ['hype-ui', 'hype-ui-shade'],
                        'attrs': {
                            times: ++this.times
                        }
                    });
                } else {
                    this.times = +this.shade.getAttribute('times');
                    this.shade.setAttribute('times', ++this.times);
                }
                document.body.appendChild(this.shade);
            }
            var oEl = createElement('div', {
                'class': ['hype-ui', 'hype-ui-tips']
            }, [createElement('div', {
                'class': ['hype-ui-panel', 'layer-anim', 'layer-anim-00'],
                'once': {
                    'animationend': function () {
                        oEl.classList.remove('layer-anim-00');
                    }
                }
            }, this.$opt.message)]);
            document.body.appendChild(oEl);
            var _this = this;
            setTimeout(function () {
                document.body.removeChild(oEl);
                if (_this.times > 1) {
                    _this.shade.setAttribute('times', --_this.times);
                } else {
                    document.body.removeChild(_this.shade);
                    _this.shade = null;
                    _this.times = 0;
                }
            }, _this.$opt.duration);
        };

        window.hype = hype;
} );
