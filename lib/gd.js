global.Gd = {
    Meta: {
        Designer: 'qinchende@qq.com',
        ProjectName: 'n-sentinel'
    }
};

// 希望将所有 global 对象，放入 global.Gd 中。
Gd.global = function(key, fun, opt) {
    if (Gd[key]) { return Gd[key]; }

    if (Object.prototype.toString.call(fun) === '[object Function]') {
        fun = fun(opt);
    }
    return Gd[key] = global[key] = fun;
};

var Utl = require('./utils');
var Ext = require('./class_ext');
var Log = require('./logger');


