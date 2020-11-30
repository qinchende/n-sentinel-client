var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
    name:'TLSentinelClient',
    description: '监控服务器各种资源信息，被动向总部汇报。',
    // execPath: 'C:\\Program Files\\nodejs\\node.exe',
    script: 'C:\\Program Files\\n-sentinel-client\\app.js',
});

svc.on('install',function(){
    svc.start();
});

svc.install();