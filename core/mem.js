module.exports = Gd.global('Mem', function() {
    var shell = require('child_process');
    var os = require('os');
    var me = {};

    me.init = function() {
        me.cur = me.last = me.curMem();
    };

    me.curMem2 = function() {
        var total = parseInt(os.totalmem() / 1024 / 1024);
        var free = [0, 0, parseInt(os.freemem() / 1024 / 1024), 0];
        return [Number(new Date()), total, free];
    };

    me.curMem = function() {
        if (Sys.os === 'Windows') return me.curMem2();

        var ret = shell.execSync('free -m').toString();
        ret = ret.split('\n');
        //          total    used   free  shared buffers cached
        // ["Mem:", "8000", "1135", "6864", "0", "172", "818"]
        var ret1 = ret[1].split(/\s+/);

        var total = parseInt(ret1[1]);
        var free = [parseInt(ret1[3]), parseInt(ret1[5]), parseInt(ret1[6]), parseInt(ret1[4])];

        // opensuse 15.0 之后的版本，内存信息发生变化了
        //          total        used        free      shared  buff/cache   available
        // Mem:     32110         413       30809         190         887       31102
        // Swap:   131071           0      131071
        if (ret[0].indexOf('available') >= 0) { free[0] = free[1] = free[3] = 0; }

        return [Number(new Date()), total, free];
    };

    me.memRate = function() {
        var total = me.cur[1];
        var totalFree = me.cur[2][0] + me.cur[2][1] + me.cur[2][2] - me.cur[2][3];

        var ret = [[me.cur[1], totalFree]];
        ret.push([Math.ceil((total-totalFree) / total * 100)]);
        ret.push(me.cur[2]);

        return ret;
    };


    me.mem = function() {
        me.last = me.cur;
        me.cur = me.curMem() || me.cur;

        return me.memRate();
    };

    return me;
});