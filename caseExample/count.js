(function (global) {
    var Count = function (startVal, endVal, duration, callback) {
        var ensureNumber = this.constructor.ensureNumber;
        startVal = Number(startVal);
        endVal = Number(endVal);
        duration = Number(duration);
        callback = callback || function () {};
        if (!ensureNumber(startVal) ||
            !ensureNumber(endVal) ||
            !ensureNumber(duration)
        ) {
            console.error('[Count] startVal (${startVal}) or endVal (${endVal}) or duration (${duration}) is not a number');
            return;
        }
        this.timer = null;
        this.isStart = false;
        this.isPause = false;
        this.startVal = startVal;
        this.endVal = endVal;
        this.originDuration = this.duration = duration || 3000;
        this.callback = callback;
        this.countDown = this.startVal > this.endVal;
    };

    Count.ensureNumber = function (val) {
        return !isNaN(val) && typeof val === 'number';
    };

    // 减速运动
    Count.easeOutExpo = function (t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    };

    Count.prototype = {
        constructor: Count,
        v: '0.0.1',
        count: function (timestamp) {
            var
                // 时间进度
                progress,
                // 值
                val;
            if (!this.startTime) {
                this.startTime = timestamp;
            };
            progress = timestamp - this.startTime;
            this.remaining = Math.max(this.duration - progress, 0);
            val = this.countDown
                            ? this.startVal - this.constructor.easeOutExpo(progress, 0, this.startVal - this.endVal, this.duration)
                            : this.constructor.easeOutExpo(progress, this.startVal, this.endVal - this.startVal, this.duration);
            this.frameVal = this.countDown
                                    ? Math.max(val, this.endVal)
                                    : Math.min(val, this.endVal);
            if (progress < this.duration) {
                this.timer = window.requestAnimationFrame(this.count.bind(this));
            } else {
                this.isStart = false;
            }
            this.frameVal = this.isStart ? this.frameVal : this.endVal;
            this.callback(this.frameVal, this.originDuration - this.remaining, !this.isStart);
        },
        start: function () {
            if (this.isStart) return;
            if (this.endVal === this.frameVal) return;
            this.isStart = true;
            this.timer = window.requestAnimationFrame(this.count.bind(this));
        },
        update: function (newEndVal) {
            newEndVal = Number(newEndVal);
            if (!this.constructor.ensureNumber(newEndVal)) {
                console.error('[CountUp] update() - new endVal is not a number: ' + newEndVal);
                return;
            }
            if (this.timer) {
                window.cancelAnimationFrame(this.timer);
                this.timer = null;
                this.isStart = false;
            }
            if (newEndVal === this.frameVal) return;
            delete this.startTime;
            this.endVal = newEndVal;
            this.startVal = this.frameVal || this.startVal;
            this.duration = this.remaining || this.originDuration;
            this.countDown = this.startVal > this.endVal;
            this.start();
        },
        pause: function () {
            if (!this.isStart || this.isPause) return;
            this.isPause = true;
            if (this.timer) {
                window.cancelAnimationFrame(this.timer);
                this.timer = null;
            }
            delete this.startTime;
        },
        resume: function () {
            if (!this.isStart || !this.isPause) return;
            this.isPause = false;
            this.startVal = this.frameVal;
            this.duration = this.remaining;
            this.timer = window.requestAnimationFrame(this.count.bind(this));
        },
        reset: function () {
            this.timer = null;
            this.isStart = false;
            this.isPause = false;
            delete this.frameVal;
            delete this.remaining;
            delete this.startTime;
            this.duration = this.originDuration;
            this.countDown = this.startVal > this.endVal;
        }
    };
    global.Count = Count;
} ( window ));
