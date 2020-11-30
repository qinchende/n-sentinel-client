module.exports = Gd.global('Ext', function() {
    Utl.apply(String.prototype, {
        /**
         * 格式化字符串
         * eg:
         *  '{{0}}天有{{1}}个小时'.format([1, 24])
         *  or
         *  '{{day}}天有{{hour}}个小时'.format({day:1, hour:24}})
         * @param {Object} values
         */
        format: function (values) {
            return this.replace(/\{\{([\w\s\.\'\"\(\),-\[\]]+)?\}\}/g, function(match, key) {
                return values[key];
            });
        },
        trim: function() {
            return this.replace(/(^\s*)|(\s*$)/g,'');
        },
        lTrim: function() {
            return this.replace(/(^\s*)/g,'');
        },
        rTrim: function() {
            return this.replace(/(\s*$)/g,'');
        },
        include: function(str) {
            if (!this) { return false; }
            return this.indexOf(str) >= 0;
        },
        lPad: function(size, pad) {
            var re = this;
            pad = pad || ' ';
            while (re.length < size) {
                re = pad + re;
            }
            return re;
        },
        rPad: function(size, pad) {
            var re = this;
            pad = pad || ' ';
            while (re.length < size) {
                re = re + pad;
            }
            return re;
        }
    });

    Utl.apply(Array, {
        inArray: function(n, v) {
            for (var i = 0; i < n.length; i++){
                if (n[i] == v) { return true; }
            }
            return false;
        }
    });
    Utl.apply(Array.prototype, {
        // add by cd.net on 2013-01-15 数组中加入不重复的值
        pushUnique: function(v) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === v) { return false; }
            }
            this.push(v);
            return true;
        },
        inArray: function(v) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == v) { return true; }
            }
            return false;
        },
        startWith: function(v) {
            for (var i = 0; i < this.length; i++) {
                if (v.indexOf(this[i]) == 0) { return true; }
            }
            return false;
        }
    });

    Utl.apply(Number.prototype, {
        // 浮点数 放大多少倍，然后转换了整数
        // param offset 小数点左右移动多少位
        toInt: function(mutl) {
            var s = this.toString(), idx = s.indexOf('.');
            if (idx < 0) { idx = s.length; }
            s = s.replace('.','') + '00000000';
            return Number(s.substr(0, idx + mutl));
        }
    });

    Utl.apply(Number, {
        isNum: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
    });

    Utl.apply(Date, {
        // 两个时间相差多少 [单位] 时间
        diff: function(A, B, interval) {
            try {
                var ms = A - B;
                if(isNaN(ms)){ return null;}
                if(interval == 's'){
                    return parseInt(ms / 1000);
                } else if(interval == 'd'){
                    return parseInt(ms / 86400000);
                }
                return ms;
            } catch(e) {
                return null;
            }
        }
    });

    Utl.apply(Date.prototype, {
        // 格式化时间输出。示例：new Date().format("yyyy-MM-dd hh:mm:ss");
        format: function (format) {
            format = format || "yyyy-MM-dd hh:mm:ss";
            var o = {
                "M+" : this.getMonth() + 1, //month
                "d+" : this.getDate(),    //day
                "h+" : this.getHours(),   //hour
                "m+" : this.getMinutes(), //minute
                "s+" : this.getSeconds(), //second
                "q+" : Math.floor((this.getMonth() + 3) / 3), //quarter
                "S" : this.getMilliseconds() //millisecond
            };
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("("+ k +")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return format;
        },

        // 时间 加减 多少天
        // (new Date()).day_add(5);    加5天
        // (new Date()).day_add(-5);   减5天
        dayAdd: function(change){
            this.setDate(this.getDate()+change);
            return this;
        }
    });

    return {};
});

