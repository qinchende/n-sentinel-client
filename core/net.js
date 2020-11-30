module.exports = Gd.global('Net', function() {
    var shell = require('child_process');
    var os = require('os');
    var me = {};

    me.init = function() {
        me.cur = me.last = me.curNet();
    };

    me.curNet2 = function() {
        var nets = os.networkInterfaces();
        var cards = [];
        var names = {};
        Utl.forEach(nets, function(k, item) {
            k = k.toLowerCase().trim();
            if (k.indexOf('lo') === 0) return;
            if (k.indexOf('vmware') === 0) return;
            // eth0:
            //     [ { address: '210.14.133.189',
            //         netmask: '255.255.255.224',
            //         family: 'IPv4',
            //         mac: 'a4:ba:db:38:b1:02',
            //         internal: false,
            //         cidr: '210.14.133.189/27' }
            //        ...
            //    ],
            var name = k;
            var addr = item[0].cidr || '';
            if (addr.indexOf('.') < 0 && item.length > 1) { addr = item[1].cidr || ''; }
            if (name.indexOf(':') < 0) {
                if (/^((10.)|(192.)|(172.))/.test(addr)) {
                    names[name] = 'lan'
                } else {
                    names[name] = 'wan'
                }
            }
            cards.push([name, addr]);
        });
        //console.log(cards);
        return [Number(new Date()), cards, [0,0,0,0], []];
    };

    me.curNet = function() {
        if (Sys.os === 'Windows') return me.curNet2();

        var ret = shell.execSync('/sbin/ip a|grep inet|grep -v inet6|grep -v 127.0.0').toString();
        ret = ret.trim().split('\n');
        // eg2:
        // inet 116.6.xx.xxx/29 brd 116.6.xx.xxx scope global eth0
        // inet 10.10.98.11/24 brd 10.10.98.255 scope global eth1:vpn
        // inet 10.10.98.9/24 brd 10.10.98.255 scope global secondary eth1
        // inet 10.10.99.9/24 brd 10.10.99.255 scope global eth2
        // inet 10.10.212.1 peer 10.10.212.2/32 scope global tun0

        var cards = [];
        var names = {};
        Utl.forEach(ret, function(i, ip) {
            ip = ip.trim().split(/\s+/);
            if (ip.length < 3) return;

            // ["inet", "210.14.133.178/27", "brd", "210.14.133.191", "scope", "global", "eth0"]
            // ["inet", "210.14.133.180/32", "scope", "global", "eth0:1"]
            var name = ip[ip.length-1];
            var addr = ip[1];
            if (name.indexOf(':') < 0) {
                if (/^((10.)|(192.)|(172.))/.test(addr)) {
                    names[name] = 'lan'
                } else {
                    names[name] = 'wan'
                }
            }
            cards.push([name, addr]);
        });

        var datas = [];
        var lanRX = 0, lanTX = 0;
        var wanRX = 0, wanTX = 0;
        Utl.forEach(names, function(k, v) {
            var ret = shell.execSync("cat /proc/net/dev |grep " + k + ":").toString();
            ret = (ret.substr(ret.indexOf(':')+1).trim()).split(/\s+/);

            var RX_KB = me.toKB(ret[0]), TX_KB = me.toKB(ret[8]);
            if (v === 'lan') {
                lanRX += RX_KB; lanTX += TX_KB;
            } else {
                wanRX += RX_KB; wanTX += TX_KB;
            }
            datas.push([k, RX_KB, TX_KB]);
        });
        return [Number(new Date()), cards, [wanRX,wanTX,lanRX,lanTX], datas];
    };

    me.toKB = function(num) {
        return parseInt(parseInt(num)/1024);
    };

    me.speed = function(num, sec) {
        // 出现异常，可能是网卡累计流量开始自动清零。
        if (num < 0) return 0;
        return parseFloat((num / sec).toFixed(2));
    };

    me.netRate = function() {
        var step = parseInt(((me.cur[0] - me.last[0])/1000).toFixed(0));
        if (step <= 0) { step = 1; }

        var wanRx = me.cur[2][0] - me.last[2][0];
        var wanTx = me.cur[2][1] - me.last[2][1];
        var lanRx = me.cur[2][2] - me.last[2][2];
        var lanTx = me.cur[2][3] - me.last[2][3];

        // 出现极端情况，并记录日志
        if (lanRx < 0 || lanTx < 0 || wanRx < 0 || wanTx < 0) {
            console.log(me.last);
            console.log(me.cur);
        }

        var rets = [];
        rets.push(me.speed(wanRx, step));
        rets.push(me.speed(wanTx, step));
        rets.push(me.speed(lanRx, step));
        rets.push(me.speed(lanTx, step));
        // rets.push(wanRx);
        // rets.push(wanTx);
        // rets.push(lanRx);
        // rets.push(lanTx);

        var ret = [];
        ret.push(me.cur[1]);
        ret.push(rets);
        ret.push(me.cur[3]);

        return ret;
    };

    me.net = function() {
        me.last = me.cur;
        me.cur = me.curNet() || me.cur;

        // 如果有网卡变动，放弃本次统计
        if (JSON.stringify(me.last[1]) !== JSON.stringify(me.cur[1])) { return []; }
        return me.netRate();
    };

    return me;
});