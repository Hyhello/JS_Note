/**
 * 作者：yeshengqiang
 * 时间：2018-12-26
 * 描述：createElement
 */

var _toString = Object.prototype.toString;

var _hasOwn = Object.prototype.hasOwnProperty;

var _typeof = function (target) {
    return _toString.call(target).replace(/^\[object (.*?)\]$/, '$1').toLowerCase();
};

var oneOf = function (target, list) {
    return new RegExp('\\b' + target + '\\b').test(list.join(','));
};

// 基本类型
var isBaseType = function (target) {
    return oneOf(_typeof(target), ['string', 'number', 'boolean']);
}

var filterAttr = function (obj) {
    var i, ii, points = [];
    if (!obj) return;
    if (_typeof(obj) === 'array') {
        ii = obj.length;
        for (i = 0; i < ii; i++) {
            if (isBaseType(obj[i])) {
                points.push(i);
            } else if (typeof obj[i] === 'object') {
                points = points.concat(filterAttr(obj[i]));
            }
        }
    } else {
        for (i in obj) {
            if (_hasOwn.call(obj, i) && obj[i]) {
               points.push(i);
            }
        }
    }
    return points;
};

// 设置属性
var setAttribute = function (el, obj) {
    var i, resource;
    if (!el || !obj) return;
    for (i in obj) {
        if (_hasOwn.call(obj, i)) {
            resource = obj[i];
            switch (i.toLowerCase()) {
                case 'class':
                    el.className = filterAttr(resource).join(' ');
                    break;
                case 'style':
                    el.style = resource;
                    break;
                case 'attrs':
                    break;
                case 'domProps':
                    break;
                case 'on':
                    break;
            }
        }
    }
};

// [el]: {String}
// [attrs]: {Object}
// vNodes: {Array | String}
var createElement = function (el, attrs, vNodes) {
    if (_typeof(el) !== 'string') {
        throw new TypeError('[createElement] arguments[0] must be string');
    }
    if (!oneOf(_typeof(attrs), ['string', 'object'])) {
        throw new TypeError('[createElement] arguments[1] property：String | Object');
    }
    if (!oneOf(_typeof(vNodes), ['string', 'array'])) {
        throw new TypeError('[createElement] arguments[1] property：String | Array');
    }
    // 元素一
    var oNode = document.createElement(el);
    // 元素二
    if (_typeof(attrs) === 'string') {
        oNode.innerHTML += attrs;
        return oNode;
    } else {
        console.log(filterAttr(attrs));
    }
    // 元素三
    if (_typeof(vNodes) === 'string') {
        oNode.innerHTML += vNodes;
    }
    return oNode;
};
