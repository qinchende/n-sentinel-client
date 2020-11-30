let Env = {
    host: '127.0.0.1',
    port: 49119,
    secret: 'n*sentinel*XYz'
};

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
let cluster = require('cluster');
if (cluster.isMaster) {
    console.log('Hi, I am the master process.');
    let numCPUs = 1;
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker %d died (%s). Try to restart after 10s...', worker.process.pid, signal || code);
        setTimeout(cluster.fork, 10000);
    });
} else {
    require('./lib/gd');
    require('./core/base').init(Env);

    // 扩展，定制化功能
    require('./ext/index');

    let server = require('http').createServer(httpRequest);
    server.listen(Env.port, Env.host, function() {
        console.log("Worker express listening on " + Env.host + ":" + Env.port);
    });

    function httpRequest(req, res) {
        let accIP = Utl.realIP(req);
        let accKey = Utl.urlValue(req.url, 'access_key');
        Log.log(req.url + ' [' + accIP + ']');

        if (!accKey || !Utl.checkSha1(accIP, accKey, Env.secret)) {
            if (accIP.indexOf('10.10.') !== 0) {
                return res.end(JSON.stringify({status: 'fai', msg: 'wrong', msg_code: 0}));
            }
        }

        let results = {
            cpu:    Cpu.cpu(),
            mem:    Mem.mem(),
            disk:   Disk.disk(),
            net:    Net.net(),
            notice: Check.check(),

            stamp:  Base.stamp()
        };
        Utl.suc(res, results);
    }
}



