module.exports = Gd.global('Disk', function() {
    var shell = require('child_process');
    var me = {};

    me.init = function() {
        me.cur = me.last = me.curDisk();
    };

    me.curDisk2 = function() {
      return [Number(new Date()), [['/all',1000,900,0]]];
    };

    me.curDisk = function() {
        if (Sys.os === 'Windows') return me.curDisk2();

        // 统计所有 ext* | xfs | btrfs 磁盘格式的分区
        var ret = shell.execSync("df -Tm |egrep 'ext|xfs|btrfs'").toString();
        ret = ret.split('\n');
        // Filesystem     Type          Size  Used     Avail Use% Mounted on
        // /dev/sda2      ext4         80505  4758     74667   6% /
        // /dev/sda3      ext4       1764783 33830   1729144   2% /home

        var items = [];
        Utl.forEach(ret, function(i, disk) {
            disk = disk.split(/\s+/);
            if (disk.length < 3) return;

            // 单位：GB
            var total = parseInt(disk[2] / 1024 + 0.5);
            var left = parseInt(disk[4] / 1024 + 0.5);
            items.push([
                disk[6],
                total,
                left,
                Math.ceil((total-left) / total * 100)
            ]);
        });
        return [Number(new Date()), items];
    };

    me.diskRate = function() {
        var items = me.cur[1];
        var total = 0;
        var left = 0;
        var maxUse = 0;
        Utl.forEach(items, function(i, disk) {
            total += disk[1];
            left += disk[2];

            if (maxUse < disk[3]) { maxUse = disk[3]; }
        });

        var ret = [[total, left]];
        ret.push([Math.ceil((total-left) / total * 100), maxUse]);
        ret.push(items);

        return ret;
    };


    me.disk = function() {
        me.last = me.cur;
        me.cur = me.curDisk() || me.cur;

        return me.diskRate();
    };

    return me;
});