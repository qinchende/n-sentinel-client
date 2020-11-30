var LIB = require('./lib.js');

module.exports = Gd.global('Check', function() {
    var shell = require('child_process');
    var me = {};

    me.init = function(host) {
        me.cur = require('../config/check_list').servers[host] || {};
    };

    // 用来监听服务器上的某一些端口，这些在配置文件中指定 config/check_list.js
    me.checkPorts = function() {
        var errPorts = [];

        var ports = me.cur.ports || {};
        Utl.forEach(ports, function(ip, pts) {
            Utl.forEach(pts || [], function(idx, pt) {
                try {
                    var opts = LIB.normalizeExecArgs('netstat -lnp|grep ' + ip + ':' + pt + ' |grep LISTEN');
                    var ret = shell.spawnSync(opts.file, opts.options).stdout.toString();
                    if (!ret) { errPorts.push(port); }
                } catch (e) {}
            });
        });

        return errPorts;
    };

    me.check = function() {
        return me.checkPorts();
    };
    return me;
});