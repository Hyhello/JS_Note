/**
 * 作者：yeshengqiang
 * 时间：2019-03-01
 * 描述：时间轴
 */
(function (window, undefined) {'use strict';

    // md: http://www.jq22.com/yanshi20931

    // code inject
    var

        array = [],

        class2type = {},

        _slice = array.slice,

        _toString = class2type.prototype.toString,

        version = "0.0.1",

        CONF = {},

        TimeAxis,

        // 继承
        extend,

        // hasown
        hasOwn,

        // 检查参数
        checkArgs;

        hasOwn = function (target, i) {
            return target.hasOwnProperty(i);
        };

        extend = Object.assign || function () {
            var args, len, target, source, i;
            target = arguments[0];
            args = _slice.call(arguments, 1);
            len = args.length;
            while (len--) {
                source = args[len];
                for (i in source) {
                    if (hasOwn(source, i)) {
                        target[i] = source[i];
                    }
                }
            }
            return target;
        };

        checkArgs = function () {};

        TimeAxis = function (options = {}) {

        };

        TimeAxis.v = version;
    window.TimeAxis = TimeAxis;
} (window));
