function updateSoftRoom() {
    var real_url = 'https://xx.xx.com/your_url';

    Utl.webReqJson({
        url: real_url,
        cb: function(err, ret) {

        }
    });
}

//TODO： 可以定时执行想要执行的特殊任务
setInterval(updateSoftRoom, 60*1000);

