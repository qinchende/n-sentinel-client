module.exports = Gd.global('Log', function() {
    require('./class_ext');
    var me = {};

    function log_time() {
        return '[' + (new Date()).format('MM-dd hh:mm:ss') + ']';
    }

    me.log = function(msg) {
        console.log(log_time() + (JSON.stringify(msg) || ''));
    };

    me.p = me.print = function(err, ret) {
        if (err) { me.log("Err: " + err); }
        else { me.log(ret); }
    };

    me.err = function(err, ret) {
        if (err) { me.log("Err: " + err); }
    };

    me.errExit = function(err, ret) {
        if (err) {
            me.log(err);
            me.log(ret);
            process.exit();
        }
    };

    return me;
});