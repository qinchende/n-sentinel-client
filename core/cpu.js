module.exports = Gd.global('Cpu', function() {
    var os = require('os');
    var me = {};

    me.init = function() {
        me.cur = me.last = me.curCpu();
    };

    me.curCpu = function() {
        var cpus = os.cpus() || [];
        if (cpus.length <= 0) return null;

        var speed = (cpus[0].model || '').match(/@.*GHz/)[0].replace('@','').trim() || (cpus[0].speed/1000).toFixed(2) + 'GHz';
        var rets = [Number(new Date()), cpus.length, speed];
        var items = [];
        Utl.forEach(cpus, function(i, cpu) {
            items.push([
                cpu.times.idle,
                cpu.times.user,
                cpu.times.sys,
                cpu.times.nice,
                cpu.times.irq
            ]);
        });
        rets.push(items);
        return rets;
    };

    me.cpuRate = function() {
        var step = parseInt(((me.cur[0] - me.last[0])/1000).toFixed(0));
        if (step < 2 || step > 600) { return null; }

        var coreCount = me.cur[1];
        var ret = [[coreCount, me.cur[2]]];
        var avgRate = 0;
        var rates = [];
        var maxRate = 0;
        for (var i = 0; i < coreCount; i++) {
            var idle = me.cur[3][i][0] - me.last[3][i][0];
            var other = (me.cur[3][i][1] - me.last[3][i][1]) +
                (me.cur[3][i][2] - me.last[3][i][2]) +
                (me.cur[3][i][3] - me.last[3][i][3]) +
                (me.cur[3][i][4] - me.last[3][i][4]);

            var rate = Math.ceil(other / (idle + other) * 100);
            if (maxRate < rate) { maxRate = rate; }

            rates.push(rate);
            avgRate += rate;
        }
        ret.push([Math.ceil(avgRate / coreCount), maxRate]);
        ret.push(rates);
        return ret;
    };

    me.cpu = function() {
        me.last = me.cur;
        me.cur = me.curCpu() || me.cur;

        return me.cpuRate();
    };

    return me;
});