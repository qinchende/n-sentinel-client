module.exports = Gd.global('Sys', function() {
    var os = require('os');
    var me = {};

    me.init = function() {
        me.arch = os.arch();
        me.hostName = os.hostname();
        me.platform = os.platform();
        me.release = os.release();
        me.type = os.type();

        me.os = 'Linux';
        if (me.platform.indexOf('win') >= 0) me.os = 'Windows';
        //console.log(me);
    };

    return me;
});