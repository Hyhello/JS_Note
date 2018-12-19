// ***** function
function Lottery (el, options) {
    this.$ctx = el.getContext('2d');
    var rect = el.getBoundingClientRect();
    this.options = options;
    this._centerToCanvasX = rect.width / 2 + rect.left;
    this._centerToCanvasY = rect.height / 2 + rect.top;
    el.width = rect.width;
    el.height = rect.height;
    this._init(0);
};

Lottery.toNumber = function (n) {
    var val = parseFloat(n);
    return isNaN(val) ? n : val;
};

Lottery.sum = function (opt, key) {
    var sum = 0;
    for(var i = 0, ii = opt.length; i < ii; i++){
        sum += this.toNumber(opt[i][key]);
    }
    return sum;
};

Lottery.compare = function (prop) {
    var toNumber = this.toNumber;
    return function (x, y) {
        return toNumber(x[prop]) - toNumber(y[prop]);
    };
};

Lottery.probResult = function (opt, key) {
    var result = null;
    var sum = this.sum(opt, key);
    var newOpt = opt.slice().sort(this.compare(key)).reverse();
    for (var i = 0, ii = newOpt.length; i < ii; i++) {
        var rand = parseInt(Math.random() * sum);
        var resource = newOpt[i];
        var keyNum = this.toNumber(resource[key]);
        if (rand <= keyNum) {
            result = resource;
            break;
        } else {
            sum -= keyNum;
        }
    }
    for (var i = 0, ii = opt.length; i < ii; i++) {
        if (opt[i].name === result.name) {
            result.index = i;
            break;
        }
    }
    return result;
};

Lottery.prototype = {
    constructor: Lottery,
    _init: function (n) {
        var len = this.options.length;
        this.$ctx.clearRect(0, 0, this.$ctx.canvas.width, this.$ctx.canvas.height);
        this.$ctx.save();
        this.$ctx.translate(this.$ctx.canvas.width / 2, this.$ctx.canvas.height / 2);
        this._baseOutCircle();
        this._baseMarquee();
        this._drawPlate(n);
        this._clickDrawCicle();

        this.$ctx.restore();
    },
    // 抽奖外圆
    _baseOutCircle: function () {
        this.$ctx.beginPath();
        this.$ctx.save();
        this.$ctx.fillStyle = '#FFBE04';
        this.$ctx.arc(0, 0, this.$ctx.canvas.height / 4, 0, Math.PI * 2, false);
        this.$ctx.fill();
        this.$ctx.restore();
    },
    // 跑马灯
    _baseMarquee: function () {
        for (var i = 0; i < 24; i++) {
            this.$ctx.beginPath();
            this.$ctx.save();
            this.$ctx.rotate(i * 15 * Math.PI / 180);
            this.$ctx.fillStyle = '#FFFFFF';
            if (i % 2 === 0) {
                this.$ctx.fillStyle = '#F00';
            }
            this.$ctx.arc(this.$ctx.canvas.height / 4 - 10, 0, 4, Math.PI * 2, false);
            this.$ctx.fill();
            this.$ctx.restore();
        }
    },
    // 抽奖盘
    _drawPlate (n) {
        var len = this.options.length;
        this.$ctx.save();
        this.$ctx.rotate(n * Math.PI / 180 - Math.PI / 2 - Math.PI / len);
        for (var i = 0; i < len; i++) {
            this.$ctx.beginPath();
            this.$ctx.save();
            this.$ctx.rotate(i * 2 * Math.PI / len);
            this.$ctx.fillStyle = this.options[i].bgColor;

            // 弧形
            this.$ctx.beginPath();
            this.$ctx.moveTo(0, 0);
            this.$ctx.arc(0, 0, this.$ctx.canvas.height / 4 - 20, 0, Math.PI * 2 / len, false);
            this.$ctx.fill();

            // 绘制文字
            this.$ctx.beginPath();
            this.$ctx.save();
            this.$ctx.translate(Math.cos(Math.PI / len) * (this.$ctx.canvas.height / 4 - 80), Math.sin(Math.PI / len) * (this.$ctx.canvas.height / 4 - 80));
            this.$ctx.rotate(Math.PI / 2 + Math.PI / len);
            this.$ctx.fillStyle = this.options[i].color;
            this.$ctx.font = "20px Georgia";
            this.$ctx.textAlign = 'center';
            this.$ctx.textBaseline = 'middle';
            this.$ctx.fillText(this.options[i].name, 0, 0);
            this.$ctx.restore();

            this.$ctx.restore();
        }
        this.$ctx.restore();
    },
    _clickDrawCicle () {
        this.$ctx.beginPath();
        this.$ctx.fillStyle = '#FFBE04';
        this.$ctx.arc(0, 0, this.$ctx.canvas.height / 14, 0, Math.PI * 2, false);
        this.$ctx.fill();
    }
};
