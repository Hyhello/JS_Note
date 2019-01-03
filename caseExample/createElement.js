/**
 * 作者：yeshengqiang
 * 时间：2018-12-26
 * 描述：createElement
 */
(function (global) {
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

    var isHtmlType = function (target) {
        return typeof target === 'object' && target.nodeType;
    };

    var filterAttr = function (obj) {
        var i, ii, points = [];
        if (!obj) return;
        if (_typeof(obj) === 'array') {
            ii = obj.length;
            for (i = 0; i < ii; i++) {
                if (isBaseType(obj[i])) {
                    points.push(obj[i]);
                } else if (typeof obj[i] === 'object') {
                    points = points.concat(filterAttr(obj[i]));
                }
            }
        } else if (_typeof(obj) === 'object') {
            for (i in obj) {
                if (_hasOwn.call(obj, i) && obj[i]) {
                    points.push(i);
                }
            }
        } else {
            points.push(obj);
        }
        return points;
    };

    var setInerHTML = function (el, resource) {
        var i, ii, source, oFrame;
        if (_typeof(resource) === 'array') {
            oFrame = document.createDocumentFragment();
            for (i = 0, ii = resource.length; i < ii; i++) {
                source = resource[i];
                if (isHtmlType(source)) {
                    oFrame.appendChild(source);
                } else {
                    setInerHTML(el, source);
                }
            }
            el.appendChild(oFrame);
        } else {
            el.innerHTML += resource;
        };
        return el;
    };

    // 设置样式
    /**
     *
     * @param {object HTML} el
     * @param { object } styles
     */
    var setStyle = function (el, styles) {
        var i, resource, points = [];
        for (i in styles) {
            resource = styles[i];
            if (_hasOwn.call(styles, i)) {
                points.push(i + ':' + resource + ';');
            }
        }
        el.style.cssText = points.join(' ');
    };

    // 设置属性
    var setAttributes = function (el, attrs) {
        var i, resource;
        for (i in attrs) {
            resource = attrs[i];
            if (_hasOwn.call(attrs, i)) {
                el.setAttribute(i, resource);
            }
        }
    };

    // 绑定事件
    var bindEvent = function (el, type, fn) {
        if (el.addEventListener) {
            el.addEventListener(type, fn, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + type, fn);
        } else {
            el['on' + type] = fn;
        }
    };

    var removeEvent = function (el, type, fn) {
        if (el.removeEventListener) {
            el.removeEventListener(type, fn, false);
        } else if (el.detachEvent) {
            el.detachEvent(type, fn);
        } else {
            el['on' + type] = null;
        }
    };

    var fireEvent = function (el, events) {
        var i, resource;
        for (i in events) {
            resource = events[i];
            if (_hasOwn.call(events, i) && typeof resource === 'function') {
                bindEvent(el, i, resource);
            }
        }
    };

    var onceEvent = function (el, events) {
        var i, resource;
        for (i in events) {
            resource = events[i];
            if (_hasOwn.call(events, i) && typeof resource === 'function') {
                el['__' + i + 'OutSide__'] = (function (i) {
                    return function () {
                        removeEvent(el, i, el['__' + i + 'OutSide__']);
                        resource();
                        el['__' + i + 'OutSide__'] = null;
                    };
                } (i));
                bindEvent(el, i, el['__' + i + 'OutSide__']);
            }
        }
    };

    // 读取属性
    var readAttribute = function (el, obj) {
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
                        setStyle(el, resource);
                        break;
                    case 'attrs':
                        setAttributes(el, resource);
                        break;
                    case 'innerhtml':
                        setInerHTML(el, resource);
                        break;
                    case 'on':
                        fireEvent(el, resource);
                        break;
                    case 'once':
                        onceEvent(el, resource);
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
        if (attrs && !oneOf(_typeof(attrs), ['string', 'object'])) {
            throw new TypeError('[createElement] arguments[1] property：String | Object');
        }
        if (vNodes && !oneOf(_typeof(vNodes), ['string', 'array'])) {
            throw new TypeError('[createElement] arguments[2] property：String | Array');
        }
        // 元素一
        var oNode = document.createElement(el);
        // 元素二
        if (_typeof(attrs) === 'string') {
            return setInerHTML(oNode, attrs);
        } else if (_typeof(attrs) === 'object'){
            readAttribute(oNode, attrs);
        }
        // 元素三
        if (vNodes) {
            setInerHTML(oNode, vNodes);
        }
        return oNode;
    };

    global.createElement = createElement;
} (window));
