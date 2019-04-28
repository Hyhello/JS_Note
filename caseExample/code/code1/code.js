/**
 * 作者：yeshengqiang
 * 时间：2019-04-04
 * 描述：验证码
 */

"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Code =
/*#__PURE__*/
function () {
  function Code(id, options, callback) {
    _classCallCheck(this, Code);

    var $dpr = window.devicePixelRatio || 1;
    this.$el = Code.isHTMLElement(id) ? id : document.getElementById(id);
    var rect = this.$el.getBoundingClientRect();

    if (!rect.height) {
      console.warn('parent box must has height');
      return;
    }

    options = options || {}; // 校验

    Code._checkConf(options);

    this.callback = callback || function () {};

    this._canvas = document.createElement('canvas');
    this._canvas.innerHTML = '您的浏览器版本不支持canvas';
    this.$el.appendChild(this._canvas);
    this.$ctx = this._canvas.getContext('2d'); // 配置

    this.$conf = Code._extend({}, Code.defaults, options);
    this.$conf.width = rect.width;
    this.$conf.height = rect.height; // 配置宽高

    this._canvas.width = rect.width * $dpr;
    this._canvas.height = rect.height * $dpr;
    this._canvas.style.width = this.$conf.width + 'px';
    this._canvas.style.height = this.$conf.height + 'px';
    this.$ctx.scale($dpr, $dpr); // 开始draw

    this._refresh(); // fire


    this._fire();
  }

  _createClass(Code, [{
    key: "_refresh",
    value: function _refresh() {
      this.$ctx.clearRect(0, 0, this.$conf.width, this.$conf.height);

      var codeStr = this._drawText();

      this._drawLine();

      this._drawDot();

      this.callback(codeStr);
    }
  }, {
    key: "_drawText",
    value: function _drawText() {
      var len = this.$conf.codeLen;
      var partWidth = this.$conf.width / (len + 1);
      var codeStr = '';

      for (var i = 0; i < len; i++) {
        this.$ctx.beginPath();
        this.$ctx.save();

        var rotate = Code._randomNum(-45, 45);

        var fontSize = Code._randomNum(this.$conf.height * 0.5, this.$conf.height * 0.8);

        var fillText = this.$conf.randomStr.charAt(Code._randomNum(0, this.$conf.randomStr.length));
        codeStr += fillText;
        this.$ctx.translate((i + 1) * partWidth, Code._randomNum(fontSize / 2, this.$conf.height - fontSize / 2 - 5));
        this.$ctx.rotate(rotate * Math.PI / 180);
        this.$ctx.font = '600 ' + fontSize + 'px Georgia';
        this.$ctx.textAlign = 'center';
        this.$ctx.textBaseline = 'middle';
        this.$ctx.fillStyle = Code._randomColor(Code._randomNum(0, 360));
        this.$ctx.fillText(fillText, 0, 0);
        this.$ctx.restore();
      }

      return codeStr;
    }
  }, {
    key: "_drawLine",
    value: function _drawLine() {
      this.$ctx.save();
      this.$ctx.lineWidth = 1;
      this.$ctx.globalAlpha = 0.5;

      for (var i = 0; i < this.$conf.lineNum; i++) {
        this.$ctx.beginPath();
        this.$ctx.strokeStyle = Code._randomColor(Code._randomNum(100, 300));
        this.$ctx.moveTo(Code._randomNum(0, this.$conf.width), Code._randomNum(0, this.$conf.height));
        this.$ctx.lineTo(Code._randomNum(0, this.$conf.width), Code._randomNum(0, this.$conf.height));
        this.$ctx.stroke();
      }

      this.$ctx.restore();
    }
  }, {
    key: "_drawDot",
    value: function _drawDot() {
      for (var i = 0; i < this.$conf.dotNum; i++) {
        this.$ctx.beginPath();
        this.$ctx.save();
        this.$ctx.translate(Code._randomNum(0, this.$conf.width), Code._randomNum(0, this.$conf.height));
        this.$ctx.globalAlpha = 0.5;
        this.$ctx.fillStyle = Code._randomColor(Code._randomNum(100, 300));
        this.$ctx.arc(0, 0, 1, Math.PI * 2, false);
        this.$ctx.fill();
        this.$ctx.restore();
      }
    }
  }, {
    key: "_fire",
    // 事件
    value: function _fire() {
      var _this = this;

      this.$el.__outSideClick__ = function () {
        _this._refresh();
      };

      this.$el.addEventListener('ontouchstart' in document.documentElement ? 'touchstart' : 'click', this.$el.__outSideClick__, false);
    }
  }, {
    key: "_destroy",
    value: function _destroy() {
      this.$el.removeEventListener('ontouchstart' in document.documentElement ? 'touchstart' : 'click', this.$el.__outSideClick__, false);
      this.$ctx.clearRect(0, 0, this.$conf.width, this.$conf.height);
      this.$el.removeChild(this._canvas);
      this.$el.__outSideClick__ = this._canvas = null;
    }
  }], [{
    key: "isHTMLElement",
    value: function isHTMLElement(el) {
      return _typeof(el) === 'object' && el.nodeType === 1;
    }
  }, {
    key: "_checkConf",
    value: function _checkConf(options) {
      var CONF = this.defaults;
      Object.keys(CONF).forEach(function (item, key) {
        var type = _typeof(CONF[item]); // eslint-disable-next-line valid-typeof


        if (options[item] && _typeof(options[item]) !== type) {
          throw new TypeError('[Code] options property：' + item + ' is not a ' + type);
        }
      });
    }
  }, {
    key: "_extend",
    value: function _extend(target) {
      var i, len, args, resource;
      if (Object.assign) return Object.assign.apply(Object, arguments);
      target = typeof target === 'boolean' ? {} : target;
      args = Array.prototype.slice.call(arguments, 1);
      len = args.length;

      while (len--) {
        resource = args[len];

        for (i in resource) {
          target[i] = resource[i];
        }
      }

      return target;
    }
  }, {
    key: "_randomColor",
    // 随机颜色 r 取值范围 0 ~ 360度
    value: function _randomColor(r) {
      r = r * Math.PI / 180;
      var pi = Math.PI * 2;
      var cos = Math.cos;
      return '#' + (cos(r) * 127 + 128 << 16 | cos(r + pi / 3) * 127 + 128 << 8 | cos(r + pi / 3 * 2) * 127 + 128).toString(16);
    }
  }, {
    key: "_randomNum",
    value: function _randomNum(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    }
  }]);

  return Code;
}();

_defineProperty(Code, "defaults", {
  codeLen: 4,
  lineNum: 5,
  dotNum: 50,
  dotText: '.',
  randomStr: 'ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
});
