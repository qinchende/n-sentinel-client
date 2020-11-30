var Sys = require('./sys');
var Cpu = require('./cpu');
var Disk = require('./disk');
var Mem = require('./mem');
var Net = require('./net');
var Check = require('./check');

var Base = module.exports = Gd.global('Base', function() {
    var me = {};

    me.init = function(Env) {
        me.last = me.cur = Number(new Date());

        Sys.init();
        Cpu.init();
        Mem.init();
        Disk.init();
        Net.init();
        Check.init(Env.host);
    };

    me.stamp = function() {
        me.last = me.cur;
        me.cur = Number(new Date());

        return [me.cur, parseInt(((me.cur - me.last)/1000).toFixed(0))];
    };

    return me;
});