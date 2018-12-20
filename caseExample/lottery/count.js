// ***** 动画 function
function Count (startVal, endVal, duration, callback) {
    this.timer = null;
    this.frameVal = null;
    this.remaining = null;
    this.isStart = false;
    this.isPause = false;
    this.originStartVal = this.startVal = Number(startVal);
    this.originEndVal = this.endVal = Number(endVal);
    this.originDuration = this.duration = Number(duration) || 3000;
    if (!this.constructor.ensureNumber(this.startVal) ||
        !this.constructor.ensureNumber(this.endVal) ||
        !this.constructor.ensureNumber(this.duration)
    ) {
        console.error(`[Count] startVal (${startVal}) or endVal (${endVal}) or duration (${duration}) is not a number`);
        return;
    }
    this.callback = callback || function () {};
    this.countDown = this.startVal > this.endVal;
}

Count.ensureNumber = function (val) {
    return !isNaN(val) && typeof val === 'number';
};

Count.easeOutExpo = function (t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
}

Count.prototype = {
    constructor: Count,
    count: function (timestamp) {
        if (!this.startTime) this.startTime = timestamp;
        var progress = timestamp - this.startTime;
        this.remaining = this.duration - progress;
        var val = this.countDown
            ? this.startVal - this.constructor.easeOutExpo(progress, 0, this.startVal - this.endVal, this.duration)
            : this.constructor.easeOutExpo(progress, this.startVal, this.endVal - this.startVal, this.duration);
        this.frameVal = this.countDown
                            ? Math.max(val, this.endVal)
                            : Math.min(val, this.endVal);
        this.isStart = true;
        if (progress < this.duration) {
            this.timer = window.requestAnimationFrame(this.count.bind(this));
        } else {
            this.isStart = false;
        }
        this.callback(this.frameVal, !this.isStart);
        if (!this.isStart) {
            this.reset();
        }
    },
    start: function () {
        if (this.isStart) return;
        this.timer = window.requestAnimationFrame(this.count.bind(this));
    },
    update: function (newEndVal) {
        newEndVal = Number(newEndVal);
        if (!this.constructor.ensureNumber(newEndVal)) {
            console.error('[CountUp] update() - new endVal is not a number: ' + newEndVal);
            return;
        }
        if (newEndVal === this.frameVal) return;
        if (this.timer) {
            window.cancelAnimationFrame(this.timer);
            this.timer = null;
        }
        delete this.startTime;
        this.endVal = newEndVal;
        this.startVal = this.frameVal || this.startVal;
        this.duration = this.remaining || this.duration;
        this.countDown = this.startVal > this.endVal;
        this.timer = window.requestAnimationFrame(this.count.bind(this));
    },
    reset: function () {
        this.timer = null;
        this.frameVal = null;
        this.remaining = null;
        delete this.startTime;
        this.isStart = false;
        this.isPause = false;
        this.startVal = this.originStartVal;
        this.endVal = this.originEndVal;
        this.duration = this.originDuration;
        this.countDown = this.startVal > this.endVal;
    },
    resume: function () {
        if (this.isStart || !this.isPause) return;
        this.isPause = false;
        delete this.startTime;
        this.startVal = this.frameVal;
        this.duration = this.remaining;
        this.timer = window.requestAnimationFrame(this.count.bind(this));
    },
    pause: function () {
        if (!this.isStart || this.isPause) return;
        this.isPause = true;
        this.isStart = false;
        if (this.timer) {
            window.cancelAnimationFrame(this.timer);
            this.timer = null;
        }
    }
};
