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
            message: '测试',             // 内容信息
            onClose: noop,              // 关闭回调
            skin: 'default',            // 皮肤
            shade: true,                // 遮罩
            duration: 3000,             // 持续时间 default: 3000ms
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
        },

        templateTpl = '<div class="hype-ui hype-ui-tips">12312</div>',

        hype = {};

        hype.version = version;

        // hype._checkConf = function (options) {
        //     Object.keys();
        // };

        // 提示
        hype.open = function (options = {}) {
            checkConf(options);
            body.innerHTML += templateTpl;
        };

        window.hype = hype;
} );
